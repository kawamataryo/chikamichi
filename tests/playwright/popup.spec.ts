import { expect, test } from "@playwright/test";
import { SEARCH_PREFIX } from "~/constants";
import { generateBookmark, generateHistory, generateTab } from "./fixtures";
import {
  getLastMockCall,
  getLastRuntimeMessage,
  getMockCalls,
  getMockStorageValue,
  setupExtensionEnvironment,
} from "./support";

async function pressMany(
  locator: { press: (key: string) => Promise<void> },
  key: string,
  count: number,
) {
  if (count <= 0) {
    return;
  }

  await locator.press(key);
  await pressMany(locator, key, count - 1);
}

test.describe("popup", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.title === "boosts previously opened results in search ranking") {
      return;
    }

    const tabs = [...Array(16)].map((_, i) =>
      generateTab({
        id: i + 1,
        lastAccessed: 1000 + i,
        title: `tab-item-${i}`,
        url: `https://tab-item.com/${i}`,
        windowId: 1,
      }),
    );

    const histories = [...Array(16)].map((_, i) =>
      generateHistory({
        lastVisitTime: 2000 + i,
        title: `history-item-${i}`,
        url: `https://history-item.com/${i}`,
      }),
    );

    await setupExtensionEnvironment(page, {
      bookmarks: [
        ...[...Array(16)].map((_, i) =>
          generateBookmark({
            title: `bookmark-item-${i}`,
            url: `https://bookmark-item.com/${i}`,
          }),
        ),
        generateBookmark({
          children: [
            generateBookmark({
              title: "folder-item",
              url: "https://folder-item.com",
            }),
            generateBookmark({
              children: [
                generateBookmark({
                  title: "nested-folder-item",
                  url: "https://nested-folder-item.com",
                }),
              ],
              title: "nested-folder",
              type: "folder",
            }),
          ],
          title: "folder",
          type: "folder",
        }),
      ],
      histories,
      tabs,
    });

    await page.goto("/popup.html");
    await expect(page.locator("[data-cy=search-input]")).toBeVisible();
  });

  test("searches tabs, bookmarks and histories", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");

    await input.fill("tab-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("tab-item-0");
    await expect(page.locator("[data-cy=search-result-type-0]")).toHaveText("tab");

    await input.fill("bookmark-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("bookmark-item-0");
    await expect(page.locator("[data-cy=search-result-type-0]")).toHaveText("bookmark");

    await input.fill("history-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-0");
    await expect(page.locator("[data-cy=search-result-type-0]")).toHaveText("history");
  });

  test("shows tabs and histories in most-recent-first order for prefix searches", async ({
    page,
  }) => {
    const input = page.locator("[data-cy=search-input]");

    await input.fill("/t");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("tab-item-15");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("tab-item-14");

    await input.fill("/h");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-15");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("history-item-14");
  });

  test("shows bookmark folder names", async ({ page }) => {
    await page.locator("[data-cy=search-input]").fill("folder-item");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("folder-item");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("folder");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("nested-folder-item");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("folder/nested-folder");
  });

  test("falls back to browser search", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("unknown-item");
    await expect(page.locator("[data-cy=browser-search-btn]")).toContainText(
      'Search "unknown-item"',
    );
    await input.press("Enter");
    await expect
      .poll(() =>
        getLastMockCall<{ disposition: number; text: string }[]>(page, "chromeSearchQuery"),
      )
      .toEqual([{ disposition: 1, text: "unknown-item" }]);
  });

  test("moves selection and opens pages through background messaging", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("history-item");
    await expect(page.locator("[data-cy=search-result-0]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await input.press("Control+n");
    await expect(page.locator("[data-cy=search-result-1]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await input.press("ArrowUp");
    await expect(page.locator("[data-cy=search-result-0]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await input.press("Enter");

    const runtimeSendMessage = await getMockCalls(page, "runtimeSendMessage");
    expect(runtimeSendMessage.length).toBeGreaterThan(0);
  });

  test("records opened results for learned ranking", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("/h history-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-0");
    await input.press("Enter");

    await expect
      .poll(async () => {
        const value = await getMockStorageValue<string | Array<{ openCount: number; url: string }>>(
          page,
          "chikamichi-open-stats",
        );
        return typeof value === "string" ? JSON.parse(value) : value;
      })
      .toEqual([
        expect.objectContaining({
          openCount: 1,
          url: "https://history-item.com/0",
        }),
      ]);
  });

  test("boosts previously opened results in search ranking", async ({ page }) => {
    await setupExtensionEnvironment(page, {
      bookmarks: [],
      histories: [14, 15].map((i) =>
        generateHistory({
          lastVisitTime: 2000 + i,
          title: `shared-history-${i}`,
          url: `https://history-item.com/${i}`,
        }),
      ),
      storage: {
        "chikamichi-open-stats": JSON.stringify([
          {
            lastOpenedAt: Date.now(),
            openCount: 10,
            url: "https://history-item.com/14",
          },
        ]),
      },
      tabs: [],
    });
    await page.goto("/popup.html");
    await expect(page.locator("[data-cy=search-input]")).toBeVisible();

    const input = page.locator("[data-cy=search-input]");
    await input.fill("/h shared-history");

    await expect(page.locator("[data-cy=search-result-0]")).toContainText(
      "https://history-item.com/14",
    );
  });

  test("keeps keyboard selection stable while scrolling long results", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("/h history-item");
    await expect(page.locator("[data-cy=search-result-wrapper]")).toHaveJSProperty("scrollTop", 0);

    await pressMany(input, "Control+n", 15);

    await expect(page.locator("[data-cy=search-result-15]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await expect(page.locator("[data-cy=search-result-wrapper]")).not.toHaveJSProperty(
      "scrollTop",
      0,
    );
  });

  test("closes the popup with escape", async ({ page }) => {
    await page.locator("[data-cy=search-input]").press("Escape");
    const closeCalls = await getMockCalls(page, "close");
    expect(closeCalls.length).toBeGreaterThan(0);
  });

  test("changes the default prefix in settings", async ({ page }) => {
    await page.locator("[data-cy=setting-tab-btn]").click();
    await expect(page.locator("[data-cy=page-setting]")).toBeVisible();
    await page.locator("[data-cy=select-prefix]").selectOption(SEARCH_PREFIX.BOOKMARK);
    await page.locator("[data-cy=search-tab-btn]").click();
    await expect(page.locator("[data-cy=page-search]")).toBeVisible();
    await expect(page.locator("[data-cy=search-input]")).toHaveValue(SEARCH_PREFIX.BOOKMARK);
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("bookmark-item-0");
  });

  test("renders info and settings pages", async ({ page }) => {
    await page.locator("[data-cy=info-tab-btn]").click();
    await expect(page.locator("[data-cy=page-info]")).toBeVisible();
    await expect(page.getByText("Quick Reference")).toBeVisible();
    await expect(page.getByText("Search targets")).toBeVisible();
    await expect(page.getByText("Move selection")).toBeVisible();
    await expect(page.getByText("Open Issue")).toBeVisible();

    await page.locator("[data-cy=setting-tab-btn]").click();
    await expect(page.locator("[data-cy=page-setting]")).toBeVisible();
    await expect(page.getByText("Default Search Prefix")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Theme" })).toBeVisible();
    await expect(page.getByText("Open Link Action")).toBeVisible();
  });

  test("updates open link behavior in settings", async ({ page }) => {
    await page.locator("[data-cy=setting-tab-btn]").click();
    await page.locator("[data-cy=open-link-in-new-tab]").click();
    await page.locator("[data-cy=search-tab-btn]").click();
    await page.locator("[data-cy=search-input]").fill("/h history-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-0");
    await page.locator("[data-cy=search-input]").press("Enter");
    await expect
      .poll(() => getLastRuntimeMessage(page))
      .toEqual({
        body: {
          url: "https://history-item.com/0",
        },
        name: "open-new-tab-page",
      });
  });

  test("toggles favorites and copies current url", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("bookmark-item-0");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await input.fill("");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("bookmark-item-0");

    await input.fill("/h history-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-0");
    await input.press("Control+c");
    await expect
      .poll(() => getLastMockCall<string[]>(page, "copy"))
      .toEqual(["https://history-item.com/0"]);
  });

  test("shows the shared feedback pill when favoriting with the keyboard shortcut", async ({
    page,
  }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("bookmark-item-0");
    await input.press("Control+f");

    await expect(page.locator("[data-cy=action-feedback]")).toContainText("Pinned");

    await input.press("Control+f");
    await expect(page.locator("[data-cy=action-feedback]")).toContainText("Unpinned");
  });

  test("keeps the selected item anchored when toggling favorite", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("bookmark-item");
    await input.press("Control+n");
    await input.press("Control+n");
    const row = page.getByText("bookmark-item-2").locator("..").locator("..");
    await expect(row).toHaveAttribute("data-selected", "true");
    await page.locator("[data-cy=search-result-favorite-2]").click();
    await expect(row).toHaveAttribute("data-selected", "true");
  });

  test("does not move a search result when toggling favorite", async ({ page }) => {
    await page.locator("[data-cy=search-input]").fill("bookmark-item");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("bookmark-item-1");
    await page.locator("[data-cy=search-result-favorite-1]").click();
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("bookmark-item-1");
  });

  test("reorders favorites by drag and drop", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("bookmark-item-0");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await input.fill("bookmark-item-1");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await input.fill("");

    await expect(page.locator("[data-cy=search-result-0]")).toContainText("bookmark-item-0");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("bookmark-item-1");

    await page.locator("[data-cy=search-result-0]").hover();
    await page
      .locator("[data-cy=favorite-drag-handle-0]")
      .dragTo(page.locator("[data-cy=search-result-1]"));
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("bookmark-item-0");
  });

  test("reorders favorites with keyboard shortcuts", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("bookmark-item-0");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await input.fill("bookmark-item-1");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await input.fill("");

    await expect(page.locator("[data-cy=search-result-0]")).toContainText("bookmark-item-0");
    await page.keyboard.down("Control");
    await page.keyboard.down("Shift");
    await page.keyboard.press("N");
    await page.keyboard.up("Shift");
    await page.keyboard.up("Control");
    await expect(page.locator("[data-cy=search-result-1]")).toContainText("bookmark-item-0");
  });

  test("shows drag handles only in favorite reorder mode", async ({ page }) => {
    await page.locator("[data-cy=search-input]").fill("bookmark-item");
    await expect(page.locator("[data-cy=favorite-drag-handle-0]")).toHaveCount(0);

    await page.locator("[data-cy=search-input]").fill("bookmark-item-0");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await page.locator("[data-cy=search-input]").fill("bookmark-item-1");
    await page.locator("[data-cy=search-result-favorite-0]").click();
    await page.locator("[data-cy=search-input]").fill("");
    await page.locator("[data-cy=search-result-0]").hover();

    await expect(page.locator("[data-cy=favorite-drag-handle-0]")).toBeVisible();
  });

  test("opens an existing tab by focusing it", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("/t tab-item-0");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("tab-item-0");
    await input.press("Enter");
    await expect
      .poll(() => getLastRuntimeMessage(page))
      .toEqual({
        body: {
          tabId: 1,
        },
        name: "change-current-tab",
      });
  });

  test("keeps updated settings after switching pages from the sidebar", async ({ page }) => {
    await page.locator("[data-cy=setting-tab-btn]").click();
    await page.locator("[data-cy=open-link-in-new-tab]").click();
    await page.locator("[data-cy=info-tab-btn]").click();
    await expect(page.locator("[data-cy=page-info]")).toBeVisible();
    await page.locator("[data-cy=search-tab-btn]").click();
    await page.locator("[data-cy=search-input]").fill("/h https://history-item.com/1");
    await expect(page.locator("[data-cy=search-result-0]")).toContainText("history-item-1");
    await page.locator("[data-cy=search-input]").press("Enter");
    await expect
      .poll(() => getLastRuntimeMessage(page))
      .toEqual({
        body: {
          url: "https://history-item.com/1",
        },
        name: "open-new-tab-page",
      });
  });

  test("opens GitHub issue from info page", async ({ page }) => {
    await page.locator("[data-cy=info-tab-btn]").click();
    await page.getByText("Open Issue").click();
    await expect
      .poll(() => getLastRuntimeMessage(page))
      .toEqual({
        body: {
          url: "https://github.com/kawamataryo/chikamichi/issues/new",
        },
        name: "open-new-tab-page",
      });
  });

  test("keeps long result lists reachable inside the result panel", async ({ page }) => {
    await page.locator("[data-cy=search-input]").fill("/h history-item");
    await expect(page.locator("[data-cy=search-result-wrapper]")).toHaveCSS("overflow-y", "auto");
    await expect(page.locator("[data-cy=search-result-15]")).toBeVisible();
    await expect(page.locator("[data-cy=search-result-15]")).toContainText("history-item");
  });

  test("supports keyboard selection and execution in action mode", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("> copy");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Copy Markdown Link");
    await expect(page.locator("[data-cy=action-result-0]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await input.press("Control+n");
    await expect(page.locator("[data-cy=action-result-1]")).toContainText("Copy URL");
    await expect(page.locator("[data-cy=action-result-1]")).toHaveAttribute(
      "data-selected",
      "true",
    );
    await input.press("Enter");
    await expect
      .poll(() => getLastMockCall<string[]>(page, "copy"))
      .toEqual(["https://tab-item.com/0"]);
    await expect(page.locator("[data-cy=action-feedback]")).toContainText("Copied");
  });

  test("shows frequently used actions first in action mode", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill(">");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Copy Markdown Link");
    await expect(page.locator("[data-cy=action-result-1]")).toContainText("Copy URL");
    await expect(page.locator("[data-cy=action-result-2]")).toContainText("Copy Title");
  });

  test("shows an empty state for unmatched action mode queries", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");
    await input.fill("> definitely-no-such-action");
    await expect(page.locator("[data-cy=action-result-empty]")).toContainText("No actions found.");
    await expect(page.locator("[data-cy=action-result-empty]")).toContainText(
      "Current page actions",
    );
  });

  test("runs current page actions from action mode", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");

    await input.fill("> markdown");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Copy Markdown Link");
    await input.press("Enter");
    await expect
      .poll(() => getLastMockCall<string[]>(page, "copy"))
      .toEqual(["[tab-item-0](https://tab-item.com/0)"]);

    await input.fill("> mute");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Mute Tab");
    await input.press("Enter");
    await expect
      .poll(() => getLastMockCall<any[]>(page, "tabsUpdate"))
      .toEqual([1, { muted: true }]);

    await input.fill("> pin");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Pin Tab");
    await input.press("Enter");
    await expect
      .poll(() => getLastMockCall<any[]>(page, "tabsUpdate"))
      .toEqual([1, { pinned: true }]);

    await input.fill("> duplicate");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Duplicate Tab");
    await input.press("Enter");
    await expect.poll(() => getLastMockCall<number[]>(page, "tabsDuplicate")).toEqual([1]);
    await expect.poll(() => getMockCalls(page, "close").then((calls) => calls.length)).toBe(0);
    await expect(input).toBeVisible();
  });

  test("captures screenshots from action mode", async ({ page }) => {
    const input = page.locator("[data-cy=search-input]");

    await input.fill("> visible");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Capture Visible Area");
    await input.press("Enter");
    await expect
      .poll(() => getMockCalls(page, "tabsCaptureVisibleTab").then((calls) => calls.length))
      .toBeGreaterThan(0);
    await expect
      .poll(() => getLastMockCall<any[]>(page, "downloadsDownload"))
      .toEqual([expect.objectContaining({ filename: "chikamichi-tab-item-0-visible.png" })]);

    await input.fill("> full page");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText("Capture Full Page");
    await input.press("Enter");
    await expect
      .poll(() => getMockCalls(page, "scriptingExecuteScript").then((calls) => calls.length))
      .toBeGreaterThan(0);
    await expect
      .poll(() => getLastMockCall<any[]>(page, "downloadsDownload"))
      .toEqual([expect.objectContaining({ filename: "chikamichi-tab-item-0-full-page.png" })]);

    await input.fill("> copy visible");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText(
      "Copy Visible Area to Clipboard",
    );
    await input.press("Enter");
    await expect
      .poll(() => getMockCalls(page, "copyImage").then((calls) => calls.length))
      .toBeGreaterThan(0);

    await input.fill("> copy full");
    await expect(page.locator("[data-cy=action-result-0]")).toContainText(
      "Copy Full Page to Clipboard",
    );
    await input.press("Enter");
    await expect
      .poll(() => getMockCalls(page, "copyImage").then((calls) => calls.length))
      .toBeGreaterThan(1);
  });
});

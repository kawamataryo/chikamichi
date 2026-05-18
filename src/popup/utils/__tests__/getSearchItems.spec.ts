import type { Bookmarks, History, Tabs } from "webextension-polyfill";
import { randCatchPhrase, randNumber, randUrl, randUuid } from "@ngneat/falso";
import { describe, expect, it, vi } from "vitest";
import { SEARCH_ITEM_TYPE } from "~/constants";
import {
  convertToSearchItemsFromBookmarks,
  convertToSearchItemsFromHistories,
  convertToSearchItemsFromTabs,
  faviconUrl,
} from "~/popup/utils/getSearchItems";

vi.mock("webextension-polyfill", () => ({}));

function generateBookmark(overwrites?: { title?: string }): Bookmarks.BookmarkTreeNode {
  return {
    dateAdded: randNumber(),
    dateGroupModified: randNumber(),
    id: randUuid(),
    index: randNumber(),
    parentId: randUuid(),
    title: randCatchPhrase(),
    type: "bookmark" as const,
    url: randUrl(),
    ...overwrites,
  };
}

function generateHistory(args: { title?: string; url?: string } = {}): History.HistoryItem {
  return {
    id: randUuid(),
    title: args.title ?? randCatchPhrase(),
    url: args.url ?? randUrl(),
  };
}

function generateTab(
  args: {
    id?: number;
    lastAccessed?: number;
    title?: string;
    url?: string;
  } = {},
): Tabs.Tab {
  return {
    active: false,
    highlighted: false,
    id: args.id ?? randNumber(),
    incognito: false,
    index: 0,
    lastAccessed: args.lastAccessed ?? Date.now(),
    pinned: false,
    title: args.title ?? randCatchPhrase(),
    url: args.url ?? randUrl(),
    windowId: 1,
  };
}

describe("convertToSearchItemsFromBookmarks", () => {
  it("get search items from bookmarks", () => {
    const bookmark1 = generateBookmark();
    const bookmark2 = generateBookmark();
    const bookmark3 = generateBookmark();
    const bookmark4 = generateBookmark({ title: "" });
    const nestedFolder = {
      ...generateBookmark(),
      children: [bookmark3],
      type: "folder" as const,
    };
    const folder = {
      ...generateBookmark(),
      children: [bookmark2, nestedFolder],
      type: "folder" as const,
    };
    const bookmarks = [bookmark1, folder, bookmark4];

    const searchItems = convertToSearchItemsFromBookmarks(bookmarks);

    expect(searchItems.length).toBe(4);
    expect(searchItems).toEqual([
      {
        bookmarkId: bookmark1.id,
        faviconUrl: faviconUrl(bookmark1.url!),
        folderName: "",
        searchTerm: `${bookmark1.title} ${bookmark1.url}`,
        title: bookmark1.title,
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        url: bookmark1.url,
      },
      {
        bookmarkId: bookmark2.id,
        faviconUrl: faviconUrl(bookmark2.url!),
        folderName: folder.title,
        searchTerm: `${bookmark2.title} ${bookmark2.url} ${folder.title}`,
        title: bookmark2.title,
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        url: bookmark2.url,
      },
      {
        bookmarkId: bookmark3.id,
        faviconUrl: faviconUrl(bookmark3.url!),
        folderName: `${folder.title}/${nestedFolder.title}`,
        searchTerm: `${bookmark3.title} ${bookmark3.url} ${folder.title}/${nestedFolder.title}`,
        title: bookmark3.title,
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        url: bookmark3.url,
      },
      {
        bookmarkId: bookmark4.id,
        faviconUrl: faviconUrl(bookmark4.url!),
        folderName: "",
        searchTerm: `${bookmark4.url}`,
        title: bookmark4.url,
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        url: bookmark4.url,
      },
    ]);
  });

  describe("convertToSearchItemsFromHistories", () => {
    it("get search items from histories", () => {
      const histories = [
        {
          ...generateHistory({
            title: "history-item-0",
            url: "https://history-item.com/0",
          }),
          lastVisitTime: 100,
        },
        {
          ...generateHistory({
            title: "history-item-1",
            url: "https://history-item.com/1",
          }),
          lastVisitTime: 200,
        },
      ];

      const searchItems = convertToSearchItemsFromHistories(histories);

      expect(searchItems.length).toBe(2);
      expect(searchItems).toEqual([
        {
          faviconUrl: faviconUrl(histories[1].url!),
          folderName: "",
          lastVisitTime: 200,
          searchTerm: `${histories[1].title!} ${histories[1].url}`,
          title: histories[1].title!,
          type: SEARCH_ITEM_TYPE.HISTORY,
          url: histories[1].url,
        },
        {
          faviconUrl: faviconUrl(histories[0].url!),
          folderName: "",
          lastVisitTime: 100,
          searchTerm: `${histories[0].title!} ${histories[0].url}`,
          title: histories[0].title!,
          type: SEARCH_ITEM_TYPE.HISTORY,
          url: histories[0].url,
        },
      ]);
    });
  });

  it("remove google search histories", () => {
    const histories = [
      generateHistory({ url: "https://www.google.com/search?q=Compiler+API" }),
      generateHistory(),
    ];

    const searchItems = convertToSearchItemsFromHistories(histories);

    expect(searchItems.length).toBe(1);
    expect(searchItems).toEqual([
      {
        faviconUrl: faviconUrl(histories[1].url!),
        folderName: "",
        searchTerm: `${histories[1].title!} ${histories[1].url}`,
        title: histories[1].title!,
        type: SEARCH_ITEM_TYPE.HISTORY,
        url: histories[1].url,
      },
    ]);
  });

  it("remove same title histories", () => {
    const histories = [
      { ...generateHistory({ title: "titleA" }), lastVisitTime: 100 },
      generateHistory({ title: "titleB" }),
      { ...generateHistory({ title: "titleA" }), lastVisitTime: 200 },
    ];

    const searchItems = convertToSearchItemsFromHistories(histories);

    expect(searchItems.length).toBe(2);
    expect(searchItems).toContainEqual({
      faviconUrl: faviconUrl(histories[1].url!),
      folderName: "",
      searchTerm: `${histories[1].title!} ${histories[1].url}`,
      title: histories[1].title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: histories[1].url,
    });
    expect(searchItems).toContainEqual({
      faviconUrl: faviconUrl(histories[2].url!),
      folderName: "",
      lastVisitTime: 200,
      searchTerm: `${histories[2].title!} ${histories[2].url}`,
      title: histories[2].title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: histories[2].url,
    });
  });

  it("remove histories with the same comparable url", () => {
    const histories = [
      {
        ...generateHistory({
          title: "older docs",
          url: "https://docs.example.com/path/?utm_source=newsletter#intro",
        }),
        lastVisitTime: 100,
      },
      {
        ...generateHistory({
          title: "latest docs",
          url: "https://docs.example.com/path?ref=popup",
        }),
        lastVisitTime: 200,
      },
      {
        ...generateHistory({
          title: "other docs",
          url: "https://docs.example.com/other",
        }),
        lastVisitTime: 150,
      },
      {
        ...generateHistory({
          title: "search docs",
          url: "https://docs.example.com/path?q=api",
        }),
        lastVisitTime: 50,
      },
    ];

    const searchItems = convertToSearchItemsFromHistories(histories);

    expect(searchItems.length).toBe(3);
    expect(searchItems).toContainEqual({
      faviconUrl: faviconUrl(histories[1].url!),
      folderName: "",
      lastVisitTime: 200,
      searchTerm: `${histories[1].title!} ${histories[1].url}`,
      title: histories[1].title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: histories[1].url,
    });
    expect(searchItems).toContainEqual({
      faviconUrl: faviconUrl(histories[2].url!),
      folderName: "",
      lastVisitTime: 150,
      searchTerm: `${histories[2].title!} ${histories[2].url}`,
      title: histories[2].title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: histories[2].url,
    });
    expect(searchItems).toContainEqual({
      faviconUrl: faviconUrl(histories[3].url!),
      folderName: "",
      lastVisitTime: 50,
      searchTerm: `${histories[3].title!} ${histories[3].url}`,
      title: histories[3].title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: histories[3].url,
    });
  });

  describe("faviconUrl", () => {
    it("get domain", () => {
      const url = "https://www.google.com/search?q=Compiler+API";
      expect(faviconUrl(url)).toBe("https://www.google.com/s2/favicons?domain=google.com&sz=64");
    });
  });
});

describe("convertToSearchItemsFromTabs", () => {
  it("removes Chrome new tab pages", () => {
    const tabs = [
      generateTab({ id: 1, title: "New Tab", url: "chrome://newtab/" }),
      generateTab({ id: 2, title: "docs", url: "https://docs.example.com" }),
    ];

    expect(convertToSearchItemsFromTabs(tabs)).toEqual([
      {
        faviconUrl: faviconUrl("https://docs.example.com"),
        folderName: "",
        lastVisitTime: tabs[1].lastAccessed,
        searchTerm: "docs https://docs.example.com",
        tabId: 2,
        title: "docs",
        type: SEARCH_ITEM_TYPE.TAB,
        url: "https://docs.example.com",
      },
    ]);
  });

  it("sorts tabs by last accessed order", () => {
    const tabs = [
      generateTab({ id: 1, lastAccessed: 100, title: "older", url: "https://older.com" }),
      generateTab({ id: 2, lastAccessed: 300, title: "newer", url: "https://newer.com" }),
      generateTab({ id: 3, lastAccessed: 200, title: "middle", url: "https://middle.com" }),
    ];

    expect(convertToSearchItemsFromTabs(tabs)).toEqual([
      {
        faviconUrl: faviconUrl("https://newer.com"),
        folderName: "",
        lastVisitTime: 300,
        searchTerm: "newer https://newer.com",
        tabId: 2,
        title: "newer",
        type: SEARCH_ITEM_TYPE.TAB,
        url: "https://newer.com",
      },
      {
        faviconUrl: faviconUrl("https://middle.com"),
        folderName: "",
        lastVisitTime: 200,
        searchTerm: "middle https://middle.com",
        tabId: 3,
        title: "middle",
        type: SEARCH_ITEM_TYPE.TAB,
        url: "https://middle.com",
      },
      {
        faviconUrl: faviconUrl("https://older.com"),
        folderName: "",
        lastVisitTime: 100,
        searchTerm: "older https://older.com",
        tabId: 1,
        title: "older",
        type: SEARCH_ITEM_TYPE.TAB,
        url: "https://older.com",
      },
    ]);
  });
});

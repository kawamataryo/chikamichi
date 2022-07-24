import { onMessage } from "webext-bridge";
import browser from "webextension-polyfill";

onMessage(
  "change-current-tab",
  async (request: { data: { tabId: number } }) => {
    const tab = await browser.tabs.get(request.data.tabId);
    await browser.tabs.update(request.data.tabId, { active: true });
    await browser.windows.update(tab.windowId!, { focused: true });
  }
);

onMessage("update-current-page", async (request: { data: { url: string } }) => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  await browser.tabs.update(tab.id, { url: request.data.url });
});

onMessage("open-new-tab-page", async (request: { data: { url: string } }) => {
  await browser.tabs.create({ url: request.data.url });
});

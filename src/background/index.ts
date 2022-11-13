import Fuse from "fuse.js";
import { onMessage } from "webext-bridge";
import browser from "webextension-polyfill";
import { FUSE_OPTIONS } from "~/constants";

onMessage("change-current-tab", async ({ data: { tabId } }) => {
  const tab = await browser.tabs.get(tabId);
  await browser.tabs.update(tabId, { active: true });
  await browser.windows.update(tab.windowId!, { focused: true });
});

onMessage("update-current-page", async ({ data: { url } }) => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  await browser.tabs.update(tab.id, { url });
});

onMessage("open-new-tab-page", async ({ data: { url } }) => {
  await browser.tabs.create({ url });
});

onMessage("fuse-search", async ({ data: { word, searchItems } }) => {
  const fuse = new Fuse(searchItems, FUSE_OPTIONS);
  return fuse.search<SearchItem>(word, { limit: 100 });
});

import { onMessage } from "webext-bridge";

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
}

onMessage("change-current-tab", async (request) => {
  const tab = await browser.tabs.get(request.data.tabId);
  await browser.tabs.update(request.data.tabId, { active: true });
  await browser.windows.update(tab.windowId!, { focused: true });
});

onMessage("update-current-page", async (request) => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  await browser.tabs.update(tab.id, { url: request.data.url });
});

onMessage("open-new-tab-page", async (request) => {
  await browser.tabs.create({ url: request.data.url });
});

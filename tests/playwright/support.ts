import type { Page } from "@playwright/test";
import type { Bookmarks, History, Tabs } from "webextension-polyfill";

type MockCallKey =
  | "chromeSearchQuery"
  | "close"
  | "copy"
  | "copyImage"
  | "downloadsDownload"
  | "runtimeSendMessage"
  | "scriptingExecuteScript"
  | "tabsCaptureVisibleTab"
  | "tabsDuplicate"
  | "tabsReload"
  | "tabsRemove"
  | "tabsUpdate";

type MockSearchItem = SearchItem;
type MockSearchCollections = {
  bookmarks: MockSearchItem[];
  histories: MockSearchItem[];
  tabs: MockSearchItem[];
};

type MockCallArgs = unknown[];
type MockCallMap = Record<MockCallKey, MockCallArgs[]>;
type StorageChangeRecord = Record<string, { newValue: unknown; oldValue: unknown }>;
type StorageListener = (changes: StorageChangeRecord, areaName: string) => void;
type StorageState = Record<string, unknown>;
type BookmarkNodeWithChildren = Bookmarks.BookmarkTreeNode & {
  children?: Bookmarks.BookmarkTreeNode[];
};
type SearchQueryPayload = {
  query?: string;
  tabId?: number;
};

type MockWindow = Window &
  typeof globalThis & {
    __chikamichiMockCalls?: MockCallMap;
    __chikamichiMockSearchItems?: MockSearchCollections;
    chikamichiMockActiveTab?: Partial<Tabs.Tab> | null;
    browser?: {
      bookmarks: {
        getTree: () => Promise<Bookmarks.BookmarkTreeNode[]>;
      };
      history: {
        search: () => Promise<History.HistoryItem[]>;
      };
      search: {
        Disposition: {
          CURRENT_TAB: number;
          NEW_TAB: number;
        };
        get: () => Promise<unknown[]>;
        query: (query: unknown) => Promise<void>;
        search: (payload: SearchQueryPayload) => Promise<void>;
      };
      storage: {
        local: {
          get: (
            keys: string | string[] | Record<string, unknown>,
            callback?: (result: Record<string, unknown>) => void,
          ) => Promise<Record<string, unknown>> | void;
          remove: (keys: string | string[], callback?: () => void) => Promise<void>;
          set: (items: Record<string, unknown>, callback?: () => void) => Promise<void>;
        };
        onChanged: {
          addListener: (listener: StorageListener) => void;
          removeListener: (listener: StorageListener) => void;
        };
      };
      tabs: {
        query: (queryInfo?: { active?: boolean }) => Promise<Partial<Tabs.Tab>[]>;
      };
    };
  };

export async function setupExtensionEnvironment(
  page: Page,
  {
    bookmarks,
    histories,
    storage,
    tabs,
  }: {
    bookmarks: Bookmarks.BookmarkTreeNode[];
    histories: History.HistoryItem[];
    storage?: StorageState;
    tabs: Partial<Tabs.Tab>[];
  },
) {
  await page.addInitScript(
    ({
      bookmarks: initialBookmarks,
      histories: initialHistories,
      storage: initialStorage,
      tabs: initialTabs,
    }) => {
      const storageState: StorageState = { ...initialStorage };
      const storageListeners: StorageListener[] = [];
      const faviconUrl = (url: string) => {
        const hostname = new URL(url).hostname.replace(/^www\./u, "");
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      };
      const generateSearchTerm = (...args: Array<string | undefined>) =>
        args.filter((arg): arg is string => Boolean(arg)).join(" ");
      const mockCalls: MockCallMap = {
        chromeSearchQuery: [] as MockCallArgs[],
        close: [] as MockCallArgs[],
        copy: [] as MockCallArgs[],
        copyImage: [] as MockCallArgs[],
        downloadsDownload: [] as MockCallArgs[],
        runtimeSendMessage: [] as MockCallArgs[],
        scriptingExecuteScript: [] as MockCallArgs[],
        tabsCaptureVisibleTab: [] as MockCallArgs[],
        tabsDuplicate: [] as MockCallArgs[],
        tabsReload: [] as MockCallArgs[],
        tabsRemove: [] as MockCallArgs[],
        tabsUpdate: [] as MockCallArgs[],
      };
      const mockWindow = window as MockWindow;

      const emitStorageChanged = (changes: StorageChangeRecord, areaName: string) => {
        storageListeners.forEach((listener) => {
          listener(changes, areaName);
        });
      };

      const bookmarkItems: SearchItem[] = [];
      const collectBookmarkItems = (
        nodes: BookmarkNodeWithChildren[],
        folderNames: string[] = [],
      ) => {
        nodes.forEach((node) => {
          if (node.type !== "bookmark" && node.children) {
            const folderName = node.parentId === "0" ? "" : node.title;
            collectBookmarkItems(node.children, [...folderNames, folderName]);
            return;
          }

          if (!node.url) {
            return;
          }

          const folderName =
            node.parentId === "1" ? "" : folderNames.filter((name) => name).join("/");
          bookmarkItems.push({
            faviconUrl: faviconUrl(node.url),
            folderName,
            searchTerm: generateSearchTerm(node.title, node.url, folderName),
            title: node.title || node.url,
            type: "bookmark",
            url: node.url,
          });
        });
      };

      collectBookmarkItems(initialBookmarks as BookmarkNodeWithChildren[]);

      mockWindow["__chikamichiMockSearchItems"] = {
        bookmarks: bookmarkItems,
        histories: initialHistories.map((history) => ({
          faviconUrl: faviconUrl(history.url ?? ""),
          folderName: "",
          lastVisitTime: history.lastVisitTime,
          searchTerm: generateSearchTerm(history.title, history.url),
          title: history.title ?? history.url ?? "",
          type: "history",
          url: history.url ?? "",
        })),
        tabs: initialTabs.map((tab) => ({
          faviconUrl: faviconUrl(tab.url ?? ""),
          folderName: "",
          lastVisitTime: tab.lastAccessed,
          searchTerm: generateSearchTerm(tab.title, tab.url),
          tabId: tab.id,
          title: tab.title ?? tab.url ?? "",
          type: "tab",
          url: tab.url ?? "",
        })),
      };

      mockWindow["__chikamichiMockCalls"] = mockCalls;
      mockWindow.chikamichiMockActiveTab = initialTabs[0] ?? null;

      const runtime = {
        getManifest: () => ({
          action: {
            default_popup: "popup.html",
          },
        }),
        getURL: () => "popup.html",
        id: "12345",
        onMessage: {
          addListener: () => undefined,
        },
        sendMessage: (...args: MockCallArgs) => {
          mockCalls.runtimeSendMessage.push(args);
          return Promise.resolve(undefined);
        },
      };

      const captureDataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==";

      const chromeApi = {
        bookmarks: {
          getTree: (callback: (nodes: Bookmarks.BookmarkTreeNode[]) => void) => {
            callback(initialBookmarks);
          },
        },
        downloads: {
          download: (options: unknown, callback?: () => void) => {
            mockCalls.downloadsDownload.push([options]);
            callback?.();
          },
        },
        history: {
          search: (_queryInfo: unknown, callback: (items: History.HistoryItem[]) => void) => {
            callback(initialHistories);
          },
        },
        runtime,
        scripting: {
          executeScript: ({
            args,
            func,
          }: {
            args?: unknown[];
            func: (...args: any[]) => unknown;
          }) => {
            mockCalls.scriptingExecuteScript.push([{ args }]);
            return Promise.resolve([{ result: func(...(args ?? [])) }]);
          },
        },
        search: {
          Disposition: {
            CURRENT_TAB: 1,
            NEW_TAB: 2,
          },
          query: (query: unknown) => {
            mockCalls.chromeSearchQuery.push([query]);
          },
        },
        storage: {
          local: {
            get: (
              keys: string | string[] | Record<string, unknown>,
              callback?: (result: Record<string, unknown>) => void,
            ) => {
              let keyList: string[] = [];
              if (Array.isArray(keys)) {
                keyList = keys;
              } else if (typeof keys === "string") {
                keyList = [keys];
              } else {
                keyList = Object.keys(keys);
              }
              const result = Object.fromEntries(
                keyList.map((key) => [
                  key,
                  storageState[key] ??
                    (typeof keys === "object" && !Array.isArray(keys)
                      ? (keys as Record<string, unknown>)[key]
                      : undefined),
                ]),
              );

              if (callback) {
                callback(result);
                return;
              }

              return Promise.resolve(result);
            },
            remove: (keys: string | string[], callback?: () => void) => {
              const keyList = Array.isArray(keys) ? keys : [keys];
              const changes = Object.fromEntries(
                keyList.map((key) => [
                  key,
                  {
                    newValue: undefined,
                    oldValue: storageState[key],
                  },
                ]),
              );
              keyList.forEach((key) => {
                delete storageState[key];
              });
              emitStorageChanged(changes, "local");
              callback?.();
              return Promise.resolve();
            },
            set: (items: Record<string, unknown>, callback?: () => void) => {
              const changes = Object.fromEntries(
                Object.entries(items).map(([key, value]) => [
                  key,
                  {
                    newValue: value,
                    oldValue: storageState[key],
                  },
                ]),
              );
              Object.assign(storageState, items);
              emitStorageChanged(changes, "local");
              callback?.();
              return Promise.resolve();
            },
          },
          onChanged: {
            addListener: (listener: StorageListener) => {
              storageListeners.push(listener);
            },
            removeListener: (listener: StorageListener) => {
              const index = storageListeners.indexOf(listener);
              if (index >= 0) {
                storageListeners.splice(index, 1);
              }
            },
          },
        },
        tabs: {
          captureVisibleTab: (
            _windowId: unknown,
            _options: unknown,
            callback: (dataUrl: string) => void,
          ) => {
            mockCalls.tabsCaptureVisibleTab.push([]);
            callback(captureDataUrl);
          },
          duplicate: (tabId: unknown, callback?: () => void) => {
            mockCalls.tabsDuplicate.push([tabId]);
            callback?.();
          },
          query: (
            queryInfo: { active?: boolean } | undefined,
            callback: (tabs: Partial<Tabs.Tab>[]) => void,
          ) => {
            window.setTimeout(() => {
              if (queryInfo?.active) {
                callback(initialTabs.slice(0, 1));
                return;
              }

              callback(initialTabs);
            }, 0);
          },
          reload: (tabId: unknown, reloadProperties: unknown, callback?: () => void) => {
            mockCalls.tabsReload.push([tabId, reloadProperties]);
            callback?.();
          },
          remove: (tabIds: unknown, callback?: () => void) => {
            mockCalls.tabsRemove.push([tabIds]);
            callback?.();
          },
          update: (tabId: unknown, updateProperties: unknown, callback?: () => void) => {
            mockCalls.tabsUpdate.push([tabId, updateProperties]);
            callback?.();
          },
        },
      };

      Object.defineProperty(window, "chrome", {
        configurable: true,
        value: chromeApi,
        writable: true,
      });

      Object.defineProperty(window, "browser", {
        configurable: true,
        value: {
          bookmarks: {
            getTree: () => Promise.resolve(initialBookmarks),
          },
          history: {
            search: () => Promise.resolve(initialHistories),
          },
          search: {
            Disposition: chromeApi.search.Disposition,
            get: () => Promise.resolve([]),
            query: (query: unknown) => {
              mockCalls.chromeSearchQuery.push([query]);
              return Promise.resolve(undefined);
            },
            search: ({ query, tabId }: SearchQueryPayload) => {
              mockCalls.chromeSearchQuery.push([
                {
                  query,
                  tabId,
                },
              ]);
              return Promise.resolve(undefined);
            },
          },
          storage: {
            local: chromeApi.storage.local,
            onChanged: chromeApi.storage.onChanged,
          },
          tabs: {
            query: (queryInfo?: { active?: boolean }) =>
              Promise.resolve(queryInfo?.active ? initialTabs.slice(0, 1) : initialTabs),
          },
        },
        writable: true,
      });

      class MockClipboardItem {
        items: Record<string, Blob>;

        constructor(items: Record<string, Blob>) {
          this.items = items;
        }
      }

      Object.defineProperty(window, "ClipboardItem", {
        configurable: true,
        value: MockClipboardItem,
        writable: true,
      });

      Object.defineProperty(window.navigator, "clipboard", {
        configurable: true,
        value: {
          write: (items: unknown) => {
            mockCalls.copyImage.push([items]);
            return Promise.resolve(undefined);
          },
          writeText: (text: string) => {
            mockCalls.copy.push([text]);
            return Promise.resolve(undefined);
          },
        },
      });

      window.close = () => {
        mockCalls.close.push([]);
      };
    },
    { bookmarks, histories, storage, tabs },
  );
}

export function getMockCalls<T = unknown>(page: Page, key: MockCallKey): Promise<T[]> {
  return page.evaluate((callKey) => {
    const mockWindow = window as MockWindow;
    return mockWindow["__chikamichiMockCalls"]?.[callKey] ?? [];
  }, key) as Promise<T[]>;
}

export async function getLastMockCall<T = unknown>(
  page: Page,
  key: MockCallKey,
): Promise<T | undefined> {
  const calls = await getMockCalls<T>(page, key);
  return calls.at(-1);
}

export async function getLastRuntimeMessage(page: Page): Promise<unknown> {
  const lastCall = await getLastMockCall<MockCallArgs>(page, "runtimeSendMessage");
  return lastCall?.[1];
}

export function getMockStorageValue<T = unknown>(page: Page, key: string): Promise<T> {
  return page.evaluate(async (storageKey) => {
    const mockWindow = window as MockWindow;
    const result = await mockWindow.browser?.storage.local.get(storageKey);
    if (!result) {
      return undefined as T;
    }
    return result[storageKey] as T;
  }, key);
}

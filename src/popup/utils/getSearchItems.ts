import browser, { type Bookmarks, type History, type Tabs } from "webextension-polyfill";
import { HISTORY_FETCH_DAYS, HISTORY_FETCH_LIMIT, SEARCH_ITEM_TYPE } from "~/constants";

export function faviconUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./u, "");
  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
}

function generateSearchTerm(...args: string[]): string {
  return args.filter((arg) => arg).join(" ");
}

const TRACKING_SEARCH_PARAMS = new Set(["fbclid", "gclid", "ref"]);

function isTrackingSearchParam(paramName: string) {
  return paramName.startsWith("utm_") || TRACKING_SEARCH_PARAMS.has(paramName);
}

function removeDuplicatedItems(
  searchItems: SearchItem[],
  getKey: (searchItem: SearchItem) => string,
) {
  const seenKeys = new Set<string>();
  return searchItems.filter((searchItem) => {
    const key = getKey(searchItem);
    if (seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

function comparableHistoryUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.hash = "";
    Array.from(parsedUrl.searchParams.keys())
      .filter(isTrackingSearchParam)
      .forEach((paramName) => parsedUrl.searchParams.delete(paramName));
    parsedUrl.pathname = parsedUrl.pathname.replace(/\/+$/u, "") || "/";
    return parsedUrl.toString();
  } catch {
    return url;
  }
}

export function convertToSearchItemsFromHistories(histories: History.HistoryItem[]): SearchItem[] {
  const searchItems = histories
    .filter((history) => {
      // Remove google search's history
      if (/google\..+\/search/u.test(history.url!)) {
        return false;
      }
      return true;
    })
    .map((history) => ({
      faviconUrl: faviconUrl(history.url!),
      folderName: "",
      lastVisitTime: history.lastVisitTime!,
      searchTerm: generateSearchTerm(history.title!, history.url!),
      title: history.title!,
      type: SEARCH_ITEM_TYPE.HISTORY,
      url: history.url!,
    }))
    .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0));

  return removeDuplicatedItems(
    removeDuplicatedItems(searchItems, (searchItem) => comparableHistoryUrl(searchItem.url)),
    (searchItem) => searchItem.title,
  );
}

export function convertToSearchItemsFromBookmarks(
  bookmarkTreeNodes: Bookmarks.BookmarkTreeNode[],
): SearchItem[] {
  // This keeps the current traversal behavior until the bookmark conversion is refactored.
  const result: SearchItem[] = [];
  const getTitleAndUrl = (nodes: Bookmarks.BookmarkTreeNode[], folderNames: string[]) => {
    nodes.forEach((node) => {
      if (node.type !== "bookmark" && node.children) {
        const folderName = node.parentId === "0" ? "" : node.title;
        getTitleAndUrl(node.children, [...folderNames, folderName]);
        return;
      }

      if (!node.url) {
        return;
      }

      // Exclude the top level folder name.
      const folderName = node.parentId === "1" ? "" : folderNames.filter((name) => name).join("/");
      result.push({
        bookmarkId: node.id,
        faviconUrl: faviconUrl(node.url),
        folderName,
        searchTerm: generateSearchTerm(node.title, node.url, folderName),
        title: node.title || node.url,
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        url: node.url,
      });
    });
  };
  getTitleAndUrl(bookmarkTreeNodes, []);
  return result;
}

export function convertToSearchItemsFromTabs(tabs: Tabs.Tab[]): SearchItem[] {
  return tabs
    .filter((tab) => tab.url !== "chrome://newtab/")
    .map((tab) => ({
      faviconUrl: faviconUrl(tab.url!),
      folderName: "",
      lastVisitTime: tab.lastAccessed,
      searchTerm: generateSearchTerm(tab.title!, tab.url!),
      tabId: tab.id,
      title: tab.title!,
      type: SEARCH_ITEM_TYPE.TAB,
      url: tab.url!,
    }))
    .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0));
}

export async function getSearchItems() {
  if (typeof window !== "undefined" && (window as any).chikamichiMockSearchItems) {
    return (window as any).chikamichiMockSearchItems as {
      bookmarks: SearchItem[];
      histories: SearchItem[];
      tabs: SearchItem[];
    };
  }

  const startTime = new Date().setDate(new Date().getDate() - HISTORY_FETCH_DAYS);
  const [tabs, bookmarks, histories] = await Promise.all([
    browser.tabs.query({ currentWindow: true }),
    browser.bookmarks.getTree(),
    browser.history.search({
      maxResults: HISTORY_FETCH_LIMIT,
      startTime,
      text: "",
    }),
  ]);

  return {
    bookmarks: convertToSearchItemsFromBookmarks(bookmarks),
    histories: convertToSearchItemsFromHistories(histories),
    tabs: convertToSearchItemsFromTabs(tabs),
  };
}

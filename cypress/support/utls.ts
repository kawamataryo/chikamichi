import { randCatchPhrase, randNumber, randUrl, randUuid } from "@ngneat/falso";
import type { Bookmarks, History, Tabs } from "webextension-polyfill";

export const generateHistory = (
  args: { title?: string; url?: string } = {}
): History.HistoryItem => ({
  id: randUuid(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
});

export const generateBookmark = (
  args: {
    title?: string;
    url?: string;
    children?: Bookmarks.BookmarkTreeNode[];
    type?: Bookmarks.BookmarkTreeNodeType;
  } = {}
): Bookmarks.BookmarkTreeNode => ({
  id: randUuid(),
  parentId: randUuid(),
  index: randNumber(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
  dateAdded: randNumber(),
  dateGroupModified: randNumber(),
  type: args.type ?? ("bookmark" as const),
  children: args.children ?? [],
});

export const generateTab = (
  args: { title?: string; url?: string } = {}
): Partial<Tabs.Tab> => ({
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
});

export const setupExtensionEnvironment = ({
  win,
  bookmarks,
  histories,
  tabs,
}: {
  win: Cypress.AUTWindow & { chrome: typeof chrome };
  bookmarks: Bookmarks.BookmarkTreeNode[];
  histories: History.HistoryItem[];
  tabs: Partial<Tabs.Tab>[];
}) => {
  win.chrome = win.chrome || {};
  (win.chrome.runtime as Partial<typeof chrome.runtime>) = {
    id: "12345",
    getManifest: cy.stub().returns({}),
    getURL: cy.stub().returns("chrome-extension://12345/"),
    sendMessage: cy.stub(),
    onMessage: {
      addListener: cy.stub(),
    } as any,
    onConnect: {
      addListener: cy.stub(),
    } as any,
  };
  (win.chrome.history as Partial<typeof chrome.history>) = {
    search: ((_: any, callback: (data: any[]) => void) => {
      callback(histories);
    }) as any,
  };
  (win.chrome.tabs as Partial<typeof chrome.tabs>) = {
    query: ((_: any, callback: (data: any[]) => void) => {
      callback(tabs);
    }) as any,
  };
  (win.chrome.bookmarks as Partial<typeof chrome.bookmarks>) = {
    getTree: ((callback: (data: any[]) => void) => {
      callback(bookmarks);
    }) as any,
  };
  win.chrome.search = {
    query: cy.stub(),
    Disposition: { CURRENT_TAB: 1 },
  } as any;
  win.close = cy.stub();
  win.postMessage = cy.stub();
};

import { onMessage } from "webext-bridge";
import { Bookmarks, History, Tabs } from "webextension-polyfill";

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
    getManifest: cy
      .stub()
      .as("getManifest")
      .returns({
        action: {
          default_popup: "popup.html",
        },
      }),
    getURL: cy.stub().as("getURL").returns(""),
    sendMessage: cy.stub(),
    onMessage: {
      addListener: cy.stub().as("onMessage.addListener"),
    } as any,
    onConnect: {
      addListener: cy.stub().as("onConnect.addListener"),
    } as any,
    connect: cy.stub().as("connect"),
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
  (win.URL as any) = cy.stub().as("URL").returns({ pathname: "/__/" });
};

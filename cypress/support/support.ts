import { Bookmarks, History, Tabs } from "webextension-polyfill";

class StubURL {
  pathname = "/dist/popup";
  constructor(public url: string) {}
}

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
    getURL: cy.stub().as("getURL").returns("popup.html"),
    sendMessage: cy.stub(),
    onMessage: {
      addListener: cy.stub().as("onMessage.addListener"),
    } as any,
    onConnect: {
      addListener: (callback: (arg: any) => void) => {
        callback({
          id: 0,
          name: "",
          sender: {
            frameId: 0,
            tab: {
              id: 0,
            },
            postMessage: cy.stub().as("postMessage"),
          },
        });
      },
    } as any,
    connect: cy
      .stub()
      .as("connect")
      .returns({
        onMessage: {
          addListener: cy.stub().as("connect-onMessage-addListener"),
        },
        onDisconnect: {
          addListener: cy.stub().as("connect-onDisconnect-addListener"),
        },
        postMessage: cy.stub().as("connect-postMessage"),
      }),
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
    query: cy.stub().as("chrome-search-query"),
    Disposition: { CURRENT_TAB: 1 },
  } as any;
  win.close = cy.stub().as("close");
  (win.URL as any) = StubURL;
  cy.spy(win.navigator.clipboard, "writeText").as("copy");
};

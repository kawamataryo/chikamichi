import { randCatchPhrase, randNumber, randUrl, randUuid } from "@ngneat/falso";
import type { Bookmarks, History, Tabs } from "webextension-polyfill";

describe("App", () => {
  const generateHistory = (
    args: { title?: string; url?: string } = {}
  ): History.HistoryItem => ({
    id: randUuid(),
    url: args.url ?? randUrl(),
    title: args.title ?? randCatchPhrase(),
  });

  const generateBookmark = (
    args: { title?: string; url?: string } = {}
  ): Bookmarks.BookmarkTreeNode => ({
    id: randUuid(),
    parentId: randUuid(),
    index: randNumber(),
    url: args.url ?? randUrl(),
    title: args.title ?? randCatchPhrase(),
    dateAdded: randNumber(),
    dateGroupModified: randNumber(),
    type: "bookmark" as const,
  });

  const generateTab = (
    args: { title?: string; url?: string } = {}
  ): Partial<Tabs.Tab> => ({
    url: args.url ?? randUrl(),
    title: args.title ?? randCatchPhrase(),
  });

  before(() => {
    // Load your popup
    cy.visit("/dist/popup/index.html", {
      // If you need to stub `chrome*` API, you should do it there:
      onBeforeLoad(win: Cypress.AUTWindow & { chrome: typeof chrome }) {
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
            callback(
              [...Array(3)].map((_, i) =>
                generateHistory({ title: `history-item-${i}` })
              )
            );
          }) as any,
        };
        (win.chrome.tabs as Partial<typeof chrome.tabs>) = {
          query: ((_: any, callback: (data: any[]) => void) => {
            callback(
              [...Array(3)].map((_, i) =>
                generateTab({ title: `tab-item-${i}` })
              )
            );
          }) as any,
        };
        (win.chrome.bookmarks as Partial<typeof chrome.bookmarks>) = {
          getTree: ((callback: (data: any[]) => void) => {
            callback(
              [...Array(3)].map((_, i) =>
                generateBookmark({ title: `bookmark-item-${i}` })
              )
            );
          }) as any,
        };
        win.chrome.search = {
          query: cy.stub(),
          Disposition: { CURRENT_TAB: 1 },
        } as any;
        win.close = cy.stub();
        win.postMessage = cy.stub();
      },
    });
  });

  it("search result", async () => {
    // show tabs
    cy.get("[data-cy=search-input]").type("tab-item");
    cy.get("[data-cy=search-result-0]").should("include.text", "tab-item-0");
    cy.get("[data-cy=search-result-1]").should("include.text", "tab-item-1");
    cy.get("[data-cy=search-result-2]").should("include.text", "tab-item-2");
    cy.get("[data-cy=search-result-type-0]").should("have.text", "tab");
    cy.get("[data-cy=search-result-type-1]").should("have.text", "tab");
    cy.get("[data-cy=search-result-type-2]").should("have.text", "tab");
    cy.get("[data-cy=search-input]").clear();

    // show bookmarks
    cy.get("[data-cy=search-input]").type("bookmark-item");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "bookmark-item-0"
    );
    cy.get("[data-cy=search-result-1]").should(
      "include.text",
      "bookmark-item-1"
    );
    cy.get("[data-cy=search-result-2]").should(
      "include.text",
      "bookmark-item-2"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "bookmark");
    cy.get("[data-cy=search-result-type-1]").should("have.text", "bookmark");
    cy.get("[data-cy=search-result-type-2]").should("have.text", "bookmark");
    cy.get("[data-cy=search-input]").clear();

    // show histories
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "history-item-0"
    );
    cy.get("[data-cy=search-result-1]").should(
      "include.text",
      "history-item-1"
    );
    cy.get("[data-cy=search-result-2]").should(
      "include.text",
      "history-item-2"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "history");
    cy.get("[data-cy=search-result-type-1]").should("have.text", "history");
    cy.get("[data-cy=search-result-type-2]").should("have.text", "history");
    cy.get("[data-cy=search-input]").clear();

    // show unknown
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=search-result-wrapper]").should(
      "include.text",
      '"unknown-item" search with browser'
    );
    cy.get("[data-cy=search-input]").clear();

    // change selected item
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{downArrow}");
    cy.get("[data-cy=search-result-2]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-2]").should("have.class", "selected-item"); // check overflow control
    cy.get("[data-cy=search-input]").type("{ctrl}p");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{upArrow}");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}p");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item"); // check overflow control
    cy.get("[data-cy=search-input]").clear();

    // on esc key
    cy.get("[data-cy=search-input]").type("{esc}");
    cy.window().its("close").should("be.called");

    // TODO: on Enter key
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{enter}");
    cy.get("[data-cy=search-input]").clear();

    // TODO: on ctrl Enter key
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}{enter}");
    cy.get("[data-cy=search-input]").clear();

    // on enter when browser search
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=browser-search-btn]");
    cy.get("[data-cy=search-input]").type("{enter}");
    cy.window()
      .its("chrome.search.query")
      .should("be.calledWith", { text: "unknown-item", disposition: 1 });
    cy.get("[data-cy=search-input]").clear();
  });
});

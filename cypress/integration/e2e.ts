import {
  generateBookmark,
  generateHistory,
  generateTab,
} from "cypress/fixtures/fixtures";
import { setupExtensionEnvironment } from "cypress/support/support";
import { SEARCH_PREFIX } from "~/constants";

describe("App", () => {
  before(() => {
    cy.visit("/dist/popup/index.html", {
      onBeforeLoad(win: Cypress.AUTWindow & { chrome: typeof chrome }) {
        setupExtensionEnvironment({
          win,
          bookmarks: [
            generateBookmark({
              title: "folder",
              type: "folder",
              children: [
                generateBookmark({ title: `folder-item` }),
                generateBookmark({
                  title: `nested-folder`,
                  type: "folder",
                  children: [generateBookmark({ title: `nested-folder-item` })],
                }),
              ],
            }),
            ...[...Array(3)].map((_, i) =>
              generateBookmark({ title: `bookmark-item-${i}` })
            ),
          ],
          histories: [...Array(3)].map((_, i) =>
            generateHistory({ title: `history-item-${i}` })
          ),
          tabs: [...Array(3)].map((_, i) =>
            generateTab({ title: `tab-item-${i}` })
          ),
        });
      },
    });
  });

  afterEach(() => {
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=search-input]").clear();
    cy.clearLocalStorage();
  });

  it("show tabs", () => {
    cy.get("[data-cy=search-input]").type("tab-item-0");
    cy.get("[data-cy=search-result-0]").should("include.text", "tab-item-0");
    cy.get("[data-cy=search-result-type-0]").should("have.text", "tab");
  });

  it("show bookmarks", () => {
    cy.get("[data-cy=search-input]").type("bookmark-item-0");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "bookmark-item-0"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "bookmark");
    cy.get("[data-cy=search-input]").clear();
  });

  it("show bookmarks folder name", () => {
    cy.get("[data-cy=search-input]").type("folder-item");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "[folder]folder-item"
    );
    cy.get("[data-cy=search-result-1]").should(
      "include.text",
      "[folder/nested-folder]nested-folder-item"
    );
  });

  it("show histories", () => {
    cy.get("[data-cy=search-input]").type("history-item-0");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "history-item-0"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "history");
  });

  it("show search on browser", () => {
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=search-result-wrapper]").should(
      "include.text",
      '"unknown-item" search with browser'
    );
  });

  it("change selected item", () => {
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
  });

  it("on esc key", () => {
    cy.get("[data-cy=search-input]").type("{esc}");
    cy.window().its("close").should("be.called");
  });

  it.skip("TODO: on Enter key", () => {
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{enter}");
  });

  it.skip("TODO: on ctrl Enter key", () => {
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}{enter}");
  });

  it.skip("TODO: on meta Enter key", () => {
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{meta}{enter}");
  });

  it("on enter when browser search", () => {
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=browser-search-btn]");
    cy.get("[data-cy=search-input]").type("{enter}");
    cy.window()
      .its("chrome.search.query")
      .should("be.calledWith", { text: "unknown-item", disposition: 1 });
  });

  it("favorite", () => {
    // check favorite
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f"); // with shortcut
    cy.get("[data-cy=search-result-0]")
      .get("[data-cy=icon-star]")
      .should("be.visible");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-result-favorite-1]").click(); // with click
    cy.get("[data-cy=search-result-1]")
      .get("[data-cy=icon-star]")
      .should("be.visible");
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-result-0]")
      .get("[data-cy=icon-star]")
      .should("be.visible");
    cy.get("[data-cy=search-result-1]")
      .get("[data-cy=icon-star]")
      .should("be.visible");
    // un check favorite
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f");
    cy.get("[data-cy=search-result-0]")
      .get("[data-cy=icon-star-border]")
      .should("be.visible");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-result-favorite-1]").click();
    cy.get("[data-cy=search-result-1]")
      .get("[data-cy=icon-star-border]")
      .should("be.visible");
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-result-empty]").should("be.visible");
    // check tabs can't be made favorites.
    cy.get("[data-cy=search-input]").type("tab-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-result-favorite-1]")
      .get("[data-cy=toggle-star]")
      .should("not.exist");
    cy.get("[data-cy=search-input]").type("{ctrl}f"); // with shortcut
  });

  it("show info page", () => {
    cy.get("[data-cy=info-tab-btn]").click();
    cy.get("[data-cy=page-info]").should("be.visible");
  });

  it("show setting page", () => {
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
  });

  it("change prefix setting", () => {
    // bookmark
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=select-prefix]").select(SEARCH_PREFIX.BOOKMARK);
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
    cy.get("[data-cy=search-input]").should(
      "have.value",
      SEARCH_PREFIX.BOOKMARK
    );
    cy.get("[data-cy=search-result-0]").should("include.text", "bookmark-item");
    // history
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=select-prefix]").select(SEARCH_PREFIX.HISTORY);
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
    cy.get("[data-cy=search-input]").should(
      "have.value",
      SEARCH_PREFIX.HISTORY
    );
    cy.get("[data-cy=search-result-0]").should("include.text", "history-item");
    // tab
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=select-prefix]").select(SEARCH_PREFIX.TAB);
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
    cy.get("[data-cy=search-input]").should("have.value", SEARCH_PREFIX.TAB);
    cy.get("[data-cy=search-result-0]").should("include.text", "tab-item");
    // none
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=select-prefix]").select("");
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
    cy.get("[data-cy=search-input]").should("have.value", "");
    cy.get("[data-cy=search-result-empty]").should("be.visible");
  });

  it("change dark mode setting", () => {
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=radio-light]").check();
    cy.get("html").should("not.have.class", "dark");
    cy.get("[data-cy=radio-dark]").check();
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
  });
});

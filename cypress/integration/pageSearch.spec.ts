import {
  generateBookmark,
  generateHistory,
  generateTab,
  setupExtensionEnvironment,
} from "cypress/support/utls";
import { SEARCH_PREFIX } from "~/constants";

describe("App", () => {
  beforeEach(() => {
    cy.visit("/dist/popup/index.html", {
      onBeforeLoad(win: Cypress.AUTWindow & { chrome: typeof chrome }) {
        setupExtensionEnvironment({
          win,
          bookmarks: [...Array(3)].map((_, i) =>
            generateBookmark({ title: `bookmark-item-${i}` })
          ),
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

  it("search result", async () => {
    // show tabs
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("tab-item-0");
    cy.get("[data-cy=search-result-0]").should("include.text", "tab-item-0");
    cy.get("[data-cy=search-result-type-0]").should("have.text", "tab");
    cy.get("[data-cy=search-input]").clear();

    // show bookmarks
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("bookmark-item-0");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "bookmark-item-0"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "bookmark");
    cy.get("[data-cy=search-input]").clear();

    // show histories
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("history-item-0");
    cy.get("[data-cy=search-result-0]").should(
      "include.text",
      "history-item-0"
    );
    cy.get("[data-cy=search-result-type-0]").should("have.text", "history");
    cy.get("[data-cy=search-input]").clear();

    // show unknown
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=search-result-wrapper]").should(
      "include.text",
      '"unknown-item" search with browser'
    );
    cy.get("[data-cy=search-input]").clear();

    // change selected item
    // ---------------------------------------------------------
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
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("{esc}");
    cy.window().its("close").should("be.called");

    // TODO: on Enter key
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{enter}");
    cy.get("[data-cy=search-input]").clear();

    // TODO: on ctrl Enter key
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}{enter}");
    cy.get("[data-cy=search-input]").clear();

    // on enter when browser search
    // ---------------------------------------------------------
    cy.get("[data-cy=search-input]").type("unknown-item");
    cy.get("[data-cy=browser-search-btn]");
    cy.get("[data-cy=search-input]").type("{enter}");
    cy.window()
      .its("chrome.search.query")
      .should("be.calledWith", { text: "unknown-item", disposition: 1 });
    cy.get("[data-cy=search-input]").clear();

    // favorite
    // ---------------------------------------------------------
    cy.clearLocalStorage();
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f");
    cy.get("[data-cy=search-result-0]").get("[data-cy=icon-star]");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f");
    cy.get("[data-cy=search-result-1]").get("[data-cy=icon-star]");
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-result-0]").get("[data-cy=icon-star]");
    cy.get("[data-cy=search-result-1]").get("[data-cy=icon-star]");
    cy.get("[data-cy=search-input]").type("history-item");
    cy.get("[data-cy=search-result-0]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f");
    cy.get("[data-cy=search-result-0]").get("[data-cy=icon-star-border]");
    cy.get("[data-cy=search-input]").type("{ctrl}n");
    cy.get("[data-cy=search-result-1]").should("have.class", "selected-item");
    cy.get("[data-cy=search-input]").type("{ctrl}f");
    cy.get("[data-cy=search-result-1]").get("[data-cy=icon-star-border]");
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-result-empty]").should("be.visible");
    cy.clearLocalStorage();

    // show info page
    // ---------------------------------------------------------
    cy.get("[data-cy=info-tab-btn]").click();
    cy.get("[data-cy=page-info]").should("be.visible");

    // show setting page
    // ---------------------------------------------------------
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");

    // show search page
    // ---------------------------------------------------------
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");

    // change prefix setting
    // ---------------------------------------------------------
    cy.clearLocalStorage();
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
    cy.clearLocalStorage();

    // change dark mode setting
    // ---------------------------------------------------------
    cy.clearLocalStorage();
    cy.get("[data-cy=setting-tab-btn]").click();
    cy.get("[data-cy=page-setting]").should("be.visible");
    cy.get("[data-cy=radio-light]").check();
    cy.get("html").should("not.have.class", "dark");
    cy.get("[data-cy=radio-dark]").check();
    cy.get("[data-cy=search-tab-btn]").click();
    cy.get("[data-cy=page-search]").should("be.visible");
    cy.clearLocalStorage();
  });
});

const base = "/chikamichi/";

export default {
  base,
  cleanUrls: true,
  description:
    "A browser command palette for fuzzy-searching history, bookmarks, tabs, and current-page actions.",
  head: [
    ["link", { href: `${base}logo.svg`, rel: "icon", type: "image/svg+xml" }],
    ["meta", { content: "#0b1220", name: "theme-color" }],
    ["meta", { content: "website", property: "og:type" }],
    ["meta", { content: "Chikamichi", property: "og:title" }],
    [
      "meta",
      {
        content:
          "Quickly search histories, bookmarks, tabs, and run page actions from one browser command palette.",
        property: "og:description",
      },
    ],
  ],
  lang: "en-US",
  lastUpdated: true,
  themeConfig: {
    footer: {
      copyright: "Copyright © kawamataryo",
      message: "Released under the MIT License.",
    },
    logo: "/logo.svg",
    nav: [
      { link: "/guide/getting-started", text: "Guide" },
      { link: "/guide/action-mode", text: "Actions" },
      { link: "/reference/privacy", text: "Privacy" },
      {
        items: [
          {
            link: "https://chrome.google.com/webstore/detail/chikamichi/gkhobepjbiepngbeikhbpnfgjcjgmgha",
            text: "Chrome Web Store",
          },
          {
            link: "https://addons.mozilla.org/firefox/addon/chikamichi/",
            text: "Firefox Add-ons",
          },
          {
            link: "https://microsoftedge.microsoft.com/addons/detail/chikamichi-quickly-find/kgbibnihcjkbcjbngneigamkphnoipli",
            text: "Edge Add-ons",
          },
        ],
        text: "Install",
      },
    ],
    search: {
      provider: "local",
    },
    sidebar: [
      {
        items: [
          { link: "/", text: "Overview" },
          { link: "/guide/getting-started", text: "Getting Started" },
          { link: "/guide/search", text: "Search" },
          { link: "/guide/action-mode", text: "Action Mode" },
          { link: "/guide/settings", text: "Settings" },
          { link: "/guide/development", text: "Development" },
          { link: "/reference/shortcuts", text: "Keyboard Shortcuts" },
        ],
        text: "Product",
      },
      {
        items: [
          { link: "/reference/privacy", text: "Privacy" },
          { link: "/reference/contributing", text: "Contributing" },
          { link: "/reference/changelog", text: "Changelog" },
        ],
        text: "Project",
      },
    ],
    siteTitle: "Chikamichi",
    socialLinks: [{ icon: "github", link: "https://github.com/kawamataryo/chikamichi" }],
  },
  title: "Chikamichi",
};

import type Fuse from "fuse.js";

export const SEARCH_TARGET_REGEX = {
  HISTORY: /^\/h\s(.*)/,
  BOOKMARK: /^\/b\s(.*)/,
  TAB: /^\/t\s(.*)/,
  EITHER: /^\/[hbt]\s(.*)/,
} as const;

export const SEARCH_ITEM_TYPE = {
  HISTORY: "history",
  BOOKMARK: "bookmark",
  TAB: "tab",
} as const;

export const FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
  useExtendedSearch: true,
  distance: 300,
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,
  shouldSort: true,
  keys: [
    {
      name: "title",
      weight: 0.4,
    },
    {
      name: "folderName",
      weight: 0.3,
    },
    {
      name: "url",
      weight: 0.2,
    },
    {
      name: "searchTerm",
      weight: 0.1,
    },
  ],
  threshold: 0.4,
};

export const PAGES = {
  SEARCH: "search",
  INFO: "info",
  SETTING: "setting",
} as const;

export const SEARCH_PREFIX = {
  HISTORY: "/h ",
  BOOKMARK: "/b ",
  TAB: "/t ",
};

export const THEME = {
  AUTO: "auto",
  DARK: "dark",
  LIGHT: "light",
} as const;

export const SEARCH_ICON_DATA_URL_LIGHT =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';

export const SEARCH_ICON_DATA_URL_DARK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" role="img" fill="none" stroke="lightgrey" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>';

export const BADGE_TEXT = {
  ADD_FAVORITE: "Add to favorite",
  REMOVE_FAVORITE: "Removed from favorite ",
  COPY: "Copied to clipboard",
} as const;

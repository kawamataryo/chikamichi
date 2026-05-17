import Fuse from "fuse.js";
import { type ReactNode } from "react";
import { Info, Search, Settings } from "lucide-react";
import { FUSE_OPTIONS, PAGES, SEARCH_ITEM_TYPE, SEARCH_TARGET_REGEX, THEME } from "~/constants";
import type { AppSettings } from "~/core/storage";
import { t } from "~/i18n";
import type { ActionItem, SearchCollections } from "~/popup-react/types";

export const EMPTY_COLLECTIONS: SearchCollections = {
  bookmarks: [],
  histories: [],
  tabs: [],
};

export function reportError(error: unknown) {
  window.dispatchEvent(
    new CustomEvent("chikamichi:error", {
      detail: String(error),
    }),
  );
}

function toSearchResult(item: SearchItem): SearchResult {
  return {
    ...item,
    isFavorite: false,
    matchedWord: "",
    score: 0,
  };
}

function toFavoriteResult(item: AppSettings["favoriteItems"][number]): SearchResult {
  return {
    ...item,
    isFavorite: true,
    matchedWord: "",
    score: 0,
    searchTerm: `${item.title} ${item.url} ${item.folderName ?? ""}`.trim(),
  };
}

export function getResultKey(item: Pick<SearchResult, "title" | "url" | "type">) {
  return `${item.type}:${item.title}:${item.url}`;
}

export function getResolvedTheme(theme: ValueOf<typeof THEME>) {
  if (theme === THEME.AUTO) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? THEME.DARK : THEME.LIGHT;
  }

  return theme;
}

export function createFuseIndex(items: SearchItem[]) {
  return new Fuse(items, FUSE_OPTIONS);
}

export function filterActionItems(items: ActionItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) =>
    `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(normalizedQuery),
  );
}

export function getExtractedSearchWord(searchWord: string) {
  if (SEARCH_TARGET_REGEX.EITHER.test(searchWord)) {
    return searchWord.match(SEARCH_TARGET_REGEX.EITHER)?.[1] ?? "";
  }

  return searchWord;
}

export function getInitialResults(
  searchWord: string,
  collections: SearchCollections,
  settings: AppSettings,
) {
  const favoriteItems = settings.favoriteItems.map(toFavoriteResult);

  if (SEARCH_TARGET_REGEX.HISTORY.test(searchWord)) {
    return collections.histories.slice(0, 50).map(toSearchResult);
  }

  if (SEARCH_TARGET_REGEX.BOOKMARK.test(searchWord)) {
    const bookmarkFavorites = favoriteItems.filter(
      (item) => item.type === SEARCH_ITEM_TYPE.BOOKMARK,
    );
    const bookmarkResults = collections.bookmarks
      .slice(0, 50)
      .map(toSearchResult)
      .filter(
        (item) =>
          !bookmarkFavorites.some(
            (favorite) => favorite.url === item.url && favorite.title === item.title,
          ),
      );

    return [...bookmarkFavorites, ...bookmarkResults];
  }

  if (SEARCH_TARGET_REGEX.TAB.test(searchWord)) {
    return collections.tabs.slice(0, 50).map(toSearchResult);
  }

  return favoriteItems;
}

export function highlightText(text: string, matchedWord: RegExp | string): ReactNode {
  if (typeof matchedWord === "string" || text.length === 0) {
    return text;
  }

  const flags = matchedWord.flags.includes("g") ? matchedWord.flags : `${matchedWord.flags}g`;
  const matcher = new RegExp(matchedWord.source, flags);
  const matches = Array.from(text.matchAll(matcher));

  if (matches.length === 0) {
    return text;
  }

  const fragments: ReactNode[] = [];
  let currentIndex = 0;

  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const value = match[0] ?? "";
    const end = start + value.length;

    if (start > currentIndex) {
      fragments.push(text.slice(currentIndex, start));
    }

    fragments.push(
      <mark
        className="bg-transparent font-semibold text-primary [text-decoration:none]"
        key={`${value}-${index}-${start}`}
      >
        {value}
      </mark>,
    );

    currentIndex = end;
  });

  if (currentIndex < text.length) {
    fragments.push(text.slice(currentIndex));
  }

  return fragments;
}

export function getPageMeta(page: ValueOf<typeof PAGES>) {
  switch (page) {
    case PAGES.INFO:
      return { icon: Info, label: t("pageInfoTitle"), summary: t("pageInfoSummary") };
    case PAGES.SETTING:
      return { icon: Settings, label: t("pageSettingsTitle"), summary: t("pageSettingsSummary") };
    default:
      return { icon: Search, label: t("pageSearchTitle"), summary: t("pageSearchSummary") };
  }
}

export function getThemeLabel(theme: ValueOf<typeof THEME>) {
  if (theme === THEME.AUTO) {
    return t("themeAuto");
  }

  if (theme === THEME.LIGHT) {
    return t("themeLight");
  }

  return t("themeDark");
}

export function getActionKey(item: ActionItem) {
  return `action:${item.id}`;
}

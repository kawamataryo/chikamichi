interface SearchItem {
  title: string;
  url: string;
  faviconUrl: string;
  type: "history" | "bookmark" | "tab";
  tabId?: number;
  folderName?: string;
  searchTerm: string;
  lastVisitTime?: number;
}

type SearchItemWithFavoriteAndMatchedWord = SearchItem & {
  isFavorite: boolean;
  matchedWord: RegExp | string;
  score: number | undefined;
};

type ValueOf<T> = T[keyof T];

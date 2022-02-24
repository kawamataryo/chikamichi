interface SearchItem {
  title: string;
  url: string;
  faviconUrl: string;
  type: "history" | "bookmark" | "tab";
  tabId?: number;
  folderName?: string;
  searchTerm: string;
}

type ValueOf<T> = T[keyof T];

interface HighlighterItem {
  indices?: [number, number][];
  text: string;
}

type SearchItemWithHighlight = SearchItem & {
  highlightedTitle: HighlighterItem;
  highlightedUrl: HighlighterItem;
  highlightedFolderName: HighlighterItem;
};

interface FavoriteItem {
  title: string;
  url: string;
  faviconUrl: string;
  folderName?: string;
  type: "history" | "bookmark";
}

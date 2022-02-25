import { randCatchPhrase, randNumber, randUrl, randUuid } from "@ngneat/falso";
import type { Bookmarks, History, Tabs } from "webextension-polyfill";

export const generateHistory = (
  args: { title?: string; url?: string } = {}
): History.HistoryItem => ({
  id: randUuid(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
});

export const generateBookmark = (
  args: {
    title?: string;
    url?: string;
    children?: Bookmarks.BookmarkTreeNode[];
    type?: Bookmarks.BookmarkTreeNodeType;
  } = {}
): Bookmarks.BookmarkTreeNode => ({
  id: randUuid(),
  parentId: randUuid(),
  index: randNumber(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
  dateAdded: randNumber(),
  dateGroupModified: randNumber(),
  type: args.type ?? ("bookmark" as const),
  children: args.children ?? [],
});

export const generateTab = (
  args: { title?: string; url?: string } = {}
): Partial<Tabs.Tab> => ({
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
});

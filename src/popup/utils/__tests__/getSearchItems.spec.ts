import { randCatchPhrase, randNumber, randUrl, randUuid } from "@ngneat/falso";
import type { Bookmarks, History } from "webextension-polyfill";
import { expect } from "vitest";
import {
  convertToSearchItemsFromBookmarks,
  convertToSearchItemsFromHistories,
  faviconUrl,
} from "~/popup/utils/getSearchItems";
import { SEARCH_ITEM_TYPE } from "~/constants";

vi.mock("webextension-polyfill", () => ({}));

const generateBookmark = (overwrites?: {
  title?: string;
}): Bookmarks.BookmarkTreeNode => ({
  id: randUuid(),
  parentId: randUuid(),
  index: randNumber(),
  url: randUrl(),
  title: randCatchPhrase(),
  dateAdded: randNumber(),
  dateGroupModified: randNumber(),
  type: "bookmark" as const,
  ...overwrites,
});

const generateHistory = (
  args: { title?: string; url?: string } = {}
): History.HistoryItem => ({
  id: randUuid(),
  url: args.url ?? randUrl(),
  title: args.title ?? randCatchPhrase(),
});

describe("convertToSearchItemsFromBookmarks", () => {
  it("get search items from bookmarks", () => {
    const bookmark1 = generateBookmark();
    const bookmark2 = generateBookmark();
    const bookmark3 = generateBookmark();
    const bookmark4 = generateBookmark({ title: "" });
    const nestedFolder = {
      ...generateBookmark(),
      type: "folder" as const,
      children: [bookmark3],
    };
    const folder = {
      ...generateBookmark(),
      type: "folder" as const,
      children: [bookmark2, nestedFolder],
    };
    const bookmarks = [bookmark1, folder, bookmark4];

    const searchItems = convertToSearchItemsFromBookmarks(bookmarks);

    expect(searchItems.length).toBe(4);
    expect(searchItems).toEqual([
      {
        url: bookmark1.url,
        title: bookmark1.title,
        faviconUrl: faviconUrl(bookmark1.url!),
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        folderName: "",
        searchTerm: `${bookmark1.title} ${bookmark1.url}`,
      },
      {
        url: bookmark2.url,
        title: bookmark2.title,
        faviconUrl: faviconUrl(bookmark2.url!),
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        folderName: folder.title,
        searchTerm: `${bookmark2.title} ${bookmark2.url} ${folder.title}`,
      },
      {
        url: bookmark3.url,
        title: bookmark3.title,
        faviconUrl: faviconUrl(bookmark3.url!),
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        folderName: `${folder.title}/${nestedFolder.title}`,
        searchTerm: `${bookmark3.title} ${bookmark3.url} ${folder.title}/${nestedFolder.title}`,
      },
      {
        url: bookmark4.url,
        title: bookmark4.url,
        faviconUrl: faviconUrl(bookmark4.url!),
        type: SEARCH_ITEM_TYPE.BOOKMARK,
        folderName: "",
        searchTerm: `${bookmark4.url}`,
      },
    ]);
  });

  describe("convertToSearchItemsFromHistories", () => {
    it("get search items from histories", () => {
      const histories = [generateHistory(), generateHistory()];

      const searchItems = convertToSearchItemsFromHistories(histories);

      expect(searchItems.length).toBe(2);
      expect(searchItems).toEqual([
        {
          url: histories[0].url,
          title: histories[0].title!,
          faviconUrl: faviconUrl(histories[0].url!),
          type: SEARCH_ITEM_TYPE.HISTORY,
          folderName: "",
          searchTerm: `${histories[0].title!} ${histories[0].url}`,
        },
        {
          url: histories[1].url,
          title: histories[1].title!,
          faviconUrl: faviconUrl(histories[1].url!),
          type: SEARCH_ITEM_TYPE.HISTORY,
          folderName: "",
          searchTerm: `${histories[1].title!} ${histories[1].url}`,
        },
      ]);
    });
  });

  it("remove google search histories", () => {
    const histories = [
      generateHistory({ url: "https://www.google.com/search?q=Compiler+API" }),
      generateHistory(),
    ];

    const searchItems = convertToSearchItemsFromHistories(histories);

    expect(searchItems.length).toBe(1);
    expect(searchItems).toEqual([
      {
        url: histories[1].url,
        title: histories[1].title!,
        faviconUrl: faviconUrl(histories[1].url!),
        type: SEARCH_ITEM_TYPE.HISTORY,
        folderName: "",
        searchTerm: `${histories[1].title!} ${histories[1].url}`,
      },
    ]);
  });

  it("remove same title histories", () => {
    const histories = [
      generateHistory({ title: "titleA" }),
      generateHistory({ title: "titleB" }),
      generateHistory({ title: "titleA" }),
    ];

    const searchItems = convertToSearchItemsFromHistories(histories);

    expect(searchItems.length).toBe(2);
    expect(searchItems).toContainEqual({
      url: histories[1].url,
      title: histories[1].title!,
      faviconUrl: faviconUrl(histories[1].url!),
      type: SEARCH_ITEM_TYPE.HISTORY,
      folderName: "",
      searchTerm: `${histories[1].title!} ${histories[1].url}`,
    });
    expect(searchItems).toContainEqual({
      url: histories[2].url,
      title: histories[2].title!,
      faviconUrl: faviconUrl(histories[2].url!),
      type: SEARCH_ITEM_TYPE.HISTORY,
      folderName: "",
      searchTerm: `${histories[2].title!} ${histories[2].url}`,
    });
  });

  describe("faviconUrl", () => {
    it("get domain", () => {
      const url = "https://www.google.com/search?q=Compiler+API";
      expect(faviconUrl(url)).toBe(
        "https://www.google.com/s2/favicons?domain=google.com"
      );
    });
  });
});

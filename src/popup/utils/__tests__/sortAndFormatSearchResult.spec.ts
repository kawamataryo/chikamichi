import Fuse from "fuse.js";
import { expect } from "vitest";
import { sortSearchResult } from "../sortAndFormatSearchResult";

describe("sortSearchResult", () => {
  // sort search result by last visit time of each score
  const baseSearchItem: SearchItem = {
    title: "test",
    url: "test",
    faviconUrl: "test",
    type: "history" as const,
    tabId: 10,
    folderName: "test",
    searchTerm: "test",
    lastVisitTime: 10,
  };

  it("sort items by last visits time", () => {
    const target: Fuse.FuseResult<SearchItem>[] = [
      {
        score: 0.123,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 12 },
      },
      {
        score: 0.223,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 11 },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: undefined },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 14 },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 10 },
      },
      {
        score: 0.952,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 20 },
      },
      {
        score: 0.953,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 13 },
      },
    ];

    expect(sortSearchResult(target)).toEqual([
      {
        score: 0.123,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 12 },
      },
      {
        score: 0.223,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 11 },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: undefined },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 14 },
      },
      {
        score: 0.823,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 10 },
      },
      {
        score: 0.952,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 20 },
      },
      {
        score: 0.953,
        refIndex: 1,
        item: { ...baseSearchItem, lastVisitTime: 13 },
      },
    ]);
  });

  it("same order if don't have lastVisitTime", () => {
    const target: Fuse.FuseResult<SearchItem>[] = [
      { score: 0.953, refIndex: 1, item: { ...baseSearchItem } },
      { score: 0.952, refIndex: 1, item: { ...baseSearchItem } },
      { score: 0.823, refIndex: 1, item: { ...baseSearchItem } },
    ];

    expect(sortSearchResult(target)).toEqual([
      { score: 0.953, refIndex: 1, item: { ...baseSearchItem } },
      { score: 0.952, refIndex: 1, item: { ...baseSearchItem } },
      { score: 0.823, refIndex: 1, item: { ...baseSearchItem } },
    ]);
  });
});

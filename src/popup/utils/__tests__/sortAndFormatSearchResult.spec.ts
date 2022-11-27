import { expect } from "vitest";
import { sortSearchResult } from "../sortAndFormatSearchResult";

describe("sortSearchResult", () => {
  // sort search result by last visit time of each score
  const baseSearchResult: SearchItemWithFavoriteAndMatchedWord = {
    title: "test",
    url: "test",
    faviconUrl: "test",
    type: "history" as const,
    tabId: 10,
    folderName: "test",
    searchTerm: "test",
    lastVisitTime: 10,
    isFavorite: false,
    matchedWord: /test/,
    score: 0.1,
  };

  it("sort items by last visits time", () => {
    const target: SearchItemWithFavoriteAndMatchedWord[] = [
      {
        ...baseSearchResult,
        lastVisitTime: 12,
        score: 0.123,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 11,
        score: 0.223,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 14,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: undefined,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 20,
        score: 0.952,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 10,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 13,
        score: 0.953,
        isFavorite: false,
      },
    ];

    expect(sortSearchResult(target)).toEqual([
      {
        ...baseSearchResult,
        lastVisitTime: 12,
        score: 0.123,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 11,
        score: 0.223,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: undefined,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 14,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 10,
        score: 0.823,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 20,
        score: 0.952,
        isFavorite: false,
      },
      {
        ...baseSearchResult,
        lastVisitTime: 13,
        score: 0.953,
        isFavorite: false,
      },
    ]);
  });

  it("same order if don't have lastVisitTime", () => {
    const target: SearchItemWithFavoriteAndMatchedWord[] = [
      { ...baseSearchResult, score: 0.953, lastVisitTime: undefined },
      { ...baseSearchResult, score: 0.952, lastVisitTime: undefined },
      { ...baseSearchResult, score: 0.823, lastVisitTime: undefined },
    ];

    expect(sortSearchResult(target)).toEqual([
      { ...baseSearchResult, score: 0.823, lastVisitTime: undefined },
      { ...baseSearchResult, score: 0.953, lastVisitTime: undefined },
      { ...baseSearchResult, score: 0.952, lastVisitTime: undefined },
    ]);
  });

  it("prefer favorite item if same score", () => {
    const target: SearchItemWithFavoriteAndMatchedWord[] = [
      { ...baseSearchResult, score: 0.814, isFavorite: true },
      { ...baseSearchResult, score: 0.813, isFavorite: true },
      { ...baseSearchResult, score: 0.952 },
      { ...baseSearchResult, score: 0.953, isFavorite: true },
    ];

    expect(sortSearchResult(target)).toEqual([
      { ...baseSearchResult, score: 0.814, isFavorite: true },
      { ...baseSearchResult, score: 0.813, isFavorite: true },
      { ...baseSearchResult, score: 0.953, isFavorite: true },
      { ...baseSearchResult, score: 0.952 },
    ]);
  });
});

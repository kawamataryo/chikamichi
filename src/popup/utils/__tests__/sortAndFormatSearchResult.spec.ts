import { describe, expect, it } from "vitest";
import { sortAndFormatSearchResult, sortSearchResult } from "../sortAndFormatSearchResult";

describe("sortSearchResult", () => {
  // Sort search result by last visit time of each score
  const baseSearchResult: SearchResult = {
    faviconUrl: "test",
    folderName: "test",
    isFavorite: false,
    lastVisitTime: 10,
    matchedWord: /test/u,
    score: 0.1,
    searchTerm: "test",
    tabId: 10,
    title: "test",
    type: "history" as const,
    url: "test",
  };

  it("sort items by last visits time", () => {
    const target: SearchResult[] = [
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 12,
        score: 0.123,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 11,
        score: 0.223,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 14,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: undefined,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 20,
        score: 0.952,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 10,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 13,
        score: 0.953,
      },
    ];

    expect(sortSearchResult(target)).toEqual([
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 12,
        score: 0.123,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 11,
        score: 0.223,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: undefined,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 14,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 10,
        score: 0.823,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 20,
        score: 0.952,
      },
      {
        ...baseSearchResult,
        isFavorite: false,
        lastVisitTime: 13,
        score: 0.953,
      },
    ]);
  });

  it("same order if don't have lastVisitTime", () => {
    const target: SearchResult[] = [
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.953 },
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.952 },
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.823 },
    ];

    expect(sortSearchResult(target)).toEqual([
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.823 },
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.953 },
      { ...baseSearchResult, lastVisitTime: undefined, score: 0.952 },
    ]);
  });

  it("does not reorder items only because favorite state changed", () => {
    const target: SearchResult[] = [
      { ...baseSearchResult, isFavorite: true, score: 0.814 },
      { ...baseSearchResult, isFavorite: true, score: 0.813 },
      { ...baseSearchResult, score: 0.952 },
      { ...baseSearchResult, isFavorite: true, score: 0.953 },
    ];

    expect(sortSearchResult(target)).toEqual([
      { ...baseSearchResult, isFavorite: true, score: 0.814 },
      { ...baseSearchResult, isFavorite: true, score: 0.813 },
      { ...baseSearchResult, score: 0.952 },
      { ...baseSearchResult, isFavorite: true, score: 0.953 },
    ]);
  });

  it("boosts results from recent hostnames", () => {
    const target = [
      {
        item: {
          ...baseSearchResult,
          title: "other-host",
          url: "https://other.example.com/page",
        },
        matches: [{ indices: [[0, 3]], key: "title", value: "other-host" }],
        score: 0.12,
      },
      {
        item: {
          ...baseSearchResult,
          title: "recent-host",
          url: "https://recent.example.com/page",
        },
        matches: [{ indices: [[0, 3]], key: "title", value: "recent-host" }],
        score: 0.12,
      },
    ] as any;

    const result = sortAndFormatSearchResult(target, {
      favoriteLookup: new Set(),
      recentContext: {
        activeHostname: null,
        recentHostnames: new Set<string>(["recent.example.com"]),
      },
    });

    expect(result[0]?.url).toBe("https://recent.example.com/page");
  });

  it("boosts results opened through Chikamichi recently", () => {
    const now = new Date("2026-05-17T00:00:00.000Z").getTime();
    const target = [
      {
        item: {
          ...baseSearchResult,
          title: "plain-result",
          url: "https://plain.example.com/page",
        },
        matches: [{ indices: [[0, 3]], key: "title", value: "plain-result" }],
        score: 0.12,
      },
      {
        item: {
          ...baseSearchResult,
          title: "learned-result",
          url: "https://learned.example.com/page",
        },
        matches: [{ indices: [[0, 3]], key: "title", value: "learned-result" }],
        score: 0.12,
      },
    ] as any;

    const result = sortAndFormatSearchResult(target, {
      favoriteLookup: new Set(),
      now,
      openStatsLookup: new Map([
        [
          "https://learned.example.com/page",
          {
            lastOpenedAt: now,
            openCount: 3,
          },
        ],
      ]),
      recentContext: {
        activeHostname: null,
        recentHostnames: new Set<string>(),
      },
    });

    expect(result[0]?.url).toBe("https://learned.example.com/page");
  });
});

import type { FuseResult } from "fuse.js";
import { SEARCH_RANKING_CONFIG } from "~/constants";
import { getMatchedRegExp } from "./getMatchedRegExp";

type RecentContextBoost = {
  activeHostname: string | null;
  recentHostnames: Set<string>;
};

export type OpenStatsLookup = Map<string, { lastOpenedAt: number; openCount: number }>;

type SortAndFormatSearchResultOptions = {
  favoriteLookup: Set<string>;
  now?: number;
  openStatsLookup?: OpenStatsLookup;
  recentContext?: RecentContextBoost;
};

function getHostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./u, "");
  } catch {
    return null;
  }
}

function getRecentContextBoostScore(item: SearchItem, recentContext: RecentContextBoost) {
  const hostname = getHostname(item.url);

  if (!hostname) {
    return 0;
  }

  if (recentContext.recentHostnames.has(hostname)) {
    return SEARCH_RANKING_CONFIG.recentHostnameBoost;
  }

  return 0;
}

function getOpenStatsBoostScore(
  item: SearchItem,
  openStatsLookup: OpenStatsLookup,
  now = Date.now(),
) {
  const stats = openStatsLookup.get(item.url);

  if (!stats) {
    return 0;
  }

  const frequencyBoost = Math.min(
    Math.log2(stats.openCount + 1) * SEARCH_RANKING_CONFIG.openStatsBoost.frequencyMultiplier,
    SEARCH_RANKING_CONFIG.openStatsBoost.frequencyMax,
  );
  const age = Math.max(0, now - stats.lastOpenedAt);
  const recencyBoost =
    Math.max(0, 1 - age / SEARCH_RANKING_CONFIG.openStatsBoost.recencyWindowMs) *
    SEARCH_RANKING_CONFIG.openStatsBoost.recencyMax;

  return Math.min(SEARCH_RANKING_CONFIG.openStatsBoost.maxTotal, frequencyBoost + recencyBoost);
}

export function sortSearchResult(searchResult: SearchResult[]) {
  const roundingFunc = (num: number) => Math.round(num * SEARCH_RANKING_CONFIG.scoreRoundingFactor);

  // Group by score
  const mapKeys: number[] = [];
  const searchResultGroupByScore = searchResult.reduce(
    (acc, cur, _i) => {
      const score = roundingFunc(cur.score!);
      if (acc[score]) {
        acc[score].push(cur);
      } else {
        acc[score] = [cur];
        mapKeys.push(score);
      }
      return acc;
    },
    {} as Record<number, SearchResult[]>,
  );

  // Sort by last visit time of each score
  return mapKeys
    .sort((a, b) => a - b)
    .map((key) =>
      searchResultGroupByScore[key].sort((a, b) => {
        // Bookmarks and tabs don't have lastVisitTime
        // Display bookmarks and tabs in priority order
        const aTime = a.lastVisitTime || Infinity;
        const bTime = b.lastVisitTime || Infinity;

        if (aTime === bTime) {
          return 0;
        }
        return bTime > aTime ? 1 : -1;
      }),
    )
    .flat();
}

export function sortAndFormatSearchResult(
  searchResult: FuseResult<SearchItem>[],
  {
    favoriteLookup,
    now = Date.now(),
    openStatsLookup = new Map(),
    recentContext = {
      activeHostname: null,
      recentHostnames: new Set<string>(),
    },
  }: SortAndFormatSearchResultOptions,
) {
  return sortSearchResult(
    searchResult.map((result) => ({
      ...result.item,
      isFavorite: favoriteLookup.has(`${result.item.url}::${result.item.title}`),
      matchedWord: getMatchedRegExp(
        result!.matches![0].value!,
        result!.matches![0].indices as [number, number][],
      ),
      score:
        (result.score ?? 0) -
        getRecentContextBoostScore(result.item, recentContext) -
        getOpenStatsBoostScore(result.item, openStatsLookup, now),
    })),
  );
}

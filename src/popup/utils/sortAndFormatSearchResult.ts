import Fuse from "fuse.js";
import { getMatchedRegExp } from "./getMatchedRegExp";

export const sortSearchResult = (
  searchResult: Fuse.FuseResult<SearchItem>[]
) => {
  const roundingFunc = (num: number) => Math.round(num * 100);

  // group by score
  const mapKeys: number[] = [];
  const searchResultGroupByScore = searchResult.reduce((acc, cur, _i) => {
    const score = roundingFunc(cur.score!);
    if (acc[score]) {
      acc[score].push(cur);
    } else {
      acc[score] = [cur];
      mapKeys.push(score);
    }
    return acc;
  }, {} as Record<number, Fuse.FuseResult<SearchItem>[]>);

  // sort by last visit time of each score
  return mapKeys
    .map((key) =>
      searchResultGroupByScore[key].slice().sort((a, b) => {
        // bookmarks and tabs don't have lastVisitTime
        // display bookmarks and tabs in priority order
        const aTime = a.item.lastVisitTime || Infinity;
        const bTime = b.item.lastVisitTime || Infinity;

        if (aTime === bTime) {
          return 0;
        }
        return bTime > aTime ? 1 : -1;
      })
    )
    .flat();
};

export const sortAndFormatSearchResult = (
  searchResult: Fuse.FuseResult<SearchItem>[],
  favoriteItems: SearchItemWithFavoriteAndMatchedWord[]
) => {
  return sortSearchResult(searchResult).map((result) => {
    return {
      ...result.item,
      isFavorite: favoriteItems.some(
        (i) => i.url === result.item.url && i.title === result.item.title
      ),
      matchedWord: getMatchedRegExp(
        result!.matches![0].value!,
        result!.matches![0].indices as [number, number][]
      ),
    };
  });
};

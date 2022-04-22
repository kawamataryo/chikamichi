import Fuse from "fuse.js";
import debounce from "lodash.debounce";
import { sendMessage } from "webext-bridge";
import type { Search } from "webextension-polyfill";
import {
  FUSE_OPTIONS,
  SEARCH_ICON_DATA_URL_DARK,
  SEARCH_ICON_DATA_URL_LIGHT,
  SEARCH_ITEM_TYPE,
  SEARCH_TARGET_REGEX,
  THEME,
} from "~/constants";
import { defaultSearchPrefix, favoriteItems, theme } from "~/logic";
import { getMatchedRegExp } from "~/popup/utils/getMatchedRegExp";
import { STORE_KEY, useStore } from "~/popup/utils/store";

export const useSearch = () => {
  const store = inject<ReturnType<typeof useStore>>(STORE_KEY);
  if (!store) throw new Error("store is not provided");

  const searchItems = computed(() => store.state.searchItems);

  const _searchWord = ref(defaultSearchPrefix.value);
  const searchWord = computed({
    get() {
      return _searchWord.value;
    },
    // NOTE: When hold the key, the character will be insert repeatedly. This causes the setter to be called repeatedly at high speed.
    // Writing the store is expensive, so too many calls can cause performance problems. So use debounce to avoid this.
    set: debounce((value: string) => {
      _searchWord.value = value;
    }, 200),
  });

  const extractOnlySearchWord = computed(() => {
    // Since searchWord may contain search prefix, if it does, return a value that excludes it.
    if (SEARCH_TARGET_REGEX.EITHER.test(searchWord.value)) {
      return searchWord.value.match(SEARCH_TARGET_REGEX.EITHER)![1];
    }
    return searchWord.value;
  });

  const searchItemsOnlyHistory = computed(() =>
    searchItems.value.filter((i) => i.type === SEARCH_ITEM_TYPE.HISTORY)
  );
  const searchItemsOnlyBookmark = computed(() =>
    searchItems.value.filter((i) => i.type === SEARCH_ITEM_TYPE.BOOKMARK)
  );
  const searchItemsOnlyTab = computed(() =>
    searchItems.value.filter((i) => i.type === SEARCH_ITEM_TYPE.TAB)
  );
  const selectedNumber = ref(0);

  const parsedFavoriteItems = computed(
    () =>
      JSON.parse(favoriteItems.value) as SearchItemWithFavoriteAndMatchedWord[]
  );

  const initialSearchItems = computed<SearchItemWithFavoriteAndMatchedWord[]>(
    () => {
      return parsedFavoriteItems.value.map((i) => ({
        ...i,
        isFavorite: true,
        tabId: undefined,
        matchedWord: "",
      }));
    }
  );

  const isFavorite = (url: string, title: string) => {
    return parsedFavoriteItems.value.some(
      (i) => i.url === url && i.title === title
    );
  };

  const searchResult = ref<SearchItemWithFavoriteAndMatchedWord[]>([]);

  const fussySearch = async () => {
    if (!searchItems.value) return [];

    if (!searchWord.value) {
      // initial display
      return initialSearchItems.value.slice(0, 100);
    }

    const word = extractOnlySearchWord.value || "h"; // "h" is included in all URLs;
    let target = searchItems.value;

    // Selecting targets with the prefix
    if (SEARCH_TARGET_REGEX.HISTORY.test(searchWord.value)) {
      target = searchItemsOnlyHistory.value;
    } else if (SEARCH_TARGET_REGEX.BOOKMARK.test(searchWord.value)) {
      target = searchItemsOnlyBookmark.value;
    } else if (SEARCH_TARGET_REGEX.TAB.test(searchWord.value)) {
      target = searchItemsOnlyTab.value;
    }

    return await new Promise<SearchItemWithFavoriteAndMatchedWord[]>(
      (resolve) => {
        const fuse = new Fuse(target, FUSE_OPTIONS);
        const result = fuse
          .search<SearchItem>(word, { limit: 100 })
          .map((result) => {
            return {
              ...result.item,
              isFavorite: isFavorite(result.item.url, result.item.title),
              matchedWord: getMatchedRegExp(
                result!.matches![0].value!,
                result!.matches![0].indices as [number, number][]
              ),
            };
          });
        resolve(result);
      }
    );
  };

  watch(
    searchWord,
    async () => {
      searchResult.value = await fussySearch();
    },
    {
      immediate: true,
    }
  );
  const changeSelectedItem = (number: number) => {
    selectedNumber.value = number;
  };

  const browserSearch = async (query: string, inNewTab?: boolean) => {
    if (browser.search.search) {
      // Firefox API
      await browser.search.search({
        query,
        tabId: inNewTab
          ? undefined
          : (
              await browser.tabs.query({
                active: true,
                currentWindow: true,
              })
            )[0].id,
      });
    } else {
      // Chrome API
      await browser.search.query({
        text: query,
        disposition: inNewTab
          ? browser.search.Disposition.NEW_TAB
          : browser.search.Disposition.CURRENT_TAB,
      });
    }
  };

  const changePage = async (isNewTab = false) => {
    if (searchResult.value.length) {
      const target = searchResult.value[selectedNumber.value];
      // if selected tab link, send change tab message to background script
      if (target.tabId) {
        await sendMessage("change-current-tab", {
          tabId: target.tabId,
        });
        return;
      }
      // otherwise, open the link in the specified way.
      if (isNewTab) {
        await sendMessage("open-new-tab-page", {
          url: target.url,
        });
      } else {
        await sendMessage("update-current-page", {
          url: target.url,
        });
      }
      return;
    }
    const word = extractOnlySearchWord.value;
    if (word) {
      await browserSearch(word, isNewTab);
    }
  };

  const changePageWithClick = async (url: string, tabId?: number) => {
    // if selected tab link, send change tab message to background script
    if (tabId) {
      await sendMessage("change-current-tab", {
        tabId,
      });
      return;
    }
    // otherwise, open the link.
    await sendMessage("update-current-page", {
      url,
    });
  };

  const toggleFavorite = async (searchItem?: SearchItem) => {
    const item = searchItem || searchResult.value[selectedNumber.value];
    if (item.tabId) {
      return;
    }
    if (isFavorite(item.url, item.title)) {
      favoriteItems.value = JSON.stringify(
        parsedFavoriteItems.value.filter((i) => i.url !== item.url)
      );
    } else {
      favoriteItems.value = JSON.stringify([
        ...parsedFavoriteItems.value,
        {
          url: item.url,
          title: item.title,
          faviconUrl: item.faviconUrl,
          type: item.type,
          folderName: item.folderName,
        },
      ]);
    }
  };

  watch(
    favoriteItems,
    async () => {
      searchResult.value = await fussySearch();
    },
    {
      immediate: true,
    }
  );

  const searchEngine = ref({
    name: "browser",
    favIconUrl:
      theme.value === THEME.DARK
        ? SEARCH_ICON_DATA_URL_DARK
        : SEARCH_ICON_DATA_URL_LIGHT,
  });

  onMounted(async () => {
    if (browser.search.get) {
      // This API is only available in Firefox
      const _searchEngine = (await browser.search.get()).find(
        (e: Search.SearchEngine) => e.isDefault
      );
      if (_searchEngine) {
        searchEngine.value = _searchEngine;
      }
    }
  });

  return {
    searchEngine,
    searchWord,
    searchResult,
    selectedNumber,
    changePage,
    changePageWithClick,
    toggleFavorite,
    changeSelectedItem,
    extractOnlySearchWord,
    browserSearch,
  };
};

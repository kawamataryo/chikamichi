import debounce from "lodash.debounce";
import { sendMessage } from "webext-bridge";
import type { Search } from "webextension-polyfill";
import {
  BADGE_TEXT,
  SEARCH_ICON_DATA_URL_DARK,
  SEARCH_ICON_DATA_URL_LIGHT,
  SEARCH_ITEM_TYPE,
  SEARCH_TARGET_REGEX,
  THEME,
} from "~/constants";
import {
  defaultSearchPrefix,
  favoriteItems,
  fuseSearch,
  openLinkInCurrentTab,
  theme,
} from "~/logic";
import { sortAndFormatSearchResult } from "~/popup/utils/sortAndFormatSearchResult";
import { STORE_KEY, useStore } from "~/popup/utils/store";

export const useSearch = () => {
  const store = inject<ReturnType<typeof useStore>>(STORE_KEY);
  if (!store) {
    throw new Error("store is not provided");
  }

  const loading = ref(true);
  const searchItems = computed(() => store.allItems.value);

  const _searchWord = ref(defaultSearchPrefix.value);
  const searchWord = computed({
    get: () => _searchWord.value,
    set: (value) => {
      loading.value = true;
      _searchWord.value = value;
    },
  });

  const badgeText = ref<typeof BADGE_TEXT[keyof typeof BADGE_TEXT] | "">("");

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
      // If there is , return an empty array.
      if (searchWord.value) {
        return [];
      }
      return parsedFavoriteItems.value.map((i) => ({
        ...i,
        isFavorite: true,
        tabId: undefined,
        matchedWord: "",
      }));
    }
  );

  const searchResult = ref<SearchItemWithFavoriteAndMatchedWord[]>(
    initialSearchItems.value.slice(0, 100)
  );

  const isFavorite = (url: string, title: string) => {
    return parsedFavoriteItems.value.some(
      (i) => i.url === url && i.title === title
    );
  };

  const search = async () => {
    const word = extractOnlySearchWord.value || "http"; // "http" is included in all URLs;
    let target = searchItems.value;

    // Selecting targets with the prefix
    if (SEARCH_TARGET_REGEX.HISTORY.test(searchWord.value)) {
      target = searchItemsOnlyHistory.value;
    } else if (SEARCH_TARGET_REGEX.BOOKMARK.test(searchWord.value)) {
      target = searchItemsOnlyBookmark.value;
    } else if (SEARCH_TARGET_REGEX.TAB.test(searchWord.value)) {
      target = searchItemsOnlyTab.value;
    }

    // use Background Search API
    try {
      const fuseSearchResult = await fuseSearch(word, target);
      // If the searchWord is empty, do not update the search result.
      if (searchWord.value) {
        searchResult.value = sortAndFormatSearchResult(
          fuseSearchResult,
          parsedFavoriteItems.value,
          !!extractOnlySearchWord.value
        );
      }
    } finally {
      loading.value = false;
    }
  };

  const debouncedSearch = debounce(search, 100);

  watch(
    [searchWord, searchItems],
    async () => {
      if (!searchItems.value.length) {
        return;
      }

      if (!searchWord.value) {
        // show initial display
        searchResult.value = initialSearchItems.value.slice(0, 100);
        loading.value = false;
        return;
      }

      await debouncedSearch();
    },
    {
      immediate: true,
    }
  );

  const changeSelectedItem = (number: number) => {
    selectedNumber.value = number;
    badgeText.value = "";
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
      // swap the default action if openLinkInCurrentTab is false. #582
      if (openLinkInCurrentTab.value ? isNewTab : !isNewTab) {
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
    if (openLinkInCurrentTab.value) {
      await sendMessage("update-current-page", {
        url,
      });
    } else {
      await sendMessage("open-new-tab-page", {
        url,
      });
    }
  };

  let timerId: ReturnType<typeof setTimeout>;
  const showBadge = async (
    text: typeof BADGE_TEXT[keyof typeof BADGE_TEXT] | ""
  ) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    badgeText.value = text;
    await new Promise((resolve) => {
      timerId = setTimeout(resolve, 1000);
    });
    badgeText.value = "";
  };

  const toggleFavorite = async (searchItem?: SearchItem) => {
    const item = searchItem || searchResult.value[selectedNumber.value];
    if (isFavorite(item.url, item.title)) {
      favoriteItems.value = JSON.stringify(
        parsedFavoriteItems.value.filter((i) => i.url !== item.url)
      );

      // If the initial display is displayed, update the searchItems to initialSearchItems
      if (searchWord.value) {
        searchResult.value[selectedNumber.value] = {
          ...searchResult.value[selectedNumber.value],
          isFavorite: false,
        };
        await showBadge(BADGE_TEXT.REMOVE_FAVORITE);
      } else {
        searchResult.value = initialSearchItems.value.slice(0, 100);
      }
    } else {
      const type =
        item.type !== SEARCH_ITEM_TYPE.TAB
          ? item.type
          : SEARCH_ITEM_TYPE.HISTORY;
      favoriteItems.value = JSON.stringify([
        ...parsedFavoriteItems.value,
        {
          url: item.url,
          title: item.title,
          faviconUrl: item.faviconUrl,
          type,
          folderName: item.folderName,
        },
      ]);
      searchResult.value[selectedNumber.value] = {
        ...searchResult.value[selectedNumber.value],
        isFavorite: true,
      };
      await showBadge(BADGE_TEXT.ADD_FAVORITE);
    }
  };

  const copyUrlOfSelectedItem = async () => {
    const item = searchResult.value[selectedNumber.value];
    await navigator.clipboard.writeText(item.url);
    await showBadge(BADGE_TEXT.COPY);
  };

  const searchEngine = ref({
    name: "browser",
    favIconUrl:
      theme.value !== THEME.LIGHT
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
    copyUrlOfSelectedItem,
    badgeText,
    loading,
  };
};

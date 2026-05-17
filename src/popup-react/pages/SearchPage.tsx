import { sendToBackground } from "@plasmohq/messaging";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import browser, { type Search } from "webextension-polyfill";
import {
  type AppSettings,
  DEFAULT_SETTINGS,
  type OpenStatsRecord,
  getOpenStats,
  recordOpenedUrl,
} from "~/core/storage";
import {
  SEARCH_ICON_DATA_URL_DARK,
  SEARCH_ICON_DATA_URL_LIGHT,
  SEARCH_RESULT_LIMIT,
  SEARCH_TARGET_REGEX,
  THEME,
} from "~/constants";
import { t } from "~/i18n";
import {
  moveFavoriteItem,
  moveFavoriteItemToIndex,
  toggleFavoriteItems,
} from "~/popup-react/favorites";
import { SearchFooter } from "~/popup-react/components/search-page/SearchFooter";
import { SearchInputBar } from "~/popup-react/components/search-page/SearchInputBar";
import { SearchResultsPanel } from "~/popup-react/components/search-page/SearchResultsPanel";
import { useActionItems } from "~/popup-react/hooks/use-action-items";
import { useFeedbackBadge } from "~/popup-react/hooks/use-feedback-badge";
import type { ActionItem } from "~/popup-react/types";
import {
  EMPTY_COLLECTIONS,
  createFuseIndex,
  filterActionItems,
  getActionKey,
  getExtractedSearchWord,
  getInitialResults,
  getResolvedTheme,
  getResultKey,
  reportError,
} from "~/popup-react/utils";
import { getSearchItems } from "~/popup/utils/getSearchItems";
import { sortAndFormatSearchResult } from "~/popup/utils/sortAndFormatSearchResult";

type SearchCollections = Awaited<ReturnType<typeof getSearchItems>>;
type SearchEngineState = {
  favIconUrl: string;
  name: string;
};
type BrowserSearchWithDisposition = typeof browser.search & {
  Disposition: Record<"CURRENT_TAB" | "NEW_TAB", Search.Disposition>;
};

function getHostname(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.replace(/^www\./u, "");
  } catch {
    return null;
  }
}

export function SearchPage({
  onUpdateSettings,
  settings,
}: {
  onUpdateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  settings: AppSettings;
}) {
  const [activeTab, setActiveTab] = useState<browser.Tabs.Tab | null>(null);
  const [collections, setCollections] = useState<SearchCollections>(EMPTY_COLLECTIONS);
  const [favoriteItems, setFavoriteItems] = useState(settings.favoriteItems);
  const [loadingCollections, setLoadingCollections] = useState(true);
  const [openStats, setOpenStats] = useState<OpenStatsRecord[]>([]);
  const [searchWord, setSearchWord] = useState(settings.defaultSearchPrefix);
  const [selectedNumber, setSelectedNumber] = useState(0);
  const [selectedKey, setSelectedKey] = useState("");
  const [draggedFavoriteIndex, setDraggedFavoriteIndex] = useState<number | null>(null);
  const [dragOverFavoriteIndex, setDragOverFavoriteIndex] = useState<number | null>(null);
  const [searchEngine, setSearchEngine] = useState<SearchEngineState>({
    favIconUrl: SEARCH_ICON_DATA_URL_LIGHT,
    name: "browser",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLElement | null>>([]);
  const resultsWrapperRef = useRef<HTMLDivElement>(null);
  const suppressHoverSelectionRef = useRef(false);
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const { badgeText, badgeVisible, clearBadge, showBadge } = useFeedbackBadge();
  const getMockActiveTab = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      (
        window as typeof window & {
          chikamichiMockActiveTab?: browser.Tabs.Tab | null;
        }
      ).chikamichiMockActiveTab ?? null
    );
  }, []);
  const deferredSearchWord = useDeferredValue(searchWord);
  const inputActionMode = useMemo(() => SEARCH_TARGET_REGEX.ACTION.test(searchWord), [searchWord]);
  const inputActionQuery = useMemo(() => {
    if (!inputActionMode) {
      return "";
    }

    return searchWord.match(SEARCH_TARGET_REGEX.ACTION)?.[1] ?? "";
  }, [inputActionMode, searchWord]);
  const actionMode = useMemo(
    () => SEARCH_TARGET_REGEX.ACTION.test(deferredSearchWord),
    [deferredSearchWord],
  );
  const actionQuery = useMemo(() => {
    if (!actionMode) {
      return "";
    }

    return deferredSearchWord.match(SEARCH_TARGET_REGEX.ACTION)?.[1] ?? "";
  }, [actionMode, deferredSearchWord]);
  const extractedSearchWord = useMemo(
    () => getExtractedSearchWord(deferredSearchWord),
    [deferredSearchWord],
  );
  const favoriteLookup = useMemo(
    () => new Set(favoriteItems.map((item) => `${item.url}::${item.title}`)),
    [favoriteItems],
  );
  const openStatsLookup = useMemo(
    () =>
      new Map(
        openStats.map((item) => [
          item.url,
          {
            lastOpenedAt: item.lastOpenedAt,
            openCount: item.openCount,
          },
        ]),
      ),
    [openStats],
  );
  const recentContext = useMemo(() => {
    const activeHostname = getHostname(activeTab?.url);
    const recentHostnames = new Set<string>();

    const recentItems = [...collections.tabs, ...collections.histories]
      .sort((a, b) => (b.lastVisitTime ?? 0) - (a.lastVisitTime ?? 0))
      .slice(0, 8);

    recentItems.forEach((item) => {
      const hostname = getHostname(item.url);

      if (!hostname || hostname === activeHostname) {
        return;
      }

      recentHostnames.add(hostname);
    });

    return {
      activeHostname,
      recentHostnames,
    };
  }, [activeTab?.url, collections.histories, collections.tabs]);
  const fuseIndexes = useMemo(() => {
    const allItems = [...collections.histories, ...collections.bookmarks, ...collections.tabs];

    return {
      all: createFuseIndex(allItems),
      bookmarks: createFuseIndex(collections.bookmarks),
      histories: createFuseIndex(collections.histories),
      tabs: createFuseIndex(collections.tabs),
    };
  }, [collections]);

  useEffect(() => {
    setFavoriteItems(settings.favoriteItems);
  }, [settings.favoriteItems]);

  useEffect(() => {
    setSearchWord(settings.defaultSearchPrefix);
  }, [settings.defaultSearchPrefix]);

  const loadActiveTab = useCallback(async () => {
    const mockActiveTab = getMockActiveTab();
    if (mockActiveTab) {
      setActiveTab(mockActiveTab);
      return mockActiveTab;
    }

    const [currentTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (currentTab) {
      setActiveTab(currentTab);
      return currentTab;
    }

    const [fallbackTab] = await browser.tabs.query({});
    setActiveTab(fallbackTab ?? null);
    return fallbackTab ?? null;
  }, [getMockActiveTab]);

  useEffect(() => {
    loadActiveTab().catch(reportError);

    getSearchItems()
      .then(setCollections)
      .catch(reportError)
      .finally(() => {
        setLoadingCollections(false);
      });

    getOpenStats().then(setOpenStats).catch(reportError);

    inputRef.current?.focus();
  }, [loadActiveTab]);

  useEffect(() => {
    const fallbackSearchEngine = {
      favIconUrl:
        getResolvedTheme(settings.theme) === THEME.DARK
          ? SEARCH_ICON_DATA_URL_DARK
          : SEARCH_ICON_DATA_URL_LIGHT,
      name: "browser",
    };

    if (!browser.search.get) {
      setSearchEngine(fallbackSearchEngine);
      return;
    }

    browser.search
      .get()
      .then((engines) => {
        const defaultEngine = engines.find((engine) => engine.isDefault);
        setSearchEngine(
          defaultEngine
            ? {
                favIconUrl: defaultEngine.favIconUrl ?? fallbackSearchEngine.favIconUrl,
                name: defaultEngine.name,
              }
            : fallbackSearchEngine,
        );
      })
      .catch(reportError);
  }, [settings.theme]);

  useEffect(() => {
    setSelectedNumber(0);
    setSelectedKey("");
    resultsWrapperRef.current?.scrollTo(0, 0);
  }, [collections, deferredSearchWord]);

  const refreshActiveTab = () => loadActiveTab();

  const actionItems = useActionItems({
    activeTab,
    refreshActiveTab,
    showBadge,
  });

  const closePopup = () => {
    window.close();
  };

  const searchResult = useMemo(() => {
    if (actionMode) {
      return [];
    }

    if (
      collections.bookmarks.length === 0 &&
      collections.histories.length === 0 &&
      collections.tabs.length === 0
    ) {
      return [];
    }

    if (!deferredSearchWord || !extractedSearchWord) {
      return getInitialResults(deferredSearchWord, collections, {
        ...DEFAULT_SETTINGS,
        favoriteItems,
      });
    }

    let targetFuse = fuseIndexes.all;
    if (SEARCH_TARGET_REGEX.HISTORY.test(deferredSearchWord)) {
      targetFuse = fuseIndexes.histories;
    } else if (SEARCH_TARGET_REGEX.BOOKMARK.test(deferredSearchWord)) {
      targetFuse = fuseIndexes.bookmarks;
    } else if (SEARCH_TARGET_REGEX.TAB.test(deferredSearchWord)) {
      targetFuse = fuseIndexes.tabs;
    }

    return sortAndFormatSearchResult(
      targetFuse.search(extractedSearchWord, {
        limit: SEARCH_RESULT_LIMIT,
      }),
      {
        favoriteLookup,
        openStatsLookup,
        recentContext,
      },
    );
  }, [
    activeTab,
    collections,
    deferredSearchWord,
    extractedSearchWord,
    favoriteItems,
    favoriteLookup,
    fuseIndexes,
    openStatsLookup,
    recentContext,
  ]);

  const actionResults = useMemo(() => {
    if (!actionMode) {
      return [];
    }

    return filterActionItems(actionItems, actionQuery);
  }, [actionItems, actionMode, actionQuery]);

  const immediateActionResults = useMemo(
    () => filterActionItems(actionItems, inputActionQuery),
    [actionItems, inputActionQuery],
  );

  const favoriteReorderEnabled = searchWord === "" && !actionMode && favoriteItems.length > 1;

  const currentResultKeys = useMemo(
    () =>
      actionMode
        ? actionResults.map((item) => getActionKey(item))
        : searchResult.map((item) => getResultKey(item)),
    [actionMode, actionResults, searchResult],
  );

  useEffect(() => {
    if (currentResultKeys.length === 0) {
      if (selectedNumber !== 0) {
        setSelectedNumber(0);
      }
      return;
    }

    if (!selectedKey) {
      const [firstKey] = currentResultKeys;

      if (selectedNumber !== 0) {
        setSelectedNumber(0);
      }

      if (firstKey !== selectedKey) {
        setSelectedKey(firstKey);
      }

      return;
    }

    const nextIndex = currentResultKeys.findIndex((item) => item === selectedKey);

    if (nextIndex >= 0) {
      if (nextIndex !== selectedNumber) {
        setSelectedNumber(nextIndex);
      }
      return;
    }

    const fallbackIndex = Math.min(selectedNumber, currentResultKeys.length - 1);
    const fallbackKey = currentResultKeys[fallbackIndex];

    if (fallbackIndex !== selectedNumber) {
      setSelectedNumber(fallbackIndex);
    }

    if (fallbackKey !== selectedKey) {
      setSelectedKey(fallbackKey);
    }
  }, [currentResultKeys, selectedKey, selectedNumber]);

  useEffect(() => {
    if (!favoriteReorderEnabled) {
      setDraggedFavoriteIndex(null);
      setDragOverFavoriteIndex(null);
    }
  }, [favoriteReorderEnabled]);

  const fixScrollPosition = useCallback((index: number) => {
    const selectedItem = resultRefs.current[index];

    if (!selectedItem) {
      return;
    }

    selectedItem.scrollIntoView({
      block: "nearest",
    });
  }, []);

  const changeSelectedItem = useCallback(
    (index: number) => {
      setSelectedNumber(index);
      if (actionMode) {
        const actionItem = actionResults[index];
        if (actionItem) {
          setSelectedKey(getActionKey(actionItem));
        }
      } else {
        const item = searchResult[index];
        if (item) {
          setSelectedKey(getResultKey(item));
        }
      }
      clearBadge();
    },
    [actionMode, actionResults, clearBadge, searchResult],
  );

  const changeSelectedItemByKeyboard = useCallback(
    (index: number) => {
      suppressHoverSelectionRef.current = true;
      flushSync(() => {
        changeSelectedItem(index);
      });
    },
    [changeSelectedItem],
  );

  const handlePointerSelection = useCallback(
    (index: number, clientX: number, clientY: number) => {
      const lastPointerPosition = lastPointerPositionRef.current;
      const pointerMoved =
        !lastPointerPosition ||
        lastPointerPosition.x !== clientX ||
        lastPointerPosition.y !== clientY;

      lastPointerPositionRef.current = {
        x: clientX,
        y: clientY,
      };

      if (suppressHoverSelectionRef.current) {
        if (!pointerMoved) {
          return;
        }

        suppressHoverSelectionRef.current = false;
      }

      changeSelectedItem(index);
    },
    [changeSelectedItem],
  );

  const browserSearch = async (query: string, inNewTab = false) => {
    if (browser.search.search) {
      const [currentTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      await browser.search.search({
        query,
        tabId: inNewTab ? undefined : currentTab?.id,
      });
      return;
    }

    const searchApi = browser.search as BrowserSearchWithDisposition;

    await searchApi.query({
      disposition: inNewTab ? searchApi.Disposition.NEW_TAB : searchApi.Disposition.CURRENT_TAB,
      text: query,
    });
  };

  const updateOpenStats = useCallback(async (url: string) => {
    try {
      await recordOpenedUrl(url);
      setOpenStats(await getOpenStats());
    } catch (error) {
      reportError(error);
    }
  }, []);

  const openResult = useCallback(
    async (item: SearchResult, inNewTab: boolean) => {
      if (item.tabId !== undefined) {
        await sendToBackground({
          body: {
            tabId: item.tabId,
          },
          name: "change-current-tab",
        });
        await updateOpenStats(item.url);
        return;
      }

      const messageName =
        settings.openLinkInCurrentTab === inNewTab ? "open-new-tab-page" : "update-current-page";

      await sendToBackground({
        body: {
          url: item.url,
        },
        name: messageName,
      });
      await updateOpenStats(item.url);
    },
    [settings.openLinkInCurrentTab, updateOpenStats],
  );

  const toggleFavorite = useCallback(
    async (item = searchResult[selectedNumber]) => {
      if (!item) {
        return;
      }

      const isFavorite = favoriteItems.some(
        (favorite) => favorite.url === item.url && favorite.title === item.title,
      );
      const nextFavoriteItems = toggleFavoriteItems(favoriteItems, item);

      setFavoriteItems(nextFavoriteItems);
      setSelectedKey(getResultKey(item));
      await onUpdateSettings({
        favoriteItems: nextFavoriteItems,
      });
      await showBadge(isFavorite ? t("badgeRemoveFavorite") : t("badgeAddFavorite"));
    },
    [favoriteItems, onUpdateSettings, searchResult, selectedNumber],
  );

  const moveFavorite = async (direction: "up" | "down") => {
    if (searchWord !== "" || actionMode || favoriteItems.length < 2) {
      return;
    }

    const moved = moveFavoriteItem(favoriteItems, selectedNumber, direction);
    if (moved.selectedIndex === selectedNumber) {
      return;
    }

    setFavoriteItems(moved.items);
    await onUpdateSettings({
      favoriteItems: moved.items,
    });
    changeSelectedItem(moved.selectedIndex);
    fixScrollPosition(moved.selectedIndex);
  };

  const reorderFavorite = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (searchWord !== "" || actionMode || favoriteItems.length < 2) {
        return;
      }

      const moved = moveFavoriteItemToIndex(favoriteItems, fromIndex, toIndex);
      if (moved.selectedIndex === fromIndex) {
        return;
      }

      setFavoriteItems(moved.items);
      await onUpdateSettings({
        favoriteItems: moved.items,
      });
      changeSelectedItem(moved.selectedIndex);
      fixScrollPosition(moved.selectedIndex);
    },
    [
      actionMode,
      changeSelectedItem,
      favoriteItems,
      fixScrollPosition,
      onUpdateSettings,
      searchWord,
    ],
  );

  const handleFavoriteDragStateChange = useCallback(
    (draggedIndex: number | null, dragOverIndex: number | null) => {
      setDraggedFavoriteIndex(draggedIndex);
      setDragOverFavoriteIndex(dragOverIndex);
    },
    [],
  );

  const openSearchResultItem = useCallback(
    async (item: SearchResult) => {
      await openResult(item, false);
      closePopup();
    },
    [openResult],
  );

  const toggleFavoriteItem = useCallback(
    (item: SearchResult) => {
      toggleFavorite(item).catch(reportError);
    },
    [toggleFavorite],
  );

  const reorderFavoriteItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      reorderFavorite(fromIndex, toIndex).catch(reportError);
    },
    [reorderFavorite],
  );

  const runActionItem = useCallback((item: ActionItem) => {
    item.run().catch(reportError);
  }, []);

  const copyCurrentUrl = async () => {
    const item = searchResult[selectedNumber];
    if (!item) {
      return;
    }

    await navigator.clipboard.writeText(item.url);
    await showBadge(t("badgeCopied"));
  };

  const handleEnterKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (inputActionMode) {
      const actionItem =
        immediateActionResults[selectedNumber] ??
        immediateActionResults.find((item) => getActionKey(item) === selectedKey) ??
        immediateActionResults[0];
      if (actionItem) {
        await actionItem.run();
      }
      return;
    }

    if (searchResult.length > 0) {
      await openResult(searchResult[selectedNumber], event.ctrlKey || event.metaKey);
      closePopup();
      return;
    }

    if (extractedSearchWord) {
      await browserSearch(extractedSearchWord, event.ctrlKey || event.metaKey);
      closePopup();
    }
  };

  const handleMoveKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const resultCount = inputActionMode ? immediateActionResults.length : searchResult.length;

    if (resultCount === 0) {
      return false;
    }

    if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
      event.preventDefault();
      const nextIndex = Math.min(selectedNumber + 1, resultCount - 1);
      changeSelectedItemByKeyboard(nextIndex);
      fixScrollPosition(nextIndex);
      return true;
    }

    if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p" && !event.shiftKey)) {
      event.preventDefault();
      const nextIndex = Math.max(selectedNumber - 1, 0);
      changeSelectedItemByKeyboard(nextIndex);
      fixScrollPosition(nextIndex);
      return true;
    }

    return false;
  };

  const handleShortcutKey = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "n") {
      event.preventDefault();
      await moveFavorite("down");
      return true;
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "p") {
      event.preventDefault();
      await moveFavorite("up");
      return true;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      await toggleFavorite();
      return true;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      await copyCurrentUrl();
      return true;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closePopup();
      return true;
    }

    return false;
  };

  const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === "Enter") {
      await handleEnterKey(event);
      return;
    }

    if (handleMoveKey(event)) {
      return;
    }

    await handleShortcutKey(event);
  };

  return (
    <section className="h-full overflow-hidden" data-cy="page-search">
      <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
        <SearchInputBar
          actionMode={actionMode}
          inputRef={inputRef}
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          onKeyDown={onKeyDown}
        />
        <div ref={resultsWrapperRef}>
          <SearchResultsPanel
            actionMode={actionMode}
            actionResults={actionResults}
            browserSearch={browserSearch}
            draggedFavoriteIndex={draggedFavoriteIndex}
            dragOverFavoriteIndex={dragOverFavoriteIndex}
            extractedSearchWord={extractedSearchWord}
            favoriteReorderEnabled={favoriteReorderEnabled}
            handleFavoriteDragStateChange={handleFavoriteDragStateChange}
            handlePointerSelection={handlePointerSelection}
            loadingCollections={loadingCollections}
            openSearchResultItem={openSearchResultItem}
            reorderFavoriteItem={reorderFavoriteItem}
            resultRefs={resultRefs}
            runActionItem={runActionItem}
            searchEngine={searchEngine}
            searchResult={searchResult}
            selectedNumber={selectedNumber}
            toggleFavoriteItem={toggleFavoriteItem}
          />
        </div>
        <SearchFooter
          badgeText={badgeText}
          badgeVisible={badgeVisible}
          openLinkInCurrentTab={settings.openLinkInCurrentTab}
        />
      </div>
    </section>
  );
}

interface State {
  histories: SearchItem[];
  bookmarks: SearchItem[];
  tabs: SearchItem[];
}

export const useStore = () => {
  const state = reactive<State>({
    histories: [],
    bookmarks: [],
    tabs: [],
  });

  const initialize = ({
    histories,
    bookmarks,
    tabs,
  }: {
    histories: State["histories"];
    bookmarks: State["bookmarks"];
    tabs: State["tabs"];
  }) => {
    state.histories = histories;
    state.bookmarks = bookmarks;
    state.tabs = tabs;
  };

  const allItems = computed(() => [
    ...state.histories,
    ...state.bookmarks,
    ...state.tabs,
  ]);

  const historyItems = computed(() => state.histories);
  const bookmarkItems = computed(() => state.bookmarks);
  const tabItems = computed(() => state.tabs);

  return {
    initialize,
    allItems,
    historyItems,
    bookmarkItems,
    tabItems,
  };
};

export const STORE_KEY = Symbol("store");

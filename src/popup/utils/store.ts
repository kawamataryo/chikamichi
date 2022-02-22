interface State {
  searchItems: SearchItem[];
}

export const useStore = () => {
  const state = reactive<State>({
    searchItems: [],
  });

  const changeSearchItems = (searchItems: State["searchItems"]) => {
    state.searchItems = searchItems;
  };
  return {
    state: state as Readonly<State>,
    changeSearchItems,
  };
};

export const STORE_KEY = Symbol("store");

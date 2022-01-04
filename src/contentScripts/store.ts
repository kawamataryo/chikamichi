type State = {
  showModal: boolean
  searchItems: SearchItem[]
  searchWord: string
}

export const useStore = () => {
  const state = reactive<State>({
    showModal: false,
    searchItems: [],
    searchWord: '',
  })

  const toggleModal = () => {
    state.showModal = !state.showModal
  }
  const changeHistories = (searchItems: State['searchItems']) => {
    state.searchItems = searchItems
  }
  const changeSearchWord = (word: string) => {
    state.searchWord = word
  }

  return {
    state: state as Readonly<State>,
    toggleModal,
    changeHistories,
    changeSearchWord,
  }
}

export const STORE_KEY = Symbol('store')

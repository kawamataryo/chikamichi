import { History } from 'webextension-polyfill'

type State = {
  showModal: boolean
  histories: History.HistoryItem[]
  searchWord: string
}

export const useStore = () => {
  const state = reactive<State>({
    showModal: false,
    histories: [],
    searchWord: '',
  })

  const toggleModal = () => {
    state.showModal = !state.showModal
  }
  const changeHistories = (histories: State['histories']) => {
    state.histories = histories
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

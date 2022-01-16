<!--
TODO: Split the component into the following units
- Modal
- SearchForm
- SearchItem
-->
<template>
  <transition name="fade">
    <div v-if="showModal" class="fixed z-99999 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="position relative min-h-screen">
        <div class="fixed inset-0 bg-black bg-opacity-60 transition-opacity" aria-hidden="true" @click="onCloseModal"></div>
        <div class="absolute align-bottom bg-white rounded-5px text-left overflow-hidden shadow-xl transform transition-all -translate-x-1/2 left-1/2 top-10vh w-650px max-w-screen-90vw dark:bg-gray-800 dark:text-bg-gray-100">
          <div class="relative text-gray-600 focus-within:text-gray-400">
            <div class="p-20px pb-0">
              <IconSearch width="20" height="20" class="absolute ml-12px mt-12px" />
              <input
                id="username"
                ref="searchInput"
                v-model="searchWord"
                class="shadow appearance-none border border-gray-400 rounded-5px w-full py-12px px-12px text-gray-700 leading-tight focus:outline-none focus:shadow-outline box-border bg-white pl-43px text-16px dark:bg-gray-700 dark:text-gray-300 dark:focus:shadow-none dark:border-0"
                type="search"
                placeholder="Search for.."
                @keydown.stop.exact
                @keypress.stop.exact
                @keyup.stop.exact
                @keypress.ctrl.enter.exact.prevent="onEnterWithControl"
                @keydown.down.prevent="onArrowDown"
                @keydown.up.prevent="onArrowUp"
                @keypress.enter.exact.prevent="onEnter"
                @keydown.ctrl.n.prevent="onArrowDown"
                @keydown.ctrl.p.prevent="onArrowUp"
                @keydown.esc.prevent="onCloseModal"
              >
              <nav class="m overflow-scroll max-h-60vh" role="navigation">
                <template v-if="searchResult.length">
                  <ul class="pl-0">
                    <li
                      v-for="(item, i) in searchResult"
                      :key="i"
                      :ref="el => { if (el) searchResultRefs[i] = el }"
                      :aria-selected="i === selectedNumber"
                      class="block"

                      role="option"
                      :data-tabid="item.tabId"
                      :data-url="item.url"
                      @click="onClick(item.url, item.tabId)"
                    >
                      <button class="p-6px block text-13px flex items-center text-black justify-between border-none w-full cursor-pointer bg-white rounded-5px dark:bg-gray-800 dark:text-gray-200" type="button" :class="{ 'bg-blue-200': i === selectedNumber, 'dark:bg-blue-700': i === selectedNumber }">
                        <span class="flex items-center w-520px">
                          <img :src="item.faviconUrl" alt="" class="w-16px h-16px mr-8px inline-block" />
                          <span class="overflow-hidden block whitespace-nowrap text-over overflow-ellipsis mr-5px">{{ item.title }}</span>
                          <span class="overflow-hidden text-gray-400 text-11px block whitespace-nowrap text-over overflow-ellipsis max-w-300px ml-auto mr-5px">
                            {{ item.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '') }}
                          </span>
                        </span>
                        <span class="px-8px py-3px rounded-5px text-gray-400 bg-gray-100 dark:bg-gray-600 dark:text-gray-200">
                          {{ item.type }}
                        </span>
                      </button>
                    </li>
                  </ul>
                </template>
                <template v-else>
                  <template v-if="searchWord">
                    <ul class="pl-0">
                      <li
                        :ref="el => { if (el) searchResultRefs[0] = el }"
                        :aria-selected="true"
                        class="block rounded-5px"
                        :data-url="`https://www.google.com/search?q=${searchWordFallback}`"
                        role="option"
                        @click="onClick(`https://www.google.com/search?q=${searchWordFallback}`)"
                      >
                        <button class="p-6px block text-13px flex items-center text-black border-none w-full cursor-pointer rounded-5px bg-blue-200 dark:bg-blue-800 dark:text-gray-200" type="button">
                          <img :src="`https://www.google.com/s2/favicons?domain=google.com`" alt="" class="w-16px h-16px mr-8px inline-block" /><span class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis">"{{ searchWordFallback }}" search with google</span>
                        </button>
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    <div class="flex min-h-15vh w-full justify-center items-center flex-row opacity-40">
                      <div class="mr-10px">
                        <Logo width="45" height="45" class="dark:hidden" />
                        <Logo width="45" height="45" class="hidden dark:block" dark />
                      </div>
                      <p class="text-24px text-black font-bold leading-20px dark:text-gray-100">
                        Chikamichi<br />
                        <span class="text-12px">Fuzzy search for anything</span>
                      </p>
                    </div>
                  </template>
                </template>
              </nav>
            </div>
            <div class="flex border-t-1px border-b-0 border-l-0 border-r-0 border-t-gray-200 h-40px justify-between px-20px items-center border-solid text-11px text-gray-500 dark:border-t-gray-700 dark:text-gray-200 rounded-b-5px">
              <div class="flex">
                <p class="mr-10px">
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">↑</span>
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block">↓</span>
                  or
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Ctrl + n</span>
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Ctrl + p</span>
                  Navigate,
                </p>
                <p class="mr-10px">
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Enter</span>Open,
                </p>
                <p>
                  <span class="bg-gray-200 dark:bg-gray-600 dark:text-white rounded-3px px-5px py-4px inline-block mr-3px">Ctrl + Enter</span>
                  Open in new tab
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import 'virtual:windi.css'
import Fuse from 'fuse.js'
import { nextTick } from 'vue-demi'
import { sendMessage } from 'webext-bridge'
import debounce from 'lodash.debounce'
import { STORE_KEY, useStore } from '~/contentScripts/store'
import {
  FUSE_OPTIONS,
  SEARCH_ITEM_TYPE,
  SEARCH_TARGET_REGEX,
} from '~/constants'

const store = inject<ReturnType<typeof useStore>>(STORE_KEY)
if (!store)
  throw new Error('store is not provided')

const searchWord = computed({
  get() {
    return store.state.searchWord
  },
  // NOTE: When hold the key, the character will be insert repeatedly. This causes the setter to be called repeatedly at high speed.
  // Writing the store is expensive, so too many calls can cause performance problems. So use debounce to avoid this.
  set: debounce((value: string) => {
    store.changeSearchWord(value)
  }, 100),
})
const searchWordFallback = computed(() => {
  if (SEARCH_TARGET_REGEX.EITHER.test(searchWord.value))
    return searchWord.value.match(SEARCH_TARGET_REGEX.EITHER)![1]

  return searchWord.value
})

// modal control
const showModal = computed(() => store.state.showModal)
const onCloseModal = () => {
  searchWord.value = ''
  store.toggleModal()
}

const searchItems = computed(() => store.state.searchItems)
const searchItemsOnlyHistory = computed(() => store.state.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.HISTORY))
const searchItemsOnlyBookmark = computed(() => store.state.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.BOOKMARK))
const searchItemsOnlyTab = computed(() => store.state.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.TAB))
const selectedNumber = ref(0)

const searchResult = computed(() => {
  if (!searchItems.value) return []

  let target = searchItems.value
  let word = searchWord.value

  // Selecting targets with the prefix
  if (SEARCH_TARGET_REGEX.HISTORY.test(word)) {
    target = searchItemsOnlyHistory.value
    word = word.match(SEARCH_TARGET_REGEX.HISTORY)![1] || 'h' // The 'h' in all URLs is set to fallback.
  }
  else if (SEARCH_TARGET_REGEX.BOOKMARK.test(word)) {
    target = searchItemsOnlyBookmark.value
    word = word.match(SEARCH_TARGET_REGEX.BOOKMARK)![1] || 'h'
  }
  else if (SEARCH_TARGET_REGEX.TAB.test(word)) {
    target = searchItemsOnlyTab.value
    word = word.match(SEARCH_TARGET_REGEX.TAB)![1] || 'h'
  }

  // fuzzy search powered by Fuse.js https://fusejs.io/
  const fuse = new Fuse(target, FUSE_OPTIONS)
  return fuse.search(word, { limit: 10 }).map(result => result.item)
})
watch(searchResult, () => {
  selectedNumber.value = 0
})

// focus to input when modal open
const searchInput = ref<HTMLInputElement | null>(null)
watch(showModal, async(next, _) => {
  await nextTick()
  if (next && searchInput.value)
    searchInput.value.focus()
})

// click event
const onClick = async(url: string, tabId?: number) => {
  // if selected tab link, send change tab message to background script
  if (tabId) {
    await sendMessage(
      'change-current-tab',
      {
        tabId,
      },
    )
    store.toggleModal()
    return
  }
  // otherwise, open the link.
  window.location.href = url
  store.toggleModal()
}

// Key event
const searchResultRefs = ref<HTMLElement[]>([])

const changePageWithKeyEvent = async(isNewTab = false) => {
  if (searchResultRefs.value) {
    const targetEl = searchResultRefs.value[selectedNumber.value]
    // if selected tab link, send change tab message to background script
    if (targetEl.dataset.tabid) {
      await sendMessage(
        'change-current-tab',
        {
          tabId: parseInt(targetEl.dataset.tabid),
        },
      )
      store.toggleModal()
      return
    }
    // otherwise, open the link in the specified way.
    const url = targetEl.dataset.url
    if (isNewTab)
      window.open(url!, '_blank')
    else
      window.location.href = url!

    store.toggleModal()
  }
}

const onEnter = async() => {
  await changePageWithKeyEvent()
}
const onEnterWithControl = async() => {
  await changePageWithKeyEvent(true)
}
const onArrowDown = () => {
  if (searchResult.value.length > selectedNumber.value + 1)
    selectedNumber.value++
}
const onArrowUp = () => {
  if (selectedNumber.value > 0)
    selectedNumber.value--
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .1s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

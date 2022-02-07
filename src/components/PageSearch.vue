<!--
TODO:Split the component into the following units
- Modal
- SearchForm
- SearchItem
-->
<template>
  <div class="flex justify-between flex-col focus-within:text-gray-400 h-full">
    <div class="p-20px pb-0 flex flex-col h-full">
      <div>
        <IconSearch width="20" height="20" class="absolute ml-12px mt-12px" />
        <input
          id="username"
          ref="searchInput"
          v-model="searchWord"
          class="appearance-none border border-gray-400 rounded-5px w-full py-12px px-12px text-gray-700 leading-tight focus:outline-none focus:shadow-none focus:border-gray-400 focus:ring-0 box-border bg-white pl-43px text-16px dark:bg-gray-700 dark:text-gray-300 dark:focus:shadow-none dark:border-0 mb-16px"
          type="search"
          autocomplete="off"
          placeholder="Search for.."
          @keypress="onKeypress"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.ctrl.n.prevent="onArrowDown"
          @keydown.ctrl.p.prevent="onArrowUp"
          @keydown.esc.prevent="onEsc"
        >
      </div>
      <nav class="m h-full" role="navigation">
        <template v-if="searchResult.length">
          <ul class="pl-0">
            <li
              v-for="(result, i) in searchResult"
              :key="i"
              :ref="el => { if (el) searchResultRefs[i] = el as HTMLElement }"
              :aria-selected="i === selectedNumber"
              class="block"

              role="option"
              :data-tabid="result.item.tabId"
              :data-url="result.item.url"
              @click="onClick(result.item.url, result.item.tabId)"
            >
              <button class="p-6px block text-13px flex items-center text-black justify-between border-none w-full cursor-pointer bg-white rounded-5px dark:bg-gray-800 dark:text-gray-200" type="button" :class="{ 'selected-item': i === selectedNumber }">
                <span class="flex items-center">
                  <img :src="result.item.faviconUrl" alt="" class="w-16px h-16px mr-8px inline-block" />
                  <span class="flex flex-col w-496px text-left">
                    <highlighter class="overflow-hidden block whitespace-nowrap text-over overflow-ellipsis mr-5px" :item="result.item.highlightedTitle" />
                    <highlighter class="overflow-hidden text-gray-400 text-11px block whitespace-nowrap text-over overflow-ellipsis max-w-496px text-left mt-4px" :item="result.item.highlightedUrl" :class="{ hidden: i !== selectedNumber }" />
                  </span>
                </span>
                <span class="px-8px py-3px rounded-5px text-gray-400 bg-gray-200 dark:bg-gray-600 dark:text-gray-200">
                  {{ result.item.type }}
                </span>
              </button>
            </li>
          </ul>
        </template>
        <template v-else>
          <template v-if="searchWord">
            <ul class="pl-0">
              <li
                :ref="el => { if (el) searchResultRefs[0] = el as HTMLElement }"
                :aria-selected="true"
                class="block rounded-5px"
                role="option"
                data-is-search
                @click="browserSearch(searchWordFallback)"
              >
                <button class="p-6px block text-13px flex items-center text-black border-none w-full cursor-pointer rounded-5px bg-blue-100 dark:bg-blue-800 dark:text-gray-200" type="button">
                  <img :src="searchEngineRef?.favIconUrl" alt="" class="w-16px h-16px mr-8px inline-block text-gray-700 dark:text-gray-300" /><span class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis">"{{ searchWordFallback }}" search with {{ searchEngineRef?.name }}</span>
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="flex w-full h-full justify-center items-center flex-row opacity-40">
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
    <div class="flex border-t-1px border-b-0 border-l-0 border-r-0 border-t-gray-200 justify-between px-20px py-10px items-center border-solid text-11px text-gray-500 dark:border-t-gray-700 dark:text-gray-200 rounded-b-5px">
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
</template>

<script lang="ts" setup>
import 'virtual:windi.css'
import Fuse from 'fuse.js'
import { sendMessage } from 'webext-bridge'
import debounce from 'lodash.debounce'
import { nextTick } from 'vue-demi'
import { Search } from 'webextension-polyfill'
import {
  FUSE_OPTIONS, PAGES, SEARCH_ICON_DATA_URL_DARK, SEARCH_ICON_DATA_URL_LIGHT,
  SEARCH_ITEM_TYPE,
  SEARCH_TARGET_REGEX, THEME,
} from '~/constants'
import { defaultSearchPrefix, theme } from '~/logic'

interface Props {
  searchItems: SearchItem[]
}

const props = defineProps<Props>()

const _searchWord = ref(defaultSearchPrefix.value)
const searchWord = computed({
  get() {
    return _searchWord.value
  },
  // NOTE: When hold the key, the character will be insert repeatedly. This causes the setter to be called repeatedly at high speed.
  // Writing the store is expensive, so too many calls can cause performance problems. So use debounce to avoid this.
  set: debounce((value: string) => {
    _searchWord.value = value
  }, 100),
})
const searchWordFallback = computed(() => {
  if (SEARCH_TARGET_REGEX.EITHER.test(searchWord.value))
    return searchWord.value.match(SEARCH_TARGET_REGEX.EITHER)![1]

  return searchWord.value
})

const searchItems = computed(() => props.searchItems)
const searchItemsOnlyHistory = computed(() => props.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.HISTORY))
const searchItemsOnlyBookmark = computed(() => props.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.BOOKMARK))
const searchItemsOnlyTab = computed(() => props.searchItems.filter(i => i.type === SEARCH_ITEM_TYPE.TAB))
const selectedNumber = ref(0)

const getHighlightedTitle = (result: Fuse.FuseResult<SearchItem>) => ({
  indices: result.matches?.find(m => m.key === 'title')?.indices as ([number, number][] | undefined),
  text: result.item.title,
})
const getHighlightedUrl = (result: Fuse.FuseResult<SearchItem>) => {
  const urlRegex = /^(?:https?:\/\/)?(?:www\.)?/i
  const urlMatch = result.item.url.match(urlRegex)
  const urlMatchedLength = urlMatch ? urlMatch[0].length : 0
  const indices = result.matches
    ?.find(m => m.key === 'url')
    ?.indices.map(([i, j]) => [i - urlMatchedLength, j - urlMatchedLength])
    .filter(indice => indice[0] >= 0)
  return {
    indices: indices as ([number, number][] | undefined),
    text: result.item.url.replace(urlRegex, ''),
  }
}

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
  return fuse.search(word, { limit: 10 }).map((result) => {
    return {
      ...result,
      item: {
        ...result.item,
        highlightedTitle: getHighlightedTitle(result),
        highlightedUrl: getHighlightedUrl(result),
      },
    }
  })
})

watch(searchResult, () => {
  selectedNumber.value = 0
})

const closePopup = () => { window.close() }

// focus to input when modal open
const searchInput = ref<HTMLInputElement | null>(null)
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
    return
  }
  // otherwise, open the link.
  await sendMessage(
    'update-current-page',
    {
      url,
    },
  )
  closePopup()
}

// Key event
const searchResultRefs = ref<HTMLElement[]>([])

const browserSearch = async(query: string, inNewTab?: boolean) => {
  if (browser.search.search) {
    // Firefox API
    await browser.search.search({
      query,
      tabId: inNewTab
        ? undefined
        : (await browser.tabs.query({
          active: true,
          currentWindow: true,
        }))[0].id,
    })
  }
  else {
    // Chrome API
    await browser.search.query({
      text: query,
      disposition: inNewTab ? browser.search.Disposition.NEW_TAB : browser.search.Disposition.CURRENT_TAB,
    })
  }
}

const changePageWithKeyEvent = async(isNewTab = false) => {
  if (searchResultRefs.value) {
    const targetEl = searchResultRefs.value[selectedNumber.value]
    if (targetEl.dataset.isSearch !== undefined) {
      await browserSearch(searchWordFallback.value, isNewTab)
      closePopup()
      return
    }
    // if selected tab link, send change tab message to background script
    if (targetEl.dataset.tabid) {
      await sendMessage(
        'change-current-tab',
        {
          tabId: parseInt(targetEl.dataset.tabid),
        },
      )
      return
    }
    // otherwise, open the link in the specified way.
    const url = targetEl.dataset.url!
    if (isNewTab) {
      await sendMessage(
        'open-new-tab-page',
        {
          url,
        },
      )
    }
    else {
      await sendMessage(
        'update-current-page',
        {
          url,
        },
      )
    }
    closePopup()
  }
}

const onKeypress = async(keyEvent: { code: string; ctrlKey?: boolean }) => {
  if (keyEvent.code === 'Enter')
    await changePageWithKeyEvent(!!keyEvent.ctrlKey)
}
const onArrowDown = () => {
  if (searchResult.value.length > selectedNumber.value + 1)
    selectedNumber.value++
}
const onArrowUp = () => {
  if (selectedNumber.value > 0)
    selectedNumber.value--
}
const onEsc = () => {
  closePopup()
}

const searchEngineRef = ref<Pick<Search.SearchEngine, 'name' | 'favIconUrl'> | null>(null)

onMounted(async() => {
  await nextTick()
  if (searchInput.value)
    searchInput.value.focus()

  const defaultSearchEngineValue = {
    name: 'browser',
    favIconUrl: theme.value === THEME.DARK ? SEARCH_ICON_DATA_URL_DARK : SEARCH_ICON_DATA_URL_LIGHT,
  }

  if (browser.search.get) {
    // This API is only available in Firefox
    searchEngineRef.value = (await browser.search.get()).find((e: Search.SearchEngine) => e.isDefault) || defaultSearchEngineValue
  }
  else {
    searchEngineRef.value = defaultSearchEngineValue
  }
})
</script>

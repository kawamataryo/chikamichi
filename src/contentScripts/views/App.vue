<template>
  <transition name="fade">
    <div v-if="showModal" class="fixed z-99999 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="position relative min-h-screen">
        <div class="fixed inset-0 bg-black bg-opacity-60 transition-opacity" aria-hidden="true" @click="onCloseModal"></div>
        <div class="absolute align-bottom bg-white rounded-5px text-left overflow-hidden shadow-xl transform transition-all -translate-x-1/2 left-1/2 top-10vh w-580px max-w-screen-80vw">
          <div class="relative text-gray-600 focus-within:text-gray-400">
            <div class="p-20px pb-0">
              <svg
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                viewBox="0 0 24 24"
                class="absolute  w-20px h-20px pl-12px pt-10px"
              ><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                id="username"
                ref="searchInput"
                v-model="searchWord"
                class="shadow appearance-none border border-gray-400 rounded-5px w-full py-12px px-12px text-gray-700 leading-tight focus:outline-none focus:shadow-outline box-border bg-white pl-43px"
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
                      class="block rounded-5px"
                      :class="{ 'bg-blue-200': i === selectedNumber }"
                      role="option"
                      :data-tabid="item.tabId"
                    >
                      <a :href="item.url" class="p-6px block text-13px flex items-center text-black hover:no-underline no-underline justify-between">
                        <span class="flex items-center w-440px">
                          <img :src="item.faviconUrl" alt="" class="w-16px h-16px mr-8px inline-block" /><span class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis">{{ item.title }}</span>
                        </span>
                        <span class="px-8px py-3px rounded-5px text-gray-400">
                          {{ item.type }}
                        </span>
                      </a>
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
                        :class="{ 'bg-blue-200': true }"
                        role="option"
                      >
                        <a :href="`https://www.google.com/search?q=${searchWord}`" class="p-6px block text-13px flex items-center text-black hover:no-underline no-underline">
                          <img :src="`https://www.google.com/s2/favicons?domain=google.com`" alt="" class="w-16px h-16px mr-8px inline-block" /><span class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis">"{{ searchWord }}" search with google</span></a>
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    <div class="flex min-h-15vh w-full justify-center items-center flex-row opacity-40">
                      <Logo width="50" height="50" class="mr-15px" />
                      <p class="text-16px text-black font-bold leading-26px">
                        Fussy<br />History Search
                      </p>
                    </div>
                  </template>
                </template>
              </nav>
            </div>
            <div class="flex border border-gray-200 h-40px justify-between px-20px border-solid items-center text-11px text-gray-500">
              <div class="flex">
                <p class="mr-10px">
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">↑</span>
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block">↓</span>
                  or
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Ctrl + n</span>
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Ctrol + p</span>
                  Navigate,
                </p>
                <p class="mr-10px">
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Enter</span>Open,
                </p>
                <p>
                  <span class="bg-gray-200 rounded-3px px-5px py-4px inline-block mr-3px">Ctrl + Enter</span>
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
import { STORE_KEY, useStore } from '~/contentScripts/store'

const store = inject<ReturnType<typeof useStore>>(STORE_KEY)
if (!store)
  throw new Error('store is not provided')

const searchWord = computed({
  get() {
    return store.state.searchWord
  },
  set(value: string) {
    store.changeSearchWord(value)
  },
})

// modal control
const showModal = computed(() => store.state.showModal)
const onCloseModal = () => {
  searchWord.value = ''
  store.toggleModal()
}

const searchItems = computed(() => store.state.searchItems)
const selectedNumber = ref(0)

// fussy search powered by Fuse.js https://fusejs.io/
const searchResult = computed(() => {
  if (!searchItems.value) return []
  const fuse = new Fuse(searchItems.value, {
    keys: [
      'title',
      'url',
    ],
    threshold: 0.2,
  })
  return fuse.search(searchWord.value, { limit: 10 }).map(result => result.item)
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

// Key event
const searchResultRefs = ref<HTMLElement[]>([])

const changePage = async(isNewTab = false) => {
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
    const linkEl = targetEl.querySelector('a')
    if (isNewTab)
      window.open(linkEl!.href, '_blank')
    else
      window.location.href = linkEl!.href

    store.toggleModal()
  }
}

const onEnter = async() => {
  await changePage()
}
const onEnterWithControl = async() => {
  await changePage(true)
}
const onArrowDown = () => {
  if (searchResult.value.length > selectedNumber.value + 1) {
    selectedNumber.value++
  }
}
const onArrowUp = () => {
  if (selectedNumber.value > 0) {
    selectedNumber.value--
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

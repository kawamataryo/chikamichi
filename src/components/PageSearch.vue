<!--
TODO:Split the component into the following units
- Modal
- SearchForm
- SearchItem
-->
<template>
  <div
    class="flex justify-between flex-col focus-within:text-gray-400 h-full"
    data-cy="page-search"
  >
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
          data-cy="search-input"
          @keypress="onKeypress"
          @keydown.meta.enter.exact.prevent="onKeypress"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.ctrl.n.prevent="onArrowDown"
          @keydown.ctrl.p.prevent="onArrowUp"
          @keydown.ctrl.f.prevent="onFavorite"
          @keydown.esc.prevent="onEsc"
        />
      </div>
      <nav
        ref="searchResultWrapperRef"
        class="m h-330px overflow-y-scroll"
        data-cy="search-result-wrapper"
      >
        <template v-if="searchResult.length">
          <ul class="pl-0">
            <li
              v-for="(item, i) in searchResult"
              :key="i"
              :ref="el => { if (el) searchResultRefs[i] = el as HTMLElement }"
              :aria-selected="i === selectedNumber"
              class="block"
              role="option"
              :data-tabid="item.tabId"
              :data-url="item.url"
              @click="onClick(item.url, item.tabId)"
            >
              <button
                class="p-6px block text-13px flex items-center text-black justify-between border-none w-full cursor-pointer bg-white rounded-5px dark:bg-gray-800 dark:text-gray-200"
                type="button"
                :data-cy="`search-result-${i}`"
                :class="{ 'selected-item': i === selectedNumber }"
              >
                <span class="flex items-center">
                  <img
                    :src="item.faviconUrl"
                    alt=""
                    class="w-16px h-16px mr-8px inline-block"
                  />
                  <span class="flex flex-col w-440px text-left">
                    <span
                      class="block break-all text-over overflow-ellipsis max-w-496px overflow-hidden"
                    >
                      <span v-show="item.folderName" class="mr-5px"
                        >[<WordHighlighter
                          :query="item.matchedWord"
                          split-by-space
                          highlight-class="highlight-word"
                          >{{ item.folderName }}</WordHighlighter
                        >]</span
                      >
                      <WordHighlighter
                        class="whitespace-nowrap"
                        :query="item.matchedWord"
                        split-by-space
                        highlight-class="highlight-word"
                        >{{ item.title }}</WordHighlighter
                      >
                    </span>
                    <WordHighlighter
                      class="overflow-hidden text-gray-400 text-11px block whitespace-nowrap text-over overflow-ellipsis max-w-496px text-left mt-4px"
                      :query="item.matchedWord"
                      split-by-space
                      highlight-class="highlight-word"
                      :class="{ hidden: i !== selectedNumber }"
                      >{{ item.url }}</WordHighlighter
                    >
                  </span>
                </span>
                <span class="items-center flex">
                  <span
                    class="px-8px py-3px rounded-5px text-gray-400 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 mr-5px"
                    :data-cy="`search-result-type-${i}`"
                  >
                    {{ item.type }}
                  </span>
                  <span
                    class="inline-block p-3px mr-15px"
                    :data-cy="`search-result-favorite-${i}`"
                    @click.stop="onClickFavorite(item)"
                  >
                    <ToggleStar v-if="!item.tabId" :value="item.isFavorite" />
                    <div v-else class="w-18px h-18px" />
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </template>
        <template v-else>
          <template v-if="searchWord">
            <ul class="pl-0">
              <li
                :aria-selected="true"
                class="block rounded-5px"
                role="option"
                data-is-search
                @click="browserSearch(extractOnlySearchWord)"
              >
                <button
                  class="p-6px block text-13px flex items-center text-black border-none w-full cursor-pointer rounded-5px bg-blue-100 dark:bg-blue-800 dark:text-gray-200"
                  data-cy="browser-search-btn"
                  type="button"
                >
                  <img
                    :src="searchEngine.favIconUrl"
                    alt=""
                    class="w-16px h-16px mr-8px inline-block text-gray-700 dark:text-gray-300"
                  /><span
                    class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis"
                    >"{{ extractOnlySearchWord }}" search with
                    {{ searchEngine.name }}</span
                  >
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <div
              class="flex w-full h-full justify-center items-center flex-row opacity-40"
              data-cy="search-result-empty"
            >
              <div class="mr-10px">
                <Logo width="45" height="45" class="dark:hidden" />
                <Logo width="45" height="45" class="hidden dark:block" dark />
              </div>
              <p
                class="text-24px text-black font-bold leading-20px dark:text-gray-100"
              >
                Chikamichi<br />
                <span class="text-12px">Fuzzy search for anything</span>
              </p>
            </div>
          </template>
        </template>
      </nav>
    </div>
    <div
      class="flex border-t-1px border-b-0 border-l-0 border-r-0 border-t-gray-200 justify-between px-20px py-10px items-center border-solid text-11px text-gray-500 dark:border-t-gray-700 dark:text-gray-200 rounded-b-5px"
    >
      <div class="flex">
        <p class="mr-10px">
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px"
            >↑</span
          >
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block"
            >↓</span
          >
          or
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px"
            >Ctrl + n</span
          >
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px"
            >Ctrl + p</span
          >
          Navigate,
        </p>
        <p class="mr-10px">
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-gray-200 rounded-3px px-5px py-4px inline-block mr-3px"
            >Enter</span
          >Open,
        </p>
        <p class="mr-10px">
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-white rounded-3px px-5px py-4px inline-block mr-3px"
            >Ctrl + Enter</span
          >
          Open in new tab,
        </p>
        <p>
          <span
            class="bg-gray-200 dark:bg-gray-600 dark:text-white rounded-3px px-5px py-4px inline-block mr-3px"
            >Ctrl + f</span
          >
          Add favorite
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "virtual:windi.css";
import WordHighlighter from "vue-word-highlighter";
import ToggleStar from "./ToggleStar.vue";
import { useSearch } from "~/composables/useSearch";

const {
  searchWord,
  searchResult,
  selectedNumber,
  extractOnlySearchWord,
  searchEngine,
  changePage,
  changePageWithClick,
  toggleFavorite,
  changeSelectedItem,
  browserSearch,
} = useSearch();

const searchResultWrapperRef = ref<HTMLElement | null>(null);

watch(searchWord, () => {
  changeSelectedItem(0);
  searchResultWrapperRef.value?.scrollTo(0, 0);
});

const closePopup = () => {
  window.close();
};

// focus to input when modal open
const searchInput = ref<HTMLInputElement | null>(null);

// click event
const onClick = async (url: string, tabId?: number) => {
  await changePageWithClick(url, tabId);
  closePopup();
};

const onClickFavorite = (item: SearchItem) => {
  toggleFavorite(item);
};

// Key event
const searchResultRefs = ref<HTMLElement[]>([]);

const fixScrollPosition = () => {
  if (!searchResultWrapperRef.value) return;

  const wrapperElm = searchResultWrapperRef.value;
  const { top: wrapperTop, height: wrapperHeight } =
    wrapperElm.getBoundingClientRect();
  const selectedItemRef = searchResultRefs.value[selectedNumber.value];
  const { top: selectedItemTop, height: selectedItemHeight } =
    selectedItemRef.getBoundingClientRect();
  if (selectedItemTop + selectedItemHeight > wrapperTop + wrapperHeight)
    wrapperElm.scrollTo(0, wrapperElm.scrollTop + selectedItemHeight);
  if (selectedItemTop < wrapperTop)
    wrapperElm.scrollTo(0, wrapperElm.scrollTop - selectedItemHeight);
};

const onKeypress = async (keyEvent: {
  code: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
}) => {
  if (keyEvent.code === "Enter") {
    await changePage(!!keyEvent.ctrlKey || !!keyEvent.metaKey);
    closePopup();
  }
};

const onArrowDown = () => {
  if (searchResult.value.length > selectedNumber.value + 1) {
    changeSelectedItem(selectedNumber.value + 1);
    fixScrollPosition();
  }
};

const onArrowUp = () => {
  if (selectedNumber.value > 0) {
    changeSelectedItem(selectedNumber.value - 1);
    fixScrollPosition();
  }
};

const onEsc = () => {
  closePopup();
};

const onFavorite = () => {
  toggleFavorite();
};

onMounted(async () => {
  await nextTick();
  if (searchInput.value) searchInput.value.focus();
});
</script>

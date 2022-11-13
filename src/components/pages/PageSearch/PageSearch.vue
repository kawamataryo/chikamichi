<script lang="ts" setup>
import "virtual:windi.css";
import { useSearch } from "~/composables/useSearch";

const {
  searchWord,
  searchResult,
  selectedNumber,
  extractOnlySearchWord,
  searchEngine,
  badgeText,
  changePage,
  changePageWithClick,
  toggleFavorite,
  changeSelectedItem,
  browserSearch,
  copyUrlOfSelectedItem,
  loading,
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
  if (!searchResultWrapperRef.value) {
    return;
  }

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

const onCopy = async () => {
  await copyUrlOfSelectedItem();
};

onMounted(async () => {
  await nextTick();
  if (searchInput.value) {
    searchInput.value.focus();
  }
});
</script>

<template>
  <div
    class="flex justify-between flex-col focus-within:text-gray-400 h-full"
    data-cy="page-search"
  >
    <div class="p-20px pb-0 flex flex-col h-full">
      <div>
        <IconLoading
          v-if="loading"
          width="20"
          height="20"
          class="absolute ml-12px mt-12px"
        />
        <IconSearch
          v-else
          width="20"
          height="20"
          class="absolute ml-12px mt-12px"
        />
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
          @keydown.ctrl.c.prevent="onCopy"
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
              @click="onClick(item.url, item.tabId)"
            >
              <SearchItemButton
                :item="item"
                :is-selected="i === selectedNumber"
                :index="i"
                :show-badge="showBadge"
                :badge-text="badgeText"
                @click-star="onClickFavorite"
              />
            </li>
          </ul>
        </template>
        <template v-else>
          <template v-if="extractOnlySearchWord && !loading">
            <ul class="pl-0">
              <li
                :aria-selected="true"
                class="block rounded-5px"
                role="option"
                data-is-search
                @click="browserSearch(extractOnlySearchWord)"
              >
                <BrowserSearchButton
                  :search-word="extractOnlySearchWord"
                  :fav-icon-url="searchEngine.favIconUrl"
                  :search-engine-name="searchEngine.name"
                />
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
    <SearchFormInfo />
  </div>
</template>

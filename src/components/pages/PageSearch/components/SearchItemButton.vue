<template>
  <button
    class="p-6px block text-13px flex items-center text-black justify-between border-none w-full cursor-pointer bg-white rounded-5px dark:bg-gray-800 dark:text-gray-200"
    type="button"
    :data-cy="`search-result-${props.index}`"
    :class="{ 'selected-item': isSelected }"
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
            >{{ item.title || item.url }}</WordHighlighter
          >
        </span>
        <WordHighlighter
          class="overflow-hidden text-gray-400 text-11px block whitespace-nowrap text-over overflow-ellipsis max-w-496px text-left mt-4px"
          :query="item.matchedWord"
          split-by-space
          highlight-class="highlight-word"
          :class="{ hidden: !isSelected }"
          >{{ item.url }}</WordHighlighter
        >
      </span>
    </span>
    <span class="items-center flex">
      <span
        class="px-8px py-3px rounded-5px text-gray-400 bg-gray-200 dark:bg-gray-600 dark:text-gray-200 mr-5px"
        :data-cy="`search-result-type-${index}`"
      >
        {{ item.type }}
      </span>
      <span
        class="inline-block p-3px mr-15px"
        :data-cy="`search-result-favorite-${index}`"
        @click.stop="emit('click-star', item)"
      >
        <ToggleStar v-if="!item.tabId" :value="item.isFavorite" />
        <div v-else class="w-18px h-18px" />
      </span>
    </span>
  </button>
</template>

<script lang="ts" setup>
import WordHighlighter from "vue-word-highlighter";
import { PropType } from "vue";
import ToggleStar from "./ToggleStar.vue";

const props = defineProps({
  item: {
    type: Object as PropType<SearchItemWithFavoriteAndMatchedWord>,
    required: true,
  },
  isSelected: {
    type: Boolean,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["click-star"]);
</script>

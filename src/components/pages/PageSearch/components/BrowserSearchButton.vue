<script lang="ts" setup>
defineProps({
  searchWord: {
    type: String,
    required: true,
  },
  searchEngineName: {
    type: String,
    required: true,
  },
  favIconUrl: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <button
    class="p-6px block text-13px flex items-center text-black border-none w-full cursor-pointer rounded-5px bg-blue-100 dark:bg-blue-800 dark:text-gray-200"
    data-cy="browser-search-btn"
    type="button"
  >
    <img
      :src="favIconUrl"
      alt=""
      class="w-16px h-16px mr-8px inline-block text-gray-700 dark:text-gray-300"
    /><span
      class="overflow-hidden display-block whitespace-nowrap text-over overflow-ellipsis"
      >"{{ searchWord }}" search with {{ searchEngineName }}</span
    >
  </button>
</template>

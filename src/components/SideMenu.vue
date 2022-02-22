<template>
  <ul
    class="w-full dark:text-gray-200 text-gray-900 mt-20px flex flex-col items-center"
  >
    <li
      class="p-10px rounded-full dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer"
      :class="currentTabClasses(PAGES.SEARCH)"
      @click="changePage(PAGES.SEARCH)"
    >
      <IconSearch width="18" height="18" class="m-auto" />
    </li>
    <li
      class="p-10px rounded-full mt-10px dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer"
      :class="currentTabClasses(PAGES.INFO)"
      @click="changePage(PAGES.INFO)"
    >
      <IconInfo width="18" height="18" class="m-auto" />
    </li>
    <li
      class="p-10px rounded-full mt-10px dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer"
      :class="currentTabClasses(PAGES.SETTING)"
      @click="changePage(PAGES.SETTING)"
    >
      <IconGear width="18" height="18" class="m-auto" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { PAGES } from "~/constants";

interface PropsType {
  currentPage: ValueOf<typeof PAGES>;
}

const props = defineProps<PropsType>();
const emit = defineEmits(["change"]);

const currentTabClasses = (tabId: string) => ({
  "dark:bg-gray-700": props.currentPage === tabId,
  "bg-gray-200": props.currentPage === tabId,
  "hover:animate-pulse ": props.currentPage !== tabId,
});

const changePage = (pageId: ValueOf<typeof PAGES>) => {
  emit("change", pageId);
};
</script>

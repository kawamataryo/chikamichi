<script setup lang="ts">
import { defaultSearchPrefix, theme } from "~/logic";
import { SEARCH_PREFIX } from "~/constants";
</script>

<template>
  <div
    class="h-full w-full flex flex-col p-20px overflow-hidden dark:text-gray-200 grid grid-cols-4 grid-rows-2 gap-4"
    data-cy="page-setting"
  >
    <div
      class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-1"
    >
      <h1 class="text-lg">🔍 Default search prefix</h1>
      <p class="mt-10px text-xs">
        If you want to search for a specific item, you can set a default search
        prefix.
      </p>
      <div class="relative mt-16px">
        <select
          id="grid-state"
          v-model="defaultSearchPrefix"
          class="block appearance-none w-full bg-gray-100 boarder-gray-100 dark:bg-gray-300 border dark:border-gray-300 text-gray-700 py-2 px-4 pr-3 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          data-cy="select-prefix"
        >
          <option value="">none</option>
          <option :value="SEARCH_PREFIX.BOOKMARK">
            /b : search for bookmarks
          </option>
          <option :value="SEARCH_PREFIX.TAB">/t : search for tabs</option>
          <option :value="SEARCH_PREFIX.HISTORY">
            /h : search for histories
          </option>
        </select>
        <div
          class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
        >
          <svg
            class="fill-current h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"
            />
          </svg>
        </div>
      </div>
    </div>
    <div
      class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-1"
    >
      <h1 class="text-lg">🎨 Theme</h1>
      <div class="grid grid-col-3 mt-10px">
        <div
          class="col-span-1 col-start-1 flex justify-center items-center flex-col text-center"
        >
          <input
            id="auto"
            v-model="theme"
            type="radio"
            value="auto"
            class="cursor-pointer"
            data-cy="radio-auto"
          />
          <label for="auto" class="cursor-pointer">
            <IconLightDark width="50" class="h-50px mt-10px" />
            Auto
          </label>
        </div>
        <div
          class="col-span-1 col-start-2 flex justify-center items-center flex-col text-center"
        >
          <input
            id="light"
            v-model="theme"
            type="radio"
            value="light"
            class="cursor-pointer"
            data-cy="radio-light"
          />
          <label for="light" class="cursor-pointer">
            <IconSun width="50" class="h-50px mt-10px" />
            Light
          </label>
        </div>
        <div
          class="col-span-1 col-start-3 flex justify-center items-center flex-col text-center"
        >
          <input
            id="dark"
            v-model="theme"
            type="radio"
            value="dark"
            class="cursor-pointer"
            data-cy="radio-dark"
          />
          <label for="dark" class="cursor-pointer">
            <IconMoon width="50" class="h-50px mt-10px" />
            Dark
          </label>
        </div>
      </div>
    </div>
    <div
      class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-3 row-start-1"
    >
      <div class="flex justify-center items-center h-full text-sm opacity-50">
        Coming Soon
      </div>
    </div>
    <div
      class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-3 row-start-2"
    >
      <div class="flex justify-center items-center h-full text-sm opacity-50">
        Coming Soon
      </div>
    </div>
  </div>
</template>

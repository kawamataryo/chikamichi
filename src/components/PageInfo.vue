<template>
  <div class="h-full w-full flex flex-col p-20px overflow-scroll dark:text-gray-200 grid grid-flow-col grid-flow-row gap-4">
    <div class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-1">
      <h1 class="text-lg">
        🔍 Search commands
      </h1>
      <ul class="text-sm mt-10px text-xs">
        <li>・<span class="info-key-text mr-5px">/ t</span> Search your tabs</li>
        <li class="mt-10px">
          ・<span class="info-key-text mr-5px">/ b</span> Search your bookmarks
        </li>
        <li class="mt-10px">
          ・<span class="info-key-text mr-5px">/ h</span> Search your histories
        </li>
      </ul>
    </div>
    <div class="border-gray-400 border-1px rounded-5px p-20px col-span-2 col-start-1">
      <h1 class="text-lg">
        ⌨ Shortcut
      </h1>
      <ul class="text-sm mt-10px text-xs">
        <li>・<span class="info-key-text mr-5px">Alt(Option) + k</span>Open or Close Search form</li>
        <li class="mt-10px">
          ・<span class="info-key-text">↑</span> <span class="info-key-text">↓</span>or<span class="info-key-text">Ctrl + n</span> <span class="info-key-text">Ctrl + p</span> Select item
        </li>
        <li class="mt-10px">
          ・<span class="info-key-text mr-5px">Enter</span>Open page
        </li>
        <li class="mt-10px">
          ・<span class="info-key-text mr-5px">Ctrl + Enter</span>Open page in new tab
        </li>
      </ul>
    </div>
    <div class="border-gray-400 border-1px rounded-5px row-span-1 col-start-3 col-span-1 p-20px">
      <h1 class="text-lg">
        📮 Feedback & Support
      </h1>
      <p class="mt-10px text-xs">
        If you have any questions, feature requests, or bug reports, please let us know.
      </p>
      <button type="button" class="bg-blue-100 dark:bg-blue-800 dark:text-white font-bold py-2 px-4 rounded mt-15px" @click="openNewTab('https://github.com/kawamataryo/chikamichi/issues/new')">
        Open GitHub issue
      </button>
    </div>
    <div class="row-span-1 col-start-3 col-span-1 flex items-center justify-center flex-col opacity-40">
      <Logo width="70" height="70" class="dark:hidden" />
      <Logo width="70" height="70" class="hidden dark:block" dark />
      <p class="text-24px text-black font-bold leading-20px dark:text-gray-100 text-center mt-10px">
        Chikamichi<br />
        <span class="text-12px">Fuzzy search for anything</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { sendMessage } from 'webext-bridge'

const openNewTab = async(url: string) => {
  await sendMessage(
    'open-new-tab-page',
    {
      url,
    },
  )
}
</script>

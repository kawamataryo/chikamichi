<template>
  <main class="w-700px h-440px flex bg-white dark:bg-gray-800 text-gray-600 dark:text-bg-gray-100 overflow-hidden">
    <div class="w-650px">
      <PageSearch v-if="currentPage === PAGES.SEARCH" :search-items="searchItems" />
      <PageInfo v-if="currentPage === PAGES.INFO" />
      <PageSetting v-if="currentPage === PAGES.SETTING" />
    </div>
    <div class="w-50px border-l-1px dark:border-l-gray-700 border-l-gray-200">
      <SideMenu :current-page="currentPage" @change="changePage" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { STORE_KEY, useStore } from '~/popup/utils/store'
import { PAGES, THEME } from '~/constants'
import { theme } from '~/logic'

// searchItem
const store = inject<ReturnType<typeof useStore>>(STORE_KEY)
if (!store)
  throw new Error('store is not provided')

const searchItems = computed(() => store.state.searchItems)

const currentPage = ref<ValueOf<typeof PAGES>>(PAGES.SEARCH)
const changePage = (pageId: ValueOf<typeof PAGES>) => {
  currentPage.value = pageId
}

// theme
watch(theme, (next) => {
  if (next === THEME.AUTO) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      document.documentElement.classList.add('dark')

    else
      document.documentElement.classList.remove('dark')
  }
  if (next === THEME.DARK)
    document.documentElement.classList.add('dark')

  if (next === THEME.LIGHT)
    document.documentElement.classList.remove('dark')
}, {
  immediate: true,
})
</script>

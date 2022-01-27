<template>
  <main class="w-700px h-440px flex bg-white dark:bg-gray-800 text-gray-600 dark:text-bg-gray-100">
    <div class="w-650px">
      <SearchPage v-if="currentPage === PAGES.SEARCH" :search-items="searchItems" />
      <InfoPage v-if="currentPage === PAGES.INFO" />
    </div>
    <div class="w-50px border-l-1px dark:border-l-gray-700 border-l-gray-200">
      <SideMenu :current-page="currentPage" @change="changePage" />
    </div>
  </main>
</template>

<script lang="ts" setup>
import { STORE_KEY, useStore } from '~/popup/utils/store'
import { PAGES } from '~/constants'

const store = inject<ReturnType<typeof useStore>>(STORE_KEY)
if (!store)
  throw new Error('store is not provided')

const searchItems = computed(() => store.state.searchItems)

const currentPage = ref<ValueOf<typeof PAGES>>(PAGES.SEARCH)
const changePage = (pageId: ValueOf<typeof PAGES>) => {
  currentPage.value = pageId
}
</script>

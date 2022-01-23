<template>
  <main class="w-650px h-440px">
    <SearchForm :search-items="searchItems" />
  </main>
</template>

<script lang="ts" setup>

import { STORE_KEY, useStore } from '~/popup/utils/store'

const store = inject<ReturnType<typeof useStore>>(STORE_KEY)
if (!store)
  throw new Error('store is not provided')

const searchItems = computed(() => store.state.searchItems)
</script>

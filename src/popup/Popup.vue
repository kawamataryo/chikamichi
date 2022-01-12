<template>
  <main class="w-[240px] px-4 py-5 dark:bg-gray-700">
    <div class="flex min-h-15vh w-full justify-center items-center flex-row">
      <div class="mr-15px">
        <Logo width="30" height="30" class="dark:hidden" />
        <Logo width="30" height="30" class="hidden dark:block" dark />
      </div>
      <p class="text-18px text-black font-bold leading-20px dark:text-gray-100">
        Chikamichi<br />
        <span class="text-11px">Fuzzy search for anything</span>
      </p>
    </div>
    <div class="text-center mt-10px">
      <span class="bg-gray-200 dark:bg-gray-600 dark:text-white rounded-3px px-8px py-4px inline-block mr-3px">Alt</span>
      <span class="dark:text-white mr-3px">+</span>
      <span class="bg-gray-200 dark:bg-gray-600 dark:text-white rounded-3px px-8px py-4px inline-block mr-3px">k</span>
    </div>
    <!-- TODO enable dark mode -->
    <!--    <div class="mt-2">-->
    <!--      <IconMoon v-if="isDark" width="40" height="40" class="cursor-pointer" @click="toggleMode" />-->
    <!--      <IconSun v-else width="40" height="40" class="cursor-pointer" @click="toggleMode" />-->
    <!--      {{ isDark }}-->
    <!--    </div>-->
  </main>
</template>

<script lang="ts" setup>
// TODO enable dark mode
// import { isDarkMode } from '~/logic/storage'

// const isDark = computed(() => isDarkMode.value)
// const toggleMode = () => {
//   isDarkMode.value = !isDarkMode.value
// }

// watch(isDarkMode, () => {
//   if (isDarkMode.value)
//     document.querySelector('html')!.classList.add('dark')
//
//   else
//     document.querySelector('html')!.classList.remove('dark')
// }, {
//   immediate: true,
// })
</script>

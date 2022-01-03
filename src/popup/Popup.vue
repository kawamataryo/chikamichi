<template>
  <main class="w-[180px] px-4 py-5 text-center text-gray-800 dark:bg-gray-700 dark:text-white">
    <Logo width="40" height="40" class="inline-block" :dark="isDark" />
    <p class="mt-2 opacity-50">
      Fussy history search
    </p>
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

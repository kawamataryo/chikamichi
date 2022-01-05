<template>
  <main class="w-[190px] px-4 py-5">
    <div class="flex min-h-15vh w-full justify-center items-center flex-row opacity-80">
      <Logo width="40" height="40" class="mr-10px" />
      <p class="text-14px text-black font-bold leading-20px">
        Fussy<br />History Search
      </p>
    </div>
    <div class="text-center mt-10px">
      <span class="bg-gray-200 rounded-3px px-8px py-4px inline-block mr-3px">Alt</span>
      +
      <span class="bg-gray-200 rounded-3px px-8px py-4px inline-block mr-3px">p</span>
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

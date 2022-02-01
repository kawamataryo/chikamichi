<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    class="iconify iconify--ph"
    :width="width"
    :height="height"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 256 256"
  ><path d="M248 88a8 8 0 0 1-8 8h-16v16a8 8 0 0 1-16 0V96h-16a8 8 0 0 1 0-16h16V64a8 8 0 0 1 16 0v16h16a8 8 0 0 1 8 8zm-96-40h8v8a8 8 0 0 0 16 0v-8h8a8 8 0 0 0 0-16h-8v-8a8 8 0 0 0-16 0v8h-8a8 8 0 0 0 0 16zm64.5 96.6l-2.2.4A84 84 0 0 1 111 41.6a5.7 5.7 0 0 0 .3-1.8a8 8 0 0 0-5-7.9a7.8 7.8 0 0 0-5.2-.2a100 100 0 1 0 123.2 123.2a7.9 7.9 0 0 0 0-4.8a8.2 8.2 0 0 0-7.8-5.5z" fill="currentColor"></path></svg>
</template>

<script lang="ts">
export default defineComponent({
  name: 'IconDark',
  props: {
    width: {
      type: [Number, String],
      default: 18,
    },
    height: {
      type: [Number, String],
      default: 18,
    },
  },
})
</script>

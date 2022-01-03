
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    class="iconify iconify--mdi"
    :width="width"
    :height="height"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 24 24"
  ><path d="M11 9h2V7h-2m1 13c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m-1 15h2v-6h-2v6z" fill="currentColor"></path></svg>
</template>

<script lang="ts">
export default defineComponent({
  name: 'IconInfo',
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

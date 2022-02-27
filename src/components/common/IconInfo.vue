<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    class="iconify iconify--carbon"
    :width="width"
    :height="height"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 32 32"
  >
    <path d="M17 22v-8h-4v2h2v6h-3v2h8v-2h-3z" fill="currentColor" />
    <path
      d="M16 8a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 16 8z"
      fill="currentColor"
    />
    <path
      d="M16 30a14 14 0 1 1 14-14a14 14 0 0 1-14 14zm0-26a12 12 0 1 0 12 12A12 12 0 0 0 16 4z"
      fill="currentColor"
    />
  </svg>
</template>
<script lang="ts">
export default defineComponent({
  name: "IconInfo",
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
});
</script>

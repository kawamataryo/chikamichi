<script lang="ts">
export default defineComponent({
  name: "IconGear",
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

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    role="img"
    class="iconify iconify--octicon"
    :width="height"
    :height="width"
    preserveAspectRatio="xMidYMid meet"
    viewBox="0 0 14 16"
  >
    <path
      fill-rule="evenodd"
      d="M14 8.77v-1.6l-1.94-.64l-.45-1.09l.88-1.84l-1.13-1.13l-1.81.91l-1.09-.45l-.69-1.92h-1.6l-.63 1.94l-1.11.45l-1.84-.88l-1.13 1.13l.91 1.81l-.45 1.09L0 7.23v1.59l1.94.64l.45 1.09l-.88 1.84l1.13 1.13l1.81-.91l1.09.45l.69 1.92h1.59l.63-1.94l1.11-.45l1.84.88l1.13-1.13l-.92-1.81l.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3s3 1.34 3 3s-1.34 3-3 3z"
      fill="currentColor"
    />
  </svg>
</template>

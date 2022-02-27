<template>
  <svg
    id="Layer_1"
    style="enable-background: new 0 0 128 128"
    :width="width"
    :height="height"
    viewBox="0 0 128 128"
    xml:space="preserve"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <g>
      <path
        :fill="colors.inner"
        d="M52.6,46.3l-0.9-14.9c0-1.8-1.5-3.2-3.2-3.2c-1.8,0-3.2,1.4-3.2,3.2l-0.9,14.9c-1.9,1.3-3.1,3.6-3.1,5.9   c0,4,3.2,7.2,7.2,7.2c0.5,0,1.1-0.1,1.6-0.2l8.3,6.9c0.6,0.5,1.4,0.8,2.2,0.8c0,0,0,0,0,0c0.9,0,1.8-0.4,2.4-1   c0.6-0.6,0.9-1.5,0.9-2.3c0-0.8-0.4-1.6-1-2.2l-7.2-8.1c0.1-0.4,0.1-0.7,0.1-1.1C55.7,49.9,54.5,47.7,52.6,46.3z"
      />
      <path
        :fill="colors.frame"
        d="M124.3,104.6c-0.7-1.7-1.9-3.2-3.4-4.4l-24-19.5c-1.3-1.1-3.2-1-4.4,0.2l-5.1-4.7c4.7-7.7,7.3-16.9,6.7-26.5   c-1.5-25.2-23.1-44.4-48.3-43C20.6,8.1,1.3,29.8,2.8,55c0.2,2.6,2.4,4.6,5,4.5c2.6-0.2,4.6-2.4,4.5-5c-1.2-19.9,14.1-37,34-38.2   c19.9-1.2,37,14.1,38.2,34c1.2,19.9-14.1,37-34,38.2c-3.6,0.2-7.2-0.1-10.6-0.9c-2.6-0.6-5.1,1-5.8,3.5c-0.6,2.6,1,5.1,3.5,5.8   c3.5,0.8,7.1,1.3,10.7,1.3c0.9,0,1.8,0,2.7-0.1c11.5-0.7,21.8-5.6,29.4-13.1l4.2,3.9l-0.2,0.2c-1.2,1.2-1.3,3.1-0.2,4.4l19.8,23.8   c4.5,5.4,12.7,5.8,17.7,0.8C125.4,114.2,126.2,108.9,124.3,104.6z"
      />
      <circle :fill="colors.inner" cx="24.1" cy="85.2" r="4.9" />
      <ellipse
        :fill="colors.inner"
        cx="12.4"
        cy="71.7"
        rx="4.9"
        ry="4.9"
        transform="matrix(0.1432 -0.9897 0.9897 0.1432 -60.3339 73.651)"
      />
    </g>
  </svg>
</template>

<script lang="ts">
export default defineComponent({
  name: "Logo",
  props: {
    width: {
      type: [Number, String],
      default: 18,
    },
    height: {
      type: [Number, String],
      default: 18,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const colors = computed(() =>
      props.dark
        ? {
            frame: "#fff",
            inner: "#4994d1",
          }
        : {
            frame: "#2D3E50",
            inner: "#1D75B9",
          }
    );
    return { colors };
  },
});
</script>

<style scoped></style>

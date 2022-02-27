<template>
  <IconStar
    :width="18"
    :height="18"
    :border="props.value"
    cy-data="toggle-star"
    @click="emit('click')"
  />
</template>

<script lang="ts" setup>
interface PropsType {
  value: boolean;
}
const props = defineProps<PropsType>();
const emit = defineEmits(["click"]);
</script>

<style scoped></style>

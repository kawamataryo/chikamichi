<script lang="ts" setup>
interface PropsType {
  value: boolean;
}
const props = defineProps<PropsType>();
const emit = defineEmits(["click"]);
</script>

<template>
  <IconStar
    :width="18"
    :height="18"
    :border="props.value"
    cy-data="toggle-star"
    @click="emit('click')"
  />
</template>

<style scoped></style>

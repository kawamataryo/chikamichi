<template>
  <IconStar :width="18" :height="18" :border="props.value" @click="emit('click')"></IconStar>
</template>

<script lang="ts" setup>
type PropsType = {
  value: boolean
}
const props = defineProps<PropsType>()
const emit = defineEmits(['click'])
</script>

<style scoped>

</style>

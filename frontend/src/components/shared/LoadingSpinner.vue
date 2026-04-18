<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg' }>()
</script>

<template>
  <div class="flex justify-center items-center p-8">
    <div
      :class="[
        'animate-spin rounded-full border-t-2 border-primary',
        size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
      ]"
    />
  </div>
</template>

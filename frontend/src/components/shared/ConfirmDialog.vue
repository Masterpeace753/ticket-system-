<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <h2 class="text-lg font-semibold mb-2">{{ title }}</h2>
      <p class="text-gray-600 text-sm mb-6">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <button @click="emit('cancel')" class="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          {{ t('common.cancel') }}
        </button>
        <button
          @click="emit('confirm')"
          :class="['px-4 py-2 text-sm rounded-lg text-white font-medium', danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary/90']"
        >
          {{ confirmLabel ?? t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

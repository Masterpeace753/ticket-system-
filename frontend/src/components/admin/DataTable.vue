<script setup lang="ts" generic="T extends Record<string, any>">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  columns: { key: keyof T; label: string }[]
  rows: T[]
  rowKey: keyof T
}>()

const emit = defineEmits<{
  (e: 'edit', row: T): void
  (e: 'delete', row: T): void
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-xs text-gray-400 border-b border-gray-100">
          <th v-for="col in columns" :key="String(col.key)" class="pb-2 pr-4 font-medium">
            {{ col.label }}
          </th>
          <th class="pb-2 text-right">{{ t('common.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="String(row[rowKey])" class="border-t border-gray-100 hover:bg-gray-50">
          <td v-for="col in columns" :key="String(col.key)" class="py-2 pr-4">
            <slot :name="`cell-${String(col.key)}`" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
          <td class="py-2 text-right">
            <div class="flex gap-2 justify-end">
              <slot name="actions" :row="row">
                <button @click="emit('edit', row)" class="text-xs text-blue-600 hover:underline">{{ t('common.edit') }}</button>
                <button @click="emit('delete', row)" class="text-xs text-red-600 hover:underline">{{ t('common.delete') }}</button>
              </slot>
            </div>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + 1" class="py-6 text-center text-gray-400 text-sm">{{ t('common.noData') }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

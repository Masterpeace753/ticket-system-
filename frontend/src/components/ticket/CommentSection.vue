<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ticketsApi } from '@/api/tickets'
import { useAuthStore } from '@/stores/auth'
import type { Comment } from '@/types'

const { t } = useI18n()
const auth = useAuthStore()

const props = defineProps<{ ticketId: number }>()

const comments = ref<Comment[]>([])
const text = ref('')
const loading = ref(false)
const submitting = ref(false)

async function fetchComments() {
  loading.value = true
  try {
    comments.value = await ticketsApi.getComments(props.ticketId)
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!text.value.trim()) return
  submitting.value = true
  try {
    const comment = await ticketsApi.addComment(props.ticketId, text.value.trim())
    comments.value.push(comment)
    text.value = ''
  } finally {
    submitting.value = false
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleString()
}

onMounted(fetchComments)
</script>

<template>
  <div>
    <h3 class="text-base font-semibold mb-3">{{ t('comment.title') }}</h3>
    <div v-if="loading" class="text-sm text-gray-400">{{ t('common.loading') }}</div>
    <div v-else class="flex flex-col gap-3 mb-4">
      <div v-if="comments.length === 0" class="text-sm text-gray-400">{{ t('comment.empty') }}</div>
      <div v-for="c in comments" :key="c.id" class="bg-gray-50 rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium text-gray-700">{{ c.author_display_name }}</span>
          <span class="text-xs text-gray-400">{{ formatDate(c.created_at) }}</span>
        </div>
        <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ c.content }}</p>
      </div>
    </div>

    <div class="flex gap-2 mt-2">
      <textarea
        v-model="text"
        rows="2"
        :placeholder="t('comment.placeholder')"
        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <button
        @click="submit"
        :disabled="submitting || !text.trim()"
        class="self-end px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {{ t('comment.submit') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usersApi } from '@/api/users'
import DataTable from '@/components/admin/DataTable.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import type { User } from '@/types'

const { t } = useI18n()

const users = ref<User[]>([])
const showCreate = ref(false)
const deactivateTarget = ref<User | null>(null)

const newUser = ref({ username: '', display_name: '', email: '', password: '', is_admin: false })

const columns = [
  { key: 'username' as const, label: t('admin.users.username') },
  { key: 'display_name' as const, label: t('admin.users.displayName') },
  { key: 'email' as const, label: t('admin.users.email') },
  { key: 'is_admin' as const, label: t('admin.users.isAdmin') },
  { key: 'is_active' as const, label: t('admin.users.isActive') }
]

async function load() {
  users.value = await usersApi.list()
}

async function createUser() {
  await usersApi.create({
    username: newUser.value.username,
    display_name: newUser.value.display_name,
    email: newUser.value.email || undefined,
    password: newUser.value.password,
    is_admin: newUser.value.is_admin
  })
  showCreate.value = false
  newUser.value = { username: '', display_name: '', email: '', password: '', is_admin: false }
  await load()
}

async function deactivate() {
  if (!deactivateTarget.value) return
  await usersApi.deactivate(deactivateTarget.value.id)
  deactivateTarget.value = null
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-base font-semibold">{{ t('admin.users.title') }}</h2>
      <button @click="showCreate = true" class="bg-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary/90">
        + {{ t('admin.users.create') }}
      </button>
    </div>

    <DataTable :columns="columns" :rows="users" row-key="id">
      <template #cell-is_admin="{ row }">
        <span :class="row.is_admin ? 'text-primary font-semibold' : 'text-gray-400'">
          {{ row.is_admin ? t('common.yes') : t('common.no') }}
        </span>
      </template>
      <template #cell-is_active="{ row }">
        <span :class="row.is_active ? 'text-green-600' : 'text-gray-400'">
          {{ row.is_active ? t('common.active') : t('common.inactive') }}
        </span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="row.is_active"
          @click="deactivateTarget = row"
          class="text-xs text-red-600 hover:underline"
        >
          {{ t('admin.users.deactivate') }}
        </button>
        <span v-else class="text-xs text-gray-400">{{ t('common.inactive') }}</span>
      </template>
    </DataTable>

    <!-- Create user modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="font-semibold mb-4">{{ t('admin.users.create') }}</h3>
        <form @submit.prevent="createUser" class="flex flex-col gap-3">
          <input v-model="newUser.username" :placeholder="t('admin.users.username')" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input v-model="newUser.display_name" :placeholder="t('admin.users.displayName')" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input v-model="newUser.email" :placeholder="t('admin.users.email')" type="email" class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <input v-model="newUser.password" :placeholder="t('admin.users.password')" type="password" required class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          <label class="flex items-center gap-2 text-sm">
            <input v-model="newUser.is_admin" type="checkbox" class="accent-primary" />
            {{ t('admin.users.isAdmin') }}
          </label>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showCreate = false" class="px-4 py-2 text-sm border border-gray-300 rounded-lg">{{ t('common.cancel') }}</button>
            <button type="submit" class="px-4 py-2 text-sm bg-primary text-white rounded-lg">{{ t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmDialog
      v-if="deactivateTarget"
      :title="t('admin.users.deactivateTitle')"
      :message="t('admin.users.deactivateConfirm', { name: deactivateTarget.display_name })"
      :danger="true"
      @confirm="deactivate"
      @cancel="deactivateTarget = null"
    />
  </div>
</template>

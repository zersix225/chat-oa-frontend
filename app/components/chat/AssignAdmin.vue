<script setup lang="ts">
// UI only — not connected to the backend yet.
// TODO: replace mock admins and local state with API calls.

interface Admin {
  id: number
  name: string
  email: string
  avatar?: string
}

const admins: Admin[] = [
  { id: 1, name: 'Admin One', email: 'admin1@example.com' },
  { id: 2, name: 'Admin Two', email: 'admin2@example.com' },
  { id: 3, name: 'Admin Three', email: 'admin3@example.com' }
]

const meId = 1

const open = ref(false)
const assigneeId = ref<number | null>(null)

const assignee = computed(() => admins.find(a => a.id === assigneeId.value) ?? null)

const groups = computed(() => [
  {
    id: 'actions',
    items: [
      ...(assigneeId.value !== meId
        ? [{ label: 'Assign to me', icon: 'i-lucide-user-round-plus', onSelect: () => select(meId) }]
        : []),
      ...(assigneeId.value
        ? [{ label: 'Unassign', icon: 'i-lucide-user-round-x', color: 'error' as const, onSelect: () => select(null) }]
        : [])
    ]
  },
  {
    id: 'admins',
    label: 'Admins',
    items: admins.map(admin => ({
      label: admin.name,
      suffix: admin.email,
      avatar: { src: admin.avatar, alt: admin.name },
      active: admin.id === assigneeId.value,
      trailingIcon: admin.id === assigneeId.value ? 'i-lucide-check' : undefined,
      onSelect: () => select(admin.id)
    }))
  }
].filter(g => g.items.length))

function select(id: number | null) {
  open.value = false
  assigneeId.value = id
}
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'end' }">
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      :avatar="assignee ? { src: assignee.avatar, alt: assignee.name } : undefined"
      :icon="assignee ? undefined : 'i-lucide-user-round-plus'"
      :label="assignee ? assignee.name : 'Assign'"
      trailing-icon="i-lucide-chevron-down"
      class="max-w-48"
      :ui="{ label: 'truncate' }"
    />

    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search admins..."
        class="h-80 w-72"
      />
    </template>
  </UPopover>
</template>

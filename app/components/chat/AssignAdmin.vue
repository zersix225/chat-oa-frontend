<script setup lang="ts">
import { useAssignConversation, useGetConversationById } from '~/composables/useConversation'
import { useGetAdmins, userDisplayName } from '~/composables/useUser'
import { useAuthMe } from '~/composables/useAuth'

const props = defineProps<{ chatId: string }>()

const { data: conversation } = useGetConversationById(props.chatId)
const { data: admins, isPending: adminsPending } = useGetAdmins()
const { data: me } = useAuthMe()
const { mutate: assign, isPending: assigning } = useAssignConversation(props.chatId)

const open = ref(false)

const assigneeId = computed(() => conversation.value?.assigneeId ?? null)

const assignee = computed(() =>
  conversation.value?.assignee
  ?? admins.value?.data.find(u => u.id === assigneeId.value)
  ?? null
)

const groups = computed(() => {
  const myId = me.value?.id
  return [
    {
      id: 'actions',
      items: [
        ...(myId && !assigneeId.value
          ? [{ label: 'Assign to me', icon: 'i-lucide-user-round-plus', onSelect: () => select(myId) }]
          : []),
        ...(assigneeId.value
          ? [{ label: 'Unassign', icon: 'i-lucide-user-round-x', color: 'error' as const, onSelect: () => select(null) }]
          : [])
      ]
    },
    {
      id: 'admins',
      label: 'Admins',
      items: (admins.value?.data ?? []).map(admin => ({
        label: userDisplayName(admin),
        suffix: admin.email ?? undefined,
        avatar: { src: admin.photo?.path, alt: userDisplayName(admin) },
        active: admin.id === assigneeId.value,
        trailingIcon: admin.id === assigneeId.value ? 'i-lucide-check' : undefined,
        onSelect: () => select(admin.id)
      }))
    }
  ].filter(g => g.items.length)
})

function select(id: number | null) {
  open.value = false
  if (id === assigneeId.value) return
  assign(id)
}
</script>

<template>
  <UPopover v-model:open="open" :content="{ align: 'end' }">
    <UButton
      color="neutral"
      variant="ghost"
      size="sm"
      :loading="assigning"
      :avatar="assignee ? { src: assignee.photo?.path, alt: userDisplayName(assignee) } : undefined"
      :icon="assignee ? undefined : 'i-lucide-user-round-plus'"
      :label="assignee ? userDisplayName(assignee) : 'Assign'"
      trailing-icon="i-lucide-chevron-down"
      class="max-w-48"
      :ui="{ label: 'truncate' }"
    />

    <template #content>
      <UCommandPalette
        :groups="groups"
        :loading="adminsPending"
        placeholder="Search admins..."
        class="h-auto max-h-80 w-72"
      />
    </template>
  </UPopover>
</template>

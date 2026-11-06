<script setup lang="ts">
import type { ConversationReader } from '~/types/conversation-read'

const props = defineProps<{
  readers: ConversationReader[]
  lastMessageId?: string
  lastMessageAt?: Date | string
  meId?: number
}>()

function readerName(reader: ConversationReader) {
  const user = reader.user
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ')
  return name || user?.email || `Admin #${reader.userId}`
}

const names = computed(() => {
  if (!props.lastMessageId) return []
  const lastAt = props.lastMessageAt ? new Date(props.lastMessageAt).getTime() : null

  return props.readers
    .filter(reader => reader.userId !== props.meId)
    .filter(reader =>
      reader.lastReadMessageId === props.lastMessageId
      || (lastAt !== null && new Date(reader.lastReadAt).getTime() >= lastAt)
    )
    .map(readerName)
})
</script>

<template>
  <div
    v-if="names.length"
    class="flex items-center justify-end gap-1 text-xs text-muted"
  >
    <UIcon name="i-lucide-check-check" class="size-3.5 shrink-0" />
    <span class="truncate">Seen by {{ names.join(', ') }}</span>
  </div>
</template>

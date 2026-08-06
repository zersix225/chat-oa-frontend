<script setup lang="ts">
import type {DropdownMenuItem} from '@nuxt/ui'
import {useGetConversationById} from '~/composables/useConversation'

defineProps<{ isOwner: boolean }>()

const route = useRoute()
const id = (route.params.id as string) ?? ''

const {data, isPending} = useGetConversationById(id)

const displayTitle = computed(
  () => data.value?.contact.displayName || ''
)

const items = computed<DropdownMenuItem[][]>(() => [[
  {
    label: 'Rename',
    icon: 'i-lucide-pencil'
    // onSelect: rename
  }
], [
  {
    label: 'Delete',
    icon: 'i-lucide-trash',
    color: 'error' as const
    // onSelect: () => deleteChat(props.chatId)
  }
]])

const platformColor = computed(() => {
  switch (data.value?.contact.contactPlatform) {
    case 'line':
      return 'success'
    case 'facebook':
      return 'info'
    default:
      return undefined
  }
})
</script>

<template>
  <div
    v-if="!isOwner"
    class="flex items-center justify-between gap-2 w-full"
  >
    <template v-if="isPending">
      <USkeleton class="h-4 w-32" />
    </template>

    <template v-else>
      <span class="text-sm font-medium text-highlighted truncate min-w-0">
        {{ displayTitle }}
      </span>
      <UBadge class="shrink-0" :color="platformColor">
        {{ data?.contact.contactPlatform }}
      </UBadge>
    </template>
  </div>

  <UDropdownMenu
    v-else
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'min-w-44' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      trailing-icon="i-lucide-chevron-down"
      :label="displayTitle"
      :class="['group min-w-0 max-w-3xs data-[state=open]:bg-elevated', { 'text-muted': !title }]"
      :ui="{
        trailingIcon: 'text-dimmed shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200'
      }"
    />
  </UDropdownMenu>
</template>

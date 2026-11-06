<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useGetConversationById } from '../../composables/useConversation'
import { useFaceBookPushMessage, useLinePushMessage } from '../../composables/useWebhook'
import { useWebsocket } from '../../composables/useWebsocket'
import { useAuthMe } from '../../composables/useAuth'
import { useConversationReadEvents, useGetConversationReaders, useMarkConversationRead } from '../../composables/useConversationRead'
import { useDocumentVisibility } from '@vueuse/core'
import type { ConversationById } from '~/types/conversation'
import type { UIMessage } from 'ai'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const input = ref('')
const id = (route.params.id as string) ?? ''

const { mutate: pushLineMsg } = useLinePushMessage()
const { mutate: pushFaceMsg } = useFaceBookPushMessage()
const { newMessage } = useWebsocket()
const queryClient = useQueryClient()

const { data } = useGetConversationById(id)
const { data: me } = useAuthMe()

watch(newMessage, (newMsg) => {
  if (!newMsg) return
  queryClient.invalidateQueries({ queryKey: ['conversations'] })
  queryClient.setQueryData<ConversationById>(
    ['conversationById', newMsg.conversationId], (old) => {
      if (!old) return
      return {
        ...old,
        messages: [...(old.messages ?? []), newMsg]
      }
    }
  )
})

function onSubmit() {
  if (!input.value.trim() || !data.value || !me.value) return

  const contact = data.value.contact
  if (contact.contactPlatform === 'line') {
    pushLineMsg({
      message: input.value,
      customerId: contact.customerId,
      conversationId: id,
      adminId: me.value.id
    })
  } else {
    pushFaceMsg({
      recipient: {
        id: contact.customerId
      },
      messaging_type: 'RESPONSE',
      message: {
        text: input.value
      },
      conversationId: id,
      adminId: me.value.id
    })
  }
  input.value = ''
}
const messages = computed(() => {
  const contact = data.value?.contact
  if (!contact) return []

  return (data.value?.messages ?? []).map(msg => ({
    id: String(msg.id),
    role: msg.senderType === 'admin' ? 'assistant' : 'user',
    parts: [{ type: 'text', text: msg.content }],
    date: msg.timestamp,
    avatar: msg.senderType !== 'admin' && contact.pictureUrl
      ? { src: contact.pictureUrl }
      : undefined
  }))
})

const bottomRef = ref<HTMLElement | null>(null)
const promptRef = useTemplateRef('prompt')

function insertEmoji(emoji: string) {
  const el = promptRef.value?.textareaRef
  if (!el) {
    input.value += emoji
    return
  }
  const start = el.selectionStart ?? input.value.length
  const end = el.selectionEnd ?? start
  input.value = input.value.slice(0, start) + emoji + input.value.slice(end)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + emoji.length, start + emoji.length)
  })
}

watch(() => messages.value.length, () => {
  nextTick(() => bottomRef.value?.scrollIntoView({ behavior: 'smooth' }))
})

const { data: readers } = useGetConversationReaders(id)
const { mutate: markRead } = useMarkConversationRead(id)
useConversationReadEvents()

const visibility = useDocumentVisibility()
const lastMessage = computed(() => data.value?.messages?.at(-1))
let lastMarkedId: string | null = null

watch([() => lastMessage.value?.id, visibility], ([lastId, state]) => {
  if (!lastId || state !== 'visible') return
  const messageId = String(lastId)
  if (messageId === lastMarkedId) return
  lastMarkedId = messageId
  markRead(messageId)
}, { immediate: true })
</script>

<template>
  <UDashboardPanel
    id="chat"
    class="relative min-h-full"
    :ui="{ body: 'p-0 sm:p-0 pt-4 overscroll-none' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <ChatTitle :chat-id="id" :is-owner="false" />
        </template>

        <ChatAssignAdmin :chat-id="id" />
      </Navbar>
    </template>

    <template #body>
      <UContainer class="flex flex-col gap-4 sm:gap-6 min-h-full">
        <UChatMessages
          :messages="messages as UIMessage[]"
          class="pt-(--ui-header-height)"
          :spacing-offset="160"
          :assistant="{ side: 'right', variant: 'soft' }"
          :user="{ side: 'left', variant: 'outline' }"
        >
          <template #header="{ message }">
            <NuxtTime
              :datetime="(message as any).date"
              time-style="short"
              class="text-xs text-gray-400"
            />
          </template>
        </UChatMessages>

        <ChatSeenBy
          :readers="readers ?? []"
          :last-message-id="lastMessage ? String(lastMessage.id) : undefined"
          :last-message-at="lastMessage?.timestamp"
          :me-id="me?.id"
          class="-mt-2 sm:-mt-4"
        />

        <div ref="bottomRef" />

        <UChatPrompt
          ref="prompt"
          v-model="input"
          variant="subtle"
          :ui="{ base: 'ps-11.5', leading: 'items-center', trailing: 'items-center' }"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          @submit="onSubmit"
        >
          <template #leading>
            <ChatEmojiPicker @select="insertEmoji" />
          </template>

          <UChatPromptSubmit color="neutral" size="sm" />
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

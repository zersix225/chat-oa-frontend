<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useGetConversationById } from '../../composables/useConversation'
import { useFaceBookPushMessage, useLinePushMessage } from '../../composables/useWebhook'
import { useUploadFile } from '../../composables/useFile'
import { useWebsocket } from '../../composables/useWebsocket'
import { useAuthMe } from '../../composables/useAuth'
import { useConversationReadEvents, useGetConversationReaders, useMarkConversationRead } from '../../composables/useConversationRead'
import { useDocumentVisibility } from '@vueuse/core'
import type { ConversationById } from '~/types/conversation'
import type { UIMessage } from 'ai'

const route = useRoute()
const input = ref('')
const id = (route.params.id as string) ?? ''

const { mutateAsync: pushLineMsg } = useLinePushMessage()
const { mutateAsync: pushFaceMsg } = useFaceBookPushMessage()
const { mutateAsync: uploadFile } = useUploadFile()
const toast = useToast()
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

// ---------- attachment ----------
const fileInput = ref<HTMLInputElement | null>(null)
const pendingFile = ref<File | null>(null)
const pendingPreview = ref<string | null>(null)
const sending = ref(false)

const accept = ACCEPTED_FILES

function setPendingFile(file: File | null) {
  if (pendingPreview.value) URL.revokeObjectURL(pendingPreview.value)
  pendingFile.value = file
  pendingPreview.value = file?.type.startsWith('image/') ? URL.createObjectURL(file) : null
}

function onFilePicked(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = '' // allow picking the same file again
  if (!file) return

  if (!isAcceptedFile(file, accept)) {
    toast.add({
      title: 'File type not supported',
      description: 'Please choose an image, video, audio or document file.',
      color: 'error'
    })
    return
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.add({ title: 'File too large', description: `Max ${formatBytes(MAX_UPLOAD_BYTES)}.`, color: 'error' })
    return
  }
  setPendingFile(file)
}

onBeforeUnmount(() => setPendingFile(null))

async function onSubmit() {
  const text = input.value.trim()
  if ((!text && !pendingFile.value) || !data.value || !me.value || sending.value) return

  const contact = data.value.contact
  sending.value = true
  try {
    const fileId = pendingFile.value
      ? (await uploadFile(pendingFile.value)).file.id
      : undefined

    if (contact.contactPlatform === 'line') {
      await pushLineMsg({
        message: text || undefined,
        fileId,
        fileName: pendingFile.value?.name,
        customerId: contact.customerId,
        conversationId: id,
        adminId: me.value.id
      })
    } else {
      await pushFaceMsg({
        recipient: {
          id: contact.customerId
        },
        messaging_type: 'RESPONSE',
        message: text ? { text } : undefined,
        fileId,
        fileName: pendingFile.value?.name,
        conversationId: id,
        adminId: me.value.id
      })
    }
    input.value = ''
    setPendingFile(null)
  } catch (error) {
    const data = (error as { data?: { message?: string, errors?: Record<string, string> } }).data
    toast.add({
      title: 'Message not sent',
      description: data?.message ?? Object.values(data?.errors ?? {})[0] ?? 'Please try again.',
      color: 'error'
    })
  } finally {
    sending.value = false
  }
}
const messages = computed(() => {
  const contact = data.value?.contact
  if (!contact) return []

  return (data.value?.messages ?? []).map(msg => ({
    id: String(msg.id),
    role: msg.senderType === 'admin' ? 'assistant' : 'user',
    parts: [{ type: 'text', text: messagePreview(msg) }],
    raw: msg,
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

          <template #content="{ message }">
            <ChatMessageMedia :message="(message as any).raw" />
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
          :disabled="sending"
          :ui="{ base: 'ps-20', leading: 'items-center gap-0', trailing: 'items-center' }"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          @submit="onSubmit"
        >
          <template v-if="pendingFile" #header>
            <div class="flex items-center gap-3 rounded-md border border-default bg-default p-2 max-w-sm">
              <img
                v-if="pendingPreview"
                :src="pendingPreview"
                alt="Selected image"
                class="size-12 rounded object-cover"
              >
              <UIcon v-else name="i-lucide-file-text" class="size-8 text-primary shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm">
                  {{ pendingFile.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ sending ? 'Sending…' : formatBytes(pendingFile.size) }}
                </p>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="Remove attachment"
                :disabled="sending"
                @click="setPendingFile(null)"
              />
            </div>
          </template>

          <template #leading>
            <ChatEmojiPicker @select="insertEmoji" />
            <UTooltip :text="data?.contact.contactPlatform === 'line' ? 'Attach file (non-images are sent to LINE as a link)' : 'Attach file'">
              <UButton
                icon="i-lucide-paperclip"
                variant="ghost"
                color="neutral"
                size="sm"
                aria-label="Attach file"
                :disabled="sending"
                @click="fileInput?.click()"
              />
            </UTooltip>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              :accept="accept"
              @change="onFilePicked"
            >
          </template>

          <!-- type=button + click: UChatPrompt drops submits with empty text,
               but a file can be sent without text. -->
          <UChatPromptSubmit
            type="button"
            color="neutral"
            size="sm"
            :disabled="sending || (!input.trim() && !pendingFile)"
            @click="onSubmit"
          />
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

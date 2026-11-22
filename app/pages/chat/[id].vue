<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query'
import { useGetConversationById } from '../../composables/useConversation'
import { useFaceBookPushMessage, useLinePushMessage, useTiktokPushMessage } from '../../composables/useWebhook'
import { useUploadFile } from '../../composables/useFile'
import { useWebsocket } from '../../composables/useWebsocket'
import { useAuthMe } from '../../composables/useAuth'
import { useConversationReadEvents, useGetConversationReaders, useMarkConversationRead } from '../../composables/useConversationRead'
import { useDocumentVisibility } from '@vueuse/core'
import type { ConversationById } from '~/types/conversation'
import type { UIMessage } from 'ai'

const TIME_GAP_MS = 30 * 60 * 1000

const { t, locale } = useI18n()
const dateLocale = computed(() => (locale.value === 'th' ? 'th-TH' : 'en-GB'))

function formatSeparator(date: Date) {
  const lang = dateLocale.value
  const time = date.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000)
  if (days === 0) return time
  if (days === 1) return t('chat.yesterday', { time })
  if (days < 7) return `${date.toLocaleDateString(lang, { weekday: 'short' })} ${time}`
  return `${date.toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}, ${time}`
}

const route = useRoute()
const input = ref('')
const id = (route.params.id as string) ?? ''

const { mutateAsync: pushLineMsg } = useLinePushMessage()
const { mutateAsync: pushFaceMsg } = useFaceBookPushMessage()
const { mutateAsync: pushTiktokMsg } = useTiktokPushMessage()
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
      title: t('chat.fileNotSupported'),
      description: t('chat.fileNotSupportedDescription'),
      color: 'error'
    })
    return
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.add({ title: t('chat.fileTooLarge'), description: t('chat.fileTooLargeDescription', { size: formatBytes(MAX_UPLOAD_BYTES) }), color: 'error' })
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
    } else if (contact.contactPlatform === 'tiktok') {
      await pushTiktokMsg({
        recipientId: contact.customerId,
        text: text || undefined,
        fileId,
        fileName: pendingFile.value?.name,
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
    scrollToBottom(false)
  } catch (error) {
    const data = (error as { data?: { message?: string, errors?: Record<string, string> } }).data
    toast.add({
      title: t('chat.notSent'),
      description: data?.message ?? Object.values(data?.errors ?? {})[0] ?? t('common.tryAgain'),
      color: 'error'
    })
  } finally {
    sending.value = false
    nextTick(() => promptRef.value?.textareaRef?.focus({ preventScroll: true }))
  }
}
const messages = computed(() => {
  const contact = data.value?.contact
  if (!contact) return []

  const list = data.value?.messages ?? []
  return list.map((msg, i) => {
    const date = new Date(msg.timestamp)
    const prev = list[i - 1]
    const showTime = !prev || date.getTime() - new Date(prev.timestamp).getTime() >= TIME_GAP_MS
    return {
      id: String(msg.id),
      role: msg.senderType === 'admin' ? 'assistant' as const : 'user' as const,
      parts: [{ type: 'text' as const, text: messageLogText(msg) }],
      raw: msg,
      separator: showTime ? formatSeparator(date) : null,
      avatar: msg.senderType !== 'admin' && contact.pictureUrl
        ? { src: contact.pictureUrl }
        : undefined
    }
  })
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

function getScrollParent(): HTMLElement | null {
  let el = bottomRef.value?.parentElement ?? null
  while (el && el !== document.body) {
    if (/auto|scroll/.test(getComputedStyle(el).overflowY)) return el
    el = el.parentElement
  }
  return document.scrollingElement as HTMLElement | null
}

function isNearBottom() {
  const el = getScrollParent()
  return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 150
}

function scrollToBottom(smooth = true) {
  const run = () => {
    const el = getScrollParent()
    el?.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
  }
  nextTick(() => {
    run()
    if (!smooth) requestAnimationFrame(() => setTimeout(run, 50))
  })
}

watch(() => messages.value.length, (length, oldLength) => {
  if (!oldLength) return scrollToBottom(false)
  if (messages.value.at(-1)?.role === 'assistant') return scrollToBottom(false)
  if (isNearBottom()) scrollToBottom()
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
        >
          <template v-for="message in messages" :key="message.id">
            <p v-if="message.separator" class="text-center text-xs text-dimmed">
              {{ message.separator }}
            </p>

            <UChatMessage
              :id="message.id"
              :role="message.role"
              :parts="message.parts"
              :avatar="message.avatar"
              :side="message.role === 'assistant' ? 'right' : 'left'"
              :variant="message.role === 'assistant' ? 'soft' : 'outline'"
            >
              <template #content>
                <ChatMessageMedia :message="message.raw" />
              </template>
            </UChatMessage>
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
                :alt="t('chat.selectedImage')"
                class="size-12 rounded object-cover"
              >
              <UIcon v-else name="i-lucide-file-text" class="size-8 text-primary shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm">
                  {{ pendingFile.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ sending ? t('chat.sending') : formatBytes(pendingFile.size) }}
                </p>
              </div>
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="t('chat.removeAttachment')"
                :disabled="sending"
                @click="setPendingFile(null)"
              />
            </div>
          </template>

          <template #leading>
            <ChatEmojiPicker @select="insertEmoji" />
            <UTooltip :text="data?.contact.contactPlatform === 'line' ? t('chat.attachFileLine') : t('chat.attachFile')">
              <UButton
                icon="i-lucide-paperclip"
                variant="ghost"
                color="neutral"
                size="sm"
                :aria-label="t('chat.attachFile')"
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

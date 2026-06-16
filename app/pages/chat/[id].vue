<script setup lang="ts">
import { useGetMessageBySenderId } from '@/hooks/useMessage'
import { useLinePushMessage } from '@/hooks/useWebhook'

const route = useRoute()
const input = ref('')

const { mutate } = useLinePushMessage()

async function onSubmit() {
  console.log(input.value)
  mutate({
    message: input.value,
    lineUserId: route.params.id as string
  })
  input.value = ''
}

const { data } = useGetMessageBySenderId((route.params.id as string) ?? '')
const messages = computed(() =>
  (data.value ?? []).map(msg => ({
    id: String(msg.id),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: msg.content
      }
    ]
  }))
)
</script>

<template>
  <UDashboardPanel
    id="chat"
    class="relative min-h-0"
    :ui="{ body: 'p-0 sm:p-0 overscroll-none' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <ChatTitle
            :chat-id="1"
            :title="title"
            :is-owner="isOwner"
            @update:title="title = $event"
          />
        </template>

<!--        <ChatVisibility-->
<!--          v-if="isOwner"-->
<!--          :chat-id="data!.id"-->
<!--          :visibility="visibility"-->
<!--          @update:visibility="visibility = $event"-->
<!--        />-->
      </Navbar>
    </template>
    <template #body>
<!--      <UContainer>-->
<!--        <UChatPrompt v-model="input" @submit="onSubmit">-->
<!--          <UChatPromptSubmit :status="chat.status" />-->
<!--        </UChatPrompt>-->
<!--      </UContainer>-->
      <div class="flex flex-1">
        <DragDropOverlay :show="dragging" />
        <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
          <UChatMessages
            should-auto-scroll
            :messages="messages"
            class="pt-(--ui-header-height) pb-4 sm:pb-6"
            :assistant="{
              variant: 'outline',
              avatar: {
                icon: 'i-lucide-bot'
              }
            }"
          >
            <template #indicator>
              <div class="flex items-center gap-1.5">
                <ChatIndicator />

                <UChatShimmer text="Thinking..." class="text-sm" />
              </div>
            </template>

            <template #files="{ message, parts }">
              <ChatFilePreview
                v-for="(part, index) in parts"
                :key="`${message.id}-${index}`"
                :name="getFileName(part.url)"
                :type="part.mediaType"
                :preview-url="part.url"
                size="3xl"
              />
            </template>

            <template #content="{ message }">
              <ChatMessageContent
                :message="message"
                :editing="isOwner && editingMessageId === message.id"
                @save="saveEdit"
                @cancel-edit="editingMessageId = null"
              />
            </template>

            <template #actions>
              <ChatMessageActions
                :message="messages"
              />
            </template>
          </UChatMessages>

          <UChatPrompt
            v-model="input"
            variant="subtle"
            class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
            :ui="{ base: 'px-1.5' }"
            @submit="onSubmit"
          >
<!--            <template v-if="files.length > 0" #header>-->
<!--              <ChatFiles :files="files" @remove="removeFile" />-->
<!--            </template>-->

            <template #footer>
              <div class="flex items-center gap-1">
                <ChatFileUploadButton :open="open" />

                <ModelSelect />
              </div>

              <UChatPromptSubmit
                :disabled="uploading"
                color="neutral"
                size="sm"
                @stop="chat.stop()"
                @reload="chat.regenerate()"
              />
            </template>
          </UChatPrompt>
        </UContainer>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { MessageType } from '~/types/enums/message-type.enum'
import type { StoredFile } from '~/types/file'

/** Renders one chat message body by type: text, image, video, audio, file or sticker. */
const props = defineProps<{
  message: {
    messageType?: MessageType | null
    content?: string | null
    file?: StoredFile | null
  }
}>()

const type = computed(() => props.message.messageType ?? 'text')
const url = computed(() => props.message.file?.path)
const fileName = computed(() => props.message.content || (url.value ? getFileName(url.value) : 'File'))
const previewOpen = ref(false)
</script>

<template>
  <!-- Text -->
  <p v-if="type === 'text'" class="whitespace-pre-wrap break-words">
    {{ message.content }}
  </p>

  <!-- Sticker: content is the sticker image URL -->
  <img
    v-else-if="type === 'sticker' && message.content"
    :src="message.content"
    alt="Sticker"
    loading="lazy"
    class="size-28 object-contain"
  >

  <!-- Media that could not be downloaded from LINE / Facebook -->
  <div v-else-if="!url" class="flex items-center gap-2 text-sm text-muted italic">
    <UIcon name="i-lucide-file-x" class="size-4" />
    {{ messagePreview(message) }} (not available)
  </div>

  <template v-else-if="type === 'image'">
    <button type="button" class="block cursor-zoom-in" @click="previewOpen = true">
      <img
        :src="url"
        alt="Image"
        loading="lazy"
        class="max-h-72 max-w-full sm:max-w-xs rounded-md object-contain"
      >
    </button>
    <UModal v-model:open="previewOpen" :ui="{ content: 'sm:max-w-4xl' }">
      <template #content>
        <div class="relative">
          <img :src="url" alt="Image" class="w-full max-h-[85vh] object-contain">
          <div class="absolute top-2 end-2 flex gap-1">
            <UButton
              :to="url"
              target="_blank"
              icon="i-lucide-external-link"
              color="neutral"
              variant="solid"
              size="sm"
              aria-label="Open original"
            />
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="solid"
              size="sm"
              aria-label="Close"
              @click="previewOpen = false"
            />
          </div>
        </div>
      </template>
    </UModal>
  </template>

  <video
    v-else-if="type === 'video'"
    :src="url"
    controls
    preload="metadata"
    class="max-h-72 max-w-full sm:max-w-xs rounded-md"
  />

  <audio
    v-else-if="type === 'audio'"
    :src="url"
    controls
    preload="metadata"
    class="max-w-full"
  />

  <a
    v-else
    :href="url"
    target="_blank"
    rel="noopener"
    class="flex items-center gap-2 rounded-md border border-default px-3 py-2 hover:bg-elevated transition-colors max-w-full"
  >
    <UIcon name="i-lucide-file-text" class="size-5 shrink-0 text-primary" />
    <span class="truncate text-sm">{{ fileName }}</span>
    <UIcon name="i-lucide-download" class="size-4 shrink-0 text-muted" />
  </a>
</template>

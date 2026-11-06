<script setup lang="ts">
const emit = defineEmits<{ select: [emoji: string] }>()

const open = ref(false)
const pickerEl = ref<HTMLElement | null>(null)
const colorMode = useColorMode()

let picker: HTMLElement | null = null

async function mountPicker() {
  if (picker || !pickerEl.value) return

  const [{ Picker }, { default: data }] = await Promise.all([
    import('emoji-mart'),
    import('@emoji-mart/data')
  ])

  picker = new Picker({
    data,
    set: 'native',
    theme: colorMode.value === 'dark' ? 'dark' : 'light',
    previewPosition: 'none',
    skinTonePosition: 'search',
    onEmojiSelect: (emoji: { native: string }) => emit('select', emoji.native)
  }) as unknown as HTMLElement

  pickerEl.value.appendChild(picker)
}

watch(open, (isOpen) => {
  if (isOpen) nextTick(mountPicker)
  else picker = null
})
</script>

<template>
  <UPopover v-model:open="open" :content="{ side: 'top', align: 'start' }">
    <UButton
      icon="i-lucide-smile"
      color="neutral"
      variant="ghost"
      size="sm"
      :ui="{ base: 'p-1', leadingIcon: 'size-5' }"
      aria-label="Insert emoji"
    />

    <template #content>
      <div ref="pickerEl" class="min-h-[435px] min-w-[352px]" />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('error.notFound'),
  description: () => t('error.notFoundDescription')
})

useHead({
  htmlAttrs: {
    lang: locale
  }
})
</script>

<template>
  <UApp>
    <UError :error="error" />
  </UApp>
</template>

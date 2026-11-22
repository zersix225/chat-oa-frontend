<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()

// Two languages: one click switches to the other, like the dark/light button.
const next = computed(() => locales.value.find(l => l.code !== locale.value))
</script>

<template>
  <UButton
    :label="locale.toUpperCase()"
    :aria-label="next ? `${t('language.label')}: ${next.name ?? next.code}` : t('language.label')"
    color="neutral"
    variant="ghost"
    class="font-semibold"
    @click="next && setLocale(next.code)"
  />
</template>

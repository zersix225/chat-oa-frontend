<script setup lang="ts">
const colorMode = useColorMode()

const color = computed(() => colorMode.value === 'dark' ? '#1b1718' : 'white')

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt AI Chatbot template'
const description = 'A full-featured, hackable Nuxt AI chatbot template made with Nuxt UI.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/chat-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>

<!--  <UApp> -->
<!--    <UHeader> -->
<!--      <template #left> -->
<!--        <NuxtLink to="/"> -->
<!--          <AppLogo class="w-auto h-6 shrink-0" /> -->
<!--        </NuxtLink> -->

<!--        <TemplateMenu /> -->
<!--      </template> -->

<!--      <template #right> -->
<!--        <UColorModeButton /> -->

<!--        <UButton -->
<!--          to="https://github.com/nuxt-ui-templates/starter" -->
<!--          target="_blank" -->
<!--          icon="i-simple-icons-github" -->
<!--          aria-label="GitHub" -->
<!--          color="neutral" -->
<!--          variant="ghost" -->
<!--        /> -->
<!--      </template> -->
<!--    </UHeader> -->

<!--    <UMain> -->
<!--      <NuxtPage /> -->
<!--    </UMain> -->

<!--    <USeparator icon="i-simple-icons-nuxtdotjs" /> -->

<!--    <UFooter> -->
<!--      <template #left> -->
<!--        <p class="text-sm text-muted"> -->
<!--          Built with Nuxt UI • © {{ new Date().getFullYear() }} -->
<!--        </p> -->
<!--      </template> -->

<!--      <template #right> -->
<!--        <UButton -->
<!--          to="https://github.com/nuxt-ui-templates/starter" -->
<!--          target="_blank" -->
<!--          icon="i-simple-icons-github" -->
<!--          aria-label="GitHub" -->
<!--          color="neutral" -->
<!--          variant="ghost" -->
<!--        /> -->
<!--      </template> -->
<!--    </UFooter> -->
<!--  </UApp> -->
</template>

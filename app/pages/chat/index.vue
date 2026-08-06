<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  middleware: ['auth']
})

const items: NavigationMenuItem[] = [{
  label: 'Figma Kit',
  to: 'https://go.nuxt.com/figma-ui',
  target: '_blank'
}, {
  label: 'Playground',
  to: 'https://stackblitz.com/edit/nuxt-ui',
  target: '_blank'
}, {
  label: 'Releases',
  to: 'https://github.com/nuxt/ui/releases',
  target: '_blank'
}]
</script>

<template>
  <UDashboardPanel
    id="chat-home"
    class="min-h-full"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <Navbar />
    </template>
    <template #body>
      <div class="flex flex-col h-full bg-default">
        <main class="flex flex-2">
          <UPageHero
            title="PCM Chat"
            description="A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours."
            class="flex flex-1 items-center justify-center"
          >
            <StarsBg :star-count="500" />
          </UPageHero>
        </main>
        <USeparator
          icon="i-simple-icons-nuxtdotjs"
          type="dashed"
        />

        <UFooter>
          <template #left>
            <p class="text-sm text-muted">
              Copyright © {{ new Date().getFullYear() }}
            </p>
          </template>

          <UNavigationMenu
            :items="items"
            variant="link"
          />

          <template #right>
            <UButton
              icon="i-simple-icons-discord"
              color="neutral"
              variant="ghost"
              to="https://go.nuxt.com/discord"
              target="_blank"
            /> <UButton
              icon="i-simple-icons-x"
              color="neutral"
              variant="ghost"
              to="https://go.nuxt.com/x"
              target="_blank"
            /> <UButton
              icon="i-simple-icons-github"
              color="neutral"
              variant="ghost"
              to="https://github.com/nuxt/nuxt"
              target="_blank"
            />
          </template>
        </UFooter>
      </div>
    </template>
  </UDashboardPanel>
</template>

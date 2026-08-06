<script setup lang="ts">
import { useGetConversations } from '~/composables/useConversation'

const { data } = useGetConversations()

const conversations = computed(() => (data.value?.data ?? []).map(c => ({
  id: c.id,
  label: c.contact.displayName,
  avatar: { src: c.contact.pictureUrl, alt: c.contact.displayName },
  to: `/log/${c.id}`
})))
</script>

<template>
  <UDashboardPanel
    id="logs"
    class="min-h-full"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <span class="text-sm font-medium text-highlighted truncate min-w-0">
            Logs
          </span>
        </template>
      </Navbar>
    </template>
    <template #body>
      <div class="pt-16 px-3.5 h-full overflow-auto">
        <UNavigationMenu
          :items="conversations"
          orientation="vertical"
          :ui="{
            linkLeadingAvatar: 'size-8',
            link: 'gap-2'
          }"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

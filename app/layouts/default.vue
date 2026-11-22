<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuthMe } from '~/composables/useAuth'
import { useDeleteConversationById, useGetConversations } from '~/composables/useConversation'
import { useAssignAlerts } from '~/composables/useAssignAlerts'
import { useUnreadCounts } from '~/composables/useConversationRead'
import { isSuperAdmin } from '~/composables/useUser'

const sidebarOpen = ref(false)
const collapsed = ref(false)
const searchOpen = ref(false)
const confirmOpen = ref(false)
const deleteTarget = ref<{ id: string, label: string } | null>(null)

const { data: conversations, isPending: cp } = useGetConversations()
const { data: me, isPending: mp } = useAuthMe()
const { mutate } = useDeleteConversationById()
const { t, locale } = useI18n()
const toast = useToast()

useAssignAlerts()
const { unreadById } = useUnreadCounts()

const items = computed(() => (conversations.value?.data ?? []).map((c) => {
  const unreadCount = unreadById.value.get(c.id) ?? 0
  return {
    id: c.id,
    unread: unreadCount > 0,
    manyUnread: unreadCount > 1,
    label: c.contact.displayName,
    description: unreadCount > 1
      ? t('sidebar.newMessages', { count: unreadCount > 9 ? '9+' : unreadCount })
      : messageLogText(c.lastMessage),
    senderType: unreadCount <= 1 && c.lastMessage.senderType === 'admin' ? t('sidebar.you') : '',
    to: `/chat/${c.id}`,
    avatar: { src: c.contact.pictureUrl, alt: c.contact.displayName },
    lastTimestamp: c.lastMessage.timestamp,
    slot: 'chat' as const
  }
}))

const chatMenuUi = computed(() => ({
  link: collapsed.value ? 'overflow-hidden py-1.5 justify-center' : 'overflow-hidden pr-7.5 py-1.5',
  linkLeadingAvatar: 'size-8',
  linkTrailing: 'ms-0 absolute inset-e-2'
}))

const skeletonWidths = [
  ['w-28', 'w-36'],
  ['w-20', 'w-32']
]

function getChatActions(item: { id: string, label: string }): DropdownMenuItem[][] {
  return [[
    {
      label: t('common.delete'),
      icon: 'i-lucide-trash',
      color: 'error' as const,
      onClick: () => {
        confirmOpen.value = true
        deleteTarget.value = { id: item.id, label: item.label }
      }
    }
  ]]
}

function confirmDeleteButton() {
  if (!deleteTarget.value) return
  mutate(deleteTarget.value.id, {
    onSuccess: () => {
      toast.add({ title: t('sidebar.deleted') })
      deleteTarget.value = null
    }
  })
}
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="sidebarOpen"
      v-model:collapsed="collapsed"
      :min-size="12"
      collapsible
      resizable
      :menu="{ inset: true }"
      class="border-r-0 py-4 dark:[--ui-bg-elevated:var(--ui-color-neutral-900)]"
    >
      <template #header="{ collapsed }">
        <NuxtLink v-if="!collapsed" to="/" class="flex items-center gap-0.5">
          <Logo class="h-8 w-auto shrink-0" />
          <span class="text-xl font-bold text-highlighted">Chat</span>
        </NuxtLink>

        <UDashboardSidebarCollapse class="ms-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :items="[
            {
              label: t('sidebar.search'),
              icon: 'i-lucide-search',
              kbds: ['meta', 'k'],
              onSelect: () => {
                searchOpen = true
              }
            },
            {
              label: t('sidebar.logs'),
              icon: 'i-lucide-hard-drive',
              to: '/log'
            },
            ...(isSuperAdmin(me) ? [{
              label: t('sidebar.newAdmin'),
              icon: 'i-lucide-user-plus',
              to: '/admins'
            }] : [])
          ]"
          :collapsed="collapsed"
          orientation="vertical"
        >
          <template #item-trailing="{ item }">
            <div v-if="item.kbds?.length" class="flex items-center gap-px opacity-0 group-hover:opacity-100 transition-opacity">
              <UKbd
                v-for="kbd in item.kbds"
                :key="kbd"
                :value="kbd"
                size="md"
                variant="soft"
                class="bg-accented/50"
              />
            </div>
          </template>
        </UNavigationMenu>

        <div v-if="cp" class="space-y-1">
          <div
            v-for="(w, n) in skeletonWidths"
            :key="n"
            class="flex items-center gap-2 px-2.5 py-1.5"
            :class="collapsed ? 'justify-center' : ''"
          >
            <USkeleton class="size-7 rounded-full shrink-0" />

            <div v-if="!collapsed" class="flex-1 min-w-0 space-y-1.5">
              <USkeleton class="h-3 rounded-full" :class="w[0]" />
              <USkeleton class="h-2.5 rounded-full" :class="w[1]" />
            </div>
          </div>
        </div>

        <UNavigationMenu
          v-if="conversations"
          :collapsed="collapsed"
          :items="items"
          orientation="vertical"
          :ui="chatMenuUi"
        >
          <template #chat-label="{ item }">
            <div v-if="!collapsed" class="flex flex-1 items-center gap-2 overflow-hidden">
              <div class="flex flex-1 flex-col overflow-hidden">
                <span class="truncate" :class="item.unread && 'font-semibold text-highlighted'">{{ item.label }}</span>

                <div class="block">
                  <span v-if="item.senderType" class="truncate text-bold text-xs">
                    {{ item.senderType }}:
                  </span>
                  <span
                    v-if="item.description"
                    class="truncate text-xs"
                    :class="item.unread ? 'font-semibold text-highlighted' : 'text-dimmed'"
                  >
                    {{ item.description }}
                    <template v-if="!item.manyUnread">
                      ·
                      <NuxtTime
                        :datetime="item.lastTimestamp"
                        :locale="locale"
                        relative
                      />
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #chat-trailing="{ item }">
            <UDropdownMenu
              v-if="!collapsed"
              :items="getChatActions(item)"
              :content="{ align: 'end' }"
            >
              <UButton
                icon="i-lucide-ellipsis"
                color="neutral"
                variant="link"
                size="sm"
                class="rounded-[5px] hover:bg-accented/50 focus-visible:bg-accented/50 data-[state=open]:bg-accented/50"
                :aria-label="t('sidebar.chatActions')"
                tabindex="-1"
                @click.stop.prevent
              />
            </UDropdownMenu>
          </template>
        </UNavigationMenu>

        <UModal :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
          <template #content>
            <div class="p-4 space-y-4">
              <p class="text-sm">
                {{ t('sidebar.confirmDelete') }}
              </p>
              <div class="flex justify-end gap-2">
                <UButton color="neutral" variant="soft" @click="deleteTarget = null">
                  {{ t('common.cancel') }}
                </UButton>
                <UButton color="error" @click="confirmDeleteButton">
                  {{ t('common.delete') }}
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
      </template>

      <template #footer="{ collapsed }">
        <div v-if="mp" class="space-y-1">
          <div
            class="flex items-center gap-2"
            :class="collapsed ? 'justify-center' : ''"
          >
            <USkeleton class="size-7 rounded-full shrink-0" />

            <div v-if="!collapsed" class="flex-1 min-w-0 space-y-1.5">
              <USkeleton class="h-3 rounded-full" :class="skeletonWidths[0]" />
              <USkeleton class="h-2.5 rounded-full" :class="skeletonWidths[1]" />
            </div>
          </div>
        </div>

        <UserMenu
          v-else-if="me"
          :collapsed="collapsed"
        />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      v-model:open="searchOpen"
      :placeholder="t('sidebar.searchContacts')"
      :groups="[{
        id: 'contacts',
        items: items
      }]"
    />

    <div class="flex-1 flex m-4 lg:ml-0 rounded-lg ring ring-default bg-default/75 shadow min-w-0 overflow-hidden">
      <slot />
    </div>
  </UDashboardGroup>
</template>

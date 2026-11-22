import { useQueryClient } from '@tanstack/vue-query'
import { useAuthMe } from '~/composables/useAuth'
import { userDisplayName } from '~/composables/useUser'
import type { ConversationAssignedEvent } from '~/types/conversation'

export function useAssignAlerts() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: me } = useAuthMe()
  const { $i18n } = useNuxtApp()
  const t = $i18n.t

  const supported = () => import.meta.client && 'Notification' in window

  function openChat(conversationId: string) {
    window.focus()
    navigateTo(`/chat/${conversationId}`)
  }

  function notifyBrowser(title: string, body: string, conversationId: string) {
    if (!supported() || Notification.permission !== 'granted') return
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `assigned-${conversationId}`,
      requireInteraction: true
    })
    notification.onclick = () => {
      openChat(conversationId)
      notification.close()
    }
  }

  async function enableNotifications() {
    if (!supported()) return
    const result = await Notification.requestPermission()
    if (result === 'granted') {
      new Notification(t('assign.alertsEnabled'), { body: t('assign.alertsEnabledDescription') })
    } else {
      showBlockedHelp()
    }
  }

  function showBlockedHelp() {
    toast.add({
      title: t('assign.alertsBlocked'),
      description: t('assign.alertsBlockedDescription'),
      icon: 'i-lucide-bell-off',
      color: 'warning',
      duration: 10000
    })
  }

  function askForPermission() {
    if (!supported()) return
    if (Notification.permission === 'default') {
      toast.add({
        id: 'enable-notifications',
        title: t('assign.turnOnAlerts'),
        description: t('assign.turnOnAlertsDescription'),
        icon: 'i-lucide-bell-ring',
        duration: 0,
        actions: [{
          label: t('common.enable'),
          color: 'primary',
          variant: 'solid',
          onClick: () => {
            enableNotifications()
          }
        }]
      })
    }
  }

  function onAssigned(event: ConversationAssignedEvent) {
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    queryClient.invalidateQueries({ queryKey: ['conversationById', event.conversationId] })

    const myId = me.value?.id
    if (!myId || event.assigneeId !== myId || event.assignedBy?.id === myId) return

    const by = event.assignedBy ? userDisplayName(event.assignedBy) : t('common.someone')
    const chat = event.contactName ?? t('common.aChat')
    const title = t('assign.newAssigned')
    const description = t('assign.assignedBy', { by, chat })

    toast.add({
      title,
      description,
      color: 'primary',
      duration: 10000
    })
    notifyBrowser(title, description, event.conversationId)
  }

  if (import.meta.client) {
    const { $socket } = useNuxtApp()

    onMounted(() => {
      $socket.on('conversation-assigned', onAssigned)
      askForPermission()
    })

    onBeforeUnmount(() => {
      $socket.off('conversation-assigned', onAssigned)
    })
  }

  return { enableNotifications }
}

import { useQueryClient } from '@tanstack/vue-query'
import { useAuthMe } from '~/composables/useAuth'
import { userDisplayName } from '~/composables/useUser'
import type { ConversationAssignedEvent } from '~/types/conversation'

export function useAssignAlerts() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: me } = useAuthMe()

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
      new Notification('Notifications enabled', { body: 'You will be alerted when a chat is assigned to you.' })
    } else {
      showBlockedHelp()
    }
  }

  function showBlockedHelp() {
    toast.add({
      title: 'Browser notifications are blocked',
      description: 'Allow notifications for this site in your browser settings (click the icon left of the address bar).',
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
        title: 'Turn on browser alerts',
        description: 'Get a notification when a chat is assigned to you.',
        icon: 'i-lucide-bell-ring',
        duration: 0,
        actions: [{
          label: 'Enable',
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

    const by = event.assignedBy ? userDisplayName(event.assignedBy) : 'Someone'
    const chat = event.contactName ?? 'a chat'
    const title = 'New chat assigned to you'
    const description = `${by} assigned ${chat} to you`

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

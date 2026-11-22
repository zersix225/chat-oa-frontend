import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { ConversationReadEvent, ConversationReader } from '~/types/conversation-read'

export function useGetConversationReaders(conversationId: string) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['conversationReaders', conversationId],
    queryFn: () => $api<ConversationReader[]>(`/conversation-reads/${conversationId}/readers`)
  })
}

export function useMarkConversationRead(conversationId: string) {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageId?: string) => $api<ConversationReader>(`/conversation-reads/${conversationId}`, {
      method: 'post',
      body: messageId ? { messageId } : {}
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
    }
  })
}

export function useUnreadCounts() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['unreadCounts'],
    queryFn: () => $api<{ totalUnread: number, conversations: { conversationId: string, unreadCount: number }[] }>('/conversation-reads/unread')
  })

  const unreadById = computed(() => new Map(
    (query.data.value?.conversations ?? []).map(c => [c.conversationId, c.unreadCount])
  ))

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['unreadCounts'] })
  }

  if (import.meta.client) {
    const { $socket } = useNuxtApp()
    $socket.on('new-message', refresh)
    $socket.on('conversation-read', refresh)
    onBeforeUnmount(() => {
      $socket.off('new-message', refresh)
      $socket.off('conversation-read', refresh)
    })
  }

  return { ...query, unreadById }
}

export function useConversationReadEvents() {
  const queryClient = useQueryClient()

  function onRead(event: ConversationReadEvent) {
    queryClient.invalidateQueries({ queryKey: ['conversationReaders', event.conversationId] })
  }

  if (import.meta.client) {
    const { $socket } = useNuxtApp()
    $socket.on('conversation-read', onRead)
    onBeforeUnmount(() => {
      $socket.off('conversation-read', onRead)
    })
  }
}

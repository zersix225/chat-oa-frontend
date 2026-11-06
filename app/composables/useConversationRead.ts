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
  return useMutation({
    mutationFn: (messageId?: string) => $api<ConversationReader>(`/conversation-reads/${conversationId}`, {
      method: 'post',
      body: messageId ? { messageId } : {}
    })
  })
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

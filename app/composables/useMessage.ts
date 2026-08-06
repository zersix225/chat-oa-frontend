import { useQuery } from '@tanstack/vue-query'
import type { MessageByConversationIdArray } from '~/types/message'

export const useMessageByConversationId = (conversationId: string, page: Ref<number>, limit: Ref<number>) => {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['message-conversationId', conversationId, page, limit],
    queryFn: () => $api<MessageByConversationIdArray>(`/messages/${conversationId}`, {
      query: {
        page: page.value,
        limit: limit.value
      }
    }),
    placeholderData: previousData => previousData
  })
}

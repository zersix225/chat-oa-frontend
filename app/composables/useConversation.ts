import {useMutation, useQuery, useQueryClient} from '@tanstack/vue-query'
import type { ConversationArray, ConversationById } from '~/types/conversation'
import { authTokenCollection } from '~/utils/auth.local'

export function useGetConversationById(id: string) {
  const config = useRuntimeConfig()
  const token = authTokenCollection.get('app-token')
  return useQuery({
    queryKey: ['conversationById', id],
    queryFn: () => $fetch<ConversationById>(`/api/v1/conversations/${id}`, {
      baseURL: config.public.apiBase,
      headers: {
        authorization: `Bearer ${token?.accessToken}`
      }
    })
  })
}

export function useGetConversations() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => $api<ConversationArray>('/conversations')
  })
}

export function useDeleteConversationById() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => $api(`/conversations/${id}`, {
      method: 'delete'
    }),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversationById', id] })
      navigateTo('/chat')
    }
  })
}

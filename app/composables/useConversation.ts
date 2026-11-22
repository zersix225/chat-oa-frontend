import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { ConversationArray, ConversationById } from '~/types/conversation'

export function useGetConversationById(id: string) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['conversationById', id],
    queryFn: () => $api<ConversationById>(`/conversations/${id}`)
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

export function useAssignConversation(id: string) {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  const { $i18n } = useNuxtApp()
  return useMutation({
    mutationFn: (assigneeId: number | null) => $api<ConversationById>(`/conversations/${id}/assign`, {
      method: 'patch',
      body: { assigneeId }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversationById', id] })
    },
    onError: (error) => {
      toast.add({
        title: $i18n.t('assign.failed'),
        description: (error as { data?: { message?: string } }).data?.message,
        color: 'error',
        icon: 'i-lucide-circle-alert'
      })
    }
  })
}

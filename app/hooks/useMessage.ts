import { useQuery } from '@tanstack/vue-query'

export function useGetMessageBySenderId(senderId: string) {
  const config = useRuntimeConfig()
  return useQuery({
    queryKey: ['messageBySenderId', senderId],
    queryFn: () => $fetch('/api/v1/messages', {
      params: {
        senderId
      },
      baseURL: config.public.apiBase
    }),
    staleTime: 1000
  })
}

import { useQuery, useQueryClient } from '@tanstack/vue-query'
import type { Contact, GetContact } from '~/types/contact'
import { authTokenCollection } from '~/utils/auth.local'

export function useGetContact() {
  const config = useRuntimeConfig()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => {
      const token = authTokenCollection.get('app-token')
      return $fetch<GetContact>('/api/v1/contacts', {
        baseURL: config.public.apiBase,
        headers: { authorization: `Bearer ${token?.accessToken}` }
      })
    },
    enabled: !!authTokenCollection.get('app-token')
  })
}

export function useGetContactBySenderId(senderId: string) {
  const config = useRuntimeConfig()
  return useQuery({
    queryKey: ['contacts-senderId', senderId],
    queryFn: () => {
      const token = authTokenCollection.get('app-token')
      return $fetch<Contact>(`/api/v1/contacts/${senderId}`, {
        baseURL: config.public.apiBase,
        headers: { authorization: `Bearer ${token?.accessToken}` }
      })
    }
  })
}

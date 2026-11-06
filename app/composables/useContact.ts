import { useQuery } from '@tanstack/vue-query'
import type { Contact, GetContact } from '~/types/contact'
import { getAuthToken } from '~/utils/auth.local'

export function useGetContact() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['contacts'],
    queryFn: () => $api<GetContact>('/contacts'),
    enabled: !!getAuthToken()
  })
}

export function useGetContactBySenderId(senderId: string) {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['contacts-senderId', senderId],
    queryFn: () => $api<Contact>(`/contacts/${senderId}`)
  })
}

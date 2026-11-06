import { useQuery } from '@tanstack/vue-query'
import type { AssignUser } from '~/types/conversation'

export function useGetAdmins() {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['users', 'assignees'],
    queryFn: () => $api<AssignUser[]>('/conversations/assignees'),
    select: data => ({ data })
  })
}

export function userDisplayName(user?: Partial<AssignUser> | null) {
  if (!user) return ''
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `Admin #${user.id}`
}

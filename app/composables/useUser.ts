import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { AssignUser } from '~/types/conversation'
import type { User } from '~/types/user'

export const ROLE_SUPER_ADMIN = 1
export const ROLE_ADMIN = 2

export function isSuperAdmin(user?: Pick<User, 'role'> | null) {
  return user?.role?.id === ROLE_SUPER_ADMIN
}

export type CreateAdminPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  roleId: number
}

export function useCreateAdmin() {
  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, ...rest }: CreateAdminPayload) => $api<User>('/users', {
      method: 'post',
      body: { ...rest, role: { id: roleId }, status: { id: 1 } }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

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

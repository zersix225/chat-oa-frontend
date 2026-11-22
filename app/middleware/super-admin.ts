import { useQueryClient } from '@tanstack/vue-query'
import { isSuperAdmin } from '~/composables/useUser'
import type { User } from '~/types/user'

export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const { $api } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()

  const me = await queryClient.fetchQuery({
    queryKey: ['auth-me'],
    queryFn: () => $api<User>('/auth/me')
  }).catch(() => null)

  if (isSuperAdmin(me)) return

  toast.add({
    title: 'No permission',
    description: 'Only super admins can open this page.',
    color: 'error'
  })
  return navigateTo('/chat')
})

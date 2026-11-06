import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { clearAuthToken, getAuthToken, saveAuthToken } from '~/utils/auth.local'
import type { AuthToken } from '~/types/auth'
import type { User } from '~/types/user'

export function useAuthLogin() {
  const config = useRuntimeConfig()
  const { $socket } = useNuxtApp()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => {
      return $fetch<AuthToken>('/api/v1/auth/email/login', {
        method: 'post',
        body: { email, password },
        baseURL: config.public.apiBase
      })
    },
    onSuccess: (data) => {
      const route = useRoute()
      saveAuthToken(data)

      // Reconnect the socket with the new token.
      $socket.disconnect().connect()

      toast.add({
        title: 'Logged in successfully'
      })

      if (route.path !== '/chat') {
        navigateTo('/chat')
      }
    },
    onError: (err) => {
      const errors = (err as { data?: { errors?: { email?: string, password?: string } } }).data?.errors
      const emailError = errors?.email
      const passwordError = errors?.password

      let text = ''

      if (emailError && passwordError) {
        text = `${emailError} or ${passwordError}`
      } else if (!emailError) {
        text = `Password: ${passwordError}`
      } else if (!passwordError) {
        text = `Email: ${emailError}`
      }

      toast.add({
        title: 'Something went wrong',
        description: text
      })
    }
  })
}

export const useAuthMe = () => {
  const { $api } = useNuxtApp()
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: () => $api<User>('/auth/me')
  })
}

export function useAuthLogout() {
  const config = useRuntimeConfig()
  const { $socket } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: () => {
      const token = getAuthToken()
      return $fetch('/api/v1/auth/logout', {
        method: 'post',
        headers: { authorization: `Bearer ${token?.accessToken}` },
        baseURL: config.public.apiBase
      })
    },
    onSuccess: () => {
      const route = useRoute()
      toast.add({
        title: 'Logged out successfully'
      })
      clearAuthToken()
      $socket.disconnect()

      // queryClient.clear()
      queryClient.setQueryData(['auth-me'], null)

      if (route.path !== '/') {
        navigateTo('/')
      }
    }
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { clearAuthToken, getAuthToken, saveAuthToken } from '~/utils/auth.local'
import { safeRedirect } from '~/utils/url'
import type { AuthToken } from '~/types/auth'
import type { User } from '~/types/user'

export function useAuthLogin() {
  const config = useRuntimeConfig()
  const { $socket, $i18n } = useNuxtApp()
  const toast = useToast()
  return useMutation({
    mutationFn: ({ email, password }: { email: string, password: string }) => {
      return $fetch<AuthToken>('/api/v1/auth/email/login', {
        method: 'post',
        body: { email, password },
        baseURL: config.public.apiBase,
        headers: { [LANGUAGE_HEADER]: $i18n.locale.value }
      })
    },
    onSuccess: (data) => {
      const route = useRoute()
      saveAuthToken(data)

      // Reconnect the socket with the new token.
      $socket.disconnect().connect()

      toast.add({
        title: $i18n.t('auth.loggedIn')
      })

      // Back to the page the user tried to open before logging in.
      const target = safeRedirect(route.query.redirect) ?? '/chat'
      if (route.fullPath !== target) {
        navigateTo(target)
      }
    },
    onError: (err) => {
      const errors = (err as { data?: { errors?: { email?: string, password?: string } } }).data?.errors
      const emailError = errors?.email
      const passwordError = errors?.password

      let text = ''

      if (emailError && passwordError) {
        text = $i18n.t('auth.eitherError', { email: emailError, password: passwordError })
      } else if (!emailError) {
        text = $i18n.t('auth.passwordError', { error: passwordError })
      } else if (!passwordError) {
        text = $i18n.t('auth.emailError', { error: emailError })
      }

      toast.add({
        title: $i18n.t('common.somethingWentWrong'),
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
  const { $socket, $i18n } = useNuxtApp()
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: () => {
      const token = getAuthToken()
      return $fetch('/api/v1/auth/logout', {
        method: 'post',
        headers: { authorization: `Bearer ${token?.accessToken}`, [LANGUAGE_HEADER]: $i18n.locale.value },
        baseURL: config.public.apiBase
      })
    },
    onSuccess: () => {
      const route = useRoute()
      toast.add({
        title: $i18n.t('auth.loggedOut')
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

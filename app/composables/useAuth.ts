import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { authTokenCollection } from '~/utils/auth.local'
import type { AuthToken } from '~/types/auth'

export function useAuthLogin() {
  const config = useRuntimeConfig()
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
      const token = authTokenCollection.get('app-token')
      const newToken = {
        id: 'app-token',
        accessToken: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires
      }

      if (token) {
        authTokenCollection.update('app-token', (draft) => {
          draft.accessToken = newToken.accessToken
          draft.refreshToken = newToken.refreshToken
          draft.tokenExpires = newToken.tokenExpires
        })
      } else {
        authTokenCollection.insert({
          id: 'app-token',
          accessToken: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires
        })
      }

      toast.add({
        title: 'Logged in successfully'
      })

      if (route.path !== '/chat') {
        navigateTo('/chat')
      }
    },
    onError: (err) => {
      const emailError = err.response?._data?.errors.email
      const passwordError = err.response?._data?.errors.password

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
    queryFn: () => $api('/auth/me')
  })
}

export function useAuthLogout() {
  const config = useRuntimeConfig()
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: () => {
      const token = authTokenCollection.get('app-token')
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
      authTokenCollection.delete('app-token')

      // queryClient.clear()
      queryClient.setQueryData(['auth-me'], null)

      if (route.path !== '/') {
        navigateTo('/')
      }
    }
  })
}

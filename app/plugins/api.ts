import { useQueryClient } from '@tanstack/vue-query'
import type { Socket } from 'socket.io-client'
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { AuthToken } from '~/types/auth'
import { clearAuthToken, getAuthToken, isSessionExpired, saveAuthToken } from '~/utils/auth.local'

// Refresh this long before the access token actually expires.
const REFRESH_MARGIN_MS = 30_000
// How often to check whether the session has run out while the tab is open.
const SESSION_CHECK_MS = 60_000

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiBase}/api/v1/`

  // Only one refresh at a time: the backend rotates the refresh token, so
  // two parallel refreshes would make the second one fail and log the user out.
  let refreshing: Promise<boolean> | null = null
  let loggingOut = false

  function refreshAccessToken(): Promise<boolean> {
    if (refreshing) return refreshing

    refreshing = (async () => {
      const token = getAuthToken()
      if (!token || isSessionExpired()) return false
      try {
        const auth = await $fetch<AuthToken>('auth/refresh', {
          method: 'POST',
          baseURL,
          headers: { authorization: `Bearer ${token.refreshToken}` }
        })
        saveAuthToken(auth)
        return true
      } catch {
        return false
      }
    })().finally(() => {
      refreshing = null
    })

    return refreshing
  }

  async function forceLogout() {
    if (loggingOut) return
    loggingOut = true
    clearAuthToken()
    const socket = nuxtApp.$socket as Socket | undefined
    socket?.disconnect()

    await nuxtApp.runWithContext(async () => {
      useQueryClient().clear()
      useToast().add({
        title: 'Session expired',
        description: 'Please log in again.',
        color: 'warning'
      })
      // Come back to the same page after logging in again.
      const current = useRoute().fullPath
      await navigateTo(current.startsWith('/login') ? '/login' : { path: '/login', query: { redirect: current } })
    })

    loggingOut = false
  }

  const raw = $fetch.create({
    baseURL,
    onRequest({ options }) {
      const token = getAuthToken()
      if (token) {
        options.headers.set('authorization', `Bearer ${token.accessToken}`)
      }
    }
  })

  async function api<T = unknown>(request: NitroFetchRequest, options?: NitroFetchOptions<NitroFetchRequest>): Promise<T> {
    const token = getAuthToken()

    if (token) {
      if (isSessionExpired()) {
        await forceLogout()
        throw new Error('Session expired')
      }
      // Refresh up front if the access token is about to expire.
      if (token.tokenExpires - Date.now() < REFRESH_MARGIN_MS && !(await refreshAccessToken())) {
        await forceLogout()
        throw new Error('Session expired')
      }
    }

    try {
      return await raw<T>(request, options as never) as T
    } catch (error) {
      const status = (error as { response?: Response }).response?.status
      if (status !== 401 || !getAuthToken()) throw error

      // Access token was rejected: refresh once and retry the same request.
      if (!(await refreshAccessToken())) {
        await forceLogout()
        throw error
      }
      return await raw<T>(request, options as never) as T
    }
  }

  if (import.meta.client) {
    const check = () => {
      if (getAuthToken() && isSessionExpired()) forceLogout()
    }
    setInterval(check, SESSION_CHECK_MS)
    window.addEventListener('focus', check)
  }

  return {
    provide: {
      api,
      forceLogout,
      refreshAccessToken
    }
  }
})

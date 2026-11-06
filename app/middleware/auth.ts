import { clearAuthToken, getAuthToken, isSessionExpired } from '~/utils/auth.local'

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  if (to.params.id && from.params.id) {
    to.meta.viewTransition = false
  }

  if (!getAuthToken() || isSessionExpired()) {
    clearAuthToken()
    return navigateTo('/login')
  }
})

import { clearAuthToken, getAuthToken, isSessionExpired } from '~/utils/auth.local'
import { safeRedirect } from '~/utils/url'

/** Pages anyone can open. Everything else needs a login. */
const PUBLIC_PATHS = ['/', '/login']

export default defineNuxtRouteMiddleware((to, from) => {
  // The token lives in localStorage, so only the browser can check it.
  // Protected pages are client-rendered (routeRules in nuxt.config.ts), so
  // this runs before anything is shown.
  if (import.meta.server) return

  if (to.params.id && from.params.id) {
    to.meta.viewTransition = false
  }

  const loggedIn = !!getAuthToken() && !isSessionExpired()

  if (to.path === '/login') {
    // Already logged in: skip the login form.
    if (loggedIn) return navigateTo(safeRedirect(to.query.redirect) ?? '/chat')
    return
  }

  if (PUBLIC_PATHS.includes(to.path)) return

  if (!loggedIn) {
    clearAuthToken()
    // Remember where the user was going so login can send them back.
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})

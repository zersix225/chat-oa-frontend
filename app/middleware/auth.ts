export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  if (to.params.id && from.params.id) {
    to.meta.viewTransition = false
  }
})

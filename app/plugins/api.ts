import { authTokenCollection } from '~/utils/auth.local'
import type { AuthToken } from '~/types/auth'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: `${config.public.apiBase}/api/v1/`,
    onRequest({ options }) {
      const token = authTokenCollection.get('app-token')
      if (token) {
        options.headers.set('authorization', `Bearer ${token.accessToken}`)
        console.log('token', token.accessToken)
        console.log('refreshToken', token.refreshToken)
      }
    },
    async onResponseError({ response, options }) {
      if (response.status !== 401) {
        return
      }
      const token = authTokenCollection.get('app-token')

      if (!token) {
        await nuxtApp.runWithContext(() => navigateTo('/'))
        return
      }

      try {
        const auth = await $fetch<AuthToken>('/auth/refresh', {
          method: 'POST',
          baseURL: `${config.public.apiBase}/api/v1/`,
          headers: {
            authorization: `Bearer ${token.refreshToken}`
          }
        })
        console.log('newToken', auth.refreshToken)

        authTokenCollection.update('app-token', (draft) => {
          draft.accessToken = auth.token
          draft.refreshToken = auth.refreshToken
          draft.tokenExpires = auth.tokenExpires
        })

        options.headers.set('Authorization', `Bearer ${auth.token}`)

        // return await $fetch(request)
      } catch {
        authTokenCollection.delete('app-token')
        await nuxtApp.runWithContext(() => navigateTo('/'))
      }
    }
  })

  return {
    provide: {
      api
    }
  }
})

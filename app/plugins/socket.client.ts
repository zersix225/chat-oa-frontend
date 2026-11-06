import { io } from 'socket.io-client'
import { getAuthToken } from '~/utils/auth.local'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  // Provided by plugins/api.ts (runs first).
  const auth = nuxtApp as unknown as {
    $refreshAccessToken: () => Promise<boolean>
    $forceLogout: () => Promise<void>
  }

  // Connect to the backend (same host as the REST API).
  // Empty apiBase = same origin, e.g. behind a reverse proxy that forwards /socket.io.
  const socket = io(config.public.apiBase || undefined, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: false,
    // Called on every (re)connect, so it always sends the latest access token.
    auth: (cb) => {
      cb({ token: getAuthToken()?.accessToken })
    }
  })

  let retriedAuth = false

  socket.on('connect', () => {
    retriedAuth = false
  })

  socket.on('connect_error', async (err) => {
    console.warn('[socket] connect error:', err.message)

    // Backend rejects expired/missing tokens in the handshake.
    // Refresh once and reconnect; if that fails, api.ts logs the user out.
    if (err.message === 'Unauthorized' && getAuthToken() && !retriedAuth) {
      retriedAuth = true
      if (await auth.$refreshAccessToken()) {
        socket.connect()
      } else {
        await auth.$forceLogout()
      }
    }
  })

  if (getAuthToken()) {
    socket.connect()
  }

  return {
    provide: { socket }
  }
})

import { createCollection, localStorageCollectionOptions } from '@tanstack/vue-db'
import type { AuthToken } from '~/types/auth'

type AuthLocalStorage = {
  id: string
  accessToken: string
  refreshToken: string
  tokenExpires: number
}

export const AUTH_TOKEN_ID = 'app-token'

export const authTokenCollection = createCollection(
  localStorageCollectionOptions<AuthLocalStorage>({
    id: 'auth-token',
    storageKey: 'app-token',
    startSync: true,
    getKey: item => item.id
  })
)

export function getAuthToken() {
  return authTokenCollection.get(AUTH_TOKEN_ID)
}

export function saveAuthToken(data: AuthToken) {
  const existing = getAuthToken()
  if (existing) {
    authTokenCollection.update(AUTH_TOKEN_ID, (draft) => {
      draft.accessToken = data.token
      draft.refreshToken = data.refreshToken
      draft.tokenExpires = data.tokenExpires
    })
  } else {
    authTokenCollection.insert({
      id: AUTH_TOKEN_ID,
      accessToken: data.token,
      refreshToken: data.refreshToken,
      tokenExpires: data.tokenExpires
    })
  }
}

export function clearAuthToken() {
  if (getAuthToken()) {
    authTokenCollection.delete(AUTH_TOKEN_ID)
  }
}

/** Expiry of a JWT in ms since epoch, or null if it can't be read. */
export function getJwtExpiry(jwt: string): number | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/** True when there is no session that can still be refreshed. */
export function isSessionExpired() {
  const token = getAuthToken()
  if (!token) return true
  const refreshExpires = getJwtExpiry(token.refreshToken)
  return refreshExpires !== null && refreshExpires <= Date.now()
}

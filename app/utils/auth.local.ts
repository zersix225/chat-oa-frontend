import { createCollection, localStorageCollectionOptions } from '@tanstack/vue-db'

type AuthLocalStorage = {
  id: string
  accessToken: string
  refreshToken: string
  tokenExpires: number
}

export const authTokenCollection = createCollection(
  localStorageCollectionOptions<AuthLocalStorage>({
    id: 'auth-token',
    storageKey: 'app-token',
    startSync: true,
    getKey: item => item.id
  })
)

import { useMutation } from '@tanstack/vue-query'
import type { FacebookSendMessage } from '~/types/facebook-message'
import type { LineSendMessage } from '~/types/line-message'
import type { TiktokSendMessage } from '~/types/tiktok-message'

export function useLinePushMessage() {
  const config = useRuntimeConfig()
  return useMutation({
    mutationFn: async (payload: LineSendMessage) => {
      await $fetch('/api/webhooks/line/push', {
        method: 'post',
        body: payload,
        baseURL: config.public.apiBase
      })
    }
  })
}

export function useFaceBookPushMessage() {
  const config = useRuntimeConfig()

  return useMutation({
    mutationFn: async (payload: FacebookSendMessage) => {
      return await $fetch('/api/webhooks/facebook/push', {
        method: 'post',
        body: payload,
        baseURL: config.public.apiBase
      })
    }
  })
}

export function useTiktokPushMessage() {
  const config = useRuntimeConfig()

  return useMutation({
    mutationFn: async (payload: TiktokSendMessage) => {
      return await $fetch('/api/webhooks/tiktok/push', {
        method: 'post',
        body: payload,
        baseURL: config.public.apiBase
      })
    }
  })
}

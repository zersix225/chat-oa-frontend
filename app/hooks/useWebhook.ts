import { useMutation } from '@tanstack/vue-query'

export function useLinePushMessage() {
  const config = useRuntimeConfig()
  return useMutation({
    mutationFn: async ({
      message,
      lineUserId
    }: {
      message: string
      lineUserId: string
    }) => {
      await $fetch('/api/webhooks/line/push', {
        method: 'post',
        body: { message, lineUserId },
        baseURL: config.public.apiBase
      })
    }
  })
}

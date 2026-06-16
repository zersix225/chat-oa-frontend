import { useQuery } from '@tanstack/vue-query'
import type { GetLine } from '#shared/types/line'

export function useGetLine() {
  const config = useRuntimeConfig()
  return useQuery({
    queryKey: ['line-contacts'],
    queryFn: () => $fetch<GetLine>('/api/v1/line-contacts', {
      baseURL: config.public.apiBase
    })
  })
}

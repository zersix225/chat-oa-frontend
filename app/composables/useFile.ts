import { useMutation } from '@tanstack/vue-query'
import type { FileUploadResponse } from '~/types/file'

/** POST /api/v1/files/upload (multipart, field "file"). */
export function useUploadFile() {
  const { $api } = useNuxtApp()
  return useMutation({
    mutationFn: (file: File) => {
      const body = new FormData()
      body.append('file', file)
      return $api<FileUploadResponse>('files/upload', { method: 'POST', body })
    }
  })
}

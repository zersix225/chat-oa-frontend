import * as z from 'zod'

/** A stored file. `path` is already a full URL (built by the backend). */
export const FileSchema = z.object({
  id: z.string(),
  path: z.string()
})

export const FileUploadResponseSchema = z.object({
  file: FileSchema
})

export type StoredFile = z.infer<typeof FileSchema>
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>

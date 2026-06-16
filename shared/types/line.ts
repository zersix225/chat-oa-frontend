import * as z from 'zod'

export const LineSchema = z.object({
  pictureUrl: z.string(),
  displayName: z.string(),
  lineUserId: z.string(),
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const GetLineSchema = z.object({
  data: z.array(LineSchema),
  hasNextPage: z.boolean()
})

export type Line = z.infer<typeof LineSchema>
export type GetLine = z.infer<typeof GetLineSchema>

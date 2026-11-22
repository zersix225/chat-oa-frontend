import * as z from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.object({ id: z.number(), name: z.string().optional() }).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable()
})

export type User = z.infer<typeof UserSchema>

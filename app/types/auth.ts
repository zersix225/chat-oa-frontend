import * as z from 'zod'

export const AuthTokenSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  tokenExpires: z.number()
})

export type AuthToken = z.infer<typeof AuthTokenSchema>

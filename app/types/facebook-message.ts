import { z } from 'zod'

export const FacebookSendMessageSchema = z.object({
  recipient: z.object({
    id: z.string()
  }),
  messaging_type: z.literal('RESPONSE'),
  message: z.object({
    text: z.string()
  }),
  adminId: z.number().optional(),
  conversationId: z.string()
})

export type FacebookSendMessage = z.infer<typeof FacebookSendMessageSchema>

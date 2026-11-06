import { z } from 'zod'

export const FacebookSendMessageSchema = z.object({
  recipient: z.object({
    id: z.string()
  }),
  messaging_type: z.literal('RESPONSE'),
  // At least one of message / fileId.
  message: z.object({
    text: z.string()
  }).optional(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  adminId: z.number().optional(),
  conversationId: z.string()
})

export type FacebookSendMessage = z.infer<typeof FacebookSendMessageSchema>

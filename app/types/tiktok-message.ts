import { z } from 'zod'

export const TiktokSendMessageSchema = z.object({
  recipientId: z.string(),
  text: z.string().optional(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  adminId: z.number().optional(),
  conversationId: z.string()
})

export type TiktokSendMessage = z.infer<typeof TiktokSendMessageSchema>

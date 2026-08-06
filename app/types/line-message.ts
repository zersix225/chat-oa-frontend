import * as z from 'zod'

export const LineSendMessageSchema = z.object({
  message: z.string(),
  customerId: z.string(),
  adminId: z.number().optional(),
  conversationId: z.string()
})

export type LineSendMessage = z.infer<typeof LineSendMessageSchema>

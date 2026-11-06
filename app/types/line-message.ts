import * as z from 'zod'

export const LineSendMessageSchema = z.object({
  // At least one of message / fileId. Non-image files reach LINE as a link.
  message: z.string().optional(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  customerId: z.string(),
  adminId: z.number().optional(),
  conversationId: z.string()
})

export type LineSendMessage = z.infer<typeof LineSendMessageSchema>

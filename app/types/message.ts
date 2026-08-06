import * as z from 'zod'
import { SenderTypeEnum } from '~/types/enums/sender.enum'
import { UserSchema } from '~/types/user'
import { platformEnum } from '~/types/enums/platform.enum'

export const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  conversationId: z.string().optional(),
  senderId: z.string(),
  senderType: SenderTypeEnum,
  displayName: z.string(),
  pictureUrl: z.string(),
  timestamp: z.string()
})

export const MessageByConversationIdSchema = z.object({
  id: z.string(),
  content: z.string(),
  adminId: z.number(),
  admin: UserSchema,
  messagePlatform: platformEnum,
  senderType: SenderTypeEnum,
  timestamp: z.coerce.date()
})

export const MessageByConversationIdArraySchema = z.object({
  massages: z.array(MessageByConversationIdSchema),
  total: z.number()
})

export const MessageArray = z.array(MessageSchema)

export type Message = z.infer<typeof MessageSchema>
export type MessageArray = z.infer<typeof MessageArray>
export type MessageByConversationId = z.infer<typeof MessageByConversationIdSchema>
export type MessageByConversationIdArray = z.infer<typeof MessageByConversationIdArraySchema>

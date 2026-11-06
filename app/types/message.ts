import * as z from 'zod'
import { SenderTypeEnum } from '~/types/enums/sender.enum'
import { UserSchema } from '~/types/user'
import { platformEnum } from '~/types/enums/platform.enum'
import { MessageTypeEnum } from '~/types/enums/message-type.enum'
import { FileSchema } from '~/types/file'

// Media fields shared by every message shape.
// content = text, original file name (file) or sticker image URL (sticker).
const MediaFields = {
  messageType: MessageTypeEnum.default('text'),
  fileId: z.string().nullable().optional(),
  file: FileSchema.nullable().optional()
}

export const MessageSchema = z.object({
  id: z.number(),
  content: z.string(),
  conversationId: z.string().optional(),
  senderId: z.string(),
  senderType: SenderTypeEnum,
  displayName: z.string(),
  pictureUrl: z.string(),
  timestamp: z.string(),
  ...MediaFields
})

export const MessageByConversationIdSchema = z.object({
  id: z.string(),
  content: z.string(),
  adminId: z.number().nullable(),
  admin: UserSchema.nullable(),
  messagePlatform: platformEnum,
  senderType: SenderTypeEnum,
  timestamp: z.coerce.date(),
  ...MediaFields
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

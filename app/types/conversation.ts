import * as z from 'zod'
import { ContactSchema } from '~/types/contact'
import { MessageSchema } from '~/types/message'

export const ConversationSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  lastMessageId: z.string(),
  contact: ContactSchema,
  messages: z.array(MessageSchema).optional().nullable(),
  lastMessage: MessageSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

// export const ConversationByIdSchema = z.object({
//   id: z.string(),
//   contact: ContactSchema,
//   contactId: z.string(),
//   lastMessageId: z.string(),
//   messages: z.array(MessageSchema),
//   createdAt: z.coerce.date(),
//   updatedAt: z.coerce.date()
// })

export type ConversationById = z.infer<typeof ConversationSchema>

export const ConversationArraySchema = z.object({
  data: z.array(ConversationSchema),
  hasNextPage: z.boolean()
})

export type Conversation = z.infer<typeof ConversationSchema>
export type ConversationArray = z.infer<typeof ConversationArraySchema>

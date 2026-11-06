import * as z from 'zod'
import { ContactSchema } from '~/types/contact'
import { MessageSchema } from '~/types/message'

export const AssignUserSchema = z.object({
  id: z.number(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable().optional(),
  photo: z.object({ path: z.string() }).nullable().optional()
})

export const ConversationAssignedEventSchema = z.object({
  conversationId: z.string(),
  contactName: z.string().nullable(),
  assigneeId: z.number().nullable(),
  assignee: AssignUserSchema.nullable(),
  assignedBy: AssignUserSchema.nullable(),
  assignedAt: z.coerce.date()
})

export const ConversationSchema = z.object({
  id: z.string(),
  contactId: z.string(),
  lastMessageId: z.string(),
  contact: ContactSchema,
  messages: z.array(MessageSchema).optional().nullable(),
  lastMessage: MessageSchema,
  assigneeId: z.number().nullable().optional(),
  assignee: AssignUserSchema.nullable().optional(),
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
export type AssignUser = z.infer<typeof AssignUserSchema>
export type ConversationAssignedEvent = z.infer<typeof ConversationAssignedEventSchema>

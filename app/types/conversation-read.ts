import * as z from 'zod'

export const ConversationReaderSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  userId: z.number(),
  user: z.object({
    id: z.number(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    email: z.string().nullable().optional()
  }).optional(),
  lastReadMessageId: z.string().nullable().optional(),
  lastReadAt: z.coerce.date()
})

export const ConversationReadEventSchema = z.object({
  conversationId: z.string(),
  userId: z.number(),
  lastReadMessageId: z.string().nullable().optional(),
  lastReadAt: z.coerce.date()
})

export type ConversationReader = z.infer<typeof ConversationReaderSchema>
export type ConversationReadEvent = z.infer<typeof ConversationReadEventSchema>

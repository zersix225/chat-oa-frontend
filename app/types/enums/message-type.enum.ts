import * as z from 'zod'

export const MessageTypeEnum = z.enum(['text', 'image', 'video', 'audio', 'file', 'sticker'])

export type MessageType = z.infer<typeof MessageTypeEnum>

import * as z from 'zod'

export const SenderTypeEnum = z.enum(['user', 'admin'])

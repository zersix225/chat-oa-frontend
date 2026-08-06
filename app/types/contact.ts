import * as z from 'zod'
import { platformEnum} from '~/types/enums/platform.enum'

export const ContactSchema = z.object({
  pictureUrl: z.string(),
  displayName: z.string(),
  customerId: z.string(),
  id: z.string(),
  contactPlatform: platformEnum,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date()
})

export const GetContactSchema = z.object({
  data: z.array(ContactSchema),
  hasNextPage: z.boolean()
})

export type Contact = z.infer<typeof ContactSchema>
export type GetContact = z.infer<typeof GetContactSchema>

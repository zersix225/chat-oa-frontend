import * as z from 'zod'

export const platformEnum = z.enum(['facebook', 'line', 'tiktok'])

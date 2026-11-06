<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { useAuthLogin } from '../../composables/useAuth'
import * as z from 'zod'

const fields = ref<AuthFormField[]>([
  {
    name: 'email',
    type: 'text',
    label: 'Email'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password'
  }
])

const { mutate } = useAuthLogin()

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
  mutate({ email: payload.data.email, password: payload.data.password })
}

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <UAuthForm
    :schema="schema"
    title="Login"
    description="Enter your credentials to access your account."
    :fields="fields"
    :separator="{
      icon: 'i-lucide-user'
    }"
    @submit="onSubmit"
  />
</template>

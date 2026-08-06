<script setup lang="ts">
import type { ButtonProps, AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { useAuthLogin, useAuthMe } from '../../composables/useAuth'
import * as z from 'zod'
import { createCollection, localStorageCollectionOptions } from '@tanstack/vue-db'

const providers = ref<ButtonProps[]>([
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    color: 'neutral',
    variant: 'subtle'
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    variant: 'subtle'
  }
])
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

// const input = ref<{ email: string, password: string } | null>(null)
//
// function onSubmit() {
//   if (!input.value) return
//   console.log(input.value)
//
//   const { mutate } = useAuthLogin()
//   mutate({ email: input.value.email, password: input.value.password })
// }
const { mutate } = useAuthLogin()

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
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
    v-model="input"
    title="Login"
    description="Enter your credentials to access your account."
    :fields="fields"
    :separator="{
      icon: 'i-lucide-user'
    }"
    @submit="onSubmit"
  />
</template>

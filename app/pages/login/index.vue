<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { useAuthLogin } from '../../composables/useAuth'
import * as z from 'zod'

const { t } = useI18n()

const fields = computed<AuthFormField[]>(() => [
  {
    name: 'email',
    type: 'text',
    label: t('auth.email')
  },
  {
    name: 'password',
    type: 'password',
    label: t('auth.password')
  }
])

const { mutate } = useAuthLogin()

const schema = computed(() => z.object({
  email: z.email(t('auth.invalidEmail')),
  password: z.string(t('auth.passwordRequired')).min(1, t('auth.passwordRequired'))
}))

type Schema = z.output<typeof schema.value>

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
    :title="t('auth.loginTitle')"
    :description="t('auth.loginDescription')"
    :fields="fields"
    :separator="{
      icon: 'i-lucide-user'
    }"
    @submit="onSubmit"
  />
</template>

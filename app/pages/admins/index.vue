<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, useCreateAdmin } from '~/composables/useUser'

definePageMeta({
  middleware: 'super-admin'
})

const { t } = useI18n()

const roleOptions = computed(() => [
  { label: t('admins.roleAdmin'), value: ROLE_ADMIN },
  { label: t('admins.roleSuperAdmin'), value: ROLE_SUPER_ADMIN }
])

const fields = computed<AuthFormField[]>(() => [
  {
    name: 'firstName',
    type: 'text',
    label: t('admins.firstName')
  },
  {
    name: 'lastName',
    type: 'text',
    label: t('admins.lastName')
  },
  {
    name: 'email',
    type: 'text',
    label: t('auth.email')
  },
  {
    name: 'password',
    type: 'password',
    label: t('auth.password')
  },
  {
    name: 'roleId',
    type: 'select',
    label: t('admins.role'),
    items: roleOptions.value,
    defaultValue: roleOptions.value[0]
  }
])

const schema = computed(() => z.object({
  firstName: z.string(t('admins.firstNameRequired')).trim().min(1, t('admins.firstNameRequired')),
  lastName: z.string(t('admins.lastNameRequired')).trim().min(1, t('admins.lastNameRequired')),
  email: z.email(t('auth.invalidEmail')),
  password: z.string(t('auth.passwordRequired')).min(6, t('admins.minPassword')),
  roleId: z.object({ value: z.number() }, t('admins.roleRequired'))
}))

type Schema = z.output<typeof schema.value>

const formRef = useTemplateRef('form')
const toast = useToast()
const { mutate, isPending } = useCreateAdmin()

function onSubmit(payload: FormSubmitEvent<Schema>) {
  mutate({ ...payload.data, roleId: payload.data.roleId.value }, {
    onSuccess: (user) => {
      toast.add({
        title: t('admins.created'),
        description: t('admins.createdDescription', { name: `${user.firstName} ${user.lastName}`, email: user.email }),
        color: 'success'
      })
      if (formRef.value) {
        Object.assign(formRef.value.state, {
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          password: undefined,
          roleId: roleOptions.value[0]
        })
      }
    },
    onError: (error) => {
      const data = (error as { data?: { message?: string, errors?: Record<string, string> } }).data
      const fieldError = Object.entries(data?.errors ?? {})[0]
      toast.add({
        title: t('admins.createFailed'),
        description: fieldError
          ? `${fieldError[0]}: ${fieldError[1]}`
          : data?.message ?? t('common.tryAgain'),
        color: 'error'
      })
    }
  })
}
</script>

<template>
  <UDashboardPanel
    id="admins-new"
    class="min-h-full"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <span class="text-sm font-medium text-highlighted truncate min-w-0">
            {{ t('admins.pageTitle') }}
          </span>
        </template>
      </Navbar>
    </template>

    <template #body>
      <div class="min-h-full flex items-center justify-center px-4 pt-20 pb-8 overflow-auto">
        <UPageCard
          class="w-full max-w-md"
          spotlight
          spotlight-color="primary"
        >
          <UAuthForm
            ref="form"
            :schema="schema"
            :title="t('admins.formTitle')"
            :description="t('admins.formDescription')"
            :fields="fields"
            :loading="isPending"
            :submit="{ label: t('admins.submit') }"
            :separator="{
              icon: 'i-lucide-user-plus'
            }"
            @submit="onSubmit"
          />
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

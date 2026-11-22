<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'
import { ROLE_ADMIN, ROLE_SUPER_ADMIN, useCreateAdmin } from '~/composables/useUser'

definePageMeta({
  middleware: 'super-admin'
})

const roleOptions = [
  { label: 'Admin', value: ROLE_ADMIN },
  { label: 'Super admin', value: ROLE_SUPER_ADMIN }
]

const fields = ref<AuthFormField[]>([
  {
    name: 'firstName',
    type: 'text',
    label: 'First name'
  },
  {
    name: 'lastName',
    type: 'text',
    label: 'Last name'
  },
  {
    name: 'email',
    type: 'text',
    label: 'Email'
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password'
  },
  {
    name: 'roleId',
    type: 'select',
    label: 'Role',
    items: roleOptions,
    defaultValue: roleOptions[0]
  }
])

const schema = z.object({
  firstName: z.string('First name is required').trim().min(1, 'First name is required'),
  lastName: z.string('Last name is required').trim().min(1, 'Last name is required'),
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(6, 'At least 6 characters'),
  roleId: z.object({ value: z.number() }, 'Role is required')
})

type Schema = z.output<typeof schema>

const formRef = useTemplateRef('form')
const toast = useToast()
const { mutate, isPending } = useCreateAdmin()

function onSubmit(payload: FormSubmitEvent<Schema>) {
  mutate({ ...payload.data, roleId: payload.data.roleId.value }, {
    onSuccess: (user) => {
      toast.add({
        title: 'Admin created',
        description: `${user.firstName} ${user.lastName} (${user.email}) can now log in.`,
        color: 'success'
      })
      if (formRef.value) {
        Object.assign(formRef.value.state, {
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          password: undefined,
          roleId: roleOptions[0]
        })
      }
    },
    onError: (error) => {
      const data = (error as { data?: { message?: string, errors?: Record<string, string> } }).data
      const fieldError = Object.entries(data?.errors ?? {})[0]
      toast.add({
        title: 'Could not create admin',
        description: fieldError
          ? `${fieldError[0]}: ${fieldError[1]}`
          : data?.message ?? 'Please try again.',
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
            Create admin
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
            title="New admin"
            description="Create a login for another admin."
            :fields="fields"
            :loading="isPending"
            :submit="{ label: 'Create admin' }"
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

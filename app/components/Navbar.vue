<script setup lang="ts">
// import { useAuthMe } from '~/hooks/useAuth'

// const { data, isPending, isError } = useAuthMe()
</script>

<template>
  <UDashboardNavbar
    class="absolute top-0 inset-x-0 border-b-0 z-10 backdrop-blur sm:px-4"
    :ui="{ left: 'min-w-0' }"
  >
    <template #left>
      <slot name="title" />
    </template>

    <template #right>
      <slot />

      <UColorModeButton />

<!--      <UButton-->
<!--        v-if="(!data && isPending) || isError"-->
<!--        label="Sign in"-->
<!--        color="neutral"-->
<!--        variant="outline"-->
<!--        to="/login"-->
<!--      />-->
    </template>
  </UDashboardNavbar>
</template>

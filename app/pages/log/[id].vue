<script setup lang="ts">
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { useMessageByConversationId } from '~/composables/useMessage'

const route = useRoute()
const id = (route.params.id as string) ?? ''

const page = ref(1)
const limit = ref(15)

const { data, isFetching } = useMessageByConversationId(id, page, limit)

const total = computed(() => data.value?.total ?? 1)

type MessageResType = {
  id: string
  admin: string
  email: string
  content: string
  date: Date | string
}

const messages = computed<MessageResType[]>(() => (data.value?.massages ?? []).map(c => ({
  id: c.id,
  admin: `${c.admin.firstName} ${c.admin.lastName}`,
  email: c.admin.email,
  content: c.content,
  date: c.timestamp
})))

const columns: TableColumn<MessageResType>[] = [
  { accessorKey: 'id', header: 'Id', cell: ({ row }) => `${row.getValue('id')}` },
  { accessorKey: 'content', header: 'Content', cell: ({ row }) => `${row.getValue('content')}` },
  { accessorKey: 'email', header: 'Email', cell: ({ row }) => `${row.getValue('email')}` },
  { accessorKey: 'admin', header: 'Admin', cell: ({ row }) => `${row.getValue('admin')}` },
  {
    accessorKey: 'date',
    header: 'Date',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right font-medium'
      }
    },
    cell: ({ row }) => {
      return new Date(row.getValue('date')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  }
]
const globalFilter = ref('')
const columnVisibility = ref({
  id: false
})
const table = useTemplateRef('table')
const scrollContainer = useTemplateRef('scrollContainer')

const scrollToTop = () => {
  scrollContainer.value?.scrollTo({ behavior: 'smooth', top: 0 })
}
</script>

<template>
  <UDashboardPanel
    id="logs"
    class="min-h-full"
    :ui="{ body: 'p-0 sm:p-0' }"
  >
    <template #header>
      <Navbar>
        <template #title>
          <span class="text-sm font-medium text-highlighted truncate min-w-0">
            Logs
          </span>
        </template>
      </Navbar>
    </template>
    <template #body>
      <div ref="scrollContainer" class="pt-16 h-full overflow-auto">
        <div class="flex items-center justify-end gap-2 px-4 py-3.5 border-b border-accented">
          <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />

          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(checked)
                  },
                  onSelect(e: Event) {
                    e.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Columns"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
            />
          </UDropdownMenu>
        </div>

        <UTable
          ref="table"
          v-model:global-filter="globalFilter"
          v-model:column-visibility="columnVisibility"
          sticky
          :data="messages"
          :columns="columns"
          loading-animation="carousel"
          :loading="isFetching"
          class="flex-1"
        />

        <div class="flex flex-col items-center py-6">
          <UPagination
            v-model:page="page"
            show-edges
            color="neutral"
            :items-per-page="limit"
            :total="total"
            @update:page="(p) => { table?.tableApi?.setPageIndex(p - 1); scrollToTop() }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

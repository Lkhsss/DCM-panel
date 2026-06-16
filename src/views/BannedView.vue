<script setup lang="ts">
import { Permission } from '@/services/model'
import axios from 'axios'
import { onBeforeMount, onMounted, ref } from 'vue'
import { DataTable, type DataTablePageEvent } from 'primevue'
import Column from 'primevue/column'
import { error_styleClass, info_styleClass, success_styleClass } from '@/services/toast_style'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import { FilterMatchMode } from '@primevue/core/api'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import FloatLabel from 'primevue/floatlabel'
import SelectButton from 'primevue/selectbutton'
import DatePicker from 'primevue/datepicker'
import OverlayBadge from 'primevue/overlaybadge'

type BannedItem = {
  id: number
  time: number
  duration: number
  operator: string
  operator_permission: Permission
  nick: string
  qqLevel: number | null
}

enum Order {
  Asc = 'Asc',
  Desc = 'Desc',
}
const toast = useToast()
const loading = ref(true)
const totalRecords = ref(0)
const rows = ref(10)
const first = ref(0)
const order = ref(Order.Desc)
const page = ref(0)
const totalpage = ref(0)
let infoRequestId = 0

const filters = ref({ global: { value: null, matchMode: FilterMatchMode.CONTAINS } })

const datalist = ref<BannedItem[]>([])

const add_dialog_visible = ref(false)
const bannd_time_value = ref('永久')
const bannd_time_option = ref(['永久', '临时'])
const bannd_time = ref(null)

const qq_id = ref()

/// 获取权限对应的tag样式
function getOperatorSeverity(permission: Permission) {
  if (permission === Permission.SuperAdmin) {
    return 'contrast'
  }

  if (permission === Permission.Admin) {
    return 'danger'
  }

  if (permission === Permission.User) {
    return 'info'
  }

  return 'secondary'
}

async function fetchOperatorPermissions(names: string[]) {
  const uniqueNames = Array.from(new Set(names.filter((name) => name.length)))
  if (!uniqueNames.length) return new Map<string, Permission>()

  const requests = uniqueNames.map(async (name) => {
    try {
      const response = await axios.get(`/api/permission/${encodeURIComponent(name)}`)
      const value = Number(response.data)
      return [name, Number.isFinite(value) ? (value as Permission) : Permission.None] as const
    } catch {
      return [name, Permission.None] as const
    }
  })

  const entries = await Promise.all(requests)
  return new Map<string, Permission>(entries)
}

async function fetchAccountInfo(ids: number[]) {
  const uniqueIds = Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)))
  if (!uniqueIds.length) return new Map<number, { nick: string; qqLevel: number | null }>()

  const requests = uniqueIds.map(async (id) => {
    try {
      const response = await axios.get('/api/info', { params: { id } })
      const data = response.data ?? {}
      return [
        id,
        {
          nick: String(data.nick ?? '-'),
          qqLevel: Number.isFinite(data.qqLevel) ? Number(data.qqLevel) : null,
        },
      ] as const
    } catch {
      return [id, { nick: '-', qqLevel: null }] as const
    }
  })

  const entries = await Promise.all(requests)
  return new Map<number, { nick: string; qqLevel: number | null }>(entries)
}

function formatOperatorName(value: string) {
  const name = String(value ?? '').trim()
  return name.length ? name : '-'
}

function getSecondsDiff(date: Date): number {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  return diffSeconds
}

function formatData(value: Date | null | undefined) {
  if (value) {
    return value.toLocaleString()
  } else {
    return '未知'
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 0) {
    throw new Error('秒数不能为负数')
  }
  if (seconds == 0) {
    return '永久'
  }

  // 预定义时间单位（秒数基准）
  const units = [
    { name: '年', seconds: 31536000 }, // 365天
    { name: '月', seconds: 2592000 }, // 30天
    { name: '天', seconds: 86400 },
    { name: '小时', seconds: 3600 },
    { name: '分钟', seconds: 60 },
    { name: '秒', seconds: 1 },
  ]

  let remaining = seconds
  const parts: string[] = []

  for (const unit of units) {
    if (remaining >= unit.seconds) {
      const count = Math.floor(remaining / unit.seconds)
      parts.push(`${count}${unit.name}`)
      remaining %= unit.seconds
    }
  }

  // 边界情况：如果所有部分都是0，至少显示"0秒"
  if (parts.length === 0) {
    return '0秒'
  }

  return parts.join('')
}

function formatTimestamp(value: number) {
  if (!value) return '-'
  const date = new Date(value * 1000)
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function fetchlist_paging(page: number, size: number, order: Order, filter: string | null) {
  loading.value = true
  // PrimeVue 的 page 是从 0 开始
  // 后端page从1

  const p: Record<string, unknown> = {
    page: page + 1,
    size: size,
    order: order,
  }

  if (filter !== null) {
    p.filter = filter
  }

  try {
    const response = await axios.get('/api/list', { params: p })
    const data = Array.isArray(response.data) ? response.data : []
    const baseItems: BannedItem[] = data.map((item: BannedItem) => ({
      id: Number(item.id),
      time: Number(item.time),
      duration: Number(item.duration),
      operator: String(item.operator ?? ''),
      operator_permission: Permission.None,
      nick: '-',
      qqLevel: null,
    }))

    const permissionMap = await fetchOperatorPermissions(
      baseItems.map((item) => formatOperatorName(item.operator)),
    )

    datalist.value = baseItems.map((item) => ({
      ...item,
      operator_permission: permissionMap.get(formatOperatorName(item.operator)) ?? Permission.None,
      nick: '-',
      qqLevel: null,
    }))

    const currentRequestId = ++infoRequestId
    fetchAccountInfo(baseItems.map((item) => item.id))
      .then((infoMap) => {
        if (currentRequestId !== infoRequestId) return
        datalist.value = datalist.value.map((item) => ({
          ...item,
          nick: infoMap.get(item.id)?.nick ?? '-',
          qqLevel: infoMap.get(item.id)?.qqLevel ?? null,
        }))
      })
      .catch(() => {
        // Ignore per-row info failures to keep the page responsive.
      })

    totalRecords.value = await fetch_list_len(filter)
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'custom',
      summary: '获取数据失败 ',
      detail: '原因：' + e,
      life: 3000,
      styleClass: error_styleClass,
    })
  }
  loading.value = false
}

async function fetch_list_len(filter: string | null) {
  const p: Record<string, unknown> = {}

  if (filter !== null) {
    p.filter = filter
  }
  const response = await axios.get('/api/metrics/banned', { params: p })
  const len = response.data ?? 0
  return len
}

function getActiveFilter() {
  const raw = String(filters.value.global?.value ?? '').trim()
  return raw.length ? raw : null
}

// 更改页面状态
const onPageChange = (event: DataTablePageEvent) => {
  // event 包含新的 first, rows, page 等属性
  first.value = event.first
  rows.value = event.rows
  page.value = event.page
  totalpage.value = event.pageCount
  const currentPage = event.page // 从 0 开始

  // 调用你的API获取新数据
  fetchlist_paging(currentPage, event.rows, order.value, getActiveFilter())
}

const onFilter = () => {
  console.log('筛选')

  first.value = 0
  page.value = 0
  fetchlist_paging(0, rows.value, order.value, getActiveFilter())
}

async function ban(id: number) {
  loading.value = true

  let duration = 0

  if (bannd_time.value !== null) {
    duration = getSecondsDiff(bannd_time.value)
  }

  if (duration < 0) {
    toast.add({
      severity: 'custom',
      summary: '封禁时间必须在当前时间之后',
      life: 3000,
      styleClass: error_styleClass,
    })
  } else {
    const p = { duration: duration }
    const response = await axios.post('/api/' + id, null, { params: p })
    if (response.status === 200) {
      if (response.data['status'] === 'Banned') {
        if (duration !== 0) {
          toast.add({
            severity: 'custom',
            summary: '封禁ID: ' + id,
            detail: '解禁时间：' + formatData(bannd_time.value),
            life: 3000,
            styleClass: success_styleClass,
          })
        } else {
          toast.add({
            severity: 'custom',
            summary: '封禁ID: ' + id,
            detail: '永久封禁',
            life: 3000,
            styleClass: success_styleClass,
          })
        }
      }
    } else if (response.status === 409) {
      toast.add({
        severity: 'custom',
        summary: '封禁失败',
        detail: '该用户已被封禁',
        life: 3000,
        styleClass: error_styleClass,
      })
    }

    add_dialog_visible.value = false
  }

  fetchlist_paging(page.value, rows.value, order.value, getActiveFilter())
  loading.value = false
}

async function unban(id: number) {
  try {
    loading.value = true
    const response = await axios.delete('/api/' + id)
    if (response.status === 200) {
      if (response.data['status'] === 'Unbanned') {
        toast.add({
          severity: 'custom',
          summary: 'ID: ' + id,
          detail: '解除封禁成功',
          life: 3000,
          styleClass: success_styleClass,
        })
      }
    } else if (response.status === 409) {
      toast.add({
        severity: 'custom',
        summary: 'ID: ' + id + '解除封禁失败',
        detail: '原因：' + response.data,
        life: 3000,
        styleClass: error_styleClass,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'custom',
      summary: 'ID: ' + id + '解除封禁失败',
      detail: '原因：' + e,
      life: 3000,
      styleClass: error_styleClass,
    })
  }

  fetchlist_paging(page.value, rows.value, order.value, getActiveFilter())
  loading.value = false
}

onBeforeMount(async () => {
  datalist.value = Array.from({ length: rows.value }, () => ({
    id: 0,
    time: 0,
    duration: 0,
    operator: '',
    operator_permission: Permission.None,
    nick: '-',
    qqLevel: null,
  }))

  totalRecords.value = (await fetch_list_len(null)) ?? 0
  if (totalRecords.value === 0) {
    toast.add({
      severity: 'custom',
      summary: '当前没有数据',
      detail: '点击添加按钮添加或使用机器人封禁哦~' + totalRecords.value,
      life: 3000,
      styleClass: info_styleClass,
    })
  }
})

onMounted(() => {
  fetchlist_paging(0, rows.value, order.value, null)
})
</script>

<template>
  <div class="banned-view">
    <div class="banned-table-wrapper">
      <DataTable :value="datalist" paginator :rows="rows" :rowsPerPageOptions="[10, 15, 20, 50]" :filters="filters"
        dataKey="id" filterDisplay="row" :totalRecords="totalRecords" :globalFilterFields="['id']"
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink JumpToPageInput"
        currentPageReportTemplate="Page {currentPage} of {totalPages}" lazy :loading="loading" @page="onPageChange"
        responsiveLayout="scroll" class="banned-table">
        <template #header>
          <div class="flex justify-end">
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText v-model="filters['global'].value" placeholder="ID Search" @input="onFilter" />
            </IconField>
          </div>
        </template>
        <template #paginatorstart>
          <Button type="button" icon="pi pi-refresh" text
            @click="fetchlist_paging(page, rows, order, getActiveFilter())" />
        </template>
        <template #paginatorend>
          <Button type="button" icon="pi pi-plus" text @click="add_dialog_visible = true" />
        </template>
        <Column field="id" header="ID" headerStyle="width: 6rem" class="banned-col-id" />
        <Column field="nick" header="昵称" headerStyle="width: 8rem" class="banned-col-nick">
          <template #body="{ data }">
            <OverlayBadge :value="data.qqLevel" :severity="data.qqLevel ? 'success' : 'secondary'">
              <span>{{ data.nick || '-' }}</span>
            </OverlayBadge>
          </template>
        </Column>
        <Column field="time" header="封禁时间" headerStyle="width: 10rem" class="banned-col-time">
          <template #body="{ data }">
            <span>{{ formatTimestamp(data.time) }}</span>
          </template>
        </Column>
        <Column field="duration" header="持续时间" headerStyle="width: 8rem" class="banned-col-duration">
          <template #body="{ data }">
            <span>{{ formatDuration(data.duration) }}</span>
          </template>
        </Column>
        <Column field="operator" header="操作人" headerStyle="width: 8rem" class="banned-col-operator">
          <template #body="{ data }">
            <Tag :value="formatOperatorName(data.operator)" :severity="getOperatorSeverity(data.operator_permission)" />
          </template>
        </Column>
        <Column field="name" header="删除" headerStyle="width: 4rem" class="banned-col-delete">
          <template #body="{ data }">
            <Button icon="pi pi-trash" aria-label="Del" @click="unban(data.id)"
              :disabled="data.permission === Permission.SuperAdmin" size="small" text />
          </template>
        </Column>
      </DataTable>

      <Dialog v-model:visible="add_dialog_visible" modal header="增加封禁：" :style="{ width: '25rem' }"
        class="max-w-[calc(100vw-2rem)]">
        <div class="flex flex-col justify-center items-center" space-y-16>
          <span class="text-surface-500 dark:text-surface-400 block mb-8">注意不要封错人了哟~</span>
          <FloatLabel variant="on" class="mb-4">
            <InputText id="on_label" v-model="qq_id" :invalid="!qq_id" v-keyfilter.num />
            <label for="on_label">QQ号</label>
          </FloatLabel>
          <SelectButton v-model="bannd_time_value" :options="bannd_time_option" class="mb-4" />

          <div v-show="bannd_time_value === '临时'">
            <DatePicker v-model="bannd_time" showTime hourFormat="24" />
          </div>

          <Button label="封禁" :disabled="!qq_id" class="mt-8" @click="ban(qq_id)" />
        </div>
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
.banned-view {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.banned-table-wrapper {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 640px) {
  .banned-view {
    font-size: 0.875rem;
  }
}
</style>

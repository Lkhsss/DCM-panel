<script setup lang="ts">
import { Permission } from '@/services/model'
import axios from 'axios'
import { onBeforeMount, ref } from 'vue'
import { DataTable } from 'primevue'
import Column from 'primevue/column'
import { error_styleClass, success_styleClass } from '@/services/toast_style'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import OverlayBadge from 'primevue/overlaybadge'

type Manager = {
  name: string
  password: string
  permission: Permission
  nick: string
  qqLevel: number | null
}
const toast = useToast()

const datalist = ref<Manager[]>([])
const rows = ref(10)
const loading = ref(true)
const add_dialog_visible = ref(false)
const new_manager = ref()
let infoRequestId = 0

function isNumericId(value: string) {
  return /^\d+$/.test(value)
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

async function fetch_data() {
  try {
    const response = await axios.get('/api/manager')
    const data = Array.isArray(response.data) ? response.data : []
    const baseItems: Manager[] = data.map((item: Manager) => ({
      name: String(item.name),
      password: String(item.password),
      permission: item.permission,
      nick: '-',
      qqLevel: null,
    }))

    datalist.value = baseItems

    const numericIds = baseItems
      .filter((item) => isNumericId(item.name))
      .map((item) => Number(item.name))

    if (numericIds.length) {
      const currentRequestId = ++infoRequestId
      fetchAccountInfo(numericIds)
        .then((infoMap) => {
          if (currentRequestId !== infoRequestId) return
          datalist.value = datalist.value.map((item) => {
            if (!isNumericId(item.name)) return item
            const info = infoMap.get(Number(item.name))
            return {
              ...item,
              nick: info?.nick ?? '-',
              qqLevel: info?.qqLevel ?? null,
            }
          })
        })
        .catch(() => {
          // Ignore per-row info failures to keep the page responsive.
        })
    }
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

async function refresh_manager_password(id: string) {
  try {
    loading.value = true
    const response = await axios.patch(`/api/manager/${id}`)
    const updated = response.data as Manager
    const index = datalist.value.findIndex((item) => item.name === updated.name)
    if (index !== -1) {
      datalist.value[index] = {
        name: String(updated.name),
        password: String(updated.password),
        permission: updated.permission,
        nick: datalist.value[index]?.nick ?? '-',
        qqLevel: datalist.value[index]?.qqLevel ?? null,
      }
    }
    toast.add({
      severity: 'custom',
      summary: '密码重置成功',
      detail: '用户：' + updated.name,
      life: 3000,
      styleClass: success_styleClass,
    })
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'custom',
      summary: '重置密码失败',
      detail: '原因：' + e,
      life: 3000,
      styleClass: error_styleClass,
    })
  }
  loading.value = false
}

async function del_manager(id: string) {
  try {
    const response = await axios.delete(`/api/manager/${id}`)
    if (response.data == id) {
      toast.add({
        severity: 'custom',
        summary: '解除权限成功',
        detail: id + '已被移除权限',
        life: 3000,
        styleClass: success_styleClass,
      })
    } else {
      toast.add({
        severity: 'custom',
        summary: '解除权限失败',
        detail: '未知原因',
        life: 3000,
        styleClass: error_styleClass,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'custom',
      summary: '解除权限失败',
      detail: '原因：' + e,
      life: 3000,
      styleClass: error_styleClass,
    })
  }
  fetch_data()
}

async function add_manager(id: string) {
  try {
    const response = await axios.post(`/api/manager/${id}`)
    const new_m = response.data as Manager
    if (new_m.name == id) {
      toast.add({
        severity: 'custom',
        summary: '增加管理员成功',
        detail: id + '已被创建',
        life: 3000,
        styleClass: success_styleClass,
      })
      add_dialog_visible.value = false
      new_manager.value = ''
    } else {
      toast.add({
        severity: 'custom',
        summary: '增加管理员失败',
        detail: '未知原因',
        life: 3000,
        styleClass: error_styleClass,
      })
    }
  } catch (e) {
    toast.add({
      severity: 'custom',
      summary: '增加管理员失败',
      detail: '原因：' + e,
      life: 3000,
      styleClass: error_styleClass,
    })
  }

  fetch_data()
}
onBeforeMount(() => {
  fetch_data()
})
</script>

<template>
  <div class="manager-view">
    <div class="manager-table-wrapper">
      <DataTable
        :value="datalist"
        paginator
        :rows="rows"
        :rowsPerPageOptions="[10, 15, 20, 50]"
        :loading="loading"
      >
        <template #paginatorend>
          <Button type="button" icon="pi pi-plus" text @click="add_dialog_visible = true" />
        </template>

        <Column field="name" header=" 管理员ID"> </Column>
        <Column field="nick" header="姓名">
          <template #body="{ data }">
            <OverlayBadge
              :value="data.qqLevel"
              :severity="data.qqLevel ? 'success' : 'secondary'"
              :pt="{ pcBadge: { class: 'nick-level-badge' } }"
            >
              <span>{{ data.nick || '-' }}</span>
            </OverlayBadge>
          </template>
        </Column>
        <Column field="password" header="密码" style="width: 40%">
          <template #body="{ data }">
            <Password v-model="data.password" toggleMask :feedback="false" size="large" fluid />
          </template>
        </Column>
        <Column field="name" header="重置密码">
          <template #body="{ data }">
            <Button
              icon="pi pi-refresh"
              aria-label="Save"
              @click="refresh_manager_password(data.name)"
            />
          </template>
        </Column>
        <Column field="name" header="删除">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              aria-label="Del"
              @click="del_manager(data.name)"
              :disabled="data.permission === Permission.SuperAdmin"
            />
          </template>
        </Column>

        <Dialog
          v-model:visible="add_dialog_visible"
          modal
          header="增加管理员"
          :style="{ width: '25rem' }"
          class="max-w-[calc(100vw-2rem)]"
        >
          <div class="flex flex-col justify-center items-center" space-y-16>
            <span class="text-surface-500 dark:text-surface-400 block mb-8">新增管理员</span>

            <FloatLabel variant="on" class="mb-4">
              <InputText id="on_label" v-model="new_manager" :invalid="!new_manager" />
              <label for="on_label">管理员名称</label>
            </FloatLabel>
            <Button
              label="增加"
              :disabled="!new_manager"
              class="mt-8"
              @click="add_manager(new_manager)"
            />
          </div>
        </Dialog>
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.nick-level-badge {
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.manager-view {
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.manager-table-wrapper {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 640px) {
  .manager-view {
    font-size: 0.875rem;
  }
}
</style>

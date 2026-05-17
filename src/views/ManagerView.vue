<script setup lang="ts">
import { Permission } from '@/services/model';
import axios from 'axios';
import { onBeforeMount, ref } from 'vue';
import { DataTable } from 'primevue';
import Column from 'primevue/column';
import { error_styleClass, success_styleClass } from '@/services/toast_style';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast'
import FloatLabel from 'primevue/floatlabel';
import Password from 'primevue/password';

type Manager = {
    name: string,
    password: string,
    permission: Permission
}
const toast = useToast()

const datalist = ref<Manager[]>([])
const rows = ref(10)
const loading = ref(true)
const add_dialog_visible = ref(false)
const new_manager = ref()

async function fetch_data() {
    try {
        const response = await axios.get('/api/manager')
        const data = Array.isArray(response.data) ? response.data : []
        const baseItems: Manager[] = data.map((item: Manager) => ({
            name: String(item.name),
            password: String(item.password),
            permission: item.permission,
        }))

        datalist.value = baseItems;
    }
    catch (e) {
        console.error(e);
        toast.add({ severity: 'custom', summary: '获取数据失败 ', detail: "原因：" + e, life: 3000, styleClass: error_styleClass })

    }
    loading.value = false;

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
            }
        }
        toast.add({ severity: 'custom', summary: '密码重置成功', detail: "用户：" + updated.name, life: 3000, styleClass: success_styleClass })

    } catch (e) {
        console.error(e)
        toast.add({ severity: 'custom', summary: '重置密码失败', detail: '原因：' + e, life: 3000, styleClass: error_styleClass })
    }
    loading.value = false
}

async function del_manager(id: string) {
    try {
        const response = await axios.delete(`/api/manager/${id}`)
        if (response.data == id) {
            toast.add({ severity: 'custom', summary: '解除权限成功', detail: id + "已被移除权限", life: 3000, styleClass: success_styleClass })
        } else {
            toast.add({ severity: 'custom', summary: '解除权限失败', detail: "未知原因", life: 3000, styleClass: error_styleClass })

        }
    } catch (e) {
        toast.add({ severity: 'custom', summary: '解除权限失败', detail: "原因：" + e, life: 3000, styleClass: error_styleClass })

    }
    fetch_data()

}


async function add_manager(id: string) {
    try {
        const response = await axios.post(`/api/manager/${id}`)
        const new_m = response.data as Manager
        if (new_m.name == id) {
            toast.add({ severity: 'custom', summary: '增加管理员成功', detail: id + "已被创建", life: 3000, styleClass: success_styleClass })
            add_dialog_visible.value = false
            new_manager.value = ""
        } else {
            toast.add({ severity: 'custom', summary: '增加管理员失败', detail: "未知原因", life: 3000, styleClass: error_styleClass })
        }

    } catch (e) {
        toast.add({ severity: 'custom', summary: '增加管理员失败', detail: "原因：" + e, life: 3000, styleClass: error_styleClass })

    }

    fetch_data()

}
onBeforeMount(() => {
    fetch_data()
})

</script>

<template>

    <DataTable :value="datalist" paginator :rows="rows" :rowsPerPageOptions="[10, 15, 20, 50]" :loading="loading">
        <template #paginatorend>
            <Button type="button" icon="pi pi-plus" text @click="add_dialog_visible = true" />
        </template>

        <Column field="name" header=" 管理员ID">
        </Column>
        <Column field="password" header="密码" style="width: 50%">
            <template #body="{ data }">
                <Password v-model="data.password" toggleMask :feedback="false" size="large" fluid />
            </template>
        </Column>
        <Column field="name" header="重置密码">
            <template #body="{ data }">
                <Button icon="pi pi-refresh" aria-label="Save" @click="refresh_manager_password(data.name)" />
            </template>
        </Column>
        <Column field="name" header="删除">
            <template #body="{ data }">
                <Button icon="pi pi-trash" aria-label="Del" @click="del_manager(data.name)"
                    :disabled="data.permission === Permission.SuperAdmin" />
            </template>
        </Column>


        <Dialog v-model:visible="add_dialog_visible" modal header="增加管理员" :style="{ width: '25rem' }">

            <div class="flex flex-col justify-center items-center" space-y-16>
                <span class="text-surface-500 dark:text-surface-400 block mb-8">新增管理员</span>

                <FloatLabel variant="on" class="mb-4">
                    <InputText id="on_label" v-model="new_manager" :invalid="!new_manager" />
                    <label for="on_label">管理员名称</label>
                </FloatLabel>
                <Button label="增加" :disabled="!new_manager" class="mt-8" @click="add_manager(new_manager)" />
            </div>

        </Dialog>
    </DataTable>

</template>
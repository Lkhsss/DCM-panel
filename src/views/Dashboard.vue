<template>
    <div class="min-h-screen px-6 pt-10 pb-6 md:px-[100px] lg:px-[100px] flex flex-col gap-6 backdrop-blur-3xl bg-white/30"
        style="background-image: linear-gradient(135deg, #f472b6 0%, #3b82f6 30%, #ffffff 100%);">
        <Menubar :model="topItems" class="top-menubar">
            <template #start>
                <span class="top-title">风纪面板</span>
            </template>
            <template #end>
                <div class="top-actions">
                    <div class="top-user">
                        <span class="top-user-name">{{ username }}</span>
                        <span class="top-user-role">{{ permisson }}</span>
                    </div>
                    <!-- <button class="top-action-btn" type="button">设置</button> -->
                    <Button v-if="isLoggedIn" class="top-action-btn" type="button" label="登出" @click="logout" />
                    <Button v-else class="top-action-btn" type="button" label="登录" @click="goLogin" />
                </div>
            </template>
        </Menubar>
        <div class="home-layout">
            <Menu :model="items" class="home-menu">
                <template #item="{ item, props }">
                    <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                        <a v-ripple :href="href" v-bind="props.action" @click="navigate">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                        </a>
                    </router-link>
                    <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </template>
            </Menu>
            <section class="home-panel">
                <div class="home-panel-inner">
                    <aside class="right-panel" aria-label="Right panel">
                        <RouterView />
                    </aside>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { clearCookie, get_user_from_cookie } from '@/services/auth';
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import { onBeforeMount, ref } from 'vue';
import { success_styleClass } from '@/services/toast_style';
import { useToast } from 'primevue/usetoast';
import { Permission, permission_to_name } from '@/services/model';

const toast = useToast()

const username = ref("未登录")
const permisson = ref(permission_to_name(Permission.None))
const isLoggedIn = ref(false)

const items = ref([
    {
        label: '面板',
        items: [
            { label: '主页', icon: 'pi pi-home', route: { name: 'hello' } },
            { label: '数据面板', icon: 'pi pi-chart-bar', route: { name: 'metrics' } },
            { label: '封禁管理', icon: 'pi pi-ban', route: { name: 'banned' } },
            { label: '管理员管理', icon: 'pi pi-users', route: { name: 'manager' } },
        ]
    }])

const topItems = ref([])

function logout() {
    console.log("退出登录")
    clearCookie("name")
    clearCookie("token")
    clearCookie("permisson")

    toast.add({
        severity: 'custom',
        summary: '退出登录',
        detail: '欢迎下次再来（；´д｀）ゞ',
        life: 3000,
        styleClass: success_styleClass
    });

    router.push("/login")
}

function goLogin() {
    router.push({ name: "login" })
}

onBeforeMount(async () => {
    const u = await get_user_from_cookie()
    if (u?.name) {
        username.value = u.name.toString();
        permisson.value = permission_to_name(u?.permisson ?? Permission.None);
        isLoggedIn.value = true;
        return;
    }

    username.value = "未登录";
    permisson.value = permission_to_name(Permission.None);
    isLoggedIn.value = false;

})
</script>

<style scoped>
.home-layout {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    align-items: stretch;
    gap: 32px;
}

.top-menubar {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.35);
    backdrop-filter: blur(12px);
}

.top-title {
    font-weight: 700;
    font-size: 18px;
    color: #0f172a;
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 16px;
}

.top-user {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
}

.top-user-name {
    font-weight: 600;
    color: #0f172a;
}

.top-user-role {
    font-size: 12px;
    color: #64748b;
}

.top-action-btn {
    padding: 6px 12px;
    border-radius: 10px;
    border: 1px solid rgba(148, 163, 184, 0.5);
    background: rgba(255, 255, 255, 0.8);
    color: #0f172a;
    font-weight: 600;
}

.home-menu {
    width: 260px;
}

.home-panel {
    flex: 1;
    display: flex;
}

.home-panel-inner {
    width: 100%;
    min-height: 60vh;
    display: flex;
    gap: 24px;
    align-items: stretch;
}

.right-panel {
    flex: 1 1 0;
    min-height: 320px;
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%);
    border: 1px solid rgba(148, 163, 184, 0.4);
    box-shadow: 0 18px 45px rgba(30, 41, 59, 0.18);
}

@media (max-width: 900px) {
    .home-layout {
        flex-direction: column;
    }

    .home-menu {
        width: 100%;
    }

    .home-panel-inner {
        flex-direction: column;
    }
}
</style>

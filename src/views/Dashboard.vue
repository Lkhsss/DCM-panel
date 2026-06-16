<template>
  <div
    class="min-h-screen px-3 pt-4 pb-4 sm:px-6 sm:pt-10 sm:pb-6 md:px-[100px] lg:px-[100px] flex flex-col gap-4 sm:gap-6 backdrop-blur-3xl bg-white/30"
    style="background-image: linear-gradient(135deg, #f472b6 0%, #3b82f6 30%, #ffffff 100%)">
    <Menubar :model="topItems" class="top-menubar">
      <template #start>
        <!-- 移动端菜单按钮 -->
        <Button class="md:hidden menu-toggle-btn" icon="pi pi-bars" severity="secondary" text @click="toggleMenu"
          aria-label="Toggle menu" />
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
    <!-- 移动端菜单遮罩 - 只用于视觉效果，不处理点击 -->
    <Transition name="fade">
      <div v-if="showMobileMenu" class="fixed inset-0 bg-black/30 md:hidden z-30 pointer-events-none" />
    </Transition>
    <div class="home-layout">
      <!-- 移动端侧边栏 -->
      <Transition name="slide">
        <Menu :model="items" class="home-menu mobile-menu-sidebar" v-if="showMobileMenu || isDesktop">
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
      </Transition>
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
import router from '@/router'
import { clearCookie, get_user_from_cookie } from '@/services/auth'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import Menubar from 'primevue/menubar'
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { success_styleClass } from '@/services/toast_style'
import { useToast } from 'primevue/usetoast'
import { Permission, permission_to_name } from '@/services/model'

const toast = useToast()

const username = ref('未登录')
const permisson = ref(permission_to_name(Permission.None))
const isLoggedIn = ref(false)
const showMobileMenu = ref(false)
const isDesktop = ref(window.innerWidth >= 768)

const items = ref([
  {
    label: '面板',
    items: [
      { label: '主页', icon: 'pi pi-home', route: { name: 'hello' } },
      { label: '数据面板', icon: 'pi pi-chart-bar', route: { name: 'metrics' } },
      { label: '封禁管理', icon: 'pi pi-ban', route: { name: 'banned' } },
      { label: '管理员管理', icon: 'pi pi-users', route: { name: 'manager' } },
    ],
  },
])

const topItems = ref([])

// 响应式菜单控制
const toggleMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 关闭菜单
const closeMenu = () => {
  if (!isDesktop.value) {
    showMobileMenu.value = false
  }
}

// 监听窗口大小变化
const handleResize = () => {
  const width = window.innerWidth
  isDesktop.value = width >= 768
  if (width >= 768) {
    showMobileMenu.value = false
  }
}

// 监听 Escape 键关闭菜单
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showMobileMenu.value) {
    showMobileMenu.value = false
  }
}

// 监听路由变化以关闭移动端菜单
router.afterEach(() => {
  closeMenu()
})

onMounted(() => {
  window.addEventListener('resize', handleResize)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('keydown', handleKeyDown)
})

function logout() {
  console.log('退出登录')
  clearCookie('name')
  clearCookie('token')
  clearCookie('permisson')

  toast.add({
    severity: 'custom',
    summary: '退出登录',
    detail: '欢迎下次再来（；´д｀）ゞ',
    life: 3000,
    styleClass: success_styleClass,
  })

  router.push('/login')
}

function goLogin() {
  router.push({ name: 'login' })
}

onBeforeMount(async () => {
  const u = await get_user_from_cookie()
  if (u?.name) {
    username.value = u.name.toString()
    permisson.value = permission_to_name(u?.permisson ?? Permission.None)
    isLoggedIn.value = true
    return
  }

  username.value = '未登录'
  permisson.value = permission_to_name(Permission.None)
  isLoggedIn.value = false
})
</script>

<style scoped>
.home-layout {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  gap: 16px;
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
  font-size: clamp(14px, 2vw, 18px);
  color: #0f172a;
  white-space: nowrap;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: clamp(11px, 1.5vw, 14px);
}

.top-user-role {
  font-size: clamp(10px, 1.2vw, 12px);
  color: #64748b;
}

.top-action-btn {
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.5);
  background: rgba(255, 255, 255, 0.8);
  color: #0f172a;
  font-weight: 600;
  font-size: clamp(12px, 1.5vw, 14px);
  white-space: nowrap;
}

/* 菜单按钮 */
.menu-toggle-btn {
  margin-right: 12px;
  color: #0f172a !important;
}

/* 桌面端菜单 */
.home-menu {
  width: 260px;
  flex-shrink: 0;
}

/* 移动端菜单侧边栏 */
.mobile-menu-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  height: 100vh;
  z-index: 50;
  overflow-y: auto;
  border-radius: 0;
  border: none;
  margin-top: 0;
}

@media (min-width: 768px) {
  .mobile-menu-sidebar {
    position: static;
    height: auto;
    width: 260px;
    border-radius: inherit;
    border: inherit;
  }
}

.home-panel {
  flex: 1;
  display: flex;
  min-width: 0;
}

.home-panel-inner {
  width: 100%;
  min-height: 60vh;
  display: flex;
  gap: 24px;
  align-items: stretch;
}

/* 移动端响应式调整 */
@media (max-width: 768px) {
  .home-layout {
    gap: 0;
  }

  .home-panel-inner {
    gap: 12px;
  }
}

/* 动画过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 特殊处理小屏幕 */
@media (max-width: 640px) {
  .top-user {
    display: none;
  }

  .top-actions {
    gap: 4px;
  }
}

/* 横屏模式优化 */
@media (orientation: landscape) and (max-height: 500px) {
  .home-layout {
    gap: 8px;
  }

  .home-panel-inner {
    min-height: auto;
  }
}

.right-panel {
  flex: 1 1 0;
  min-height: 320px;
  padding: 12px;
  border-radius: 18px;
  background: linear-gradient(160deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid rgba(148, 163, 184, 0.4);
  box-shadow: 0 18px 45px rgba(30, 41, 59, 0.18);
  min-width: 0;
}

@media (max-width: 900px) {
  .home-layout {
    flex-direction: column;
    gap: 12px;
  }

  .home-menu {
    width: 100%;
  }

  .home-panel-inner {
    flex-direction: column;
    gap: 16px;
  }

  .right-panel {
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .top-actions {
    gap: 4px;
  }

  .top-action-btn {
    padding: 4px 8px;
  }

  .top-menubar {
    border-radius: 12px;
  }
}
</style>

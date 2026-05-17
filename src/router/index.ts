import { createRouter, createWebHashHistory } from 'vue-router'

import axios from 'axios'
import { auth, get_user_from_cookie, is_permission_match_rule, Rule as Role } from '@/services/auth'
import { getToast } from '@/services/toast'
import { error_styleClass } from '@/services/toast_style'
import Index from '@/views/Index.vue'

const Login = () => import('@/views/Login.vue')
const MetricsView = () => import('@/views/MetricsView.vue')
const BannedView = () => import('@/views/BannedView.vue')
const ManagerView = () => import('@/views/ManagerView.vue')
const HelloView = () => import('@/views/HelloView.vue')
const ForbiddenView = () => import('@/views/ForbiddenView.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      redirect: { name: 'hello' },
      children: [
        {
          path: 'hello',
          name: 'hello',
          component: HelloView,
        },
        {
          path: 'metrics',
          name: 'metrics',
          component: MetricsView,
          meta: { requiresAuth: true, roles: Role.UserOrAbove },
        },
        {
          path: 'banned',
          name: 'banned',
          component: BannedView,
          meta: { requiresAuth: true, roles: Role.AdminOrAbove },
        },
        {
          path: 'manager',
          name: 'manager',
          component: ManagerView,
          meta: { requiresAuth: true, roles: Role.SuperAdminOnly },
        },
        {
          path: 'forbidden',
          name: 'forbidden',
          component: ForbiddenView,
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // 1. 登录页直接放行
  if (to.name === 'login') {
    return next()
  }

  // 2. 检查是否需要权限
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
  const roleRecord = [...to.matched].reverse().find((record) => record.meta?.roles !== undefined)
  const requiredRule = (roleRecord?.meta?.roles as Role | undefined) ?? Role.None

  if (!requiresAuth) {
    return next()
  }

  // 3. 验证登录状态并获取权限
  let authedUser: Awaited<ReturnType<typeof auth>> | null = null

  try {
    authedUser = await auth()
  } catch (e) {
    const toast = getToast()
    const detail = axios.isAxiosError(e) ? (e.response?.data ?? e.message) : String(e ?? '')
    toast?.add({
      severity: 'custom',
      summary: '需要登陆',
      detail: String(detail),
      life: 3000,
      styleClass: error_styleClass,
    })
    console.error('验证失败：' + e)
    return next({ name: 'login' })
  }

  if (!authedUser) {
    return next({ name: 'login' })
  }

  // 4. 获取用户信息
  // 5. 权限验证
  console.log(authedUser.permisson, requiredRule)

  if (requiredRule !== undefined && !is_permission_match_rule(authedUser.permisson, requiredRule)) {
    return next({ name: 'forbidden' })
  }

  // 6. 放行
  next()
})

export default router

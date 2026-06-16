<template>
  <div
    class="min-h-screen px-4 py-10 sm:px-6 sm:py-20 md:px-20 lg:px-80 flex items-center justify-center backdrop-blur-3xl"
    style="background-image: linear-gradient(135deg, #f472b6 0%, #3b82f6 30%, #ffffff 100%)"
  >
    <div
      class="px-6 py-8 sm:px-8 md:px-12 lg:px-20 sm:py-12 flex flex-col items-center gap-8 sm:gap-12 w-full backdrop-blur-3xl rounded-2xl bg-white/20 border border-white/15 max-w-sm"
    >
      <div class="flex flex-col items-center gap-4 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 sm:h-14 sm:w-14"
          width="33"
          height="32"
          viewBox="0 0 33 32"
          fill="none"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7.09219 2.87829C5.94766 3.67858 4.9127 4.62478 4.01426 5.68992C7.6857 5.34906 12.3501 5.90564 17.7655 8.61335C23.5484 11.5047 28.205 11.6025 31.4458 10.9773C31.1517 10.087 30.7815 9.23135 30.343 8.41791C26.6332 8.80919 21.8772 8.29127 16.3345 5.51998C12.8148 3.76014 9.71221 3.03521 7.09219 2.87829ZM28.1759 5.33332C25.2462 2.06 20.9887 0 16.25 0C14.8584 0 13.5081 0.177686 12.2209 0.511584C13.9643 0.987269 15.8163 1.68319 17.7655 2.65781C21.8236 4.68682 25.3271 5.34013 28.1759 5.33332ZM32.1387 14.1025C28.2235 14.8756 22.817 14.7168 16.3345 11.4755C10.274 8.44527 5.45035 8.48343 2.19712 9.20639C2.0292 9.24367 1.86523 9.28287 1.70522 9.32367C1.2793 10.25 0.939308 11.2241 0.695362 12.2356C0.955909 12.166 1.22514 12.0998 1.50293 12.0381C5.44966 11.161 11.0261 11.1991 17.7655 14.5689C23.8261 17.5991 28.6497 17.561 31.9029 16.838C32.0144 16.8133 32.1242 16.7877 32.2322 16.7613C32.2441 16.509 32.25 16.2552 32.25 16C32.25 15.358 32.2122 14.7248 32.1387 14.1025ZM31.7098 20.1378C27.8326 20.8157 22.5836 20.5555 16.3345 17.431C10.274 14.4008 5.45035 14.439 2.19712 15.1619C1.475 15.3223 0.825392 15.5178 0.252344 15.7241C0.250782 15.8158 0.25 15.9078 0.25 16C0.25 24.8366 7.41344 32 16.25 32C23.6557 32 29.8862 26.9687 31.7098 20.1378Z"
            class="fill-surface-0"
          />
        </svg>
        <div class="flex flex-col gap-2 w-full">
          <div class="text-center text-2xl sm:text-3xl font-medium text-white leading-tight">
            风纪面板
          </div>
        </div>
      </div>
      <div class="flex flex-col items-center gap-6 sm:gap-8 w-full">
        <div class="flex flex-col gap-4 sm:gap-6 w-full">
          <IconField>
            <InputIcon class="pi pi-user text-black/70!" />
            <InputText
              type="text"
              v-model="username"
              inputmode="text"
              class="appearance-none! border! border-white/10! w-full! outline-0! bg-white/10! text-white! placeholder:text-white/70! rounded-3xl! shadow-sm! transition-all! duration-200! ease-out! focus:scale-[1.02] sm:focus:scale-[1.03]! focus:shadow-[0_0_20px_rgba(59,130,246,0.45)]! focus:border-white/40! focus:ring-2! focus:ring-white/30!"
              placeholder="用户名"
            />
          </IconField>
          <IconField>
            <InputIcon class="pi pi-lock text-black/70!" />
            <InputText
              type="password"
              v-model="password"
              inputmode="text"
              class="appearance-none! border! border-white/10! w-full! outline-0! bg-white/10! text-white! placeholder:text-white/70! rounded-3xl! shadow-sm! transition-all! duration-200! ease-out! focus:scale-[1.02] sm:focus:scale-[1.03]! focus:shadow-[0_0_20px_rgba(59,130,246,0.45)]! focus:border-white/40! focus:ring-2! focus:ring-white/30!"
              placeholder="密码"
            />
          </IconField>
        </div>
        <Button
          label="登录"
          @click="login"
          class="w-full! rounded-3xl! bg-surface-950! border! border-surface-950! text-white! hover:bg-surface-950/80! text-base sm:text-lg! h-12 sm:h-auto!"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import axios, { Axios } from 'axios'
import { ref } from 'vue'
import { validate_status } from '@/services/validateStatus'
import { useRouter } from 'vue-router'
import { error_styleClass, info_styleClass, success_styleClass } from '@/services/toast_style'

const router = useRouter()
const username = ref('')
const password = ref('')
const toast = useToast()

async function login(this: any) {
  const payload = new URLSearchParams()
  payload.set('name', username.value)
  payload.set('password', password.value)

  try {
    const response = await axios.post('/api/auth', payload, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      validateStatus: validate_status,
    })

    if (response.status !== 200) {
      toast.add({
        severity: 'custom',
        summary: '登录失败',
        detail: '无法登录!\n原因：' + response.data,
        life: 3000,
        styleClass: error_styleClass,
      })
      return
    }

    toast.add({
      severity: 'custom',
      summary: '登录成功',
      detail: '欢迎回来',
      life: 3000,
      styleClass: success_styleClass,
    })
    // 跳转到主页
    router.push({ name: 'dashboard' })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      toast.add({
        severity: 'custom',
        summary: '登录失败',
        detail: '请求出错：' + (error.response?.data ?? error.message),
        life: 3000,
        styleClass: error_styleClass,
      })
    } else {
      toast.add({
        severity: 'custom',
        summary: '登录失败',
        detail: '未知错误：' + error,
        life: 3000,
        styleClass: error_styleClass,
      })
    }
  }
}
</script>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue'
import { getVersion } from '@/services/version'
import Tag from 'primevue/tag'
const version = ref('Unknown Version')

onBeforeMount(async () => {
  version.value = await getVersion()
})
</script>

<template>
  <div
    class="min-h-screen px-4 pt-6 pb-6 sm:px-6 sm:pt-10 sm:pb-6 md:px-25 lg:px-25 flex flex-col items-center justify-center gap-6 backdrop-blur-3xl bg-white/30"
    style="background-image: linear-gradient(135deg, #f472b6 0%, #3b82f6 30%, #ffffff 100%)"
  >
    <div
      class="w-full max-w-3xl border border-white/80 rounded-2xl bg-white/70 shadow-xl p-5 sm:p-8 backdrop-blur"
      style="box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2)"
    >
      <h1 class="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900">
        DCM Panel <Tag :value="version" severity="info"></Tag>
      </h1>
      <p class="mt-3 sm:mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
        这是一个面向 QQ 风纪委员的管理面板，用于集中查看与处理风纪事件、
        账号状态与相关指标，帮助管理员高效完成审核与统计工作。
      </p>
      <p class="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
        使用方法：将<a
          href="http://wpa.qq.com/msgrd?v=3&uin=10352472&site=qq&menu=yes "
          target="_blank"
          >QQBot(10352472)</a
        >邀请加入群聊并赋予管理员权限即可使用。数据库全局共享，
        被封禁的用户永远无法进入被保护的群聊。
      </p>
      <p class="mt-2 sm:mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">
        更多信息可联系QQ(10352472)
      </p>
      <div class="mt-6">
        <RouterLink
          to="/dashboard"
          class="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800 transition"
        >
          进入 Dashboard
        </RouterLink>
      </div>
    </div>
  </div>
</template>

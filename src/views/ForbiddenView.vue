<script setup lang="ts"></script>
<template>
    <div class="w-full h-full flex items-center justify-center p-6">
        <div class="
        flex flex-col items-center gap-6 
        px-8 py-12 md:px-12 md:py-16 
        w-full max-w-md 
        bg-red-500/10 backdrop-blur-xl 
        rounded-3xl 
        border border-red-500/20 
        shadow-2xl
        transition-all duration-300
      ">
            <!-- 图标装饰 -->
            <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center backdrop-blur-sm">
                <svg class="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>

            <!-- 提示文字 - 更醒目 -->
            <span class="text-3xl md:text-4xl font-bold text-red-300 tracking-wide drop-shadow-lg">
                权限不足
            </span>

            <!-- 描述副文本 - 更清晰 -->
            <p class="text-base md:text-lg text-red-400/70 text-center font-medium">
                抱歉，您没有访问此页面的权限
            </p>
        </div>
    </div>
</template>
<script setup lang="ts">
import Toast from 'primevue/toast'
import { RouterView } from 'vue-router'
</script>

<template>
  <Toast position="top-right"/>
  <RouterView />
  <!-- <router-link to="/login">登录</router-link> -->
</template>

<style>
html,
body,
#app {
  min-height: 100%;
  background: var(--surface-ground);
  color: var(--text-color);
  transition: background 0.3s, color 0.3s;
}

html.my-app-dark,
html.my-app-dark body,
html.my-app-dark #app {
  color: var(--text-color);
}

/* .glass-toast {
  --glass-bg: rgba(255, 255, 255, 0.16);
  --glass-border: rgba(255, 255, 255, 0.24);
  --glass-shadow: 0 20px 50px rgba(15, 23, 42, 0.18);
}

.glass-toast .p-toast-message {
  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  color: var(--text-color);
}

.glass-toast .p-toast-message-content {
  background: transparent;
}

.glass-toast .p-toast-message-icon,
.glass-toast .p-toast-summary,
.glass-toast .p-toast-detail {
  color: inherit;
}

.glass-toast .p-toast-close-button {
  color: inherit;
  opacity: 0.7;
}

.glass-toast .p-toast-close-button:hover {
  opacity: 1;
} */
</style>

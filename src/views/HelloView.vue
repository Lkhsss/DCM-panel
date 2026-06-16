<script setup lang="ts">

import { onBeforeMount, ref } from 'vue';

import { getVersion } from '@/services/version'

const version = ref("Unknown Version")

onBeforeMount(async () => {
    version.value = await getVersion()
})
</script>

<template>
    <section class="hello">
        <div class="glow" aria-hidden="true"></div>
        <div class="card">
            <span class="badge">DCM Panel {{ version }}</span>
            <h1>欢迎登录风纪面板</h1>
            <p>本面板作为QQ风纪委员的后端管理面板</p>
            <p>使用方法：将QQBot邀请加入群聊并赋予管理员权限即可使用。数据库全局共享，被封禁的用户永远无法进入被保护的群聊。</p>
            <p class="muted">有什么问题可以私信Bot(10352472)</p>
            <div class="meta">
                <div class="meta-item">
                    <span class="dot"></span>
                    <span>实时风控</span>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hello {
    --bg: #f7f5f0;
    --bg-2: #f0f4ff;
    --ink: #1d2337;
    --muted: #5b647a;
    --accent: #f28f45;
    --accent-2: #20c6b8;
    --card: rgba(255, 255, 255, 0.86);
    --stroke: rgba(20, 26, 47, 0.08);
    /* min-height: calc(100vh - 64px); */
    display: grid;
    place-items: center;
    padding: 64px 20px;
    background:
        radial-gradient(900px 420px at 15% 10%, rgba(242, 143, 69, 0.18), transparent 70%),
        radial-gradient(700px 380px at 90% 20%, rgba(32, 198, 184, 0.18), transparent 70%),
        linear-gradient(160deg, var(--bg), var(--bg-2));
    color: var(--ink);
    position: relative;
    overflow: hidden;
    font-family: "Space Grotesk", "IBM Plex Sans", "Noto Sans SC", sans-serif;
}

.glow {
    position: absolute;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: conic-gradient(from 120deg, rgba(247, 178, 103, 0.2), rgba(94, 234, 212, 0.2), rgba(247, 178, 103, 0.2));
    filter: blur(50px);
    opacity: 0.7;
    animation: drift 14s ease-in-out infinite alternate;
}

.card {
    width: min(640px, 92vw);
    padding: 40px 36px 32px;
    border-radius: 24px;
    background: var(--card);
    border: 1px solid var(--stroke);
    box-shadow: 0 24px 60px rgba(32, 38, 57, 0.18);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1;
    animation: rise 700ms ease-out;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(247, 178, 103, 0.15);
    border: 1px solid rgba(247, 178, 103, 0.35);
    color: var(--accent);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 12px;
}

h1 {
    margin: 18px 0 12px;
    font-size: clamp(28px, 4vw, 40px);
    line-height: 1.2;
    letter-spacing: -0.02em;
}

p {
    margin: 0 0 8px;
    font-size: 16px;
    line-height: 1.7;
}

.muted {
    color: var(--muted);
}

.meta {
    margin-top: 22px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    font-size: 14px;
    color: var(--muted);
}

.meta-item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
}

.dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(120deg, var(--accent), var(--accent-2));
    box-shadow: 0 0 12px rgba(94, 234, 212, 0.6);
}

@keyframes drift {
    0% {
        transform: translate(-140px, -160px) scale(1);
    }

    100% {
        transform: translate(140px, -40px) scale(1.15);
    }
}

@keyframes rise {
    from {
        transform: translateY(18px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 520px) {
    .card {
        padding: 32px 24px 28px;
    }

    .meta {
        flex-direction: column;
    }
}
</style>
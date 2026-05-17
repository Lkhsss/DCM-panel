<script setup lang="ts">
import { Card } from 'primevue';
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';
import { useToast } from 'primevue/usetoast';
import { error_styleClass } from '@/services/toast_style';

const toast = useToast()

const Chart = defineAsyncComponent(() => import('primevue/chart'))

const success = ref(NaN)
const fail = ref(NaN)
const request = ref(NaN)
const banned = ref(NaN)

const value = ref([
    { label: 'Success', color1: '#34d399', color2: '#fbbf24', value: success, icon: 'pi pi-verified' },
    { label: 'Fail', color1: '#fbbf24', color2: '#60a5fa', value: fail, icon: 'pi pi-ban' },
    { label: 'Request', color1: '#60a5fa', color2: '#c084fc', value: request, icon: 'pi pi-send' },
    { label: 'Banned', color1: '#c084fc', color2: '#c084fc', value: banned, icon: 'pi pi-lock' }
]);

const MAX_POINTS = 30

type LineDataset = {
    label: string
    data: number[]
    borderColor: string
    tension: number
}

type MetricsChartData = {
    labels: string[]
    datasets: [LineDataset, LineDataset, LineDataset, LineDataset]
}

const chartData = shallowRef<MetricsChartData>({
    labels: [],
    datasets: [
        { label: 'Success', data: [], borderColor: '#34d399', tension: 0.35 },
        { label: 'Fail', data: [], borderColor: '#fbbf24', tension: 0.35 },
        { label: 'Request', data: [], borderColor: '#60a5fa', tension: 0.35 },
        { label: 'Banned', data: [], borderColor: '#c084fc', tension: 0.35 }
    ]
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    plugins: {
        legend: { display: true, position: 'bottom' }
    },
    scales: {
        x: { ticks: { maxRotation: 0 } },
        y: { beginAtZero: true }
    }
}

type MetricsPayload = {
    success?: number
    fail?: number
    request?: number
    banned?: number
}

type ChartApi = {
    refresh?: () => void
    reinit?: () => void
}

let sse: EventSource | null = null
const chartRef = ref<ChartApi | null>(null)

const applyPayload = (payload: MetricsPayload) => {
    if (typeof payload.success === 'number') success.value = payload.success
    if (typeof payload.fail === 'number') fail.value = payload.fail
    if (typeof payload.request === 'number') request.value = payload.request
    if (typeof payload.banned === 'number') banned.value = payload.banned

    if (
        typeof payload.success === 'number' ||
        typeof payload.fail === 'number' ||
        typeof payload.request === 'number' ||
        typeof payload.banned === 'number'
    ) {
        const labels = chartData.value.labels
        const datasets = chartData.value.datasets
        const now = new Date()
        const label = now.toLocaleTimeString('zh-CN', { hour12: false })

        labels.push(label)
        datasets[0].data.push(success.value)
        datasets[1].data.push(fail.value)
        datasets[2].data.push(request.value)
        datasets[3].data.push(banned.value)

        if (labels.length > MAX_POINTS) {
            labels.shift()
            datasets.forEach((dataset) => {
                dataset.data.shift()
            })
        }
        chartRef.value?.refresh?.()
    }
}

onMounted(() => {
    sse = new EventSource('/api/metrics/sse')
    sse.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data) as MetricsPayload

            applyPayload(payload)

        } catch {
            console.log("获取指标数据失败" + event.data)
            toast.add({ severity: 'custom', summary: '获取指标数据失败', detail: event.data, life: 3000, styleClass: error_styleClass })

        }
    }
})

onBeforeUnmount(() => {
    if (sse) {
        sse.close()
        sse = null
    }
})


</script>


<template>
    <div class="metrics-layout">
        <div class="metrics-cards">
            <template v-for="val of value" :key="val.label">
                <Card class="metrics-card border border-surface shadow-none">
                    <template #content>
                        <div class="flex justify-between gap-8">
                            <div class="flex flex-col gap-1">
                                <span class="text-surface-500 dark:text-surface-400 text-sm">{{ val.label
                                }}</span>
                                <Transition name="jump" mode="out-in">
                                    <span :key="`${val.label}-${val.value}`" class="metric-value font-bold text-lg">{{
                                        val.value }}次</span>
                                </Transition>
                            </div>
                            <span class="w-8 h-8 rounded-full inline-flex justify-center items-center text-center"
                                :style="{ backgroundColor: `${val.color1}`, color: '#ffffff' }">
                                <i :class="val.icon" />
                            </span>
                        </div>
                    </template>
                </Card>
            </template>
        </div>
        <div class="metrics-chart">
            <Chart ref="chartRef" type="line" :data="chartData" :options="chartOptions" class="h-full" />
        </div>
    </div>
</template>

<style scoped>
.metrics-layout {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.metrics-cards {
    display: flex;
    gap: 16px;
    align-items: stretch;
    flex-wrap: wrap;
}

.metrics-card {
    flex: 1 1 180px;
    min-width: 160px;
}

.metrics-chart {
    margin-top: 16px;
    flex: 1 1 auto;
    min-height: 240px;
}

.metric-value {
    display: inline-block;
}

.jump-enter-active,
.jump-leave-active {
    transition: transform 200ms ease, opacity 200ms ease;
}

.jump-enter-from,
.jump-leave-to {
    transform: translateY(-8px) scale(0.96);
    opacity: 0;
}

.jump-enter-to,
.jump-leave-from {
    transform: translateY(0) scale(1);
    opacity: 1;
}
</style>
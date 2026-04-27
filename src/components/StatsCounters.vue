<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'

const ordersStore = useOrdersStore()

const items = computed(() => [
    {
        key: 'total',
        label: 'Total',
        value: ordersStore.stats.total,
        icon: '🛍️',
        bgClass: 'bg-blue-50',
        iconBgClass: 'bg-blue-100',
        iconColor: 'text-blue-500',
        valueColor: 'text-blue-900',
    },
    {
        key: 'toConfirm',
        label: 'À confirmer',
        value: ordersStore.stats.toConfirm,
        icon: '⏰',
        bgClass: 'bg-orange-50',
        iconBgClass: 'bg-orange-100',
        iconColor: 'text-orange-500',
        valueColor: 'text-orange-900',
    },
    {
        key: 'paid',
        label: 'Payées',
        value: ordersStore.stats.paid,
        icon: '✓',
        bgClass: 'bg-emerald-50',
        iconBgClass: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        valueColor: 'text-emerald-900',
    },
    {
        key: 'toDeliver',
        label: 'À livrer',
        value: ordersStore.stats.toDeliver,
        icon: '🚚',
        bgClass: 'bg-violet-50',
        iconBgClass: 'bg-violet-100',
        iconColor: 'text-violet-500',
        valueColor: 'text-violet-900',
    },
])
</script>

<template>
    <div class="grid grid-cols-4 gap-2">
        <div v-for="item in items" :key="item.key" :class="item.bgClass"
            class="rounded-xl p-3 flex flex-col items-start">
            <div :class="[item.iconBgClass, item.iconColor]"
                class="w-7 h-7 rounded-lg flex items-center justify-center text-sm mb-2">
                {{ item.icon }}
            </div>
            <div :class="item.valueColor" class="text-2xl font-bold leading-none">
                {{ item.value }}
            </div>
            <div class="text-xs text-slate-600 mt-1">
                {{ item.label }}
            </div>
        </div>
    </div>
</template>
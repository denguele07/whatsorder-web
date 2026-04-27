<script setup>
import { computed } from 'vue'
import { useToastsStore } from '@/stores/toasts'

const toastsStore = useToastsStore()

// ═════════════════════════════════════════
// Styling selon le type
// ═════════════════════════════════════════
function getToastClasses(type) {
    const map = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    }
    return map[type] || map.info
}

function getToastIcon(type) {
    const map = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
    }
    return map[type] || 'ℹ'
}

function getIconClasses(type) {
    const map = {
        success: 'bg-emerald-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
    }
    return map[type] || map.info
}
</script>

<template>
    <Teleport to="body">
        <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full sm:w-auto">
            <TransitionGroup name="toast">
                <div v-for="toast in toastsStore.toasts" :key="toast.id" :class="getToastClasses(toast.type)"
                    class="pointer-events-auto border rounded-xl shadow-lg p-3 flex items-start gap-3 min-w-[280px]"
                    role="status">
                    <!-- Icône -->
                    <div :class="getIconClasses(toast.type)"
                        class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {{ getToastIcon(toast.type) }}
                    </div>

                    <!-- Message -->
                    <p class="flex-1 text-sm font-medium leading-snug">
                        {{ toast.message }}
                    </p>

                    <!-- Bouton fermer -->
                    <button @click="toastsStore.remove(toast.id)"
                        class="flex-shrink-0 text-slate-400 hover:text-slate-700 transition-colors" aria-label="Fermer">
                        ✕
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
/* Animations d'entrée/sortie des toasts */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* Animation fluide quand un toast est enlevé au milieu */
.toast-move {
    transition: transform 0.3s ease;
}
</style>
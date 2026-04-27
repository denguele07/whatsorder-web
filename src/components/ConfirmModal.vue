<script setup>
import { computed } from 'vue'

// ═════════════════════════════════════════
// PROPS & EMITS
// ═════════════════════════════════════════
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: 'Êtes-vous sûr ?',
    },
    message: {
        type: String,
        default: '',
    },
    confirmLabel: {
        type: String,
        default: 'Confirmer',
    },
    cancelLabel: {
        type: String,
        default: 'Annuler',
    },
    variant: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'danger'].includes(v),
    },
    icon: {
        type: String,
        default: '',
    },
    loading: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

// ═════════════════════════════════════════
// COMPUTED — styling selon le variant
// ═════════════════════════════════════════
const confirmButtonClass = computed(() => {
    if (props.variant === 'danger') {
        return 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
    }
    return 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'
})

const defaultIcon = computed(() => {
    if (props.icon) return props.icon
    return props.variant === 'danger' ? '⚠️' : '❓'
})

// ═════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════
function handleCancel() {
    emit('cancel')
    emit('update:modelValue', false)
}

function handleConfirm() {
    emit('confirm')
}
</script>

<template>
    <Transition name="fade">
        <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop cliquable -->
            <div class="absolute inset-0 bg-black/50" @click="!loading && handleCancel()"></div>

            <!-- Contenu modal -->
            <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <!-- Icône en haut -->
                <div class="pt-8 pb-4 text-center">
                    <div class="text-5xl">
                        {{ defaultIcon }}
                    </div>
                </div>

                <!-- Titre + message -->
                <div class="px-6 pb-6 text-center">
                    <h3 class="text-lg font-bold text-slate-900 mb-2">
                        {{ title }}
                    </h3>
                    <p v-if="message" class="text-sm text-slate-600">
                        {{ message }}
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex border-t border-slate-100">
                    <button type="button" @click="handleCancel" :disabled="loading"
                        class="flex-1 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        {{ cancelLabel }}
                    </button>

                    <button type="button" @click="handleConfirm" :disabled="loading" :class="confirmButtonClass"
                        class="flex-1 px-4 py-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed border-l border-slate-100">
                        <span v-if="!loading">{{ confirmLabel }}</span>
                        <span v-else>En cours...</span>
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
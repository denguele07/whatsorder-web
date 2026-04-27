<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'
import ConfirmModal from '@/components/ConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const toastsStore = useToastsStore()

const showLogoutConfirm = ref(false)

async function confirmLogout() {
    showLogoutConfirm.value = false
    await authStore.logout()
    toastsStore.info('À bientôt 👋')
    router.push({ name: 'login' })
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-24">
        <!-- Header -->
        <header class="bg-white sticky top-0 z-10">
            <div class="max-w-2xl mx-auto px-4 py-5">
                <h1 class="text-2xl font-bold text-slate-900">
                    Profil
                </h1>
            </div>
        </header>

        <main class="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <!-- Carte user -->
            <div class="bg-white rounded-2xl p-6 text-center">
                <div
                    class="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold mb-3">
                    {{ authStore.user?.name?.[0]?.toUpperCase() }}
                </div>
                <h2 class="text-xl font-bold text-slate-900">
                    {{ authStore.user?.name }}
                </h2>
                <p class="text-sm text-slate-500 mt-1">
                    {{ authStore.user?.email }}
                </p>
            </div>

            <!-- Actions -->
            <div class="bg-white rounded-2xl overflow-hidden">
                <button @click="showLogoutConfirm = true"
                    class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer">
                    <span class="flex items-center gap-3 text-red-600 font-medium">
                        <span class="text-xl">🚪</span>
                        Déconnexion
                    </span>
                    <span class="text-slate-400">›</span>
                </button>
            </div>

            <!-- Footer info -->
            <p class="text-center text-xs text-slate-400 pt-4">
                WhatsOrder — Version 0.1
            </p>
        </main>

        <!-- Modal de déconnexion -->
        <ConfirmModal v-model="showLogoutConfirm" title="Se déconnecter ?"
            message="Vous devrez entrer vos identifiants à nouveau." confirm-label="Déconnexion" variant="default"
            icon="⎋" @confirm="confirmLogout" />
    </div>
</template>
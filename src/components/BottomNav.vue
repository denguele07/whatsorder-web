<script setup>
import { computed } from 'vue'// Importation des fonctions de navigation de Vue Router pour gérer les redirections et accéder à la route actuelle
import { useRouter, useRoute } from 'vue-router'// Importation du store de toasts pour afficher des notifications
import { useToastsStore } from '@/stores/toasts'// Assurez-vous que le chemin d'importation est correct selon votre structure de projet

const router = useRouter()// Accès à la route actuelle pour déterminer quel onglet est actif
const route = useRoute()// Accès au store de toasts pour afficher des notifications lorsque l'utilisateur clique sur un onglet désactivé
const toastsStore = useToastsStore()// Définition des onglets de navigation avec leurs propriétés (clé, label, icône, route cible et état d'activation)

// ONGLETS
const tabs = [
    { key: 'orders', label: 'Commandes', icon: '🛍️', to: '/dashboard', enabled: true },
    { key: 'clients', label: 'Clients', icon: '👥', to: null, enabled: false },
    { key: 'shop', label: 'Boutique', icon: '🏪', to: null, enabled: false },
    { key: 'profile', label: 'Profil', icon: '👤', to: '/profile', enabled: true },
]

// ═════════════════════════════════════════
// DÉTECTER QUEL ONGLET EST ACTIF
// ═════════════════════════════════════════
function isActive(tab) {
    if (tab.key === 'orders') {
        // Actif sur /dashboard ET sur /orders/:reference
        return route.path === '/dashboard' || route.path.startsWith('/orders/')
    }
    if (tab.key === 'profile') {
        return route.path === '/profile'
    }
    return false
}

// ═════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════
function handleClick(tab) {
    if (!tab.enabled) {
        toastsStore.info(`${tab.label} — Bientôt disponible ✨`)
        return
    }
    if (tab.to && route.path !== tab.to) {
        router.push(tab.to)
    }
}
</script>

<template>
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div class="max-w-2xl mx-auto grid grid-cols-4">
            <button v-for="tab in tabs" :key="tab.key" @click="handleClick(tab)"
                class="flex flex-col items-center justify-center py-3 gap-1 cursor-pointer transition-colors" :class="[
                    isActive(tab)
                        ? 'text-emerald-600'
                        : tab.enabled
                            ? 'text-slate-500 hover:text-slate-900'
                            : 'text-slate-300',
                ]">
                <span class="text-xl leading-none">{{ tab.icon }}</span>
                <span class="text-[11px] font-medium">{{ tab.label }}</span>
                <!-- Soulignement si actif -->
                <span v-if="isActive(tab)" class="absolute bottom-0 h-0.5 w-8 bg-emerald-600 rounded-full"></span>
            </button>
        </div>
    </nav>
</template>
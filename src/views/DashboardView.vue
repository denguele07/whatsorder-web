<script setup>
import { onMounted, computed, ref } from 'vue'
import NewOrderModal from '@/components/NewOrderModal.vue'
import { useToastsStore } from '@/stores/toasts'
import StatsCounters from '@/components/StatsCounters.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrdersStore } from '@/stores/orders'
import OrderCard from '@/components/OrderCard.vue'
import { watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const router = useRouter()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
// État de la modal "Nouvelle commande"
const showNewOrderModal = ref(false)

// État du modal de confirmation de suppression
const showDeleteConfirm = ref(false)
const orderToDelete = ref(null)
const isDeleting = ref(false)

// État du modal de confirmation de déconnexion
const showLogoutConfirm = ref(false)

const toastsStore = useToastsStore()// Pour afficher des toasts depuis ce composant : toastsStore.add('Message de toast', 'success')



// ═════════════════════════════════════════
// RECHERCHE
// ═════════════════════════════════════════
const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 400)

// Appelé après 400ms d'inactivité
watch(debouncedSearch, (newValue) => {
    ordersStore.fetchOrders({ search: newValue })
})

// Computed pour savoir si on est en mode recherche
const isSearching = computed(() => searchQuery.value.trim().length > 0)


// ═════════════════════════════════════════
// 
// ═════════════════════════════════════════
onMounted(() => {
    ordersStore.fetchOrders()
})

// ═════════════════════════════════════════
// Sections ordonnées pour l'affichage
// ═════════════════════════════════════════
const sections = [
    { key: 'nouveau', label: 'Nouveau', dotClass: 'bg-orange-400' },
    { key: 'confirme', label: 'Confirmé', dotClass: 'bg-blue-400' },
    { key: 'paye', label: 'Payé', dotClass: 'bg-emerald-500' },
    { key: 'livre', label: 'Livré', dotClass: 'bg-violet-400' },
    { key: 'annule', label: 'Annulé', dotClass: 'bg-slate-400' },
]

// État "replié" par section — nouveau est ouvert par défaut
const collapsedSections = ref({
    nouveau: false,
    confirme: true,
    paye: true,
    livre: true,
    annule: true,
})

function toggleSection(key) {
    collapsedSections.value[key] = !collapsedSections.value[key]
}

// Sections qui ont au moins une commande (pour cacher les vides)
const visibleSections = computed(() =>
    sections.filter((s) => ordersStore.byStatus[s.key]?.length > 0),
)

// Nombre de commandes nouvelles (à traiter)
const toTreatCount = computed(
    () => ordersStore.byStatus.nouveau?.length || 0,
)

// Message dynamique sous le "Bonjour"
const greetingSubtitle = computed(() => {
    const n = toTreatCount.value
    if (n === 0) return 'Aucune commande à traiter 🎉'
    if (n === 1) return '1 commande à traiter aujourd\'hui'
    return `${n} commandes à traiter aujourd'hui`
})

// Actions
function handleLogout() {
    showLogoutConfirm.value = true
}

async function confirmLogout() {
    showLogoutConfirm.value = false
    await authStore.logout()
    toastsStore.info('À bientôt 👋')
    router.push({ name: 'login' })
}

// Faire avancer une commande d'un statut
async function handleAdvance(reference) {
    try {
        await ordersStore.advanceOrder(reference)
        toastsStore.success('Commande mise à jour ✓')
    } catch (error) {
        toastsStore.error('Impossible de faire avancer cette commande.')
        console.error(error)
    }
}

// ═════════════════════════════════════════
// Suppression — flow avec confirmation
// ═════════════════════════════════════════
function handleDelete(reference) {
    orderToDelete.value = reference
    showDeleteConfirm.value = true
}

async function confirmDelete() {
    if (!orderToDelete.value) return
    isDeleting.value = true
    try {
        await ordersStore.deleteOrder(orderToDelete.value)
        showDeleteConfirm.value = false
        orderToDelete.value = null
        toastsStore.success('Commande supprimée')
    } catch (error) {
        console.error(error)
        toastsStore.error('Impossible de supprimer la commande.')
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-24">
        <!-- ═══════════════════════════════════════ -->
        <!-- HEADER                                    -->
        <!-- ═══════════════════════════════════════ -->
        <header class="bg-white sticky top-0 z-10">
            <div class="max-w-2xl mx-auto px-4 py-5 flex items-start justify-between">
                <div class="min-w-0 flex-1">
                    <h1 class="text-2xl font-bold text-slate-900 truncate">
                        Bonjour {{ authStore.user?.name?.split(' ')[0] }} 👋
                    </h1>
                    <p class="text-sm text-slate-500 mt-1">
                        {{ greetingSubtitle }}
                    </p>
                </div>

                <!-- Notifications (statique pour l'instant) -->
                <button
                    class="relative shrink-0 w-10 h-10 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
                    title="Notifications">
                    <span class="text-2xl">🔔</span>
                    <span v-if="toTreatCount > 0"
                        class="absolute top-0 right-0 min-w-18px h-4.5px bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {{ toTreatCount > 9 ? '9+' : toTreatCount }}
                    </span>
                </button>
            </div>
        </header>

        <!-- ═══════════════════════════════════════ -->
        <!-- CONTENU                                   -->
        <!-- ═══════════════════════════════════════ -->
        <main class="max-w-2xl mx-auto px-4 py-6">
            <!-- Search Bar -->
            <div class="relative mb-4">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                    🔍
                </span>
                <input v-model="searchQuery" type="text" placeholder="Rechercher (nom, téléphone, produit...)"
                    class="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
                <button v-if="searchQuery" @click="searchQuery = ''"
                    class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer"
                    aria-label="Effacer">
                    ✕
                </button>
            </div>
            <!-- Bouton "Nouvelle commande" -->
            <button @click="showNewOrderModal = true"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2 mb-6 active:scale-[0.98] cursor-pointer">
                <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-lg leading-none">
                    +
                </span>
                Nouvelle commande
            </button>

            <!-- Stats counters -->
            <StatsCounters class="mb-6" />

            <!-- Loading skeleton -->
            <div v-if="ordersStore.loading" class="space-y-3">
                <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-4 animate-pulse">
                    <div class="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                    <div class="h-3 bg-slate-100 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-slate-100 rounded w-1/3"></div>
                </div>
            </div>

            <!-- Erreur -->
            <div v-else-if="ordersStore.error"
                class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {{ ordersStore.error }}
            </div>

            <!-- Empty state : aucune commande du tout OU aucun résultat de recherche -->
            <div v-else-if="ordersStore.totalCount === 0"
                class="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                <p class="text-4xl mb-3">{{ isSearching ? '🔍' : '📭' }}</p>
                <h2 class="text-lg font-semibold text-slate-900 mb-1">
                    {{ isSearching ? 'Aucun résultat' : 'Aucune commande' }}
                </h2>
                <p class="text-sm text-slate-500">
                    {{ isSearching
                        ? `Rien pour "${searchQuery}". Essayez un autre mot.`
                        : 'Vos commandes apparaîtront ici.' }}
                </p>
            </div>

            <!-- Sections de commandes -->
            <div v-else class="space-y-3">
                <section v-for="section in visibleSections" :key="section.key"
                    class="border-b border-slate-200 pb-3 last:border-b-0">
                    <!-- Header cliquable -->
                    <button @click="toggleSection(section.key)"
                        class="w-full flex items-center justify-between py-3 cursor-pointer hover:opacity-70 transition-opacity">
                        <div class="flex items-center gap-2">
                            <!-- Pastille colorée -->
                            <span :class="section.dotClass" class="w-2.5 h-2.5 rounded-full shrink-0"></span>
                            <h2 class="text-base font-semibold text-slate-900">
                                {{ section.label }} ({{ ordersStore.byStatus[section.key].length }})
                            </h2>
                        </div>

                        <!-- "Voir tout" si déplié + chevron animé -->
                        <div class="flex items-center gap-2 text-slate-400">
                            <span v-if="!collapsedSections[section.key]" class="text-sm text-emerald-600 font-medium">
                                Voir tout
                            </span>
                            <span class="text-lg transition-transform"
                                :class="{ 'rotate-180': !collapsedSections[section.key] }">
                                ⌄
                            </span>
                        </div>
                    </button>

                    <!-- Liste des cards (avec animation de repli) -->
                    <div v-show="!collapsedSections[section.key]" class="space-y-3 mt-3">
                        <OrderCard v-for="order in ordersStore.byStatus[section.key]" :key="order.reference"
                            :order="order" @advance="handleAdvance" @delete="handleDelete" />
                    </div>
                </section>

                <!-- Footer info : compteur total -->
                <div class="text-center text-xs text-slate-400 pt-4">
                    {{ ordersStore.totalCount }} commande(s) au total
                </div>
            </div>
        </main>
        <!-- ═══════════════════════════════════════ -->
        <!-- FAB — Bouton flottant "+"                -->
        <!-- ═══════════════════════════════════════ -->
        <!-- FAB — Bouton flottant "+"                -->
        <button @click="showNewOrderModal = true"
            class="fixed bottom-20 right-4 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl font-light z-20 active:scale-95 cursor-pointer"
            aria-label="Nouvelle commande">
            +
        </button>

        <!-- ═══════════════════════════════════════ -->
        <!-- Modal "Nouvelle commande"                -->
        <!-- ═══════════════════════════════════════ -->
        <NewOrderModal v-model="showNewOrderModal" />

        <!-- ═══════════════════════════════════════ -->
        <!-- Modal de confirmation — Suppression      -->
        <!-- ═══════════════════════════════════════ -->
        <ConfirmModal v-model="showDeleteConfirm" title="Supprimer cette commande ?"
            message="Cette action peut être annulée depuis la corbeille." confirm-label="Supprimer" variant="danger"
            icon="🗑️" :loading="isDeleting" @confirm="confirmDelete" />

        <!-- ═══════════════════════════════════════ -->
        <!-- Modal de confirmation — Déconnexion      -->
        <!-- ═══════════════════════════════════════ -->
        <ConfirmModal v-model="showLogoutConfirm" title="Se déconnecter ?"
            message="Vous devrez entrer vos identifiants à nouveau." confirm-label="Déconnexion" variant="default"
            icon="⎋" @confirm="confirmLogout" />
    </div>
</template>
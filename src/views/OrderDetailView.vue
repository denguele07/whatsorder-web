<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useToastsStore } from '@/stores/toasts'
import ConfirmModal from '@/components/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const toastsStore = useToastsStore()


// ÉTAT

const order = ref(null)
const loading = ref(true)
const error = ref(null)

// Mode édition
const isEditing = ref(false)
const isSaving = ref(false)
const editForm = reactive({
    client_name: '',
    client_phone: '',
    product_description: '',
    amount: '',
    notes: '',
})
const editErrors = ref({})

// Modal de confirmation de suppression
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

// ═════════════════════════════════════════
// COMPUTED
// ═════════════════════════════════════════
const statusBadgeClass = computed(() => {
    if (!order.value?.status) return 'bg-slate-100 text-slate-700'
    const map = {
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-amber-100 text-amber-700',
        emerald: 'bg-emerald-100 text-emerald-700',
        slate: 'bg-slate-100 text-slate-600',
        red: 'bg-red-100 text-red-700',
    }
    return map[order.value.status.color] || 'bg-slate-100 text-slate-700'
})

const formattedDate = computed(() => {
    if (!order.value?.created_at) return ''
    return new Date(order.value.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
})

// ═════════════════════════════════════════
// CHARGEMENT AU MONTAGE
// ═════════════════════════════════════════
onMounted(async () => {
    try {
        const data = await ordersStore.fetchOrder(route.params.reference)
        order.value = data
    } catch (err) {
        error.value = 'Impossible de charger cette commande.'
        console.error(err)
    } finally {
        loading.value = false
    }
})

// ═════════════════════════════════════════
// MODE ÉDITION
// ═════════════════════════════════════════
function startEdit() {
    editForm.client_name = order.value.client_name
    editForm.client_phone = order.value.client_phone
    editForm.product_description = order.value.product_description
    editForm.amount = order.value.amount
    editForm.notes = order.value.notes || ''
    editErrors.value = {}
    isEditing.value = true
}

function cancelEdit() {
    isEditing.value = false
    editErrors.value = {}
}

async function saveEdit() {
    isSaving.value = true
    editErrors.value = {}
    try {
        const updated = await ordersStore.updateOrder(order.value.reference, {
            client_name: editForm.client_name.trim(),
            client_phone: editForm.client_phone.trim(),
            product_description: editForm.product_description.trim(),
            amount: parseInt(editForm.amount, 10),
            notes: editForm.notes.trim() || null,
        })
        order.value = updated
        isEditing.value = false
        toastsStore.success('Commande mise à jour ✓')
    } catch (err) {
        if (err.response?.status === 422) {
            editErrors.value = err.response.data.errors || {}
        } else {
            toastsStore.error('Impossible de sauvegarder.')
        }
    } finally {
        isSaving.value = false
    }
}

// ═════════════════════════════════════════
// ACTIONS
// ═════════════════════════════════════════
async function handleAdvance() {
    try {
        const updated = await ordersStore.advanceOrder(order.value.reference)
        order.value = updated
        toastsStore.success('Commande mise à jour ✓')
    } catch {
        toastsStore.error('Impossible de faire avancer la commande.')
    }
}

function handleWhatsApp() {
    if (order.value?.whatsapp_url) {
        window.open(order.value.whatsapp_url, '_blank')
    }
}

function handleDelete() {
    showDeleteConfirm.value = true
}

async function confirmDelete() {
    isDeleting.value = true
    try {
        await ordersStore.deleteOrder(order.value.reference)
        toastsStore.success('Commande supprimée')
        router.push({ name: 'dashboard' })
    } catch {
        toastsStore.error('Impossible de supprimer.')
    } finally {
        isDeleting.value = false
        showDeleteConfirm.value = false
    }
}

function goBack() {
    router.push({ name: 'dashboard' })
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 pb-12">
        <!-- ═══════════════════════════════════════ -->
        <!-- HEADER                                    -->
        <!-- ═══════════════════════════════════════ -->
        <header class="bg-white shadow-sm sticky top-0 z-10">
            <div class="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
                <button @click="goBack"
                    class="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center transition-colors"
                    title="Retour">
                    ←
                </button>
                <h1 class="text-lg font-bold text-slate-900 truncate flex-1">
                    Détail commande
                </h1>
            </div>
        </header>

        <!-- ═══════════════════════════════════════ -->
        <!-- CONTENU                                   -->
        <!-- ═══════════════════════════════════════ -->
        <main class="max-w-2xl mx-auto px-4 py-6">
            <!-- Loading -->
            <div v-if="loading" class="bg-white rounded-2xl p-8 animate-pulse space-y-4">
                <div class="h-6 bg-slate-200 rounded w-1/2"></div>
                <div class="h-4 bg-slate-100 rounded w-3/4"></div>
                <div class="h-4 bg-slate-100 rounded w-1/3"></div>
                <div class="h-24 bg-slate-100 rounded"></div>
            </div>

            <!-- Erreur -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {{ error }}
            </div>

            <!-- Affichage -->
            <div v-else-if="order && !isEditing" class="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <!-- Référence + statut -->
                <div>
                    <p class="text-xs text-slate-400 font-mono mb-2">
                        {{ order.reference }}
                    </p>
                    <div class="flex items-center gap-2">
                        <span :class="statusBadgeClass" class="px-3 py-1 rounded-full text-sm font-medium">
                            {{ order.status?.emoji }} {{ order.status?.label }}
                        </span>
                    </div>
                </div>

                <hr class="border-slate-100" />

                <!-- Client -->
                <div>
                    <p class="text-xs uppercase text-slate-400 font-semibold tracking-wide mb-2">
                        👤 Client
                    </p>
                    <p class="text-lg font-semibold text-slate-900">{{ order.client_name }}</p>
                    <p class="text-sm text-slate-600 mt-1">📞 {{ order.client_phone }}</p>
                </div>

                <!-- Produit -->
                <div>
                    <p class="text-xs uppercase text-slate-400 font-semibold tracking-wide mb-2">
                        📦 Produit
                    </p>
                    <p class="text-slate-900 whitespace-pre-wrap">{{ order.product_description }}</p>
                </div>

                <!-- Montant -->
                <div>
                    <p class="text-xs uppercase text-slate-400 font-semibold tracking-wide mb-2">
                        💰 Montant
                    </p>
                    <p class="text-2xl font-bold text-slate-900">{{ order.amount_formatted }}</p>
                </div>

                <!-- Notes -->
                <div v-if="order.notes">
                    <p class="text-xs uppercase text-slate-400 font-semibold tracking-wide mb-2">
                        💬 Notes
                    </p>
                    <p class="text-slate-700 italic bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                        {{ order.notes }}
                    </p>
                </div>

                <!-- Date -->
                <div>
                    <p class="text-xs uppercase text-slate-400 font-semibold tracking-wide mb-2">
                        📅 Créé le
                    </p>
                    <p class="text-sm text-slate-600">{{ formattedDate }}</p>
                </div>

                <hr class="border-slate-100" />

                <!-- Actions -->
                <div class="space-y-3 pt-2">
                    <!-- Prochaine action (si non-final) -->
                    <button v-if="!order.status?.is_final" @click="handleAdvance"
                        class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors">
                        {{ order.status?.next_action_label }}
                    </button>

                    <!-- WhatsApp + Modifier -->
                    <div class="grid grid-cols-2 gap-3">
                        <button @click="handleWhatsApp"
                            class="bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            💬 WhatsApp
                        </button>
                        <button @click="startEdit"
                            class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                            ✏️ Modifier
                        </button>
                    </div>

                    <!-- Supprimer -->
                    <button @click="handleDelete"
                        class="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 rounded-xl transition-colors cursor-pointer">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>

            <!-- Édition -->
            <form v-else-if="order && isEditing" @submit.prevent="saveEdit"
                class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <div class="flex items-center gap-2 mb-2">
                    <p class="text-xs text-slate-400 font-mono">{{ order.reference }}</p>
                    <span :class="statusBadgeClass" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ order.status?.emoji }} {{ order.status?.label }}
                    </span>
                </div>

                <!-- Client -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                        Nom du client
                    </label>
                    <input v-model="editForm.client_name" type="text" required :disabled="isSaving"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50" />
                    <p v-if="editErrors.client_name" class="mt-1 text-xs text-red-600">
                        {{ editErrors.client_name[0] }}
                    </p>
                </div>

                <!-- Téléphone -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                        Téléphone
                    </label>
                    <input v-model="editForm.client_phone" type="tel" required :disabled="isSaving"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50" />
                    <p v-if="editErrors.client_phone" class="mt-1 text-xs text-red-600">
                        {{ editErrors.client_phone[0] }}
                    </p>
                </div>

                <!-- Produit -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                        Description du produit
                    </label>
                    <textarea v-model="editForm.product_description" required rows="3" :disabled="isSaving"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 resize-none"></textarea>
                    <p v-if="editErrors.product_description" class="mt-1 text-xs text-red-600">
                        {{ editErrors.product_description[0] }}
                    </p>
                </div>

                <!-- Montant -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                        Montant (FCFA)
                    </label>
                    <input v-model="editForm.amount" type="number" min="0" step="500" required :disabled="isSaving"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50" />
                    <p v-if="editErrors.amount" class="mt-1 text-xs text-red-600">
                        {{ editErrors.amount[0] }}
                    </p>
                </div>

                <!-- Notes -->
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">
                        Notes
                    </label>
                    <textarea v-model="editForm.notes" rows="3" :disabled="isSaving"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 resize-none"></textarea>
                </div>

                <!-- Boutons sticky en bas -->
                <div class="flex gap-3 pt-4">
                    <button type="button" @click="cancelEdit" :disabled="isSaving"
                        class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                        Annuler
                    </button>
                    <button type="submit" :disabled="isSaving"
                        class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                        <span v-if="!isSaving">Enregistrer</span>
                        <span v-else>Enregistrement...</span>
                    </button>
                </div>
            </form>
        </main>

        <!-- Modal de confirmation suppression -->
        <ConfirmModal v-model="showDeleteConfirm" title="Supprimer cette commande ?"
            message="Cette action peut être annulée depuis la corbeille." confirm-label="Supprimer" variant="danger"
            icon="🗑️" :loading="isDeleting" @confirm="confirmDelete" />
    </div>
</template>
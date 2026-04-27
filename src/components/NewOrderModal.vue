<script setup>
import { ref, reactive, watch } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import { useToastsStore } from '@/stores/toasts'

// ═════════════════════════════════════════
// PROPS & EMITS
// ═════════════════════════════════════════
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

// ═════════════════════════════════════════
// ÉTAT DU FORMULAIRE
// ═════════════════════════════════════════
const ordersStore = useOrdersStore()

const toastsStore = useToastsStore()

function initialForm() {
    return {
        client_name: '',
        client_phone: '',
        product_description: '',
        amount: '',
        notes: '',
    }
}

const form = reactive(initialForm())
const errors = ref({})
const isSubmitting = ref(false)

// ═════════════════════════════════════════
// OUVERTURE / FERMETURE
// ═════════════════════════════════════════

// Quand la modal se ferme, on reset le formulaire
watch(
    () => props.modelValue,
    (isOpen) => {
        if (!isOpen) {
            Object.assign(form, initialForm())
            errors.value = {}
        }
    },
)

function close() {
    emit('update:modelValue', false)
}

// ═════════════════════════════════════════
// SOUMISSION
// ═════════════════════════════════════════
async function handleSubmit() {
    errors.value = {}
    isSubmitting.value = true

    try {
        await ordersStore.createOrder({
            client_name: form.client_name.trim(),
            client_phone: form.client_phone.trim(),
            product_description: form.product_description.trim(),
            amount: parseInt(form.amount, 10),
            notes: form.notes.trim() || null,
        })
        close()
        toastsStore.success('Commande créée ✓')  // ← AJOUT ICI
    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors || {}
        } else {
            errors.value = {
                _general: ['Impossible de créer la commande. Réessayez.'],
            }
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <!-- Backdrop + modal -->
    <Transition name="fade">
        <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <!-- Backdrop cliquable -->
            <div class="absolute inset-0 bg-black/50" @click="close"></div>

            <!-- Contenu modal -->
            <div
                class="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                <!-- Header -->
                <div
                    class="sticky top-0 bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-slate-900">
                        Nouvelle commande
                    </h2>
                    <button @click="close"
                        class="w-8 h-8 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                        aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <!-- Formulaire -->
                <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
                    <!-- Erreur générale -->
                    <div v-if="errors._general"
                        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {{ errors._general[0] }}
                    </div>

                    <!-- Nom du client -->
                    <div>
                        <label for="client_name" class="block text-sm font-medium text-slate-700 mb-1">
                            Nom du client <span class="text-red-500">*</span>
                        </label>
                        <input id="client_name" v-model="form.client_name" type="text" required autofocus
                            :disabled="isSubmitting"
                            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                            placeholder="Fatou Koné" />
                        <p v-if="errors.client_name" class="mt-1 text-xs text-red-600">
                            {{ errors.client_name[0] }}
                        </p>
                    </div>

                    <!-- Téléphone -->
                    <div>
                        <label for="client_phone" class="block text-sm font-medium text-slate-700 mb-1">
                            Téléphone <span class="text-red-500">*</span>
                        </label>
                        <input id="client_phone" v-model="form.client_phone" type="tel" required
                            :disabled="isSubmitting"
                            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                            placeholder="+225 07 12 34 56 78" />
                        <p v-if="errors.client_phone" class="mt-1 text-xs text-red-600">
                            {{ errors.client_phone[0] }}
                        </p>
                    </div>

                    <!-- Description produit -->
                    <div>
                        <label for="product_description" class="block text-sm font-medium text-slate-700 mb-1">
                            Description du produit <span class="text-red-500">*</span>
                        </label>
                        <textarea id="product_description" v-model="form.product_description" required rows="3"
                            :disabled="isSubmitting"
                            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 resize-none"
                            placeholder="Robe wax rouge taille M"></textarea>
                        <p v-if="errors.product_description" class="mt-1 text-xs text-red-600">
                            {{ errors.product_description[0] }}
                        </p>
                    </div>

                    <!-- Montant -->
                    <div>
                        <label for="amount" class="block text-sm font-medium text-slate-700 mb-1">
                            Montant (FCFA) <span class="text-red-500">*</span>
                        </label>
                        <input id="amount" v-model="form.amount" type="number" min="0" step="500" required
                            :disabled="isSubmitting"
                            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                            placeholder="15000" />
                        <p v-if="errors.amount" class="mt-1 text-xs text-red-600">
                            {{ errors.amount[0] }}
                        </p>
                    </div>

                    <!-- Notes (optionnel) -->
                    <div>
                        <label for="notes" class="block text-sm font-medium text-slate-700 mb-1">
                            Notes <span class="text-slate-400 font-normal">(optionnel)</span>
                        </label>
                        <textarea id="notes" v-model="form.notes" rows="2" :disabled="isSubmitting"
                            class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 resize-none"
                            placeholder="Livraison Cocody samedi, paiement Wave..."></textarea>
                    </div>

                    <!-- Boutons -->
                    <div class="flex gap-3 pt-4">
                        <button type="button" @click="close" :disabled="isSubmitting"
                            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                            Annuler
                        </button>
                        <button type="submit" :disabled="isSubmitting"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                            <span v-if="!isSubmitting">Créer</span>
                            <span v-else>Création...</span>
                        </button>
                    </div>
                </form>
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
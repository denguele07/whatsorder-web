<script setup>
import { ref, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'

const router = useRouter()
const authStore = useAuthStore()
const toastsStore = useToastsStore()

// ═════════════════════════════════════════
// ÉTAT DU FORMULAIRE
// ═════════════════════════════════════════
const form = reactive({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
})

const errors = ref({})
const errorMessage = ref('')
const isSubmitting = ref(false)

// ═════════════════════════════════════════
// SOUMISSION
// ═════════════════════════════════════════
async function handleSubmit() {
    errors.value = {}
    errorMessage.value = ''
    isSubmitting.value = true

    try {
        await authStore.register({
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            password_confirmation: form.password_confirmation,
        })

        toastsStore.success(`Bienvenue ${authStore.user.name.split(' ')[0]} ! 🎉`)
        router.push({ name: 'dashboard' })
    } catch (error) {
        if (error.response?.status === 422) {
            errors.value = error.response.data.errors || {}
        } else if (error.response?.status === 419) {
            errorMessage.value = 'Session expirée. Rechargez la page.'
        } else {
            errorMessage.value = 'Impossible de créer le compte. Vérifiez votre connexion.'
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo / titre -->
            <div class="text-center mb-8">
                <div
                    class="w-16 h-16 mx-auto bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-4">
                    🛍️
                </div>
                <h1 class="text-2xl font-bold text-slate-900">
                    Créer un compte
                </h1>
                <p class="text-sm text-slate-500 mt-1">
                    Commence à organiser tes commandes
                </p>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                <!-- Erreur générale -->
                <div v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {{ errorMessage }}
                </div>

                <!-- Nom complet -->
                <div>
                    <label for="name" class="block text-sm font-medium text-slate-700 mb-1">
                        Nom complet
                    </label>
                    <input id="name" v-model="form.name" type="text" required autofocus :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        placeholder="Awa Koffi" />
                    <p v-if="errors.name" class="mt-1 text-xs text-red-600">
                        {{ errors.name[0] }}
                    </p>
                </div>

                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
                        Email
                    </label>
                    <input id="email" v-model="form.email" type="email" required :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        placeholder="awa@example.com" />
                    <p v-if="errors.email" class="mt-1 text-xs text-red-600">
                        {{ errors.email[0] }}
                    </p>
                </div>

                <!-- Mot de passe -->
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
                        Mot de passe
                    </label>
                    <input id="password" v-model="form.password" type="password" required :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        placeholder="Au moins 8 caractères" />
                    <p v-if="errors.password" class="mt-1 text-xs text-red-600">
                        {{ errors.password[0] }}
                    </p>
                </div>

                <!-- Confirmation mot de passe -->
                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-slate-700 mb-1">
                        Confirmer le mot de passe
                    </label>
                    <input id="password_confirmation" v-model="form.password_confirmation" type="password" required
                        :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50"
                        placeholder="Retape ton mot de passe" />
                </div>

                <!-- Bouton submit -->
                <button type="submit" :disabled="isSubmitting"
                    class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                    <span v-if="!isSubmitting">S'inscrire</span>
                    <span v-else>Création...</span>
                </button>
            </form>

            <!-- Lien vers login -->
            <p class="text-center text-sm text-slate-600 mt-6">
                Déjà un compte ?
                <RouterLink :to="{ name: 'login' }" class="text-emerald-600 font-semibold hover:underline">
                    Se connecter
                </RouterLink>
            </p>
        </div>
    </div>
</template>
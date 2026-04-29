<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastsStore } from '@/stores/toasts'
import { RouterLink } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()
const toastsStore = useToastsStore()


// État local du formulaire

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)


// Soumission du formulaire

async function handleSubmit() {
    // Reset de l'erreur précédente
    errorMessage.value = ''
    isSubmitting.value = true

    try {
        await authStore.login({
            email:email.value,
            password:password.value,
        })
        router.push({ name: 'dashboard' })
        toastsStore.success(`Bienvenue ${authStore.user.name.split(' ')[0]} 👋`)
    } catch (error) {
        // Extraire le message d'erreur de Laravel
        if (error.response?.status === 422) {
            const errors = error.response.data.errors
            errorMessage.value =
                errors?.email?.[0] ||
                errors?.password?.[0] ||
                'Identifiants invalides.'
        } else if (error.response?.status === 419) {
            errorMessage.value = 'Session expirée, veuillez réessayer.'
        } else {
            errorMessage.value = 'Impossible de se connecter. Vérifiez votre connexion.'
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <!-- En-tête -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-slate-900">
                    WhatsOrder
                </h1>
                <p class="text-slate-500 text-sm mt-2">
                    Connectez-vous à votre espace
                </p>
            </div>

            <!-- Formulaire -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700 mb-1">
                        Email
                    </label>
                    <input id="email" v-model="email" type="email" required autocomplete="email" autofocus
                        :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="awa@whatsorder.ci" />
                </div>

                <!-- Password -->
                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700 mb-1">
                        Mot de passe
                    </label>
                    <input id="password" v-model="password" type="password" required autocomplete="current-password"
                        :disabled="isSubmitting"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="••••••••" />
                </div>

                <!-- Message d'erreur -->
                <div v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {{ errorMessage }}
                </div>

                <!-- Bouton submit -->
                <button type="submit" :disabled="isSubmitting"
                    class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors mt-6">
                    <span v-if="!isSubmitting">Se connecter</span>
                    <span v-else>Connexion en cours...</span>
                </button>
            </form>

            <!-- Lien vers register -->
            <p class="text-center text-sm text-slate-600 mt-6">
                Pas encore de compte ?
                <RouterLink :to="{ name: 'register' }" class="text-emerald-600 font-semibold hover:underline">
                    Créer un compte
                </RouterLink>
            </p>
        </div>
    </div>
</template>
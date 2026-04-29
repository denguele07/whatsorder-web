import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {

    // ═══════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════

    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
    const token = ref(localStorage.getItem('token'))
    const loading = ref(false)
    const error = ref(null)

    // ═══════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════

    const isAuthenticated = computed(() => !!user.value && !!token.value)

    // ═══════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════

    /**
     * Connexion utilisateur
     */
    async function login(credentials) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/api/v1/auth/login', credentials)

            // Stocker user + token
            user.value = response.data.user
            token.value = response.data.token

            // Persister dans localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('token', response.data.token)

            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Erreur de connexion'
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Inscription utilisateur (auto-login après)
     */
    async function register(payload) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/api/v1/auth/register', payload)

            user.value = response.data.user
            token.value = response.data.token

            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('token', response.data.token)

            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Erreur d\'inscription'
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Vérifier si le token est encore valide en récupérant l'user
     */
    async function fetchUser() {
        if (!token.value) {
            user.value = null
            return false
        }

        loading.value = true
        try {
            const response = await api.get('/api/v1/user')
            user.value = response.data
            localStorage.setItem('user', JSON.stringify(response.data))
            return true
        } catch {
            // Token invalide, on nettoie tout
            user.value = null
            token.value = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            return false
        } finally {
            loading.value = false
        }
    }

    /**
     * Déconnexion
     */
    async function logout() {
        try {
            await api.post('/api/v1/auth/logout')
        } catch (err) {
            // Ignorer erreurs (token déjà invalidé par exemple)
        } finally {
            user.value = null
            token.value = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        fetchUser,
        logout,
    }
})
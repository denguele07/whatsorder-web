import { defineStore } from 'pinia'// Importation de la fonction defineStore pour créer un store Pinia
import { ref, computed } from 'vue'// Importation de ref et computed pour gérer les états réactifs et les propriétés calculées
import api from '@/api/axios' // Importation de l'instance axios pré-configurée pour les requêtes API

export const useAuthStore = defineStore('auth', () => {// Définition du store d'authentification avec un nom unique 'auth'

    // STATE(etats) : les données réactives du store
    const user = ref(null)// Stocke les informations de l'utilisateur connecter ou null si aucun utilisateur n'est connecter
    const token = ref(localStorage.getItem('auth_token'))// Stocke le token d'authentification, initialisé à partir du localStorage pour persister entre les sessions
    const loading = ref(false)// Indique si une requete d'authentification est en cours pour afficher un indicateur de chargement dans l'interface utilisateur

    // GETTERS(propriétés calculées) : les données dérivées du state

    const isAuthenticated = computed(() => user.value !== null)// Propriété calculée qui retourne true si un utilisateur est connecté (user n'est pas null), sinon false

    // HELPERS(fonctions utilitaires) : fonctions internes pour gérer le token et les requêtes API

    /**
     * Stocke le token en mémoire + localStorage + headers Axios.
     */
    function setToken(newToken) {// Fonction pour mettre à jour le token d'authentification dans le state, le localStorage et les headers d'axios
        token.value = newToken// Met a jour le token dans le state reactif
        if (newToken) {// Si un nouveau token est fourni, on le stocke dans le localStorage et on l'ajoute aux headers d'axios pour les requêtes futures
            localStorage.setItem('auth_token', newToken)// Stocke le token dans le localStorage pour persister entre les sessions
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`// Ajoute le token aux headers d'axios pour l'authentification des requêtes API
        } else {
            localStorage.removeItem('auth_token')// Si le token est null, on le supprime du localStorage et des headers d'axios
            delete api.defaults.headers.common['Authorization']// Supprime le header d'Authorization d'axios pour éviter d'envoyer un token invalide avec les requêtes API
        }
    }

    /**
     * Si un token existe déjà en localStorage au boot de l'app,
     * on l'attache aux headers Axios dès le départ.
     */
    if (token.value) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }

    // ACTIONS(fonctions métier) : les fonctions qui effectuent des actions, souvent asynchrones, et qui modifient le state

    async function getCsrfCookie() {// Fonction pour obtenir le cookie CSRF nécessaire pour les requêtes d'authentification avec Laravel Sanctum
        await api.get('/sanctum/csrf-cookie')// Effectue une requête GET pour obtenir le cookie CSRF, qui sera automatiquement géré par axios grâce à la configuration withXSRFToken et xsrfCookieName
    }

    //CONNECTION : envoie les identifiants de l'utilisateur pour tenter de se connecter, stocke le token et les informations de l'utilisateur en cas de succès

    async function login(email, password) {
        loading.value = true// Indique que la requete de login est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        try {
            await getCsrfCookie()// Avant de tenter de se connecter, on s'assure d'avoir le cookie CSRF nécessaire pour les requêtes POST avec Laravel Sanctum
            const { data } = await api.post('/api/v1/auth/login', {// Envoie une requete POST à l'endpoint de login avec les identifiants de l'utilisateur
                email,
                password,
            })
            user.value = data.user// Stocke les informations de l'utilisateur connecté dans le state
            setToken(data.token) // ← on stocke le token
            return true// Retourne true pour indiquer que la connexion a réussi
        } finally {
            loading.value = false// Indique que la requete de login est terminée, que ce soit un succès ou une erreur, pour masquer l'indicateur de chargement dans l'interface utilisateur
        }
    }

    /**
   * Inscription d'un nouvel utilisateur.
   * Retourne un token, donc l'user est auto-connecté.
   */
    async function register(payload) {
        loading.value = true// Indique que la requete d'inscription est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        try {
            const { data } = await api.post('/api/v1/auth/register', payload)// Envoie une requete POST à l'endpoint de register avec les données d'inscription de l'utilisateur (payload contient généralement le nom, l'email, le mot de passe, etc.)

            // Même pattern que login : trio token persistant
            user.value = data.user// Stocke les informations de l'utilisateur nouvellement inscrit dans le state
            setToken(data.token)// Stocke le token d'authentification retourné par l'API pour connecter automatiquement l'utilisateur après l'inscription

            return data.user// Retourne les informations de l'utilisateur nouvellement inscrit pour que le composant puisse les utiliser (par exemple, pour afficher un message de bienvenue ou rediriger vers une page spécifique)
        } catch (error) {
            console.error(error)// Affiche l'erreur dans la console pour le développement, mais on laisse les composants gérer les erreurs pour afficher des messages d'erreur appropriés à l'utilisateur
            throw error// Rejette l'erreur pour que les composants puissent la gérer (par exemple, afficher un message d'erreur à l'utilisateur)
        } finally {
            loading.value = false// Indique que la requete d'inscription est terminée, que ce soit un succès ou une erreur, pour masquer l'indicateur de chargement dans l'interface utilisateur
        }
    }

    //FETCH USER : vérifie si le token est valide en essayant de récupérer les informations de l'utilisateur connecté, sinon on nettoie le token et on considère que l'utilisateur n'est pas connecté

    async function fetchUser() {
        // Pas de token ? Inutile d'essayer
        if (!token.value) {
            user.value = null
            return false
        }

        loading.value = true// Indique que la requete de récupération des informations de l'utilisateur est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        try {
            const { data } = await api.get('/api/v1/user')// Envoie une requete GET à l'endpoint de récupération des informations de l'utilisateur connecté pour vérifier si le token est valide et obtenir les données de l'utilisateur
            user.value = data// Stocke les informations de l'utilisateur dans le state
            return true// Retourne true pour indiquer que la récupération des informations de l'utilisateur a réussi et que le token est valide
        } catch {
            user.value = null// Si une erreur se produit (par exemple, token invalide ou expiré), on considère que l'utilisateur n'est pas connecté
            setToken(null) // ← on nettoie le token invalide
            return false
        } finally {
            loading.value = false
        }
    }

    //LOGOUT : envoie une requete pour se déconnecter, puis nettoie le token et les informations de l'utilisateur dans le state

    async function logout() {
        loading.value = true// Indique que la requete de logout est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        try {
            await api.post('/api/v1/auth/logout')// Envoie une requete POST à l'endpoint de logout pour déconnecter l'utilisateur côté serveur (par exemple, pour invalider le token ou supprimer la session)
        } catch {
            // Ignorer les erreurs
        } finally {
            user.value = null
            setToken(null) // ← on supprime le token
            loading.value = false
        }
    }

    // On retourne les états, les propriétés calculées et les actions pour qu'ils soient accessibles dans les composants qui utilisent ce store
    return {
        user,// Les informations de l'utilisateur connecter
        token,// le token d'authentification pour les requetes API
        loading,// Indique si une requete d'authentification est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        isAuthenticated,// Propriété calculée qui retourne true si un utilisateur est connecté, sinon false
        login,// Fontion pour se connecter avec les identifiants de l'utilisateur, stocker le token et les informations de l'utilisateur en cas de succes
        register,// Fonction pour s'inscrire avec les données d'inscription de l'utilisateur, stocker le token et les informations de l'utilisateur en cas de succès
        logout,// Fonction pour se déconnecter, nettoyer le token et les informations de l'utilisateur dans le state
        fetchUser,// Fonction pour vérifier si le token est valide en essayant de récupérer les informations de l'utilisateur connecté, sinon nettoyer le token et considérer que l'utilisateur n'est pas connecté
    }
})
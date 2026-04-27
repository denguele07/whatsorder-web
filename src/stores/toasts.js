import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastsStore = defineStore('toasts', () => {
    // ═════════════════════════════════════════
    // STATE
    // ═════════════════════════════════════════
    const toasts = ref([])

    // ═════════════════════════════════════════
    // ACTIONS
    // ═════════════════════════════════════════

    /**
     * Ajoute un toast. Disparaît automatiquement après `duration` ms.
     *
     * @param {Object} options
     * @param {string} options.message - Texte du toast
     * @param {'success'|'error'|'info'} options.type - Type visuel
     * @param {number} options.duration - Durée avant disparition (défaut 3500ms)
     */
    function add({ message, type = 'info', duration = 3500 }) {// Prend en paramètre un objet d'options pour ajouter un nouveau toast avec un message, un type visuel (success, error, info) et une durée avant disparition (par défaut 3500ms)
        const id = Date.now() + Math.random()// Génère un ID unique pour le toast en combinant le timestamp actuel et un nombre aléatoire pour éviter les collisions d'ID
        toasts.value.push({ id, message, type })// Ajoute le nouveau toast à la liste des toasts dans le state pour qu'il soit réactif et puisse être affiché dans l'interface utilisateur

        // Auto-remove après la durée
        setTimeout(() => {
            remove(id)
        }, duration)

        return id
    }

    // Supprime un toast par ID
    function remove(id) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    // ═════════════════════════════════════════
    // HELPERS — raccourcis
    // ═════════════════════════════════════════
    function success(message, duration) {
        return add({ message, type: 'success', duration })// Raccourci pour ajouter un toast de type "success" avec un message et une durée optionnelle
    }

    function error(message, duration) {
        return add({ message, type: 'error', duration: duration ?? 5000 })// Raccourci pour ajouter un toast de type "error" avec un message et une durée optionnelle (par défaut 5000ms pour les erreurs)
    }

    function info(message, duration) {
        return add({ message, type: 'info', duration })//Raccourci pour ajouter un toast de type "info" avec un message et une durée optionnelle
    }

    return {
        toasts,
        add,
        remove,
        success,
        error,
        info,
    }
})
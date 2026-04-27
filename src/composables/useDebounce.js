import { ref, watch } from 'vue'

/**
 * Retourne un ref dont la valeur est mise à jour
 * uniquement après `delay` ms d'inactivité.
 *
 * @param {Ref} source - Le ref source à surveiller
 * @param {number} delay - Le délai en ms (défaut 400)
 * @returns {Ref} - Un ref avec la valeur "debouncée"
 */
export function useDebounce(source, delay = 400) {// Définir un ref pour stocker la valeur "debouncée"
    const debounced = ref(source.value)// Initialiser le ref avec la valeur actuelle du source

    let timeoutId = null// Stocker l'ID du timeout pour pouvoir le nettoyer

    // Surveiller les changements du ref source

    watch(source, (newValue) => {// À chaque changement, réinitialiser le timeout
        if (timeoutId) clearTimeout(timeoutId)// Nettoyer le timeout précédent
        timeoutId = setTimeout(() => {// Après le délai, mettre à jour la valeur "debouncée"
            debounced.value = newValue// Mettre à jour la valeur du ref "debouncée"
        }, delay)
    })

    return debounced// Retourner le ref "debouncée"
}
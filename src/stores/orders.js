import { defineStore } from 'pinia'// Importation de la fonction defineStore pour créer un store Pinia
import { ref, computed } from 'vue'// Importation de ref et computed pour gérer les états réactifs et les propriétés calculées
import api from '@/api/axios'// Importation de l'instance axios pré-configurée pour les requêtes API

export const useOrdersStore = defineStore('orders', () => {// Définition du store de gestion des commandes avec un nom unique 'orders'

    // STATE

    const orders = ref([])// Stocke la liste des commandes de l'utilisateur connecté, initialisée à un tableau vide
    const loading = ref(false)// Indique si une requete de chargement des commandes est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
    const error = ref(null)// Stocke les erreurs liées aux opérations sur les commandes pour afficher des messages d'erreur appropriés à l'utilisateur

    // ═════════════════════════════════════════
    // GETTERS — commandes groupées par statut
    // ═════════════════════════════════════════
    const byStatus = computed(() => {// Propriété calculée qui retourne les commandes groupées par statut pour faciliter l'affichage dans l'interface utilisateur (par exemple, dans des onglets ou des sections)
        const groups = {
            nouveau: [],
            confirme: [],
            paye: [],
            livre: [],
            annule: [],
        }
        for (const order of orders.value) {// Parcourt la liste des commandes et les classe dans les groupes correspondants en fonction de leur statut
            const status = order.status?.value// Accède au statut de la commande (en supposant que c'est un objet avec une propriété 'value' qui contient le nom du statut)
            if (groups[status]) {// Si le statut de la commande correspond à l'un des groupes définis, on ajoute la commande à ce groupe
                groups[status].push(order)// Ajoute la commande au groupe correspondant à son statut
            }
        }
        return groups// Retourne les commandes groupées par statut
    })

    const totalCount = computed(() => orders.value.length)// Propriété calculée qui retourne le nombre total de commandes pour afficher un compteur dans l'interface utilisateur

    const totalConfirmed = computed(() => byStatus.value.confirme.length)// Propriété calculée qui retourne le nombre de commandes confirmées pour afficher un compteur dans l'interface utilisateur

    const totalPaid = computed(() => byStatus.value.paye.length)// Propriété calculée qui retourne le nombre de commandes payées pour afficher un compteur dans l'interface utilisateur

    const totalToDeliver = computed(() => byStatus.value.paye.length)// Propriété calculée qui retourne le nombre de commandes à livrer (payées mais pas encore livrées) pour afficher un compteur dans l'interface utilisateur

    // Stats pour le dashboard
    const stats = computed(() => ({
        total: totalCount,// Nombre tatal de commandes
        toConfirm: totalConfirmed,// Nombre de commandes "Nouveau" en attente de confirmation
        paid: totalPaid,// Nombre de commandes "Payé"
        toDeliver: totalToDeliver, // = "Payé" en attente de livraison
    }))

    // ACTIONS

    /**
     * Récupère la liste des commandes de l'utilisateur connecté avec des filtres optionnels (recherche, statut).
     */
    async function fetchOrders(filters = {}) {// Prend en paramètre un objet de filtres optionnels pour affiner la recherche des commandes (par exemple, par statut ou par terme de recherche)
        loading.value = true// Indique que le chargement des commandes est en cours pour afficher un indicateur de chargement dans l'interface utilisateur
        error.value = null// Réinitialise les erreurs avant de tenter de charger les commandes pour éviter d'afficher des messages d'erreur obsolètes
        try {
            const params = { per_page: 100 }// Définit les paramètres de la requete pour récupérer jusqu'à 100 commandes (ajustable selon les besoins)
            if (filters.search) {// Si un terme de recherche est fourni dans les filtres, on l'ajoute aux parametres de la requete pour filtrer les commandes coter serveur
                params.search = filters.search// Ajoute le terme de recherche aux paramètres de la requete pour filtrer les commandes côté serveur en fonction de ce terme (par exemple, par nom de client, référence de commande, etc.)
            }
            if (filters.status) {// Si un statut est fourni dans les filtres, on l'ajoute aux parametres de la requete pour filtrer les commandes coter serveur
                params.status = filters.status// Ajoute le statut aux paramètres de la requete pour filtrer les commandes côté serveur en fonction de ce statut (par exemple, "Nouveau", "Confirmé", "Payé", etc.)
            }
            const { data } = await api.get('/api/v1/orders', { params })// Envoie une requete GET à l'endpoint de récupération des commandes avec les paramètres de filtrage pour obtenir la liste des commandes correspondant aux critères spécifiés
            orders.value = data.data// Met à jour le state avec la liste des commandes récupérées pour que l'interface utilisateur puisse les afficher de manière réactive
        } catch (err) {
            error.value = 'Impossible de charger les commandes.'// En cas d'erreur lors du chargement des commandes, on met à jour le state des erreurs avec un message approprié pour informer l'utilisateur
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    /**
   * Crée une nouvelle commande.
   * Ajoute la commande retournée en haut de la liste.
   */
    async function createOrder(payload) {// Prend en paramètre les données de la nouvelle commande à créer (payload contient généralement les détails de la commande comme les produits, quantités, etc.)
        try {
            const { data } = await api.post('/api/v1/orders', payload)// Envoie une requete POST à l'endpoint de création de commande avec les données de la nouvelle commande
            orders.value.unshift(data.data)// Ajoute la nouvelle commande retournée par l'API en haut de la liste des commandes dans le state pour qu'elle soit réactive et puisse être affichée immédiatement dans l'interface utilisateur
            return data.data// Retourne les informations de la commande nouvellement créée pour que le composant puisse les utiliser (par exemple, pour afficher un message de confirmation ou rediriger vers la page de détails de la commande)
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    /**
   * Récupère une commande spécifique par sa référence.
   */
    async function fetchOrder(reference) {// Prend en paramètre la référence de la commande à récupérer (généralement un identifiant unique ou un numéro de commande)
        try {
            const { data } = await api.get(`/api/v1/orders/${reference}`)// Envoie une requete GET à l'endpoint de récupération d'une commande spécifique en utilisant sa référence pour obtenir les détails de cette commande
            return data.data// Retourne les informations de la commande récupérée pour que le composant puisse les utiliser (par exemple, pour afficher les détails de la commande dans une page dédiée)
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    /**
     * Met à jour une commande existante (par référence).
     */
    async function updateOrder(reference, payload) {// Prend en paramètre la référence de la commande à mettre à jour et les données à mettre à jour (payload contient généralement les champs de la commande à modifier, comme les produits, quantités, etc.)
        try {
            const { data } = await api.patch(`/api/v1/orders/${reference}`, payload)// Envoie une requete PATCH à l'endpoint de mise à jour d'une commande spécifique en utilisant sa référence et les données à mettre à jour pour modifier les détails de cette commande
            // Sync le tableau local
            const index = orders.value.findIndex((o) => o.reference === reference)// Trouve l'index de la commande mise à jour dans le tableau local des commandes en utilisant sa référence
            if (index !== -1) {// Si la commande existe dans le tableau local, on met à jour ses informations avec les données retournées par l'API pour que le state soit réactif et que les changements soient reflétés immédiatement dans l'interface utilisateur
                orders.value[index] = data.data// Met à jour la commande dans le tableau local avec les nouvelles données retournées par l'API
            }
            return data.data// Retourne les informations de la commande mise à jour pour que le composant puisse les utiliser (par exemple, pour afficher un message de confirmation ou mettre à jour les détails de la commande affichés dans l'interface utilisateur)
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    /**
     * Avance une commande au statut suivant.
     */
    async function advanceOrder(reference) {// Prend en paramètre la référence de la commande à faire avancer au statut suivant
        try {
            const { data } = await api.post(`/api/v1/orders/${reference}/advance`)// Envoie une requete POST à l'endpoint d'avancement de commande en utilisant sa référence pour faire avancer cette commande au statut suivant (par exemple, de "Nouveau" à "Confirmé", puis à "Payé", etc.)
            // Mettre à jour la commande dans le tableau local
            const index = orders.value.findIndex((o) => o.reference === reference)// Trouve l'index de la commande avancée dans le tableau local des commandes en utilisant sa référence
            if (index !== -1) {// Si la commande existe dans le tableau local, on met à jour ses informations avec les données retournées par l'API pour que le state soit réactif et que les changements soient reflétés immédiatement dans l'interface utilisateur
                orders.value[index] = data.data// Met à jour la commande dans le tableau local avec les nouvelles données retournées par l'API
            }
            return data.data// Retourne les informations de la commande avancée pour que le composant puisse les utiliser (par exemple, pour afficher un message de confirmation ou mettre à jour les détails de la commande affichés dans l'interface utilisateur)
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    /**
     * Supprime une commande (soft delete côté back).
     */
    async function deleteOrder(reference) {// Prend en paramètre la référence de la commande à supprimer
        try {
            await api.delete(`/api/v1/orders/${reference}`)// Envoie une requete DELETE à l'endpoint de suppression de commande en utilisant sa référence pour supprimer cette commande (soft delete côté back, donc elle ne sera plus retournée dans les listes de commandes actives)
            // Retirer la commande du tableau local
            orders.value = orders.value.filter((o) => o.reference !== reference)// Met à jour le tableau local des commandes en filtrant pour retirer la commande supprimée en utilisant sa référence, ce qui met à jour le state de manière réactive et reflète immédiatement les changements dans l'interface utilisateur
        } catch (err) {
            console.error(err)
            throw err
        }
    }

    return {
        orders,
        loading,
        error,
        byStatus,
        totalCount,
        stats,
        fetchOrders,
        fetchOrder,
        createOrder,
        updateOrder,
        advanceOrder,
        deleteOrder,
    }
})
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Redirige la racine vers le dashboard
  {
    path: '/',
    redirect: '/dashboard',
  },
  // Route pour la page de connexion, accessible uniquement aux invites (non-authentifiés)
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),// Charge le composant de la page de connexion de manière asynchrone pour optimiser le chargement initial de l'application
    meta: { guest: true },// Ajoute une meta propriété "guest" pour indiquer que cette route est réservée aux utilisateurs non-authentifiés, ce qui sera utilisé dans le guard global pour rediriger les utilisateurs déjà connectés vers le dashboard
  },
  // Route pour la page d'inscription, accessible uniquement aux invites (non-authentifies)
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),// Charge le composant de la page de d'inscription de manière asynchrone pour optimiser le chargement initial de l'application
    meta: { guest: true },// Ajoute une meta propriété "guest" pour indiquer que cette route est réservée aux utilisateurs non-authentifiés, ce qui sera utilisé dans le guard global pour rediriger les utilisateurs déjà connectés vers le dashboard
  },
  // Route pour la page de profil, accessible uniquement aux utilisateurs authentifiers
  {
  path: '/profile',
  name: 'profile',
  component: () => import('@/views/ProfileView.vue'),// Charge le composant de la page de profile de manière asynchrone pour optimiser le chargement initial de l'application
  meta: { requiresAuth: true },// Ajoute une meta propriété "requiresAuth" pour indiquer que cette route nécessite une authentification, ce qui sera utilisé dans le guard global pour rediriger les utilisateurs non-connectés vers la page de connexion
},
// Route pour la page de dashboard, accessible uniquement aux utilisateurs authentifiers
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),// Charge le composant de la page dashboard de manière asynchrone pour optimiser le chargement initial de l'application
    meta: { requiresAuth: true },// Ajoute une meta propriété "requiresAuth" pour indiquer que cette route nécessite une authentification, ce qui sera utilisé dans le guard global pour rediriger les utilisateurs non-connectés vers la page de connexion
  },
  // Route pour la page de detail d'une commande, accessible uniquement aux utilisateurs authentifiers
  {
    path: '/orders/:reference',// Définit une route dynamique pour la page de détail d'une commande en utilisant un paramètre de route ":reference" qui correspond à la référence unique de la commande, ce qui permet d'afficher les détails spécifiques de chaque commande en fonction de sa référence
    name: 'order-detail',
    component: () => import('@/views/OrderDetailView.vue'),// Charge le composant de la page de détail d'une commande de manière asynchrone pour optimiser le chargement initial de l'application
    meta: { requiresAuth: true },// Ajoute une meta propriété "requiresAuth" pour indiquer que cette route nécessite une authentification, ce qui sera utilisé dans le guard global pour rediriger les utilisateurs non-connectés vers la page de connexion
  },
  // Route pour la page de gestion des restaurants, accessible uniquement aux utilisateurs authentifirs
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),// Charge le composant de la page 404 Not Found de manière asynchrone pour optimiser le chargement initial de l'application et afficher une page d'erreur personnalisée pour les routes non définies
  },
]

// Création du routeur avec l'historique de navigation basé sur l'API History du navigateur pour une navigation fluide sans rechargement de page
const router = createRouter({
  history: createWebHistory(),
  routes,// Utilise la configuration des routes définie ci-dessus pour le routeur
})

/**
 * Guard global : exécuté avant chaque navigation.
 *
 * Au premier lancement de l'app, on tente de restaurer la session
 * via le cookie httpOnly. Si ça échoue, user reste null et on
 * redirige vers /login si nécessaire.
 */
let authChecked = false// Variable pour s'assurer que la vérification de l'authentification n'est effectuée qu'une seule fois au lancement de l'application, ce qui évite des appels redondants à l'API pour vérifier le token d'authentification à chaque navigation

// Guard global pour protéger les routes qui nécessitent une authentification et rediriger les utilisateurs en fonction de leur état d'authentification
router.beforeEach(async (to) => {
  const authStore = useAuthStore()// Accède au store d'authentification pour vérifier l'état de l'utilisateur et effectuer les actions nécessaires en fonction des routes visitées

  // Au premier appel seulement : on tente de restaurer la session
  if (!authChecked) {
    await authStore.fetchUser()// Tente de récupérer les informations de l'utilisateur connecté en vérifiant le token d'authentification stocké (par exemple, dans un cookie httpOnly) pour restaurer la session de l'utilisateur au lancement de l'application, ce qui permet de maintenir l'état de connexion même après un rafraîchissement de la page
    authChecked = true// Marque la vérification de l'authentification comme effectuée pour éviter de refaire cette vérification à chaque navigation, ce qui optimise les performances en réduisant les appels redondants à l'API pour vérifier le token d'authentification
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {// Si la route nécessite une authentification et que l'utilisateur n'est pas connecté, redirige vers la page de connexion
    return { name: 'login' }
  }

  if (to.meta.guest && authStore.isAuthenticated) {// Si la route est réservée aux invités (non-authentifiés) et que l'utilisateur est déjà connecté, redirige vers le dashboard
    return { name: 'dashboard' }
  }
})

export default router// Exporte le routeur pour qu'il puisse être utilisé dans l'application Vue, notamment dans le fichier main.js pour être intégré à l'instance de l'application Vue et permettre la navigation entre les différentes pages définies dans les routes
import axios from 'axios'// Importation de la bibliothèque axios pour les requêtes HTTP

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',// URL de base pour les requetes API
  withCredentials: true,// Permet d'envoyer les cookies avec les requetes pour l'autentification
  withXSRFToken: true,// Permet d'envoyer le token CSRF pour les requetes POST, PUT, DELETE
  xsrfCookieName: 'XSRF-TOKEN',// Nom du cookie qui contient le token CSRF
  xsrfHeaderName: 'X-XSRF-TOKEN',// Nom de l'en-tete qui contient le token CSRF
  headers: {// En-tete par defaut pour toutes les requetes
    Accept: 'application/json',// Indique que le client accepte les reponses au format JSON
    'X-Requested-With': 'XMLHttpRequest',// Indeique que la requete est faite via AJAX
  },
})

/**
 * Intercepteur de réponse :
 * - On PASSE les erreurs aux composants/stores pour qu'ils gèrent
 * - PAS de redirection brutale ici
 * - Le router guard et les composants savent mieux quoi faire
 */
api.interceptors.response.use(
  (response) => response,// Si la reponse est un succes, on la retourne telle quelle
  (error) => Promise.reject(error),// Si la reponse est une erreur, on la rejette pour que les composants/stores puissent la gerer
)

export default api// Exportation de l'instance axios pour l'utiliser dans les autres fichiers de l'application
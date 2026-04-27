import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)// Crée une nouvelle instance de l'application Vue en utilisant le composant racine App.vue, qui servira de point d'entrée pour l'ensemble de l'application et contiendra la structure globale de l'interface utilisateur

app.use(createPinia())// Intègre Pinia comme système de gestion d'état global pour l'application, ce qui permet de créer des stores réactifs et de les utiliser dans les composants pour gérer l'état de manière centralisée et efficace
app.use(router)// Intègre le routeur Vue Router dans l'application pour gérer la navigation entre les différentes pages et composants de l'application en fonction des routes définies dans le fichier router/index.js, ce qui permet une navigation fluide sans rechargement de page et une gestion des accès basée sur l'authentification

app.mount('#app')// Monte l'application Vue sur l'élément HTML avec l'ID "app", ce qui rend l'application visible et interactive dans le navigateur en attachant l'instance de l'application Vue à cet élément du DOM, généralement défini dans le fichier index.html comme point d'ancrage pour l'application Vue
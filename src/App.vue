<script setup>// Importations des composants et fonctions nécessaires
import { computed } from 'vue' // composant pour les propriétés calculées
import { useRoute } from 'vue-router' // composant pour acceder a la route courante
import ToastsContainer from '@/components/ToastsContainer.vue' // composant pour afficher les toasts de notifications
import BottomNav from '@/components/BottomNav.vue' // composant pour la navigation en bas de l'ecrant

const route = useRoute()// Acceder a la route courante pour determiner si la bottom nav doit etre affichee

// La bottom nav est cachée sur login + 404
const showBottomNav = computed(() => {
  return !['login', 'not-found'].includes(route.name)// Si la route courante n'est pas 'login' ou 'not-found', alors on affiche la bottom nav
})
</script>

<template>
  <RouterView /><!--Affiche le composant correspondant a la route courante-->
  <BottomNav v-if="showBottomNav" /><!--Affiche la botton nav si la condition est remplie-->
  <ToastsContainer /><!--Affiche le container pour les toasts de notifications-->
</template>
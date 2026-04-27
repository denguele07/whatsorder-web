<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div class="text-center">
            <h1 class="text-6xl font-bold text-slate-300">404</h1>
            <p class="text-xl text-slate-700 mt-4">Page introuvable</p>
            <p class="text-slate-500 mt-2 mb-6">
                Cette page n'existe pas ou a été déplacée.
            </p>
            <RouterLink to="/"
                class="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors">
                Retour à l'accueil
            </RouterLink>
        </div>
    </div>
</template>
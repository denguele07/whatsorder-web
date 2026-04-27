<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
    order: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['advance', 'delete'])

// ═════════════════════════════════════════
// NAVIGATION
// ═════════════════════════════════════════
function navigateToDetail() {
    router.push({
        name: 'order-detail',
        params: { reference: props.order.reference },
    })
}

// ═════════════════════════════════════════
// AVATAR — initiales + couleur
// ═════════════════════════════════════════
const initials = computed(() => {
    const name = props.order.client_name || ''
    return name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
})

// Couleur déterministe basée sur le nom (pour que chaque client
// garde toujours la même couleur)
const avatarColor = computed(() => {
    const palettes = [
        { bg: 'bg-orange-100', text: 'text-orange-600' },
        { bg: 'bg-rose-100', text: 'text-rose-600' },
        { bg: 'bg-amber-100', text: 'text-amber-700' },
        { bg: 'bg-emerald-100', text: 'text-emerald-700' },
        { bg: 'bg-sky-100', text: 'text-sky-700' },
        { bg: 'bg-violet-100', text: 'text-violet-700' },
        { bg: 'bg-pink-100', text: 'text-pink-700' },
    ]
    const name = props.order.client_name || ''
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i)
        hash |= 0
    }
    return palettes[Math.abs(hash) % palettes.length]
})

// ═════════════════════════════════════════
// BADGE STATUT
// ═════════════════════════════════════════
const statusBadgeClass = computed(() => {
    const color = props.order.status?.color
    const map = {
        blue: 'bg-blue-100 text-blue-700',
        amber: 'bg-orange-400 text-white',
        emerald: 'bg-emerald-500 text-white',
        slate: 'bg-violet-400 text-white',
        red: 'bg-red-100 text-red-700',
    }
    // Cas spécial "nouveau" = orange vif dans le design
    if (props.order.status?.value === 'nouveau') {
        return 'bg-orange-400 text-white'
    }
    return map[color] || 'bg-slate-100 text-slate-700'
})

const statusLabel = computed(() => {
    return (props.order.status?.label || '').toUpperCase()
})

// ═════════════════════════════════════════
// DATE RELATIVE — "Il y a 5 min"
// ═════════════════════════════════════════
const relativeDate = computed(() => {
    if (!props.order.created_at) return ''
    const now = new Date()
    const created = new Date(props.order.created_at)
    const diffSec = Math.round((now - created) / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffH = Math.round(diffMin / 60)
    const diffJ = Math.round(diffH / 24)

    if (diffSec < 60) return 'À l\'instant'
    if (diffMin < 60) return `Il y a ${diffMin} min`
    if (diffH < 24) return `Il y a ${diffH} h`
    if (diffJ < 7) return `Il y a ${diffJ} j`
    return created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
})

// ═════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════
function handleAdvance(event) {
    event?.stopPropagation()
    emit('advance', props.order.reference)
}

function openWhatsApp(event) {
    event?.stopPropagation()
    if (props.order.whatsapp_url) {
        window.open(props.order.whatsapp_url, '_blank')
    }
}
</script>

<template>
    <article @click="navigateToDetail"
        class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <!-- Layout principal : avatar + contenu -->
        <div class="flex gap-3">
            <!-- Avatar -->
            <div :class="[avatarColor.bg, avatarColor.text]"
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm">
                {{ initials }}
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
                <!-- Ligne 1 : nom + badge -->
                <div class="flex items-start justify-between gap-2 mb-0.5">
                    <h3 class="font-semibold text-slate-900 truncate">
                        {{ order.client_name }}
                    </h3>
                    <span :class="statusBadgeClass"
                        class="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide">
                        {{ statusLabel }}
                    </span>
                </div>

                <!-- Ligne 2 : produit -->
                <p class="text-sm text-slate-600 line-clamp-1 mb-2">
                    {{ order.product_description }}
                </p>

                <!-- Ligne 3 : montant + date -->
                <div class="flex items-center justify-between gap-2 mb-3">
                    <p class="text-sm font-bold text-emerald-600">
                        {{ order.amount_formatted }}
                    </p>
                    <p class="text-xs text-slate-400">
                        {{ relativeDate }}
                    </p>
                </div>

                <!-- Ligne 4 : téléphone -->
                <div class="flex items-center gap-2 mb-3 text-sm text-slate-600">
                    <span>📞</span>
                    <span>{{ order.client_phone }}</span>
                    <span class="text-green-500">💬</span>
                </div>

                <!-- Ligne 5 : boutons d'action -->
                <div class="flex gap-2">
                    <!-- Bouton "prochaine action" (Confirmer, Marquer payée…) -->
                    <button v-if="!order.status?.is_final" @click.stop="handleAdvance"
                        class="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <span>✓</span>
                        {{ order.status?.next_action_label }}
                    </button>

                    <!-- Bouton WhatsApp -->
                    <button @click.stop="openWhatsApp"
                        class="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <span class="text-green-500">💬</span>
                        WhatsApp
                    </button>
                </div>
            </div>
        </div>
    </article>
</template>
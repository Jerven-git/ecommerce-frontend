<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16 overflow-hidden">

    <Transition name="card-pop" appear>
      <div class="max-w-md w-full">
        <div class="relative bg-white rounded-2xl border border-gray-100 shadow-2xl p-10 text-center overflow-hidden">

          <!-- Background radial glow -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-green-400/10 blur-3xl"></div>
          </div>

          <!-- Confetti particles -->
          <div class="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div v-for="p in confetti" :key="p.id" class="confetti-piece absolute" :style="p.style"></div>
          </div>

          <!-- Content -->
          <div class="relative z-10">

            <!-- Icon cluster -->
            <div class="relative flex items-center justify-center mx-auto mb-8 w-28 h-28">

              <!-- Outermost ripple ring -->
              <div class="absolute inset-0 rounded-full border-2 border-green-200 animate-ripple" style="animation-delay: 0s;"></div>
              <div class="absolute inset-2 rounded-full border border-green-200 animate-ripple" style="animation-delay: 0.3s;"></div>

              <!-- Slow orbit ring with dot -->
              <div class="absolute inset-1 rounded-full border border-green-100 animate-spin-orbit"></div>
              <div class="absolute inset-1 animate-spin-orbit">
                <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-green-400 shadow-md shadow-green-200"></div>
              </div>

              <!-- Inner glow disc -->
              <div class="absolute inset-6 rounded-full bg-green-50 animate-ping-slow opacity-60"></div>

              <!-- Icon tile -->
              <div class="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-200 animate-icon-pop">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path
                    class="check-path"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <!-- Headline -->
            <div class="animate-slide-up" style="animation-delay: 0.2s;">
              <p class="text-xs font-semibold uppercase tracking-widest text-green-500 mb-2">Payment Confirmed</p>
              <h1 class="text-2xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
              <p class="text-sm text-gray-500 leading-relaxed mb-8">
                Thank you for your purchase. We've received your order and will begin processing it shortly.
                A confirmation email is on its way.
              </p>
            </div>

            <!-- Status badges -->
            <div class="grid grid-cols-3 gap-3 mb-8 animate-slide-up" style="animation-delay: 0.38s;">
              <div class="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-gray-600 leading-tight">Order<br/>Confirmed</span>
              </div>
              <div class="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-gray-600 leading-tight">Email<br/>Sent</span>
              </div>
              <div class="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span class="text-xs font-medium text-gray-600 leading-tight">Being<br/>Processed</span>
              </div>
            </div>

            <!-- CTAs -->
            <div class="space-y-3 animate-slide-up" style="animation-delay: 0.52s;">
              <NuxtLink
                to="/shop"
                class="inline-flex items-center justify-center gap-2 btn-primary w-full"
              >
                Continue Shopping
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
              <NuxtLink to="/" class="btn-secondary w-full block text-center">
                Back to Home
              </NuxtLink>
            </div>

          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const cartStore = useCartStore()

interface ConfettiPiece {
  id: number
  style: Record<string, string>
}

const COLORS = ['#4ade80', '#34d399', '#60a5fa', '#a78bfa', '#f9a8d4', '#fbbf24', '#fb923c']
const SHAPES = ['rounded-full', 'rounded-sm', 'rotate-45']

const confetti = ref<ConfettiPiece[]>([])

const buildConfetti = () => {
  const pieces: ConfettiPiece[] = []
  for (let i = 0; i < 22; i++) {
    const angle  = (i / 22) * 360
    const dist   = 55 + Math.random() * 60          // px from center
    const size   = 5 + Math.random() * 7            // px
    const delay  = Math.random() * 0.4              // s
    const dur    = 0.7 + Math.random() * 0.6        // s
    const color  = COLORS[i % COLORS.length]
    const rad    = (angle * Math.PI) / 180
    const tx     = Math.cos(rad) * dist
    const ty     = Math.sin(rad) * dist

    pieces.push({
      id: i,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: `confetti-burst ${dur}s ease-out ${delay}s forwards`,
        '--tx': `${tx}px`,
        '--ty': `${ty}px`,
        opacity: '0',
      } as Record<string, string>
    })
  }
  confetti.value = pieces
}

onMounted(() => {
  if (!sessionStorage.getItem('order_completed')) {
    navigateTo('/shop')
    return
  }
  sessionStorage.removeItem('order_completed')
  cartStore.clearCart()
  buildConfetti()
})
</script>

<style scoped>
/* ── Card entrance ── */
.card-pop-enter-active {
  animation: card-pop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes card-pop-in {
  from { opacity: 0; transform: scale(0.88) translateY(24px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}

/* ── Staggered slide-up ── */
.animate-slide-up {
  opacity: 0;
  animation: slide-up 0.5s ease forwards;
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0);    }
}

/* ── Icon pop ── */
.animate-icon-pop {
  animation: icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
}
@keyframes icon-pop {
  from { opacity: 0; transform: scale(0.5);  }
  to   { opacity: 1; transform: scale(1);    }
}

/* ── Checkmark draw ── */
.check-path {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: draw-check 0.45s ease forwards;
  animation-delay: 0.5s;
}
@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

/* ── Ripple rings ── */
.animate-ripple {
  animation: ripple 2.2s ease-out infinite;
}
@keyframes ripple {
  0%   { opacity: 0.8; transform: scale(0.9);  }
  100% { opacity: 0;   transform: scale(1.35); }
}

/* ── Orbit ring ── */
.animate-spin-orbit {
  animation: spin-orbit 9s linear infinite;
}
@keyframes spin-orbit {
  to { transform: rotate(360deg); }
}

/* ── Slow ping ── */
.animate-ping-slow {
  animation: ping-slow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes ping-slow {
  0%   { transform: scale(1);    opacity: 0.6; }
  70%  { transform: scale(1.6);  opacity: 0;   }
  100% { transform: scale(1.6);  opacity: 0;   }
}

/* ── Confetti burst ── */
.confetti-piece {
  position: absolute;
  pointer-events: none;
}
@keyframes confetti-burst {
  0%   { opacity: 1;   transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg)   scale(1);   }
  60%  { opacity: 1;                                                                                     }
  100% { opacity: 0;   transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) rotate(540deg) scale(0.4); }
}
</style>

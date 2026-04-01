<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 overflow-hidden relative">
    <!-- Floating shopping items falling in background -->
    <div class="falling-items">
      <span v-for="i in 12" :key="i" class="falling-item" :style="randomFallStyle(i)">
        {{ fallingEmojis[(i - 1) % fallingEmojis.length] }}
      </span>
    </div>

    <div class="text-center z-10">
      <!-- Animated 404 number -->
      <div class="relative mb-6">
        <h1 class="text-[10rem] sm:text-[14rem] font-black leading-none select-none error-number">
          <span class="inline-block animate-wiggle-left">4</span>
          <span class="inline-block cart-spin">
            <Icon name="mdi:cart-remove" class="text-[8rem] sm:text-[12rem]" style="color: var(--color-primary)" />
          </span>
          <span class="inline-block animate-wiggle-right">4</span>
        </h1>
      </div>

      <!-- Funny message -->
      <div class="space-y-3 mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 bounce-in" style="animation-delay: 0.3s">
          Oops! This page went out of stock.
        </h2>
        <p class="text-gray-500 text-lg max-w-md mx-auto bounce-in" style="animation-delay: 0.5s">
          {{ funnyMessages[activeMessage] }}
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center bounce-in" style="animation-delay: 0.7s">
        <NuxtLink to="/" class="btn-primary inline-flex items-center gap-2 group">
          <Icon name="mdi:home" class="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          Back to Safety
        </NuxtLink>
        <NuxtLink to="/shop" class="btn-secondary inline-flex items-center gap-2 group">
          <Icon name="mdi:shopping" class="w-5 h-5 transition-transform group-hover:scale-110" />
          Go Shopping Instead
        </NuxtLink>
      </div>

      <!-- Easter egg counter -->
      <button
        class="mt-10 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bounce-in"
        style="animation-delay: 0.9s"
        @click="cycleMessage"
      >
        Click for more excuses ({{ activeMessage + 1 }}/{{ funnyMessages.length }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ error: { statusCode: number; message: string } }>()

const { fetchSiteConfig } = useSiteConfig()
useTheme()

onMounted(() => {
  fetchSiteConfig()
})

const activeMessage = ref(0)

const funnyMessages = [
  "Looks like our delivery driver took a wrong turn. Way wrong.",
  "We searched every warehouse. Twice. This page doesn't exist.",
  "Error 404: Page not found. But hey, at least shipping is free!",
  "This page pulled a Houdini and disappeared from our inventory.",
  "Our intern accidentally deleted this page. They've been promoted.",
  "This page is on backorder... forever.",
  "We'd offer you a refund, but you didn't pay for this page.",
  "Plot twist: the page was inside you all along. Just kidding, it's gone.",
]

const fallingEmojis = ['📦', '🛒', '👟', '👕', '🎁', '💳', '🧾', '📱', '⌚', '👜', '🎧', '🕶️']

const cycleMessage = () => {
  activeMessage.value = (activeMessage.value + 1) % funnyMessages.length
}

const randomFallStyle = (i: number) => ({
  left: `${(i * 8.3) % 100}%`,
  animationDuration: `${3 + (i * 1.7) % 5}s`,
  animationDelay: `${(i * 0.8) % 4}s`,
  fontSize: `${1.2 + (i % 3) * 0.6}rem`,
})

useHead({
  title: '404 - Page Not Found',
})
</script>

<style scoped>
/* 404 number colors */
.error-number span {
  color: var(--color-secondary-800, #333d53);
}

/* Wiggle animations for the 4s */
@keyframes wiggle-left {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(4deg); }
}

@keyframes wiggle-right {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(6deg); }
  75% { transform: rotate(-4deg); }
}

.animate-wiggle-left {
  animation: wiggle-left 2.5s ease-in-out infinite;
}

.animate-wiggle-right {
  animation: wiggle-right 2s ease-in-out infinite;
  animation-delay: 0.3s;
}

/* Cart spinning and bouncing */
@keyframes cart-spin {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  20% { transform: translateY(-20px) rotate(15deg); }
  40% { transform: translateY(0) rotate(-10deg); }
  60% { transform: translateY(-10px) rotate(8deg); }
  80% { transform: translateY(0) rotate(-3deg); }
}

.cart-spin {
  animation: cart-spin 3s ease-in-out infinite;
  display: inline-block;
}

/* Bounce-in entrance animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  60% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.bounce-in {
  opacity: 0;
  animation: bounce-in 0.6s ease-out forwards;
}

/* Falling items in background */
.falling-items {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

@keyframes fall {
  0% {
    transform: translateY(-60px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.7;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(calc(100vh + 60px)) rotate(360deg);
    opacity: 0;
  }
}

.falling-item {
  position: absolute;
  top: -60px;
  animation: fall linear infinite;
  opacity: 0;
}
</style>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
        <span>/</span>
        <span class="text-gray-600 font-medium">Settings</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Site Settings</h1>
      <p class="text-gray-500 text-sm mt-1">Manage your store's appearance and content</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading settings…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load settings</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadSettings" class="btn-primary" :disabled="saving">Retry</button>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="saveSettings" class="space-y-5 pb-24">

      <!-- General Settings -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">General</h2>
            <p class="text-xs text-gray-400">Store name and logo</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
            <input v-model="form.site_name" type="text" class="input-field" placeholder="My Awesome Store" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>

            <!-- Logo Preview -->
            <div v-if="form.logo_url" class="inline-flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <img :src="form.logo_url" alt="Logo" class="h-16 w-auto rounded-lg object-contain" />
              <button
                @click="removeLogo"
                type="button"
                class="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium mt-1 transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>

            <!-- Drop zone -->
            <label
              v-else
              for="logoInput"
              class="flex flex-col items-center justify-center w-full h-36 rounded-xl cursor-pointer transition-all duration-200"
              :class="isDraggingLogo
                ? 'bg-blue-50 border-2 border-blue-400 border-dashed'
                : 'bg-gray-50 border-2 border-gray-200 border-dashed hover:border-blue-300 hover:bg-blue-50/40'"
              @dragenter.prevent="onDragEnter('logo')"
              @dragover.prevent
              @dragleave.prevent="onDragLeave('logo')"
              @drop.prevent="onDropReset('logo'); handleLogoDrop($event)"
            >
              <svg class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-500">
                <span v-if="uploadingLogo" class="text-blue-600 font-medium">Uploading…</span>
                <template v-else>Drop logo here or <span class="text-blue-600 font-medium">browse</span></template>
              </p>
              <p class="text-xs text-gray-400 mt-1">PNG, JPG, SVG — max 10 MB</p>
              <input id="logoInput" ref="logoInput" type="file" class="hidden" accept="image/*" @change="handleLogoUpload" />
            </label>
          </div>
        </div>
      </section>

      <!-- Brand Colors -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Brand Colors</h2>
            <p class="text-xs text-gray-400">Primary and secondary palette</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.primary_color" type="color" class="sr-only" id="primaryColorPicker" />
                  <label
                    for="primaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.primary_color }"
                  />
                </div>
                <input v-model="form.primary_color" type="text" class="input-field font-mono text-sm" placeholder="#2563eb" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.secondary_color" type="color" class="sr-only" id="secondaryColorPicker" />
                  <label
                    for="secondaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.secondary_color }"
                  />
                </div>
                <input v-model="form.secondary_color" type="text" class="input-field font-mono text-sm" placeholder="#10b981" />
              </div>
            </div>
          </div>

          <!-- Preview bar -->
          <div class="rounded-xl overflow-hidden border border-gray-100 h-14 flex">
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.primary_color }"
            >
              Primary
            </div>
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.secondary_color }"
            >
              Secondary
            </div>
          </div>
        </div>
      </section>

      <!-- Homepage Content -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Homepage</h2>
            <p class="text-xs text-gray-400">Hero banner title, subtitle, and image</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Title</label>
              <input v-model="form.hero_title" type="text" class="input-field" placeholder="Welcome to our store" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Subtitle</label>
              <input v-model="form.hero_subtitle" type="text" class="input-field" placeholder="Discover something amazing" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Hero Image</label>

            <!-- Hero Preview -->
            <div v-if="form.hero_image_url" class="relative rounded-xl overflow-hidden border border-gray-200">
              <img :src="form.hero_image_url" alt="Hero Image" class="w-full h-44 object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <button
                @click="removeHeroImage"
                type="button"
                class="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>

            <!-- Drop zone -->
            <label
              v-else
              for="heroImageInput"
              class="flex flex-col items-center justify-center w-full h-40 rounded-xl cursor-pointer transition-all duration-200"
              :class="isDraggingHero
                ? 'bg-blue-50 border-2 border-blue-400 border-dashed'
                : 'bg-gray-50 border-2 border-gray-200 border-dashed hover:border-blue-300 hover:bg-blue-50/40'"
              @dragenter.prevent="onDragEnter('hero')"
              @dragover.prevent
              @dragleave.prevent="onDragLeave('hero')"
              @drop.prevent="onDropReset('hero'); handleHeroImageDrop($event)"
            >
              <svg class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-500">
                <span v-if="uploadingHeroImage" class="text-blue-600 font-medium">Uploading…</span>
                <template v-else>Drop image here or <span class="text-blue-600 font-medium">browse</span></template>
              </p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF — max 5 MB · 1920×600 px recommended</p>
              <input id="heroImageInput" ref="heroImageInput" type="file" class="hidden" accept="image/*" @change="handleHeroImageUpload" />
            </label>
          </div>
        </div>
      </section>

      <!-- About Page -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">About Page</h2>
            <p class="text-xs text-gray-400">Image and body content</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">About Image</label>

            <!-- About Preview -->
            <div v-if="form.about_image_url" class="relative rounded-xl overflow-hidden border border-gray-200 inline-block">
              <img :src="form.about_image_url" alt="About Image" class="max-w-xs w-full h-40 object-cover" />
              <button
                @click="removeAboutImage"
                type="button"
                class="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>

            <!-- Drop zone -->
            <label
              v-else
              for="aboutImageInput"
              class="flex flex-col items-center justify-center w-full h-40 rounded-xl cursor-pointer transition-all duration-200"
              :class="isDraggingAbout
                ? 'bg-blue-50 border-2 border-blue-400 border-dashed'
                : 'bg-gray-50 border-2 border-gray-200 border-dashed hover:border-blue-300 hover:bg-blue-50/40'"
              @dragenter.prevent="onDragEnter('about')"
              @dragover.prevent
              @dragleave.prevent="onDragLeave('about')"
              @drop.prevent="onDropReset('about'); handleAboutImageDrop($event)"
            >
              <svg class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-500">
                <span v-if="uploadingAboutImage" class="text-blue-600 font-medium">Uploading…</span>
                <template v-else>Drop image here or <span class="text-blue-600 font-medium">browse</span></template>
              </p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF — max 5 MB · 800×600 px recommended</p>
              <input id="aboutImageInput" ref="aboutImageInput" type="file" class="hidden" accept="image/*" @change="handleAboutImageUpload" />
            </label>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">About Content</label>
            <textarea
              v-model="form.about_content"
              rows="6"
              class="input-field resize-none leading-relaxed"
              placeholder="Tell your customers about your brand…"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Contact Information -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Contact</h2>
            <p class="text-xs text-gray-400">Email, phone, and contact page image</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contact Image</label>

            <!-- Contact Preview -->
            <div v-if="form.contact_image_url" class="relative rounded-xl overflow-hidden border border-gray-200 inline-block">
              <img :src="form.contact_image_url" alt="Contact Image" class="max-w-xs w-full h-40 object-cover" />
              <button
                @click="removeContactImage"
                type="button"
                class="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-red-500 hover:text-red-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>

            <!-- Drop zone -->
            <label
              v-else
              for="contactImageInput"
              class="flex flex-col items-center justify-center w-full h-40 rounded-xl cursor-pointer transition-all duration-200"
              :class="isDraggingContact
                ? 'bg-blue-50 border-2 border-blue-400 border-dashed'
                : 'bg-gray-50 border-2 border-gray-200 border-dashed hover:border-blue-300 hover:bg-blue-50/40'"
              @dragenter.prevent="onDragEnter('contact')"
              @dragover.prevent
              @dragleave.prevent="onDragLeave('contact')"
              @drop.prevent="onDropReset('contact'); handleContactImageDrop($event)"
            >
              <svg class="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-sm text-gray-500">
                <span v-if="uploadingContactImage" class="text-blue-600 font-medium">Uploading…</span>
                <template v-else>Drop image here or <span class="text-blue-600 font-medium">browse</span></template>
              </p>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF — max 5 MB · 800×600 px recommended</p>
              <input id="contactImageInput" ref="contactImageInput" type="file" class="hidden" accept="image/*" @change="handleContactImageUpload" />
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input v-model="form.contact_email" type="email" class="input-field pl-10" placeholder="hello@example.com" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <input v-model="form.contact_phone" type="tel" class="input-field pl-10" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </form>

    <!-- Sticky Save Footer -->
    <div class="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Feedback messages -->
        <div class="flex items-center min-w-0">
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div v-if="success" class="flex items-center gap-2 text-green-700 text-sm font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Saved successfully
            </div>
          </Transition>
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="saveError" class="flex items-center gap-2 text-red-600 text-sm font-medium min-w-0">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="truncate">{{ saveError }}</span>
            </div>
          </Transition>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <button
            @click="loadSettings"
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
          >
            Reset
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="saving"
            @click="saveSettings"
          >
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "auth" })

interface SiteConfig {
  id: number
  site_name: string
  primary_color: string
  secondary_color: string
  logo_url: string
  hero_title: string
  hero_subtitle: string
  hero_image_url: string
  about_content: string
  about_image_url: string
  contact_image_url: string
  contact_email: string
  contact_phone: string
  updated_at: string
}

interface SiteConfigResponse {
  data: SiteConfig
}

type MediaCollection = "logo" | "hero" | "about" | "contact"

const { $apiFetch } = useNuxtApp()

const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)
const configId = ref<number | null>(null)

// upload state (now means “queued / will upload on save”)
const uploadingLogo = ref(false)
const uploadingHeroImage = ref(false)
const uploadingAboutImage = ref(false)
const uploadingContactImage = ref(false)

// drag state
const isDraggingLogo = ref(false)
const isDraggingHero = ref(false)
const isDraggingAbout = ref(false)
const isDraggingContact = ref(false)
const dragCounter = reactive<Record<MediaCollection, number>>({ logo: 0, hero: 0, about: 0, contact: 0 })

const logoInput = ref<HTMLInputElement | null>(null)
const heroImageInput = ref<HTMLInputElement | null>(null)
const aboutImageInput = ref<HTMLInputElement | null>(null)
const contactImageInput = ref<HTMLInputElement | null>(null)

const form = ref({
  site_name: "",
  primary_color: "#2563eb",
  secondary_color: "#10b981",
  logo_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_image_url: "",
  about_content: "",
  about_image_url: "",
  contact_image_url: "",
  contact_email: "",
  contact_phone: "",
})

/**
 * ✅ Pending files waiting for Save
 */
const pending = reactive<Record<MediaCollection, File | null>>({
  logo: null,
  hero: null,
  about: null,
  contact: null,
})

/**
 * ✅ Track blob preview URLs so we can revoke them (avoid memory leak)
 */
const blobPreview = reactive<Record<MediaCollection, string | null>>({
  logo: null,
  hero: null,
  about: null,
  contact: null,
})

const setUploading = (type: MediaCollection, v: boolean) => {
  if (type === "logo") uploadingLogo.value = v
  if (type === "hero") uploadingHeroImage.value = v
  if (type === "about") uploadingAboutImage.value = v
  if (type === "contact") uploadingContactImage.value = v
}

const setDragging = (key: MediaCollection, value: boolean) => {
  if (key === "logo") isDraggingLogo.value = value
  if (key === "hero") isDraggingHero.value = value
  if (key === "about") isDraggingAbout.value = value
  if (key === "contact") isDraggingContact.value = value
}

const validateImage = (file: File, maxSizeMB: number): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024

  if (!file.type.startsWith("image/")) {
    saveError.value = "Please upload a valid image file"
    return false
  }

  if (file.size > maxSize) {
    saveError.value = `Image size must be less than ${maxSizeMB}MB`
    return false
  }

  return true
}

const clearPreviewFor = (type: MediaCollection) => {
  if (blobPreview[type]) {
    URL.revokeObjectURL(blobPreview[type]!)
    blobPreview[type] = null
  }
}

const setPreviewUrl = (type: MediaCollection, url: string) => {
  if (type === "logo") form.value.logo_url = url
  if (type === "hero") form.value.hero_image_url = url
  if (type === "about") form.value.about_image_url = url
  if (type === "contact") form.value.contact_image_url = url
}

/**
 * ✅ Queue file + set local preview (NO upload yet)
 */
const queueFile = (file: File, type: MediaCollection) => {
  const maxSize = 10
  if (!validateImage(file, maxSize)) return

  saveError.value = null

  // replace any previous queued file + revoke old preview
  clearPreviewFor(type)

  pending[type] = file

  const url = URL.createObjectURL(file)
  blobPreview[type] = url
  setPreviewUrl(type, url)
}

/** Load settings from backend */
const loadSettings = async () => {
  if (saving.value) return

  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>("/site-config", { method: "GET" })

    if (response?.data) {
      configId.value = response.data.id

      // when loading from server, clear any pending local files/previews
      ;(["logo", "hero", "about", "contact"] as MediaCollection[]).forEach((t) => {
        pending[t] = null
        clearPreviewFor(t)
      })

      form.value = {
        site_name: response.data.site_name || "",
        primary_color: response.data.primary_color || "#2563eb",
        secondary_color: response.data.secondary_color || "#10b981",
        logo_url: response.data.logo_url || "",
        hero_title: response.data.hero_title || "",
        hero_subtitle: response.data.hero_subtitle || "",
        hero_image_url: response.data.hero_image_url || "",
        about_content: response.data.about_content || "",
        about_image_url: response.data.about_image_url || "",
        contact_image_url: response.data.contact_image_url || "",
        contact_email: response.data.contact_email || "",
        contact_phone: response.data.contact_phone || "",
      }
    }
  } catch (err: any) {
    console.error("Error loading settings:", err)
    error.value = err?.data?.message || "Failed to load settings"
  } finally {
    loading.value = false
  }
}

/** Upload file on Save and return server URL */
const uploadImage = async (file: File, collection: MediaCollection): Promise<string> => {
  const fd = new FormData()
  fd.append("file", file)

  const res = await $apiFetch<{ url: string }>(`/site-config/media/${collection}`, {
    method: "POST",
    body: fd,
  })

  if (!res?.url) throw new Error("Upload response missing url")
  return res.url
}

/** Drag helpers */
const onDragEnter = (key: MediaCollection) => {
  dragCounter[key]++
  setDragging(key, true)
}
const onDragLeave = (key: MediaCollection) => {
  dragCounter[key] = Math.max(0, dragCounter[key] - 1)
  setDragging(key, dragCounter[key] > 0)
}
const onDropReset = (key: MediaCollection) => {
  dragCounter[key] = 0
  setDragging(key, false)
}

/** Input handlers (queue only) */
const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  queueFile(file, "logo")
  target.value = ""
}
const handleHeroImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  queueFile(file, "hero")
  target.value = ""
}
const handleAboutImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  queueFile(file, "about")
  target.value = ""
}

const handleContactImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  queueFile(file, "contact")
  target.value = ""
}

/** Drop handlers (queue only) */
const handleLogoDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) queueFile(file, "logo")
}
const handleHeroImageDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) queueFile(file, "hero")
}
const handleAboutImageDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) queueFile(file, "about")
}

const handleContactImageDrop = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (file) queueFile(file, "contact")
}

/**
 * Remove image:
 * - If user selected a new local file (pending), just clear it
 * - If it’s from server, call DELETE immediately OR you can queue deletion until Save
 *
 * I'll do: queue deletion until Save by setting pending[type] = null and setting a flag.
 */
const pendingDelete = reactive<Record<MediaCollection, boolean>>({
  logo: false,
  hero: false,
  about: false,
  contact: false,
})

const markDeleted = (type: MediaCollection) => {
  // if there was a queued new file, remove it
  pending[type] = null
  pendingDelete[type] = true

  clearPreviewFor(type)
  setPreviewUrl(type, "")

  // also clear native input
  if (type === "logo" && logoInput.value) logoInput.value.value = ""
  if (type === "hero" && heroImageInput.value) heroImageInput.value.value = ""
  if (type === "about" && aboutImageInput.value) aboutImageInput.value.value = ""
  if (type === "contact" && contactImageInput.value) contactImageInput.value.value = ""
}

const removeLogo = async () => markDeleted("logo")
const removeHeroImage = async () => markDeleted("hero")
const removeAboutImage = async () => markDeleted("about")
const removeContactImage = async () => markDeleted("contact")

const deleteMedia = async (collection: MediaCollection) => {
  await $apiFetch(`/site-config/media/${collection}`, { method: "DELETE" })
}

/** Save settings:
 * 1) Upload any pending files
 * 2) Apply deletions
 * 3) PATCH text fields
 * 4) Reload
 */
const saveSettings = async () => {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    // 1) uploads (only the ones user changed)
    for (const type of ["logo", "hero", "about", "contact"] as MediaCollection[]) {
      if (pending[type]) {
        setUploading(type, true)
        const url = await uploadImage(pending[type]!, type)
        setUploading(type, false)

        // replace preview with server url (and revoke blob)
        clearPreviewFor(type)
        setPreviewUrl(type, url)

        pending[type] = null
        pendingDelete[type] = false // because we just uploaded replacement
      }
    }

    // 2) deletions (only if user removed and did NOT upload a new replacement)
    for (const type of ["logo", "hero", "about", "contact"] as MediaCollection[]) {
      if (pendingDelete[type]) {
        await deleteMedia(type)
        pendingDelete[type] = false
      }
    }

    // 3) patch text fields only
    const payload = {
      site_name: form.value.site_name,
      primary_color: form.value.primary_color,
      secondary_color: form.value.secondary_color,
      hero_title: form.value.hero_title,
      hero_subtitle: form.value.hero_subtitle,
      about_content: form.value.about_content,
      contact_email: form.value.contact_email,
      contact_phone: form.value.contact_phone,
    }

    await $apiFetch("/site-config", {
      method: "PATCH",
      body: payload,
    })

    success.value = true
    setTimeout(() => (success.value = false), 3000)

    await loadSettings()
  } catch (err: any) {
    console.error("Save failed:", err?.data || err)
    saveError.value = err?.data?.message || "Failed to save settings"
  } finally {
    // ensure uploading flags are cleared
    uploadingLogo.value = false
    uploadingHeroImage.value = false
    uploadingAboutImage.value = false
    uploadingContactImage.value = false
    saving.value = false
  }
}

onMounted(loadSettings)

// clean up blob urls when leaving page
onBeforeUnmount(() => {
  ;(["logo", "hero", "about"] as MediaCollection[]).forEach(clearPreviewFor)
})
</script>

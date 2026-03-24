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
      <div class="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
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
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">General</h2>
            <p class="text-xs text-gray-400">Store name, logo, and site icon</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
            <input v-model="form.site_name" type="text" class="input-field" placeholder="My Awesome Store" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
              <AdminMediaUploader
                :url="form.logo_url"
                :uploading="media.uploading.logo"
                label="Logo"
                hint="PNG, JPG, SVG — max 2 MB"
                input-id="logoInput"
                preview-class="h-16 w-auto rounded-lg object-contain"
                @select="(f) => onMediaSelect(f, 'logo')"
                @remove="onMediaRemove('logo')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Site Icon</label>
              <AdminMediaUploader
                :url="form.favicon_url"
                :uploading="media.uploading.favicon"
                label="Icon"
                hint="Square preferred — max 2 MB"
                input-id="faviconInput"
                preview-class="h-16 w-16 rounded-lg object-contain"
                @select="(f) => onMediaSelect(f, 'favicon')"
                @remove="onMediaRemove('favicon')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Cart Icon</label>
              <AdminMediaUploader
                :url="form.cart_icon_url"
                :uploading="media.uploading.cart_icon"
                label="Cart Icon"
                hint="PNG, SVG — max 2 MB · 24×24 px recommended"
                input-id="cartIconInput"
                preview-class="h-16 w-16 rounded-lg object-contain"
                @select="(f) => onMediaSelect(f, 'cart_icon')"
                @remove="onMediaRemove('cart_icon')"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Theme -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Theme</h2>
            <p class="text-xs text-gray-400">Colors, fonts, and presets</p>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <!-- Theme Presets -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Theme Presets</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <button
                v-for="preset in themePresets"
                :key="preset.name"
                type="button"
                class="group relative rounded-xl border-2 p-3 transition-all hover:shadow-md text-left"
                :class="isActivePreset(preset) ? 'border-primary-500 ring-2 ring-primary-200 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                @click="applyPreset(preset)"
              >
                <!-- Mini preview -->
                <div class="rounded-lg overflow-hidden border border-gray-100 mb-2.5">
                  <!-- Header bar -->
                  <div class="h-6 flex items-center px-2 gap-1" :style="{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }">
                    <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                  </div>
                  <!-- Body -->
                  <div class="h-12 p-1.5" :style="{ backgroundColor: preset.accent }">
                    <div class="h-2 rounded-sm w-3/4 mb-1" :style="{ backgroundColor: preset.primary, opacity: 0.3 }"></div>
                    <div class="h-1.5 rounded-sm w-full" :style="{ backgroundColor: preset.secondary, opacity: 0.15 }"></div>
                    <div class="h-1.5 rounded-sm w-2/3 mt-0.5" :style="{ backgroundColor: preset.secondary, opacity: 0.1 }"></div>
                  </div>
                </div>
                <!-- Label + info -->
                <p class="text-xs font-semibold text-gray-800 leading-tight">{{ preset.name }}</p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ preset.headingFont }} · {{ preset.bodyFont }}</p>
                <!-- Color dots -->
                <div class="flex gap-1 mt-1.5">
                  <span class="w-3 h-3 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.primary }"></span>
                  <span class="w-3 h-3 rounded-full border border-white shadow-sm" :style="{ backgroundColor: preset.secondary }"></span>
                  <span class="w-3 h-3 rounded-full border border-gray-200 shadow-sm" :style="{ backgroundColor: preset.accent }"></span>
                </div>
                <!-- Active check -->
                <div v-if="isActivePreset(preset)" class="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Color Pickers -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.theme.primary_color" type="color" class="sr-only" id="primaryColorPicker" />
                  <label
                    for="primaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.theme.primary_color }"
                  />
                </div>
                <input v-model="form.theme.primary_color" type="text" class="input-field font-mono text-sm" placeholder="#6898ED" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.theme.secondary_color" type="color" class="sr-only" id="secondaryColorPicker" />
                  <label
                    for="secondaryColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.theme.secondary_color }"
                  />
                </div>
                <input v-model="form.theme.secondary_color" type="text" class="input-field font-mono text-sm" placeholder="#4B5979" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Accent / Surface Color</label>
              <div class="flex items-center gap-2">
                <div class="relative shrink-0">
                  <input v-model="form.theme.accent_color" type="color" class="sr-only" id="accentColorPicker" />
                  <label
                    for="accentColorPicker"
                    class="block w-10 h-10 rounded-lg cursor-pointer border-2 border-white shadow ring-1 ring-gray-200 hover:scale-105 transition-transform"
                    :style="{ backgroundColor: form.theme.accent_color }"
                  />
                </div>
                <input v-model="form.theme.accent_color" type="text" class="input-field font-mono text-sm" placeholder="#F3F4F6" />
              </div>
            </div>
          </div>

          <!-- Preview bar -->
          <div class="rounded-xl overflow-hidden border border-gray-100 h-14 flex">
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.theme.primary_color }"
            >
              Primary
            </div>
            <div
              class="flex-1 flex items-center justify-center text-white text-sm font-semibold"
              :style="{ backgroundColor: form.theme.secondary_color }"
            >
              Secondary
            </div>
            <div
              class="flex-1 flex items-center justify-center text-sm font-semibold text-gray-600"
              :style="{ backgroundColor: form.theme.accent_color }"
            >
              Accent
            </div>
          </div>

          <!-- Fonts -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Heading Font</label>
              <select v-model="form.theme.heading_font" class="input-field text-sm">
                <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Body Font</label>
              <select v-model="form.theme.body_font" class="input-field text-sm">
                <option v-for="font in availableFonts" :key="font" :value="font">{{ font }}</option>
              </select>
            </div>
          </div>

          <!-- Texture -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Background Texture</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tex in availableTextures"
                :key="tex.id"
                type="button"
                class="relative w-16 h-16 rounded-xl border-2 transition-all hover:shadow-sm overflow-hidden"
                :class="form.theme.texture === tex.id ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'"
                @click="form.theme.texture = tex.id"
              >
                <div
                  v-if="tex.id !== 'none'"
                  class="absolute inset-0"
                  :style="{
                    backgroundColor: form.theme.accent_color,
                    backgroundImage: tex.css,
                    backgroundSize: tex.id === 'dots' || tex.id === 'grid' ? '20px 20px' : tex.id === 'waves' ? '40px 20px' : 'auto',
                    color: form.theme.primary_color + '15',
                  }"
                ></div>
                <div v-else class="absolute inset-0 bg-gray-50 flex items-center justify-center">
                  <svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <span class="absolute bottom-0 inset-x-0 text-[9px] font-medium text-center pb-0.5 text-gray-500 bg-white/80">{{ tex.name }}</span>
              </button>
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
            <AdminMediaUploader
              :url="form.hero_image_url"
              :uploading="media.uploading.hero"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 1920×600 px recommended"
              input-id="heroImageInput"
              preview-class="w-full h-44 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'hero')"
              @remove="onMediaRemove('hero')"
            />
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
            <AdminMediaUploader
              :url="form.about_image_url"
              :uploading="media.uploading.about"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
              input-id="aboutImageInput"
              preview-class="w-full h-40 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'about')"
              @remove="onMediaRemove('about')"
            />
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

      <!-- Features -->
      <section class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-gray-900">Features</h2>
            <p class="text-xs text-gray-400">Toggle store features on or off</p>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <p class="text-sm font-medium text-gray-700">Favorites</p>
              <p class="text-xs text-gray-400">Allow customers to favorite products with a heart icon</p>
            </div>
            <button
              type="button"
              role="switch"
              :aria-checked="form.favorites_enabled"
              class="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              :class="form.favorites_enabled ? 'bg-primary-600' : 'bg-gray-200'"
              @click="form.favorites_enabled = !form.favorites_enabled"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="form.favorites_enabled ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </label>
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
          <div class="flex-1">
            <h2 class="text-sm font-semibold text-gray-900">Contact</h2>
            <p class="text-xs text-gray-400">Contact page image and contact entries</p>
          </div>
          <button
            type="button"
            @click="addContactEntry"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Contact
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Contact Image</label>
            <AdminMediaUploader
              :url="form.contact_image_url"
              :uploading="media.uploading.contact"
              label="Image"
              hint="JPG, PNG, GIF — max 5 MB · 800×600 px recommended"
              input-id="contactImageInput"
              preview-class="w-full h-40 object-cover"
              dropzone-class="h-40"
              overlay
              @select="(f) => onMediaSelect(f, 'contact')"
              @remove="onMediaRemove('contact')"
            />
          </div>

          <!-- Repeatable Contact Entries -->
          <div class="space-y-3">
            <AdminContactEntryCard
              v-for="(entry, i) in form.contact_entries"
              :key="i"
              :entry="entry"
              :show-remove="form.contact_entries.length > 1"
              @remove="removeContactEntry(i)"
            />
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
            class="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
import type { MediaCollection } from '~/composables/useMediaUpload'
import { AVAILABLE_FONTS, AVAILABLE_TEXTURES, THEME_PRESETS, type ThemePreset } from '~/composables/useTheme'

definePageMeta({ middleware: "auth" })

interface ContactEntry {
  label: string
  email: string
  phone: string
}

interface SiteConfigResponse {
  data: Record<string, any>
}

// --- Theme presets ---
const availableFonts = AVAILABLE_FONTS
const availableTextures = AVAILABLE_TEXTURES
const themePresets = THEME_PRESETS

function applyPreset(preset: ThemePreset) {
  form.value.theme = {
    primary_color: preset.primary,
    secondary_color: preset.secondary,
    accent_color: preset.accent,
    heading_font: preset.headingFont,
    body_font: preset.bodyFont,
    texture: preset.texture,
  }
}

function isActivePreset(preset: ThemePreset): boolean {
  const t = form.value.theme
  return t.primary_color.toLowerCase() === preset.primary.toLowerCase()
    && t.secondary_color.toLowerCase() === preset.secondary.toLowerCase()
    && t.accent_color.toLowerCase() === preset.accent.toLowerCase()
    && t.heading_font === preset.headingFont
    && t.body_font === preset.bodyFont
    && t.texture === preset.texture
}

const { $apiFetch } = useNuxtApp()

// --- Media upload composable ---
const media = useMediaUpload({
  collections: ['logo', 'favicon', 'cart_icon', 'hero', 'about', 'contact'],
  limits: {
    logo:      { maxMB: 2,  label: 'Logo' },
    favicon:   { maxMB: 2,  label: 'Site icon' },
    cart_icon: { maxMB: 2,  label: 'Cart icon' },
    hero:    { maxMB: 10, label: 'Hero image' },
    about:   { maxMB: 10, label: 'About image' },
    contact: { maxMB: 10, label: 'Contact image' },
  },
  apiFetch: $apiFetch,
})

// --- Page state ---
const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref<string | null>(null)
const saveError = ref<string | null>(null)
const configId = ref<number | null>(null)

const form = ref({
  site_name: "",
  theme: {
    primary_color: "#6898ED",
    secondary_color: "#4B5979",
    accent_color: "#F3F4F6",
    heading_font: "Inter",
    body_font: "Inter",
    texture: "none",
  },
  logo_url: "",
  favicon_url: "",
  cart_icon_url: "",
  hero_title: "",
  hero_subtitle: "",
  hero_image_url: "",
  about_content: "",
  about_image_url: "",
  contact_image_url: "",
  contact_email: "",
  contact_phone: "",
  contact_entries: [{ label: '', email: '', phone: '' }] as ContactEntry[],
  favorites_enabled: false,
})

// Map collection -> form field
const urlFields: Record<MediaCollection, keyof typeof form.value> = {
  logo: 'logo_url',
  favicon: 'favicon_url',
  cart_icon: 'cart_icon_url',
  hero: 'hero_image_url',
  about: 'about_image_url',
  contact: 'contact_image_url',
}

// --- Media event handlers ---
function onMediaSelect(file: File, collection: MediaCollection) {
  const url = media.queueFile(file, collection)
  if (url) {
    ;(form.value[urlFields[collection]] as string) = url
    saveError.value = null
  } else {
    saveError.value = media.lastError.value
  }
}

function onMediaRemove(collection: MediaCollection) {
  media.markDeleted(collection)
  ;(form.value[urlFields[collection]] as string) = ''
}

// --- Contact entries ---
function addContactEntry() {
  form.value.contact_entries.push({ label: '', email: '', phone: '' })
}
function removeContactEntry(index: number) {
  if (form.value.contact_entries.length <= 1) return
  form.value.contact_entries.splice(index, 1)
}

// --- Load settings ---
async function loadSettings() {
  if (saving.value) return
  loading.value = true
  error.value = null

  try {
    const response = await $apiFetch<SiteConfigResponse>("/site-config", { method: "GET" })

    if (response?.data) {
      configId.value = response.data.id
      media.reset()

      form.value = {
        site_name: response.data.site_name || "",
        theme: {
          primary_color: response.data.theme?.primary_color || "#6898ED",
          secondary_color: response.data.theme?.secondary_color || "#4B5979",
          accent_color: response.data.theme?.accent_color || "#F3F4F6",
          heading_font: response.data.theme?.heading_font || "Inter",
          body_font: response.data.theme?.body_font || "Inter",
          texture: response.data.theme?.texture || "none",
        },
        logo_url: response.data.logo_url || "",
        favicon_url: response.data.favicon_url || "",
        cart_icon_url: response.data.cart_icon_url || "",
        hero_title: response.data.hero_title || "",
        hero_subtitle: response.data.hero_subtitle || "",
        hero_image_url: response.data.hero_image_url || "",
        about_content: response.data.about_content || "",
        about_image_url: response.data.about_image_url || "",
        contact_image_url: response.data.contact_image_url || "",
        contact_email: response.data.contact_email || "",
        contact_phone: response.data.contact_phone || "",
        contact_entries: response.data.contact_entries?.length
          ? response.data.contact_entries
          : [{ label: '', email: '', phone: '' }],
        favorites_enabled: response.data.favorites_enabled ?? false,
      }
    }
  } catch (err: any) {
    console.error("Error loading settings:", err)
    error.value = err?.data?.message || "Failed to load settings"
  } finally {
    loading.value = false
  }
}

// --- Save settings ---
async function saveSettings() {
  saving.value = true
  success.value = false
  saveError.value = null

  try {
    // 1) Upload pending files
    const uploaded = await media.uploadAllPending()
    for (const [collection, serverUrl] of Object.entries(uploaded)) {
      ;(form.value[urlFields[collection as MediaCollection]] as string) = serverUrl
    }

    // 2) Execute pending deletions
    await media.deleteAllMarked()

    // 3) PATCH text fields
    await $apiFetch("/site-config", {
      method: "PATCH",
      body: {
        site_name: form.value.site_name,
        theme: form.value.theme,
        hero_title: form.value.hero_title,
        hero_subtitle: form.value.hero_subtitle,
        about_content: form.value.about_content,
        contact_email: form.value.contact_email,
        contact_phone: form.value.contact_phone,
        contact_entries: form.value.contact_entries,
        favorites_enabled: form.value.favorites_enabled,
      },
    })

    // Refresh shared siteConfig so the theme updates live
    const { fetchSiteConfig, broadcastConfigUpdate } = useSiteConfig()
    useState<boolean>('siteConfigFetched').value = false
    await fetchSiteConfig()

    // Notify other open tabs to re-fetch and apply the new theme
    broadcastConfigUpdate()

    success.value = true
    setTimeout(() => (success.value = false), 3000)
    await loadSettings()
  } catch (err: any) {
    console.error("Save failed:", err?.data || err)
    saveError.value = err?.data?.message || "Failed to save settings"
  } finally {
    saving.value = false
  }
}

onMounted(loadSettings)
onBeforeUnmount(() => media.cleanup())
</script>

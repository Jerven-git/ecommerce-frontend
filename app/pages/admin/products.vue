<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <NuxtLink to="/admin" class="hover:text-gray-600 transition-colors">Dashboard</NuxtLink>
          <span>/</span>
          <span class="text-gray-600 font-medium">Products</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <p class="text-gray-500 text-sm mt-1">Manage your store's product catalogue</p>
      </div>
      <button
        @click="openAddModal"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Add Product
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
      </div>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          class="px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all"
          :class="selectedStatus === filter.value
            ? filter.activeClass
            : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300 hover:text-gray-700'"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-3">
      <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
      <p class="text-sm text-gray-500">Loading products…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white rounded-2xl border border-red-100 shadow-sm p-10 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="font-semibold text-gray-800 mb-1">Failed to load products</p>
      <p class="text-sm text-red-500 mb-6">{{ error }}</p>
      <button @click="loadProducts" class="btn-primary">Retry</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <div class="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <p class="font-semibold text-gray-700 mb-1">No products yet</p>
      <p class="text-sm text-gray-400 mb-6">Add your first product to get started</p>
      <button @click="openAddModal" class="btn-primary">Add Product</button>
    </div>

    <!-- Products table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Weight / Dims</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.image_url"
                    :src="product.image_url"
                    :alt="product.name"
                    class="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-100"
                  />
                  <div v-else class="h-10 w-10 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ product.name }}</p>
                    <p class="text-xs text-gray-400 truncate max-w-xs">{{ product.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                ${{ parseFloat(String(product.price)).toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="text-sm font-medium"
                    :class="product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-amber-600' : 'text-gray-800'"
                  >
                    {{ product.stock }}
                  </span>
                  <span
                    v-if="product.allow_backorder"
                    class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600"
                    title="Backorder enabled"
                  >BO</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <template v-if="product.shipping_calc_type === 'dimensions'">
                  <span class="text-xs">{{ product.volume_cbm?.toFixed(4) }} m³</span>
                </template>
                <template v-else>
                  {{ parseFloat(String(product.weight || 0)).toFixed(2) }} kg
                </template>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {{ product.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                  :class="product.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="product.is_active ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ product.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="inline-flex items-center gap-1">
                  <button
                    @click="editProduct(product)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteProduct(product.id)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && totalPages > 1" class="mt-6 flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Showing {{ ((currentPage - 1) * perPage) + 1 }}–{{ Math.min(currentPage * perPage, totalItems) }} of {{ totalItems }} products
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-2 text-gray-400 text-sm">...</span>
          <button
            v-else
            @click="goToPage(page as number)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
            :class="page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
        </template>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDeleteModal
      :open="showDeleteModal"
      title="Delete Product"
      message="Are you sure you want to delete this product? This action cannot be undone."
      :deleting="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteModal = false"
    />

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @mousedown.self="backdropMouseDown = true"
          @mouseup.self="if (backdropMouseDown) closeModal(); backdropMouseDown = false"
          @mouseup.capture="backdropMouseDown = false"
        >
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-2"
          >
            <div v-if="showModal" class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              <!-- Modal header -->
              <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="editingProduct ? 'bg-blue-50' : 'bg-green-50'">
                    <svg class="w-4 h-4" :class="editingProduct ? 'text-blue-600' : 'text-green-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="editingProduct" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-sm font-semibold text-gray-900">{{ editingProduct ? 'Edit Product' : 'New Product' }}</h2>
                    <p class="text-xs text-gray-400">{{ editingProduct ? 'Update product details' : 'Fill in the details below' }}</p>
                  </div>
                </div>
                <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Modal body (scrollable) -->
              <div class="overflow-y-auto flex-1 px-6 py-5">
                <form id="productForm" @submit.prevent="saveProduct" class="space-y-5">

                  <!-- Section: Basic Info -->
                  <fieldset class="space-y-3">
                    <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Basic Info</legend>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 mb-1">Product Name <span class="text-red-400">*</span></label>
                        <input v-model="form.name" type="text" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all" placeholder="e.g. Wireless Headphones" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea
                          v-model="form.description"
                          rows="2"
                          class="w-full h-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all resize-none leading-relaxed overflow-y-auto"
                          placeholder="Brief product description..."
                        ></textarea>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Price <span class="text-red-400">*</span></label>
                        <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                          <span class="px-2.5 flex items-center bg-gray-50 text-gray-400 text-sm border-r border-gray-200 select-none">$</span>
                          <input v-model.number="form.price" type="number" step="0.01" min="0" required class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Stock <span class="text-red-400">*</span></label>
                        <input v-model.number="form.stock" type="number" min="0" required class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all" placeholder="0" />
                      </div>
                    </div>
                  </fieldset>

                  <div class="border-t border-gray-100"></div>

                  <!-- Section: Shipping -->
                  <fieldset class="space-y-3">
                    <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Shipping</legend>
                    <div class="flex items-center gap-2">
                      <div class="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                        <button
                          type="button"
                          @click="form.shipping_calc_type = 'weight'"
                          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                          :class="form.shipping_calc_type === 'weight' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                        >
                          By Weight
                        </button>
                        <button
                          type="button"
                          @click="form.shipping_calc_type = 'dimensions'"
                          class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150"
                          :class="form.shipping_calc_type === 'dimensions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                        >
                          By Dimensions
                        </button>
                      </div>
                    </div>

                    <Transition
                      enter-active-class="transition-all duration-200 ease-out"
                      leave-active-class="transition-all duration-150 ease-in"
                      enter-from-class="opacity-0 -translate-y-1"
                      enter-to-class="opacity-100 translate-y-0"
                      leave-from-class="opacity-100 translate-y-0"
                      leave-to-class="opacity-0 -translate-y-1"
                      mode="out-in"
                    >
                      <!-- Weight -->
                      <div v-if="form.shipping_calc_type === 'weight'" key="weight">
                        <label class="block text-xs font-medium text-gray-600 mb-1">Weight</label>
                        <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all max-w-[200px]">
                          <input v-model.number="form.weight" type="number" step="0.01" min="0" class="flex-1 px-2.5 py-2 text-sm outline-none w-0" placeholder="0.00" />
                          <span class="px-2.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">kg</span>
                        </div>
                      </div>

                      <!-- Dimensions -->
                      <div v-else key="dimensions" class="space-y-2">
                        <div class="grid grid-cols-3 gap-2">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Length</label>
                            <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                              <input v-model.number="form.length_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                              <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                            </div>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Width</label>
                            <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                              <input v-model.number="form.width_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                              <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                            </div>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Height</label>
                            <div class="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                              <input v-model.number="form.height_cm" type="number" step="0.01" min="0" class="flex-1 px-2 py-2 text-sm outline-none w-0" placeholder="0" />
                              <span class="px-1.5 flex items-center bg-gray-50 text-gray-400 text-xs border-l border-gray-200 select-none">cm</span>
                            </div>
                          </div>
                        </div>
                        <Transition
                          enter-active-class="transition-all duration-200"
                          enter-from-class="opacity-0 scale-95"
                          enter-to-class="opacity-100 scale-100"
                          leave-active-class="transition-all duration-150"
                          leave-from-class="opacity-100 scale-100"
                          leave-to-class="opacity-0 scale-95"
                        >
                          <div v-if="computedVolumeCbm > 0" class="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                            <svg class="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span class="text-xs text-blue-700 font-medium">
                              Volume: {{ computedVolumeCbm.toFixed(6) }} m&sup3; ({{ (computedVolumeCbm * 1000).toFixed(3) }} L)
                            </span>
                          </div>
                        </Transition>
                      </div>
                    </Transition>
                  </fieldset>

                  <div class="border-t border-gray-100"></div>

                  <!-- Section: Category -->
                  <fieldset class="space-y-2">
                    <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</legend>
                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                      <!-- Selected display / clear -->
                      <div class="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                        <p v-if="categoryBreadcrumb" class="text-xs text-gray-600 flex items-center gap-1.5">
                          <svg class="w-3 h-3 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                          {{ categoryBreadcrumb }}
                        </p>
                        <p v-else class="text-xs text-gray-400">No category selected</p>
                        <button v-if="form.category_id" type="button" @click="clearCategorySelection" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear</button>
                      </div>
                      <!-- Tree -->
                      <div class="max-h-48 overflow-y-auto py-1">
                        <template v-for="cat in allCategories" :key="cat.id">
                          <CategoryTreeItem
                            :category="cat"
                            :depth="0"
                            :selected-id="form.category_id"
                            :expanded-ids="catPickerExpanded"
                            @select="selectCategory"
                            @toggle="toggleCatPickerExpand"
                          />
                        </template>
                        <p v-if="!allCategories.length" class="text-xs text-gray-400 text-center py-3">No categories available</p>
                      </div>
                    </div>
                  </fieldset>

                  <div class="border-t border-gray-100"></div>

                  <!-- Section: Media & Status -->
                  <fieldset class="space-y-3">
                    <legend class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Media & Status</legend>

                    <!-- Main Image (for new products) -->
                    <div v-if="!editingProduct">
                      <label class="block text-xs font-medium text-gray-600 mb-1.5">Image</label>
                      <div v-if="imagePreview" class="mb-2 flex items-center gap-3">
                        <img
                          :src="imagePreview"
                          alt="Preview"
                          class="h-14 w-14 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          @click="removeImage"
                          class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        ref="imageInput"
                        type="file"
                        accept="image/*"
                        @change="onImageSelected"
                        class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>

                    <!-- Gallery Images (for editing existing products) -->
                    <div v-if="editingProduct">
                      <label class="block text-xs font-medium text-gray-600 mb-1.5">Product Images</label>

                      <!-- Existing gallery images -->
                      <div v-if="galleryImages.length" class="flex flex-wrap gap-2 mb-3">
                        <div
                          v-for="img in galleryImages"
                          :key="img.id"
                          class="relative group"
                        >
                          <img
                            :src="img.url"
                            alt="Product image"
                            class="h-20 w-20 rounded-lg object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            @click="deleteGalleryImage(img.id)"
                            class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove image"
                          >
                            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p v-else class="text-xs text-gray-400 mb-2">No images uploaded yet.</p>

                      <!-- Upload new gallery images -->
                      <div class="flex items-center gap-3">
                        <input
                          ref="galleryInput"
                          type="file"
                          accept="image/*"
                          multiple
                          @change="onGallerySelected"
                          class="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <button
                          v-if="galleryFiles.length"
                          type="button"
                          @click="uploadGalleryImages"
                          :disabled="uploadingGallery"
                          class="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {{ uploadingGallery ? 'Uploading...' : `Upload (${galleryFiles.length})` }}
                        </button>
                      </div>
                    </div>

                    <!-- Active toggle -->
                    <div class="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-sm font-medium text-gray-700">Active</p>
                        <p class="text-xs text-gray-400">Visible to customers</p>
                      </div>
                      <button
                        type="button"
                        @click="form.is_active = !form.is_active"
                        class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        :class="form.is_active ? 'bg-blue-600' : 'bg-gray-300'"
                      >
                        <span
                          class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                          :class="form.is_active ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                        />
                      </button>
                    </div>

                    <!-- Backorder toggle -->
                    <div class="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                      <div>
                        <p class="text-sm font-medium text-gray-700">Allow Backorder</p>
                        <p class="text-xs text-gray-400">Accept orders for this product when out of stock</p>
                        <p class="text-[11px] text-amber-600 mt-0.5">Requires the global backorder setting to also be enabled in Backorders &rarr; Settings</p>
                      </div>
                      <button
                        type="button"
                        @click="form.allow_backorder = !form.allow_backorder"
                        class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        :class="form.allow_backorder ? 'bg-blue-600' : 'bg-gray-300'"
                      >
                        <span
                          class="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
                          :class="form.allow_backorder ? 'translate-x-[18px]' : 'translate-x-[3px]'"
                        />
                      </button>
                    </div>

                    <!-- Backorder charge policy (only visible when backorder enabled) -->
                    <div v-if="form.allow_backorder" class="px-3">
                      <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Charge Policy</label>
                      <select
                        v-model="form.backorder_charge_policy"
                        class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="charged_now">Charged at checkout</option>
                        <option value="charged_later">Charged when available</option>
                      </select>
                      <p class="text-xs text-gray-400 mt-1">When to charge the customer for backordered items</p>
                    </div>
                  </fieldset>

                  <!-- Form error -->
                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition-all duration-150"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ formError }}
                    </div>
                  </Transition>
                </form>
              </div>

              <!-- Modal footer -->
              <div class="px-6 py-3.5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="productForm"
                  class="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="submitting"
                >
                  <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {{ submitting ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Add Product') }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

interface Category {
  id: number
  name: string
  parent_id: number | null
  children?: Category[]
}

interface Product {
  id: number
  name: string
  description: string
  price: number | string
  stock: number
  weight: number | string
  length_cm: number | string
  width_cm: number | string
  height_cm: number | string
  shipping_calc_type: 'weight' | 'dimensions'
  volume_cbm: number
  category: string
  category_id: number | null
  image_url: string
  is_active: boolean
  allow_backorder: boolean
  backorder_charge_policy: 'charged_now' | 'charged_later'
  created_at: string
  updated_at: string
}

interface PaginatedResponse {
  data: Product[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const { $apiFetch } = useNuxtApp()

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedStatus = ref('all')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 15

const statusFilters = [
  { value: 'all', label: 'All', activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'active', label: 'Active', activeClass: 'border-green-500 bg-green-50 text-green-700' },
  { value: 'inactive', label: 'Inactive', activeClass: 'border-gray-500 bg-gray-100 text-gray-700' },
]

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | string)[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadProducts()
}
const showModal = ref(false)
const backdropMouseDown = ref(false)
const submitting = ref(false)
const formError = ref<string | null>(null)
const editingProduct = ref<Product | null>(null)
const showDeleteModal = ref(false)
const deletingId = ref<number | null>(null)
const deleting = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

// Gallery images (for editing existing products)
const galleryImages = ref<{ id: number; url: string }[]>([])
const galleryFiles = ref<File[]>([])
const galleryInput = ref<HTMLInputElement | null>(null)
const uploadingGallery = ref(false)

const onGallerySelected = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    galleryFiles.value = Array.from(files)
  }
}

const uploadGalleryImages = async () => {
  if (!editingProduct.value || !galleryFiles.value.length) return
  uploadingGallery.value = true
  try {
    const formData = new FormData()
    for (const file of galleryFiles.value) {
      formData.append('images[]', file)
    }
    const res = await $apiFetch<{ data: any }>(`/products/${editingProduct.value.id}/images`, {
      method: 'POST',
      body: formData,
    })
    // Refresh gallery from response
    if (res?.data?.media) {
      galleryImages.value = res.data.media
        .filter((m: any) => m.collection === 'gallery')
        .map((m: any) => ({ id: m.id, url: m.url }))
    }
    galleryFiles.value = []
    if (galleryInput.value) galleryInput.value.value = ''
    // Reload product list to update thumbnails
    await loadProducts()
  } catch (err: any) {
    console.error('Error uploading gallery images:', err)
    formError.value = err?.data?.message || 'Failed to upload images'
  } finally {
    uploadingGallery.value = false
  }
}

const deleteGalleryImage = async (mediaId: number) => {
  if (!editingProduct.value) return
  try {
    const res = await $apiFetch<{ data: any }>(`/products/${editingProduct.value.id}/images/${mediaId}`, {
      method: 'DELETE',
    })
    if (res?.data?.media) {
      galleryImages.value = res.data.media
        .filter((m: any) => m.collection === 'gallery')
        .map((m: any) => ({ id: m.id, url: m.url }))
    } else {
      galleryImages.value = galleryImages.value.filter(img => img.id !== mediaId)
    }
    await loadProducts()
  } catch (err: any) {
    console.error('Error deleting gallery image:', err)
  }
}

// Categories — tree picker
const allCategories = ref<Category[]>([])
const categorySelections = ref<(number | null)[]>([])
const catPickerExpanded = ref<Set<number>>(new Set())

function toggleCatPickerExpand(id: number) {
  const s = new Set(catPickerExpanded.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  catPickerExpanded.value = s
}

function selectCategory(id: number) {
  // Toggle: if already selected, deselect
  if (form.value.category_id === id) {
    form.value.category_id = null
    form.value.category = 'general'
    categorySelections.value = []
    return
  }
  form.value.category_id = id
  const cat = findCategoryById(allCategories.value, id)
  form.value.category = cat?.name || 'general'
  // Update selections path for breadcrumb
  const path = findCategoryPath(allCategories.value, id)
  categorySelections.value = path.map(c => c.id)
  // Auto-expand parent path
  const parentIds = path.slice(0, -1).map(c => c.id)
  catPickerExpanded.value = new Set([...catPickerExpanded.value, ...parentIds])
}

function clearCategorySelection() {
  form.value.category_id = null
  form.value.category = 'general'
  categorySelections.value = []
}

function findCategoryById(cats: Category[], id: number): Category | null {
  for (const cat of cats) {
    if (Number(cat.id) === Number(id)) return cat
    if (cat.children?.length) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return null
}

function findCategoryPath(cats: Category[], id: number): Category[] {
  for (const cat of cats) {
    if (Number(cat.id) === Number(id)) return [cat]
    if (cat.children?.length) {
      const path = findCategoryPath(cat.children, id)
      if (path.length) return [cat, ...path]
    }
  }
  return []
}

const categoryBreadcrumb = computed(() => {
  const names: string[] = []
  for (const selId of categorySelections.value) {
    if (selId == null) break
    const cat = findCategoryById(allCategories.value, selId)
    if (cat) names.push(cat.name)
  }
  return names.length > 1 ? names.join(' > ') : ''
})

const form = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  weight: 0,
  length_cm: 0,
  width_cm: 0,
  height_cm: 0,
  shipping_calc_type: 'weight' as 'weight' | 'dimensions',
  category: 'general',
  category_id: null as number | null,
  is_active: true,
  allow_backorder: false,
  backorder_charge_policy: 'charged_later' as 'charged_now' | 'charged_later',
})

const computedVolumeCbm = computed(() => {
  const l = Number(form.value.length_cm) || 0
  const w = Number(form.value.width_cm) || 0
  const h = Number(form.value.height_cm) || 0
  if (l <= 0 || w <= 0 || h <= 0) return 0
  return (l * w * h) / 1000000
})

const onImageSelected = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function normalizeCategories(cats: any[]): Category[] {
  return (cats || []).map(c => ({
    ...c,
    id: Number(c.id),
    parent_id: c.parent_id != null ? Number(c.parent_id) : null,
    children: normalizeCategories(c.children || c.children_recursive || []),
  }))
}

const fetchCategories = async () => {
  try {
    const res = await $apiFetch<{ data: any[] }>('/categories', { method: 'GET' })
    allCategories.value = normalizeCategories(res.data || [])
  } catch (err) {
    console.warn('Failed to load categories:', err)
  }
}

const loadProducts = async () => {
  loading.value = true
  error.value = null

  try {
    const query: Record<string, string | number> = {
      sort: 'created_at',
      order: 'desc',
      page: currentPage.value,
      per_page: perPage,
    }

    if (selectedStatus.value === 'active') query.is_active = 1
    else if (selectedStatus.value === 'inactive') query.is_active = 0

    const q = searchQuery.value.trim()
    if (q) query.search = q

    const response = await $apiFetch<PaginatedResponse>('/products', {
      method: 'GET',
      query,
    })

    if (response?.data) {
      products.value = response.data
      currentPage.value = response.current_page ?? 1
      totalPages.value = response.last_page ?? 1
      totalItems.value = response.total ?? 0
    }
  } catch (err: any) {
    console.error('Error loading products:', err)
    error.value = err?.data?.message || 'Failed to load products'
  } finally {
    loading.value = false
  }
}

// Re-fetch when status filter changes
watch(selectedStatus, () => {
  currentPage.value = 1
  loadProducts()
})

// Debounced re-fetch when search query changes
let searchTimer: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadProducts()
  }, 400)
})

const openAddModal = () => {
  editingProduct.value = null
  form.value = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    weight: 0,
    length_cm: 0,
    width_cm: 0,
    height_cm: 0,
    shipping_calc_type: 'weight',
    category: 'general',
    category_id: null,
    is_active: true,
    allow_backorder: false,
    backorder_charge_policy: 'charged_later',
  }
  imageFile.value = null
  imagePreview.value = null
  categorySelections.value = []
  catPickerExpanded.value = new Set()
  formError.value = null
  showModal.value = true
}

const editProduct = async (product: Product) => {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description,
    price: parseFloat(product.price as string),
    stock: product.stock,
    weight: parseFloat(String(product.weight || 0)),
    length_cm: parseFloat(String(product.length_cm || 0)),
    width_cm: parseFloat(String(product.width_cm || 0)),
    height_cm: parseFloat(String(product.height_cm || 0)),
    shipping_calc_type: product.shipping_calc_type || 'weight',
    category: product.category,
    category_id: product.category_id,
    is_active: product.is_active,
    allow_backorder: product.allow_backorder ?? false,
    backorder_charge_policy: product.backorder_charge_policy ?? 'charged_later',
  }
  imageFile.value = null
  imagePreview.value = null
  galleryFiles.value = []
  galleryImages.value = []

  // Fetch product with media to populate gallery
  try {
    const res = await $apiFetch<{ data: any }>(`/products/${product.id}`, { method: 'GET' })
    if (res?.data?.media) {
      galleryImages.value = res.data.media
        .filter((m: any) => m.collection === 'gallery')
        .map((m: any) => ({ id: m.id, url: m.url }))
    }
  } catch {
    // Silently fail — gallery just won't show existing images
  }

  // Resolve category_id into cascading selections
  const catId = product.category_id ? Number(product.category_id) : null
  form.value.category_id = catId
  if (catId) {
    const path = findCategoryPath(allCategories.value, catId)
    categorySelections.value = path.map(c => Number(c.id))
    // Auto-expand parent path in tree picker
    catPickerExpanded.value = new Set(path.slice(0, -1).map(c => Number(c.id)))
  } else {
    categorySelections.value = []
    catPickerExpanded.value = new Set()
  }

  formError.value = null
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProduct.value = null
  formError.value = null
}

const onEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && showModal.value) closeModal()
}

onMounted(() => window.addEventListener('keydown', onEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', onEscape))

const saveProduct = async () => {
  submitting.value = true
  formError.value = null

  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('description', form.value.description)
    formData.append('price', String(form.value.price))
    formData.append('stock', String(form.value.stock))
    formData.append('weight', String(form.value.weight))
    formData.append('length_cm', String(form.value.length_cm))
    formData.append('width_cm', String(form.value.width_cm))
    formData.append('height_cm', String(form.value.height_cm))
    formData.append('shipping_calc_type', form.value.shipping_calc_type)
    formData.append('category', form.value.category)
    if (form.value.category_id !== null) {
      formData.append('category_id', String(form.value.category_id))
    }
    formData.append('is_active', form.value.is_active ? '1' : '0')
    formData.append('allow_backorder', form.value.allow_backorder ? '1' : '0')
    formData.append('backorder_charge_policy', form.value.backorder_charge_policy)
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    if (editingProduct.value) {
      formData.append('_method', 'PATCH')
      await $apiFetch(`/products/${editingProduct.value.id}`, {
        method: 'POST',
        body: formData
      })
    } else {
      await $apiFetch('/products', {
        method: 'POST',
        body: formData
      })
    }

    await loadProducts()
    closeModal()
  } catch (err: any) {
    console.error('Error saving product:', err)
    formError.value = err?.data?.message || 'Failed to save product'
  } finally {
    submitting.value = false
  }
}

const deleteProduct = (id: number) => {
  deletingId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!deletingId.value) return
  deleting.value = true

  try {
    await $apiFetch(`/products/${deletingId.value}`, { method: 'DELETE' })
    await loadProducts()
    showDeleteModal.value = false
    deletingId.value = null
  } catch (err: any) {
    console.error('Error deleting product:', err)
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadProducts()
  fetchCategories()
})
</script>
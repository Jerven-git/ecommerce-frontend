export interface Store {
  id: number
  name: string
  slug: string
  domain: string | null
  domain_verified_at: string | null
  domain_verified: boolean
  status: 'active' | 'inactive'
  is_default: boolean
  default_currency_id: number | null
  users_count: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DomainDns {
  resolves: boolean
  addresses: string[]
  points_at_server: boolean
  expected_ips: string[]
}

/**
 * `valid` — a well-formed domain we're allowed to accept.
 * `available` — not already claimed by another store.
 * `dns.points_at_server` — provably controlled by the claimant.
 */
export interface DomainAvailability {
  domain: string
  valid: boolean
  available: boolean
  reason: string | null
  claimed_by: { id: number; name: string } | null
  dns: DomainDns | null
  expected_ips: string[]
}

export interface DomainVerification {
  message: string
  dns: DomainDns & { verified: boolean }
  data: { id: number; domain: string; domain_verified_at: string | null; domain_verified: boolean }
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'super_admin'
  is_super_admin: boolean
  status: 'active' | 'disabled'
  disabled_at: string | null
  store: { id: number; name: string; slug: string } | null
  created_at: string
}

export interface ActivityEntry {
  id: number
  log_name: string | null
  description: string
  event: string | null
  subject_type: string | null
  subject_id: number | null
  causer: { id: number; name?: string; email?: string } | null
  store: { id: number; name: string } | null
  properties: Record<string, unknown> | null
  created_at: string
}

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

interface StoreInput {
  name: string
  slug?: string
  domain?: string | null
  status?: 'active' | 'inactive'
  default_currency_id?: number | null
}

interface AdminUserInput {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
  role?: 'admin' | 'super_admin'
  store_id?: number | null
  store_name?: string
  store_slug?: string
  status?: 'active' | 'disabled'
}

export const useSuperAdminApi = () => {
  const { $apiFetch } = useNuxtApp()

  return {
    // Stores
    listStores: () => $apiFetch<{ data: Store[] }>('/super-admin/stores'),
    showStore: (id: number) => $apiFetch<{ data: Store }>(`/super-admin/stores/${id}`),
    createStore: (body: StoreInput) =>
      $apiFetch<{ data: Store }>('/super-admin/stores', { method: 'POST', body }),
    updateStore: (id: number, body: Partial<StoreInput>) =>
      $apiFetch<{ data: Store }>(`/super-admin/stores/${id}`, { method: 'PATCH', body }),
    deleteStore: (id: number) =>
      $apiFetch<{ message: string }>(`/super-admin/stores/${id}`, { method: 'DELETE' }),
    activateStore: (id: number) =>
      $apiFetch<{ data: Store }>(`/super-admin/stores/${id}/activate`, { method: 'POST' }),
    deactivateStore: (id: number) =>
      $apiFetch<{ data: Store }>(`/super-admin/stores/${id}/deactivate`, { method: 'POST' }),

    // Custom domains
    checkDomain: (domain: string, storeId?: number) =>
      $apiFetch<DomainAvailability>('/super-admin/stores/domain-availability', {
        params: { domain, ...(storeId ? { store_id: storeId } : {}) },
      }),
    verifyStoreDomain: (id: number) =>
      $apiFetch<DomainVerification>(`/super-admin/stores/${id}/domain/verify`, { method: 'POST' }),

    // Admin users
    listAdmins: () => $apiFetch<{ data: AdminUser[] }>('/super-admin/users'),
    createAdmin: (body: AdminUserInput) =>
      $apiFetch<{ data: AdminUser }>('/super-admin/users', { method: 'POST', body }),
    updateAdmin: (id: number, body: Partial<AdminUserInput>) =>
      $apiFetch<{ data: AdminUser }>(`/super-admin/users/${id}`, { method: 'PATCH', body }),
    deleteAdmin: (id: number) =>
      $apiFetch<{ message: string }>(`/super-admin/users/${id}`, { method: 'DELETE' }),

    // Activity log
    listActivity: (params: Record<string, string | number | undefined> = {}) =>
      $apiFetch<Paginated<ActivityEntry>>('/activity-log', { params }),
  }
}

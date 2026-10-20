const LAST_PAYMENT_ID_KEY = 'last_payment_id'
const TOKEN_KEY_PREFIX = 'payment_access_token:'

const normalize = (value: unknown): string => value == null ? '' : String(value).trim()

export function rememberPaymentAccess(paymentId: unknown, paymentToken?: unknown): string {
  const id = normalize(paymentId)
  if (!id || typeof window === 'undefined') return id

  localStorage.setItem(LAST_PAYMENT_ID_KEY, id)

  const token = normalize(paymentToken)
  if (token) sessionStorage.setItem(`${TOKEN_KEY_PREFIX}${id}`, token)

  return id
}

export function paymentAccessTokenFor(paymentId: unknown, explicitToken?: unknown): string {
  const id = normalize(paymentId)
  const token = normalize(explicitToken)
  if (!id || typeof window === 'undefined') return token

  if (token) {
    sessionStorage.setItem(`${TOKEN_KEY_PREFIX}${id}`, token)
    return token
  }

  return sessionStorage.getItem(`${TOKEN_KEY_PREFIX}${id}`) || ''
}

export function paymentCompletePath(paymentId: unknown, paymentToken?: unknown): string {
  const id = normalize(paymentId)
  const token = paymentAccessTokenFor(id, paymentToken)
  const query = new URLSearchParams({ payment_id: id })

  if (token) query.set('payment_token', token)

  return `/payment/complete?${query.toString()}`
}

export function forgetPaymentAccess(paymentId: unknown): void {
  const id = normalize(paymentId)
  if (!id || typeof window === 'undefined') return

  sessionStorage.removeItem(`${TOKEN_KEY_PREFIX}${id}`)
  if (localStorage.getItem(LAST_PAYMENT_ID_KEY) === id) {
    localStorage.removeItem(LAST_PAYMENT_ID_KEY)
  }
}

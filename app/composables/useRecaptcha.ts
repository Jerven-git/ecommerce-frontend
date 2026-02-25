/**
 * Composable for Google reCAPTCHA v3
 * Loads the script on demand and executes token generation.
 */
let scriptLoaded = false
let scriptLoading: Promise<void> | null = null

function loadScript(siteKey: string): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (scriptLoading) return scriptLoading

  scriptLoading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => {
      scriptLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA script'))
    document.head.appendChild(script)
  })

  return scriptLoading
}

export function useRecaptcha() {
  const config = useRuntimeConfig()
  const siteKey = config.public.recaptchaSiteKey as string

  /**
   * Execute reCAPTCHA v3 and return a token for the given action.
   */
  async function execute(action: string): Promise<string> {
    if (!siteKey) {
      throw new Error('reCAPTCHA site key is not configured')
    }

    await loadScript(siteKey)

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  return { execute }
}

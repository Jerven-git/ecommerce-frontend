<template>
  <main class="apex-verify">
    <header class="apex-verify__header">
      <a :href="platformHomeUrl" class="apex-verify__brand" aria-label="DATABASY home">DATABASY</a>
      <p class="apex-verify__header-status">
        <Icon name="heroicons:lock-closed" aria-hidden="true" />
        Secure admin access
      </p>
      <NuxtLink to="/admin/login" class="apex-verify__exit">
        Cancel sign in
        <Icon name="heroicons:x-mark" aria-hidden="true" />
      </NuxtLink>
    </header>

    <div class="apex-verify__layout">
      <section class="apex-verify__story" aria-labelledby="verify-title">
        <div class="apex-verify__story-copy">
          <h1 id="verify-title">
            One last check.
            <span>Your workspace is waiting.</span>
          </h1>
          <p>
            We use a short-lived code to make sure it is really you before opening your DATABASY workspace.
          </p>
        </div>

        <ol class="apex-verify__journey" aria-label="Sign-in security progress">
          <li class="apex-verify__journey-step is-complete">
            <span class="apex-verify__journey-node">
              <Icon name="heroicons:check" aria-hidden="true" />
            </span>
            <span>
              <strong>Password confirmed</strong>
              <small>Your account details matched.</small>
            </span>
          </li>
          <li class="apex-verify__journey-step is-current" aria-current="step">
            <span class="apex-verify__journey-node">
              <Icon name="heroicons:envelope" aria-hidden="true" />
            </span>
            <span>
              <strong>Check your email</strong>
              <small>Enter the six-digit code below.</small>
            </span>
          </li>
          <li class="apex-verify__journey-step">
            <span class="apex-verify__journey-node">
              <Icon name="heroicons:squares-2x2" aria-hidden="true" />
            </span>
            <span>
              <strong>Open your workspace</strong>
              <small>Your admin tools are next.</small>
            </span>
          </li>
        </ol>

        <p class="apex-verify__privacy-note">
          <Icon name="heroicons:shield-check" aria-hidden="true" />
          Your verification code expires after a short time and can only be used once.
        </p>
      </section>

      <section class="apex-verify__challenge" aria-labelledby="challenge-title">
        <div class="apex-verify__challenge-inner">
          <div class="apex-verify__challenge-heading">
            <span class="apex-verify__mail-mark" aria-hidden="true">
              <Icon name="heroicons:envelope-open" />
            </span>
            <h2 id="challenge-title">Enter the code we sent.</h2>
            <p>
              Six digits were sent to
              <strong>{{ maskedEmail || 'your email address' }}</strong>
            </p>
          </div>

          <form class="apex-verify__form" @submit.prevent="handleVerify">
            <div class="apex-verify__field">
              <label for="two-factor-code">Verification code</label>
              <input
                id="two-factor-code"
                ref="codeInput"
                :value="code"
                type="text"
                inputmode="numeric"
                maxlength="6"
                pattern="[0-9]{6}"
                required
                class="apex-verify__code-input"
                placeholder="000000"
                autocomplete="one-time-code"
                :aria-invalid="Boolean(error)"
                :aria-describedby="messageId"
                @input="handleCodeInput"
              >
              <p id="verification-code-hint" class="apex-verify__field-hint">
                Use the latest code in your inbox.
              </p>
            </div>

            <Transition name="verify-message" mode="out-in">
              <p v-if="error" id="verification-error" key="error" class="apex-verify__message apex-verify__message--error" role="alert">
                <Icon name="heroicons:exclamation-circle" aria-hidden="true" />
                <span>{{ error }}</span>
              </p>
              <p v-else-if="resendSuccess" id="verification-success" key="success" class="apex-verify__message apex-verify__message--success" role="status">
                <Icon name="heroicons:check-circle" aria-hidden="true" />
                <span>{{ resendSuccess }}</span>
              </p>
            </Transition>

            <button
              type="submit"
              class="apex-verify__submit"
              :disabled="loading || code.length !== 6"
            >
              <Icon v-if="loading" name="heroicons:arrow-path" class="apex-verify__spinner" aria-hidden="true" />
              <span>{{ loading ? 'Checking code…' : 'Continue to workspace' }}</span>
              <Icon v-if="!loading" name="heroicons:arrow-right" aria-hidden="true" />
            </button>
          </form>

          <div class="apex-verify__resend">
            <p>Didn’t receive the email?</p>
            <button
              type="button"
              :disabled="resendCooldown > 0 || resendLoading"
              @click="handleResend"
            >
              <Icon v-if="resendLoading" name="heroicons:arrow-path" class="apex-verify__spinner" aria-hidden="true" />
              {{ resendLabel }}
            </button>
          </div>

          <p class="apex-verify__help">
            Check your spam folder or confirm that the address above belongs to the account you signed in with.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const requestUrl = useRequestURL()

const code = ref('')
const codeInput = ref<HTMLInputElement | null>(null)
const loading = ref(false)
const error = ref('')
const resendSuccess = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | undefined

// Optional ?redirect= carried over from login. Only same-origin paths.
const getRedirect = () => {
  const candidate = route.query.redirect
  return typeof candidate === 'string' && candidate.startsWith('/') ? candidate : '/admin'
}

const platformHomeUrl = computed(() => {
  const configuredBaseUrl = String(runtimeConfig.public.baseURL || '').trim()
  if (configuredBaseUrl) {
    try {
      return new URL('/', configuredBaseUrl).toString()
    } catch {
      // Fall back to the configured platform domain.
    }
  }

  const baseDomain = String(runtimeConfig.public.storefrontBaseDomain || '').trim()
  if (!baseDomain) return '/'

  const port = requestUrl.port ? `:${requestUrl.port}` : ''
  return `${requestUrl.protocol}//${baseDomain}${port}/`
})

const maskedEmail = computed(() => {
  const email = authStore.twoFactorEmail
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  return `${local.charAt(0)}${'*'.repeat(Math.max(local.length - 1, 2))}@${domain}`
})

const messageId = computed(() => {
  if (error.value) return 'verification-code-hint verification-error'
  if (resendSuccess.value) return 'verification-code-hint verification-success'
  return 'verification-code-hint'
})

const resendLabel = computed(() => {
  if (resendLoading.value) return 'Sending a new code…'
  if (resendCooldown.value > 0) return `Send again in ${resendCooldown.value}s`
  return 'Send a new code'
})

const handleCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 6)
  code.value = digits
  input.value = digits
  if (error.value) error.value = ''
}

const handleVerify = async () => {
  if (code.value.length !== 6 || loading.value) return

  loading.value = true
  error.value = ''
  resendSuccess.value = ''

  try {
    await authStore.verifyTwoFactor(code.value)
    await navigateTo(getRedirect())
  } catch (err: any) {
    error.value = err?.data?.message || 'That code could not be verified. Check the digits and try again.'
    await nextTick()
    codeInput.value?.focus()
    codeInput.value?.select()
  } finally {
    loading.value = false
  }
}

const startResendCooldown = () => {
  if (resendTimer) clearInterval(resendTimer)
  resendCooldown.value = 60
  resendTimer = setInterval(() => {
    resendCooldown.value -= 1
    if (resendCooldown.value <= 0 && resendTimer) {
      clearInterval(resendTimer)
      resendTimer = undefined
    }
  }, 1000)
}

const handleResend = async () => {
  if (resendCooldown.value > 0 || resendLoading.value) return

  resendLoading.value = true
  error.value = ''
  resendSuccess.value = ''

  try {
    const response = await authStore.resendTwoFactor()
    resendSuccess.value = response.message || 'A new code is on its way. Use the latest email.'
    code.value = ''
    startResendCooldown()
    await nextTick()
    codeInput.value?.focus()
  } catch (err: any) {
    error.value = err?.data?.message || 'We could not send another code. Please try again.'
  } finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  if (!authStore.twoFactorRequired) {
    navigateTo(authStore.isAdmin ? getRedirect() : '/admin/login')
    return
  }

  requestAnimationFrame(() => codeInput.value?.focus())
})

onBeforeUnmount(() => {
  if (resendTimer) clearInterval(resendTimer)
})
</script>

<style scoped>
.apex-verify {
  min-height: 100svh;
  overflow-x: hidden;
  background: var(--apex-canvas);
  color: var(--apex-text);
  font-family: 'Space Grotesk', var(--font-body);
  scrollbar-color: var(--apex-node) var(--apex-surface-subtle);
}

.apex-verify ::selection { background: #dbe8ff; color: var(--apex-text); }

.apex-verify__header {
  display: grid;
  min-height: 5rem;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--apex-border-soft);
  padding: 0.75rem clamp(1.25rem, 4vw, 4.5rem);
  background: var(--apex-canvas);
}

.apex-verify__brand {
  width: fit-content;
  color: var(--apex-text);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.apex-verify__header-status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  color: var(--apex-text-caption);
  font-size: 0.75rem;
  font-weight: 600;
}

.apex-verify__header-status svg,
.apex-verify__exit svg { width: 1rem; height: 1rem; }

.apex-verify__exit {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-self: end;
  gap: 0.45rem;
  color: var(--apex-text-emphasis);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: var(--apex-border-strong);
  text-underline-offset: 0.25rem;
}

.apex-verify__exit:hover { text-decoration-color: currentColor; }

.apex-verify__layout {
  display: grid;
  min-height: calc(100svh - 5rem);
  grid-template-columns: minmax(0, 1.08fr) minmax(25rem, 0.92fr);
}

.apex-verify__story {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 7vw, 7rem) clamp(1.5rem, 6vw, 7rem);
}

.apex-verify__story-copy { max-width: 43rem; }

.apex-verify__story h1 {
  max-width: 13ch;
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(3.15rem, 5.6vw, 5.8rem);
  font-weight: 600;
  line-height: 1.04;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.apex-verify__story h1 span {
  display: block;
  color: var(--apex-text-display-muted);
  font-family: 'Space Grotesk', var(--font-heading);
  font-size: 0.74em;
  line-height: 1.08;
  letter-spacing: -0.035em;
}

.apex-verify__story-copy > p {
  max-width: 39rem;
  margin: 1.5rem 0 0;
  color: var(--apex-text-muted);
  font-size: clamp(1rem, 1.25vw, 1.1rem);
  line-height: 1.65;
}

.apex-verify__journey {
  position: relative;
  display: grid;
  max-width: 48rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin: clamp(3.5rem, 7vw, 6rem) 0 0;
  padding: 0;
  list-style: none;
}

.apex-verify__journey::before,
.apex-verify__journey::after {
  position: absolute;
  top: 1.3rem;
  right: calc(16.666% + 1.3rem);
  left: calc(16.666% + 1.3rem);
  height: 1px;
  content: '';
}

.apex-verify__journey::before { background: var(--apex-border-strong); }
.apex-verify__journey::after {
  background: var(--apex-text);
  transform: scaleX(0.5);
  transform-origin: left;
  animation: verify-progress 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.apex-verify__journey-step {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  color: var(--apex-text-caption);
  text-align: center;
}

.apex-verify__journey-node {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border: 1px solid var(--apex-border-strong);
  border-radius: 50%;
  background: var(--apex-canvas);
  color: var(--apex-text-caption);
}

.apex-verify__journey-node svg { width: 1.05rem; height: 1.05rem; }
.apex-verify__journey-step.is-complete .apex-verify__journey-node { border-color: var(--apex-text); background: var(--apex-text); color: var(--apex-on-action); }
.apex-verify__journey-step.is-current .apex-verify__journey-node { border-color: var(--apex-text); color: var(--apex-text); animation: verify-node 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.apex-verify__journey-step > span:last-child { display: flex; min-width: 0; flex-direction: column; gap: 0.3rem; }
.apex-verify__journey-step strong { color: var(--apex-text-emphasis); font-size: 0.78rem; line-height: 1.35; }
.apex-verify__journey-step small { max-width: 16ch; color: var(--apex-text-caption); font-size: 0.7rem; line-height: 1.45; }
.apex-verify__journey-step.is-current strong { color: var(--apex-text); }

.apex-verify__privacy-note {
  display: flex;
  max-width: 34rem;
  align-items: flex-start;
  gap: 0.6rem;
  margin: clamp(3rem, 6vw, 5rem) 0 0;
  color: var(--apex-text-caption);
  font-size: 0.75rem;
  line-height: 1.55;
}

.apex-verify__privacy-note svg { flex: 0 0 auto; width: 1.1rem; height: 1.1rem; margin-top: 0.05rem; color: var(--apex-accent); }

.apex-verify__challenge {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  border-left: 1px solid var(--apex-border-soft);
  background: var(--apex-surface);
  padding: clamp(3rem, 6vw, 6rem) clamp(1.5rem, 5vw, 5.5rem);
}

.apex-verify__challenge-inner { width: min(100%, 31rem); }

.apex-verify__mail-mark {
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  margin-bottom: 1.5rem;
  place-items: center;
  border: 1px solid var(--apex-border-strong);
  border-radius: 50%;
  color: var(--apex-text);
}

.apex-verify__mail-mark svg { width: 1.35rem; height: 1.35rem; }

.apex-verify__challenge-heading h2 {
  max-width: 12ch;
  margin: 0;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(2.35rem, 4vw, 3.6rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.apex-verify__challenge-heading p {
  margin: 1rem 0 0;
  color: var(--apex-text-muted);
  font-size: 0.92rem;
  line-height: 1.65;
}

.apex-verify__challenge-heading strong { display: block; color: var(--apex-text); font-weight: 700; }
.apex-verify__form { display: grid; gap: 1rem; margin-top: 2.25rem; }
.apex-verify__field label { display: block; margin-bottom: 0.55rem; color: var(--apex-text); font-size: 0.8rem; font-weight: 700; }

.apex-verify__code-input {
  display: block;
  width: 100%;
  min-height: 4.5rem;
  border: 1px solid #a9a9a5;
  border-radius: 0.75rem;
  outline: none;
  background: var(--apex-surface);
  caret-color: var(--apex-accent);
  color: var(--apex-text);
  font: inherit;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  letter-spacing: 0.32em;
  text-align: center;
  text-indent: 0.32em;
  transition: border-color 160ms ease, box-shadow 160ms ease;
}

.apex-verify__code-input::placeholder { color: #777; opacity: 1; }
.apex-verify__code-input:hover { border-color: #666; }
.apex-verify__code-input:focus-visible { border-color: var(--apex-focus-on-light); box-shadow: 0 0 0 3px #dce9ff; }
.apex-verify__code-input[aria-invalid='true'] { border-color: #b84848; }
.apex-verify__field-hint { margin: 0.5rem 0 0; color: var(--apex-text-caption); font-size: 0.72rem; line-height: 1.5; }

.apex-verify__message {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  border: 1px solid;
  border-radius: 0.7rem;
  padding: 0.85rem 0.95rem;
  font-size: 0.8rem;
  line-height: 1.5;
}

.apex-verify__message svg { flex: 0 0 auto; width: 1.05rem; height: 1.05rem; margin-top: 0.12rem; }
.apex-verify__message--error { border-color: #e3a5a5; background: #fff6f6; color: #842525; }
.apex-verify__message--success { border-color: #9fcbb1; background: #f1faf5; color: #205f40; }

.apex-verify__submit {
  display: inline-flex;
  width: 100%;
  min-height: 3.35rem;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  border: 1px solid var(--apex-action);
  border-radius: 0.75rem;
  background: var(--apex-action);
  color: var(--apex-on-action);
  font: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 180ms ease, transform 180ms ease;
}

.apex-verify__submit:hover:not(:disabled) { background: var(--apex-action-hover); transform: translateY(-2px); }
.apex-verify__submit:active:not(:disabled) { transform: translateY(0); }
.apex-verify__submit:disabled { opacity: 0.48; cursor: not-allowed; }
.apex-verify__submit svg { width: 1.05rem; height: 1.05rem; }
.apex-verify__spinner { animation: verify-spin 800ms linear infinite; }

.apex-verify__resend {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  border-top: 1px solid var(--apex-border-soft);
  padding-top: 1.25rem;
}

.apex-verify__resend p { margin: 0; color: var(--apex-text-muted); font-size: 0.8rem; }
.apex-verify__resend button { display: inline-flex; min-height: 2.75rem; align-items: center; gap: 0.4rem; border: 0; background: transparent; padding: 0.4rem 0; color: var(--apex-text); font: inherit; font-size: 0.8rem; font-weight: 700; text-decoration: underline; text-decoration-color: var(--apex-border-strong); text-underline-offset: 0.25rem; cursor: pointer; }
.apex-verify__resend button:hover:not(:disabled) { text-decoration-color: currentColor; }
.apex-verify__resend button:disabled { color: var(--apex-text-caption); cursor: not-allowed; text-decoration: none; }
.apex-verify__resend svg { width: 1rem; height: 1rem; }
.apex-verify__help { margin: 1rem 0 0; color: var(--apex-text-caption); font-size: 0.7rem; line-height: 1.55; }

.apex-verify :is(a, button):focus-visible { outline: 3px solid var(--apex-focus-on-light); outline-offset: 3px; }
.verify-message-enter-active, .verify-message-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.verify-message-enter-from, .verify-message-leave-to { opacity: 0; transform: translateY(-0.3rem); }

@keyframes verify-progress { from { transform: scaleX(0); } to { transform: scaleX(0.5); } }
@keyframes verify-node { from { box-shadow: 0 0 0 0 rgb(40 80 149 / 22%); transform: scale(0.86); } to { box-shadow: 0 0 0 0.45rem rgb(40 80 149 / 8%); transform: scale(1); } }
@keyframes verify-spin { to { transform: rotate(360deg); } }

@media (max-width: 940px) {
  .apex-verify__layout { grid-template-columns: 1fr; }
  .apex-verify__story { padding-block: 4rem; }
  .apex-verify__story h1 { max-width: 16ch; }
  .apex-verify__challenge { border-top: 1px solid var(--apex-border-soft); border-left: 0; padding-block: 4rem; }
}

@media (max-width: 600px) {
  .apex-verify__header { min-height: 4.5rem; grid-template-columns: 1fr auto; }
  .apex-verify__header-status { display: none; }
  .apex-verify__layout { min-height: calc(100svh - 4.5rem); }
  .apex-verify__story { padding: 3.5rem 1.25rem; }
  .apex-verify__story h1 { font-size: clamp(2.75rem, 14vw, 4rem); }
  .apex-verify__journey { grid-template-columns: 1fr; gap: 1.2rem; margin-top: 3rem; }
  .apex-verify__journey::before, .apex-verify__journey::after { top: 1.3rem; right: auto; bottom: 1.3rem; left: 1.3rem; width: 1px; height: auto; }
  .apex-verify__journey::after { transform: scaleY(0.5); transform-origin: top; animation-name: verify-progress-mobile; }
  .apex-verify__journey-step { min-height: 3.5rem; flex-direction: row; align-items: flex-start; gap: 0.9rem; text-align: left; }
  .apex-verify__journey-step > span:last-child { padding-top: 0.25rem; }
  .apex-verify__journey-step small { max-width: none; }
  .apex-verify__privacy-note { margin-top: 2.5rem; }
  .apex-verify__challenge { padding: 3.5rem 1.25rem 4rem; }
  .apex-verify__challenge-heading h2 { font-size: clamp(2.25rem, 11vw, 3rem); }
}

@media (max-width: 390px) {
  .apex-verify__exit { font-size: 0.75rem; }
  .apex-verify__resend { align-items: flex-start; flex-direction: column; gap: 0.35rem; }
}

@keyframes verify-progress-mobile { from { transform: scaleY(0); } to { transform: scaleY(0.5); } }

@media (prefers-reduced-motion: reduce) {
  .apex-verify *, .apex-verify *::before, .apex-verify *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
}

@media (forced-colors: active) {
  .apex-verify__journey-step.is-complete .apex-verify__journey-node { forced-color-adjust: none; background: CanvasText; color: Canvas; }
  .apex-verify__submit { border-color: ButtonText; }
}
</style>

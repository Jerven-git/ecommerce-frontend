export type AuthTransitionPhase = 'authenticating' | 'verification' | 'preparing'

export const useAuthTransition = () => {
  const active = useState('auth-transition:active', () => false)
  const phase = useState<AuthTransitionPhase>('auth-transition:phase', () => 'authenticating')
  const email = useState('auth-transition:email', () => '')

  const start = (nextPhase: AuthTransitionPhase, identity = '') => {
    phase.value = nextPhase
    email.value = identity
    active.value = true
  }

  const setPhase = (nextPhase: AuthTransitionPhase) => {
    phase.value = nextPhase
  }

  const finish = () => {
    active.value = false
    email.value = ''
  }

  return { active, phase, email, start, setPhase, finish }
}

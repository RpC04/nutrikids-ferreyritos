// App constants and configuration

export const SITE_NAME = 'NutriKids'
export const SITE_DESCRIPTION = 'Sistema web informativo para NutriKids'

// Jornadas (shifts)
export const SHIFTS = {
  day1: {
    id: 'day1',
    label: 'Día 1 · Jornada con niños',
    shortLabel: 'Día 1',
  },
  day2: {
    id: 'day2',
    label: 'Día 2 · Jornada con familias',
    shortLabel: 'Día 2',
  },
  both: {
    id: 'both',
    label: 'Ambas jornadas',
    shortLabel: 'Ambas',
  },
} as const

export const LEGACY_SHIFT_TO_CURRENT = {
  morning: 'day1',
  afternoon: 'day2',
} as const

// Gender options
export const GENDER_OPTIONS = [
  { value: 'F', label: 'Femenino' },
  { value: 'M', label: 'Masculino' },
  { value: 'Otro', label: 'Prefiero no indicar' },
] as const

// Cómo se enteró options
export const HOW_FOUND_OPTIONS = [
  { value: 'redes_sociales', label: 'Redes sociales' },
  { value: 'pagina_web', label: 'Página web' },
  { value: 'volante_afiche', label: 'Volante / afiche' },
  { value: 'familiar_amigo', label: 'Un familiar o amigo' },
  { value: 'institucion_educativa', label: 'La institución educativa' },
  { value: 'otro', label: 'Otro' },
] as const

// Form validation
export const MIN_AGE = 1
export const MAX_AGE = 120

// API endpoints
export const API_ROUTES = {
  RECIPES: '/api/recipes',
  ACTIVITIES: '/api/activities',
  REGISTRATIONS: '/api/registrations',
  EVENT_SETTINGS: '/api/event-settings',
  AUTH: '/api/auth',
} as const

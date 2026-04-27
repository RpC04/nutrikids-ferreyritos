// Database-agnostic type definitions for NutriKids
// These types work with both Supabase and Neon

export type ShiftType = 'day1' | 'day2' | 'both' | 'morning' | 'afternoon'

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string
  preparation: string
  preparation_time_minutes: number | null
  servings: number | null
  notes: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  title: string
  description: string
  date: string
  shift: ShiftType
  time: string
  location: string
  capacity: number
  created_at: string
  updated_at: string
}

export interface EventSettings {
  id: string
  event_date: string | null // Legacy field kept for backwards compatibility
  start_date: string | null
  end_date: string | null
  display_date_label: string | null
  team_name: string | null
  team_size: number | null
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  nombres: string
  apellidos: string
  dni: string
  edad: number
  sexo: 'M' | 'F' | 'Otro'
  celular: string
  correo: string
  jornada: ShiftType
  diagnostico: string
  como_se_entero: string
  comentarios: string | null
  created_at: string
  updated_at: string
}

export interface AdminUser {
  id: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data?: T[]
  total?: number
  error?: string
}

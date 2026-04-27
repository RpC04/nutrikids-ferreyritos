'use server'

import type {
  Recipe,
  Activity,
  Registration,
  EventSettings,
  AdminUser,
} from './types/database'
import * as crypto from 'crypto'

type CanonicalShift = 'day1' | 'day2' | 'both'

let supabase: any = null

const LEGACY_SHIFT_TO_CANONICAL: Record<string, CanonicalShift> = {
  morning: 'day1',
  afternoon: 'day2',
}

const CANONICAL_SHIFTS = new Set<CanonicalShift>(['day1', 'day2', 'both'])

function normalizeShiftValue(value: string | null | undefined): CanonicalShift {
  if (!value) return 'day1'

  const normalized = value.trim().toLowerCase()

  if (CANONICAL_SHIFTS.has(normalized as CanonicalShift)) {
    return normalized as CanonicalShift
  }

  if (normalized in LEGACY_SHIFT_TO_CANONICAL) {
    return LEGACY_SHIFT_TO_CANONICAL[normalized]
  }

  return 'day1'
}

function normalizeActivity(activity: Activity): Activity {
  return {
    ...activity,
    shift: normalizeShiftValue(activity.shift),
  }
}

function normalizeRegistration(registration: Registration): Registration {
  return {
    ...registration,
    jornada: normalizeShiftValue(registration.jornada),
  }
}

function normalizeEventSettings(settings: EventSettings): EventSettings {
  const today = new Date().toISOString().split('T')[0]
  const baseDate = settings.start_date || settings.event_date || today

  return {
    ...settings,
    event_date: settings.event_date || baseDate,
    start_date: settings.start_date || baseDate,
    end_date: settings.end_date || baseDate,
    display_date_label: settings.display_date_label || null,
    team_name: settings.team_name || 'Equipo universitario independiente NutriKids',
    team_size: typeof settings.team_size === 'number' ? settings.team_size : 31,
  }
}

function getSupabaseJwtRole(key: string): string | null {
  try {
    const payloadSegment = key.split('.')[1]
    if (!payloadSegment) return null

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))

    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    // Non-JWT keys are treated as valid for their configured env var name.
    return null
  }
}

function resolveSupabaseKey(
  expectedRole: 'anon' | 'service_role',
  primary?: string,
  secondary?: string
): string | null {
  if (primary) {
    const role = getSupabaseJwtRole(primary)
    if (!role || role === expectedRole) {
      return primary
    }
  }

  if (secondary) {
    const role = getSupabaseJwtRole(secondary)
    if (role === expectedRole) {
      return secondary
    }
  }

  return primary || secondary || null
}

async function getSupabaseClient() {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = resolveSupabaseKey(
    'service_role',
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const { createClient } = await import('@supabase/supabase-js')
  supabase = createClient(supabaseUrl, supabaseServiceKey)
  return supabase
}

// RECIPES
export async function getRecipes(): Promise<Recipe[]> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data || []
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>): Promise<Recipe> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('recipes')
    .insert([
      {
        ...recipe,
        preparation_time_minutes: recipe.preparation_time_minutes ?? null,
        servings: recipe.servings ?? null,
        notes: recipe.notes ?? null,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateRecipe(id: string, recipe: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>): Promise<Recipe> {
  const client = await getSupabaseClient()
  const updatePayload: Record<string, unknown> = {
    ...recipe,
    updated_at: new Date().toISOString(),
  }

  if ('preparation_time_minutes' in recipe) {
    updatePayload.preparation_time_minutes = recipe.preparation_time_minutes ?? null
  }

  if ('servings' in recipe) {
    updatePayload.servings = recipe.servings ?? null
  }

  if ('notes' in recipe) {
    updatePayload.notes = recipe.notes ?? null
  }

  const { data, error } = await client
    .from('recipes')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteRecipe(id: string): Promise<void> {
  const client = await getSupabaseClient()
  const { error } = await client.from('recipes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ACTIVITIES
export async function getActivities(): Promise<Activity[]> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('activities')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (error) throw new Error(error.message)
  return (data || []).map(normalizeActivity)
}

export async function getActivityById(id: string): Promise<Activity | null> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('activities')
    .select('*')
    .eq('id', id)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data ? normalizeActivity(data) : null
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Promise<Activity> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('activities')
    .insert([{ ...activity, shift: normalizeShiftValue(activity.shift) }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return normalizeActivity(data)
}

export async function updateActivity(id: string, activity: Partial<Omit<Activity, 'id' | 'created_at' | 'updated_at'>>): Promise<Activity> {
  const client = await getSupabaseClient()
  const updatePayload: Record<string, unknown> = {
    ...activity,
    updated_at: new Date().toISOString(),
  }

  if (typeof activity.shift === 'string') {
    updatePayload.shift = normalizeShiftValue(activity.shift)
  }

  const { data, error } = await client
    .from('activities')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return normalizeActivity(data)
}

export async function deleteActivity(id: string): Promise<void> {
  const client = await getSupabaseClient()
  const { error } = await client.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// EVENT SETTINGS
export async function getEventSettings(): Promise<EventSettings | null> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('event_settings')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data ? normalizeEventSettings(data) : null
}

export async function updateEventSettings(input: {
  event_date?: string | null
  start_date?: string | null
  end_date?: string | null
  display_date_label?: string | null
  team_name?: string | null
  team_size?: number | null
}): Promise<EventSettings> {
  const client = await getSupabaseClient()
  const settings = await getEventSettings()
  const today = new Date().toISOString().split('T')[0]
  const startDate = input.start_date || input.event_date || settings?.start_date || settings?.event_date || today
  const endDate = input.end_date || input.start_date || input.event_date || settings?.end_date || startDate
  const payload = {
    event_date: input.event_date || startDate,
    start_date: startDate,
    end_date: endDate,
    display_date_label:
      typeof input.display_date_label === 'string'
        ? input.display_date_label || null
        : settings?.display_date_label || null,
    team_name:
      typeof input.team_name === 'string'
        ? input.team_name || null
        : settings?.team_name || 'Equipo universitario independiente NutriKids',
    team_size:
      typeof input.team_size === 'number' && Number.isFinite(input.team_size)
        ? input.team_size
        : settings?.team_size || 31,
  }

  try {
    if (!settings) {
      const { data, error } = await client
        .from('event_settings')
        .insert([payload])
        .select()
        .single()

      if (error) throw new Error(error.message)
      return normalizeEventSettings(data)
    }

    const { data, error } = await client
      .from('event_settings')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return normalizeEventSettings(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : ''

    // Backwards-compatible fallback when new columns are not migrated yet.
    if (
      message.includes('start_date') ||
      message.includes('end_date') ||
      message.includes('display_date_label') ||
      message.includes('team_name') ||
      message.includes('team_size')
    ) {
      if (!settings) {
        const { data, error: insertError } = await client
          .from('event_settings')
          .insert([{ event_date: payload.event_date }])
          .select()
          .single()

        if (insertError) throw new Error(insertError.message)
        return normalizeEventSettings(data)
      }

      const { data, error: updateError } = await client
        .from('event_settings')
        .update({ event_date: payload.event_date, updated_at: new Date().toISOString() })
        .eq('id', settings.id)
        .select()
        .single()

      if (updateError) throw new Error(updateError.message)
      return normalizeEventSettings(data)
    }

    throw error
  }
}

export async function updateEventDate(newDate: string): Promise<EventSettings> {
  return updateEventSettings({
    event_date: newDate,
    start_date: newDate,
    end_date: newDate,
  })
}

// REGISTRATIONS
export async function getRegistrations(): Promise<Registration[]> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data || []).map(normalizeRegistration)
}

export async function createRegistration(registration: Omit<Registration, 'id' | 'created_at' | 'updated_at'>): Promise<Registration> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('registrations')
    .insert([
      {
        ...registration,
        jornada: normalizeShiftValue(registration.jornada),
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return normalizeRegistration(data)
}

export async function deleteRegistration(id: string): Promise<void> {
  const client = await getSupabaseClient()
  const { error } = await client.from('registrations').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ADMIN USERS
export async function getAdminByEmail(email: string): Promise<AdminUser | null> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data || null
}

export async function createAdminUser(email: string, passwordHash: string): Promise<AdminUser> {
  const client = await getSupabaseClient()
  const { data, error } = await client
    .from('admin_users')
    .insert([{ email, password_hash: passwordHash }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function verifyAdminPassword(email: string, password: string): Promise<AdminUser | null> {
  const admin = await getAdminByEmail(email)
  if (!admin) return null

  // Use bcrypt if available, otherwise fall back to simple hash
  try {
    const bcrypt = require('bcryptjs')
    const isMatch = await bcrypt.compare(password, admin.password_hash)
    return isMatch ? admin : null
  } catch {
    // Fallback to simple comparison (not recommended for production)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    return admin.password_hash === passwordHash ? admin : null
  }
}

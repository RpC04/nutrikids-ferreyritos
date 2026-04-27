// Database client - supports both Supabase and Neon
// Uses raw SQL queries for flexibility
// Lazy-loaded to avoid issues during build time

import type { Database } from './types/supabase'

const dbType = process.env.DATABASE_TYPE || 'supabase'

let dbClient: any = null
let initialized = false

function getSupabaseJwtRole(key: string): string | null {
  try {
    const payloadSegment = key.split('.')[1]
    if (!payloadSegment) return null

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))

    return typeof payload.role === 'string' ? payload.role : null
  } catch {
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

function initializeClient() {
  if (initialized) return dbClient
  
  if (dbType === 'supabase') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = resolveSupabaseKey(
      'anon',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (!supabaseUrl || !supabaseAnonKey) {
      // Return null during build time, will be initialized at runtime
      return null
    }

    try {
      const { createClient } = require('@supabase/supabase-js')
      dbClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
    } catch (err) {
      // Gracefully handle missing dependencies
      return null
    }
  } else if (dbType === 'neon') {
    // For Neon, queries are handled via API routes
    dbClient = { type: 'neon' }
  }
  
  initialized = true
  return dbClient
}

export function getDBClient() {
  return initializeClient()
}

export function getDatabaseType() {
  return dbType
}

// Generic query executor for both databases
export async function executeQuery(query: string, params: any[] = []) {
  const client = getDBClient()
  
  if (!client && dbType === 'supabase') {
    throw new Error('Database client not initialized. Check your Supabase environment variables.')
  }

  if (dbType === 'supabase') {
    // Supabase RPC is optional, directly use the fetch approach
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params }),
    })

    if (!response.ok) {
      throw new Error('Query execution failed')
    }
    
    const result = await response.json()
    return result
  } else if (dbType === 'neon') {
    // For Neon, use the API route
    const response = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, params }),
    })

    if (!response.ok) {
      throw new Error('Query execution failed')
    }
    
    return response.json()
  }
}

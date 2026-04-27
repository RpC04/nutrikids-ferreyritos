import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, params } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const dbType = process.env.DATABASE_TYPE || 'supabase'

    if (dbType === 'supabase') {
      // For Supabase, use the supabase-js client
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        return NextResponse.json(
          { error: 'Supabase configuration missing' },
          { status: 500 }
        )
      }

      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

      // Execute raw query using RPC or direct query
      // For now, we'll handle specific queries
      const result = await executeSupabaseQuery(supabase, query, params)
      return NextResponse.json(result)
    } else if (dbType === 'neon') {
      // For Neon, use the pg library
      const { Pool } = require('pg')

      const databaseUrl = process.env.DATABASE_URL

      if (!databaseUrl) {
        return NextResponse.json(
          { error: 'Database URL not configured' },
          { status: 500 }
        )
      }

      const pool = new Pool({
        connectionString: databaseUrl,
      })

      const result = await pool.query(query, params)
      await pool.end()

      return NextResponse.json(result.rows)
    } else {
      return NextResponse.json(
        { error: 'Unknown database type' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Query execution error:', error)
    return NextResponse.json(
      { error: error.message || 'Query execution failed' },
      { status: 500 }
    )
  }
}

async function executeSupabaseQuery(supabase: any, query: string, params: any[]) {
  // For Supabase, we need to use RPC or the admin API
  // For now, return a helper that can be called from server actions
  
  try {
    // Use the supabase client to execute the query
    // Note: This is a simplified version. In production, you might want to use
    // stored procedures or the supabase REST API
    
    const { data, error } = await supabase.from('recipes').select('*').limit(1)
    
    if (error) throw error
    
    // For actual query execution, you'd need to use RPC or implement stored procedures
    // For now, we return mock data
    return data
  } catch (error: any) {
    throw error
  }
}

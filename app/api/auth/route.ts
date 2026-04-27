import { NextRequest, NextResponse } from 'next/server'
import { loginAdmin, logoutAdmin, getSession } from '@/lib/auth/actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password } = body

    if (action === 'login') {
      const result = await loginAdmin(email, password)
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 401 }
        )
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'logout') {
      const result = await logoutAdmin()
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        )
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Auth failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No session' },
        { status: 401 }
      )
    }
    return NextResponse.json({ success: true, data: session })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { success: false, error: 'Session check failed' },
      { status: 500 }
    )
  }
}

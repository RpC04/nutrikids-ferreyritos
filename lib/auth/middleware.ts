import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('session')?.value

  if (!token) {
    return null
  }

  try {
    const verified = await jwtVerify(token, secret)
    return verified.payload
  } catch (err) {
    return null
  }
}

export async function adminMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    const session = await verifyAuth(request)

    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { getAdminByEmail } from '@/lib/db/server-actions'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export interface SessionPayload {
  adminId: string
  email: string
  iat?: number
  exp?: number
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function createSession(adminId: string, email: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  const token = await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  })

  return token
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    const payload = verified.payload as SessionPayload

    if (!payload.adminId || !payload.email) {
      return null
    }

    const admin = await getAdminByEmail(normalizeEmail(payload.email))
    if (!admin || admin.id !== payload.adminId) {
      return null
    }

    return {
      adminId: admin.id,
      email: admin.email,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch (err) {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

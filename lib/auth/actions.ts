'use server'

import { createSession, destroySession, verifySession } from './session'
import { verifyAdminPassword, createAdminUser, getAdminByEmail } from '@/lib/db/server-actions'
import * as crypto from 'crypto'

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function hashPassword(password: string): Promise<string> {
  try {
    const bcrypt = require('bcryptjs')
    return await bcrypt.hash(password, 10)
  } catch {
    // Fallback for environments where bcrypt is unavailable.
    return crypto.createHash('sha256').update(password).digest('hex')
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const normalizedEmail = normalizeEmail(email)
    const admin = await verifyAdminPassword(normalizedEmail, password)

    if (admin) {
      await createSession(admin.id, admin.email)
      return { success: true }
    }

    return { success: false, error: 'Credenciales invalidas' }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'No se pudo iniciar sesion' }
  }
}

export async function logoutAdmin() {
  try {
    await destroySession()
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'An error occurred during logout' }
  }
}

export async function getSession() {
  return await verifySession()
}

export async function registerAdminUser(email: string, password: string) {
  try {
    const normalizedEmail = normalizeEmail(email)

    const existingAdmin = await getAdminByEmail(normalizedEmail)
    if (existingAdmin) {
      return { success: false, error: 'El usuario admin ya existe' }
    }

    const passwordHash = await hashPassword(password)
    const createdAdmin = await createAdminUser(normalizedEmail, passwordHash)
    await createSession(createdAdmin.id, createdAdmin.email)

    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { success: false, error: 'Failed to register' }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import {
  getRegistrations,
  createRegistration,
  deleteRegistration,
} from '@/lib/db/server-actions'
import { verifySession } from '@/lib/auth/session'
import { MIN_AGE, MAX_AGE } from '@/lib/constants'
import type { Registration } from '@/lib/db/types/database'

const VALID_SEX_VALUES = new Set<Registration['sexo']>(['F', 'M', 'Otro'])
const VALID_JORNADA_VALUES = new Set<Registration['jornada']>([
  'day1',
  'day2',
  'both',
  'morning',
  'afternoon',
])

function getTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export async function GET(request: NextRequest) {
  try {
    // Only admins can view registrations
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const registrations = await getRegistrations()
    return NextResponse.json({ success: true, data: registrations })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = (await request.json()) as Record<string, unknown>

    const nombres = getTrimmedString(rawBody.nombres)
    const apellidos = getTrimmedString(rawBody.apellidos)
    const dni = getTrimmedString(rawBody.dni)
    const sexo = getTrimmedString(rawBody.sexo)
    const celular = getTrimmedString(rawBody.celular)
    const correo = getTrimmedString(rawBody.correo)
    const jornada = getTrimmedString(rawBody.jornada)
    const diagnostico = getTrimmedString(rawBody.diagnostico)
    const comoSeEntero = getTrimmedString(rawBody.como_se_entero)
    const comentarios = getTrimmedString(rawBody.comentarios)

    const edadRaw = rawBody.edad
    const edad = typeof edadRaw === 'number'
      ? edadRaw
      : Number.parseInt(String(edadRaw ?? ''), 10)

    const requiredFields: Array<{ field: string; value: string | number }> = [
      { field: 'nombres', value: nombres },
      { field: 'apellidos', value: apellidos },
      { field: 'dni', value: dni },
      { field: 'edad', value: edad },
      { field: 'sexo', value: sexo },
      { field: 'celular', value: celular },
      { field: 'correo', value: correo },
      { field: 'jornada', value: jornada },
      { field: 'diagnostico', value: diagnostico },
      { field: 'como_se_entero', value: comoSeEntero },
    ]

    for (const item of requiredFields) {
      if (typeof item.value === 'number') {
        if (!Number.isFinite(item.value)) {
          return NextResponse.json(
            { success: false, error: `Missing required field: ${item.field}` },
            { status: 400 }
          )
        }
        continue
      }

      if (!item.value) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${item.field}` },
          { status: 400 }
        )
      }
    }

    if (!Number.isInteger(edad) || edad < MIN_AGE || edad > MAX_AGE) {
      return NextResponse.json(
        { success: false, error: `Invalid edad. Allowed range: ${MIN_AGE}-${MAX_AGE}` },
        { status: 400 }
      )
    }

    if (!VALID_SEX_VALUES.has(sexo as Registration['sexo'])) {
      return NextResponse.json(
        { success: false, error: 'Invalid sexo value' },
        { status: 400 }
      )
    }

    if (!VALID_JORNADA_VALUES.has(jornada as Registration['jornada'])) {
      return NextResponse.json(
        { success: false, error: 'Invalid jornada value' },
        { status: 400 }
      )
    }

    if (nombres.length > 100 || apellidos.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Nombres y apellidos no pueden exceder 100 caracteres' },
        { status: 400 }
      )
    }

    if (dni.length > 15) {
      return NextResponse.json(
        { success: false, error: 'DNI no puede exceder 15 caracteres' },
        { status: 400 }
      )
    }

    if (celular.length > 20) {
      return NextResponse.json(
        { success: false, error: 'Celular no puede exceder 20 caracteres' },
        { status: 400 }
      )
    }

    if (correo.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Correo no puede exceder 255 caracteres' },
        { status: 400 }
      )
    }

    const payload: Omit<Registration, 'id' | 'created_at' | 'updated_at'> = {
      nombres,
      apellidos,
      dni,
      edad,
      sexo: sexo as Registration['sexo'],
      celular,
      correo,
      jornada: jornada as Registration['jornada'],
      diagnostico,
      como_se_entero: comoSeEntero,
      comentarios: comentarios || null,
    }

    const registration = await createRegistration(payload)

    return NextResponse.json(
      { success: true, data: registration },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating registration:', error)

    const message = error instanceof Error ? error.message : ''

    if (
      message.includes('duplicate key value') ||
      message.includes('registrations_dni_key') ||
      message.includes('duplicate key')
    ) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un registro con ese DNI' },
        { status: 409 }
      )
    }

    if (message.toLowerCase().includes('value too long')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Uno o mas campos exceden el largo permitido (ejemplo: celular maximo 20 caracteres)',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create registration' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing registration ID' },
        { status: 400 }
      )
    }

    await deleteRegistration(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete registration' },
      { status: 500 }
    )
  }
}

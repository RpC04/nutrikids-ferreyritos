import { NextRequest, NextResponse } from 'next/server'
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from '@/lib/db/server-actions'
import { verifySession } from '@/lib/auth/session'

export async function GET() {
  try {
    const activities = await getActivities()
    return NextResponse.json({ success: true, data: activities })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Contenido temporalmente no disponible',
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const activity = await createActivity(body)

    return NextResponse.json({ success: true, data: activity }, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, ...data } = await request.json()
    const activity = await updateActivity(id, data)

    return NextResponse.json({ success: true, data: activity })
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
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
        { success: false, error: 'Missing activity ID' },
        { status: 400 }
      )
    }

    await deleteActivity(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}

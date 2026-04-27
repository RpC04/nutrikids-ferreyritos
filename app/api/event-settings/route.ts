import { NextRequest, NextResponse } from 'next/server'
import { getEventSettings, updateEventSettings } from '@/lib/db/server-actions'
import { verifySession } from '@/lib/auth/session'

export async function GET() {
  try {
    const settings = await getEventSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching event settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event settings' },
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

    const {
      event_date,
      start_date,
      end_date,
      display_date_label,
      team_name,
      team_size,
    } = await request.json()

    const parsedTeamSize =
      typeof team_size === 'string' ? parseInt(team_size, 10) : team_size

    if (!event_date && !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing start_date or event_date' },
        { status: 400 }
      )
    }

    const settings = await updateEventSettings({
      event_date,
      start_date,
      end_date,
      display_date_label,
      team_name,
      team_size:
        typeof parsedTeamSize === 'number' && Number.isFinite(parsedTeamSize)
          ? parsedTeamSize
          : null,
    })

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error updating event settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event settings' },
      { status: 500 }
    )
  }
}

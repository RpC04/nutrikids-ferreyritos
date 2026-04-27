'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Activity } from '@/lib/db/types/database'
import { SHIFTS } from '@/lib/constants'
import { Clock, MapPin, Users } from 'lucide-react'

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const shift = SHIFTS[activity.shift as keyof typeof SHIFTS]

  const activityDate = new Date(activity.date)
  const formattedDate = activityDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg">{activity.title}</CardTitle>
            <CardDescription>{activity.description}</CardDescription>
          </div>
          <Badge variant="secondary">{shift?.label || activity.shift}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span>{formattedDate} a las {activity.time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{activity.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>Capacidad: {activity.capacity} personas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

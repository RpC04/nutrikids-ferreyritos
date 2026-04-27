'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, Users, Settings } from 'lucide-react'
import type { Recipe, Activity, Registration, EventSettings } from '@/lib/db/types/database'

function formatEventDateRange(settings: EventSettings) {
  if (settings.display_date_label) {
    return settings.display_date_label
  }

  const startDate = settings.start_date || settings.event_date
  const endDate = settings.end_date || settings.start_date || settings.event_date

  if (!startDate) return 'Sin fecha configurada'

  const start = new Date(startDate)
  const end = new Date(endDate || startDate)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Sin fecha configurada'
  }

  if (startDate === endDate) {
    return start.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return `${start.toLocaleDateString('es-ES')} al ${end.toLocaleDateString('es-ES')}`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    recipes: 0,
    activities: 0,
    registrations: 0,
  })
  const [eventSettings, setEventSettings] = useState<EventSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [recipesRes, activitiesRes, registrationsRes, settingsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/activities'),
        fetch('/api/registrations'),
        fetch('/api/event-settings'),
      ])

      const [recipesData, activitiesData, registrationsData, settingsData] = await Promise.all([
        recipesRes.json(),
        activitiesRes.json(),
        registrationsRes.json(),
        settingsRes.json(),
      ])

      setStats({
        recipes: recipesData.data?.length || 0,
        activities: activitiesData.data?.length || 0,
        registrations: registrationsData.data?.length || 0,
      })

      if (settingsData.data) {
        setEventSettings(settingsData.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Recetas',
      value: stats.recipes,
      icon: BookOpen,
      description: 'Recetas activas',
    },
    {
      title: 'Actividades',
      value: stats.activities,
      icon: Calendar,
      description: 'Actividades programadas',
    },
    {
      title: 'Registros',
      value: stats.registrations,
      icon: Users,
      description: 'Participantes registrados',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de administración de NutriKids
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.description}
                    </p>
                  </div>
                  <Icon className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Event Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración Global
          </CardTitle>
          <CardDescription>
            Información del evento principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : eventSettings ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  Rango del Evento
                </label>
                <p className="text-lg font-semibold mt-1">
                  {formatEventDateRange(eventSettings)}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">
                  Equipo
                </label>
                <p className="text-sm mt-1">
                  {eventSettings.team_name || 'Equipo NutriKids'} · {eventSettings.team_size || 31} integrantes
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Para cambiar la fecha del evento, ve a la sección de Configuración
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No hay configuración disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agregar Nueva Receta</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crea nuevas recetas nutritivas
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Crear Nueva Actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Programa actividades para las jornadas
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ver Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Consulta todos los registros de participantes
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cambiar Fecha del Evento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Actualiza la fecha principal del evento
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

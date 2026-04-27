'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { EventSettings } from '@/lib/db/types/database'

function formatDateLabel(dateValue: string | null | undefined) {
  if (!dateValue) return 'No configurada'

  const [year, month, day] = dateValue.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) return 'No configurada'

  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateRangeLabel(startDate: string, endDate: string, customLabel?: string) {
  if (customLabel?.trim()) return customLabel.trim()
  if (!startDate) return 'Sin fechas configuradas'

  const [sYear, sMonth, sDay] = startDate.split('-');
  const start = new Date(Number(sYear), Number(sMonth) - 1, Number(sDay));
  
  const end = new Date(endDate || startDate)

  if (Number.isNaN(start.getTime())) return 'Sin fechas configuradas'
  if (Number.isNaN(end.getTime())) return formatDateLabel(startDate)

  if (startDate === endDate) {
    return start.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const startDay = start.getDate()
  const endDay = end.getDate()
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()

  if (sameMonth) {
    const monthName = start.toLocaleDateString('es-ES', { month: 'long' })
    return `${startDay} y ${endDay} de ${monthName} de ${start.getFullYear()}`
  }

  return `${formatDateLabel(startDate)} al ${formatDateLabel(endDate)}`
}

export default function EventSettingsPage() {
  const [settings, setSettings] = useState<EventSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    display_date_label: '',
    team_name: 'Equipo universitario independiente NutriKids',
    team_size: '31',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const renderedDateLabel = useMemo(() => {
    return formatDateRangeLabel(
      formData.start_date,
      formData.end_date || formData.start_date,
      formData.display_date_label
    )
  }, [formData])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/event-settings')
      const data = await response.json()

      if (data.success && data.data) {
        const resolvedStartDate = data.data.start_date || data.data.event_date || ''
        const resolvedEndDate = data.data.end_date || data.data.event_date || resolvedStartDate

        setSettings(data.data)
        setFormData({
          start_date: resolvedStartDate,
          end_date: resolvedEndDate,
          display_date_label: data.data.display_date_label || '',
          team_name: data.data.team_name || 'Equipo universitario independiente NutriKids',
          team_size:
            typeof data.data.team_size === 'number' && Number.isFinite(data.data.team_size)
              ? data.data.team_size.toString()
              : '31',
        })
      } else if (data.success && !data.data) {
        const today = new Date().toISOString().split('T')[0]
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        setFormData({
          start_date: today,
          end_date: tomorrow,
          display_date_label: '',
          team_name: 'Equipo universitario independiente NutriKids',
          team_size: '31',
        })
      } else {
        setError(data.error || 'No se encontró configuración del evento')
      }
    } catch (err) {
      setError('Error al cargar la configuración')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      if (!formData.start_date) {
        setError('La fecha de inicio es obligatoria')
        setSaving(false)
        return
      }

      const parsedTeamSize = parseInt(formData.team_size, 10)
      if (!Number.isNaN(parsedTeamSize) && parsedTeamSize <= 0) {
        setError('El número de integrantes debe ser mayor que cero')
        setSaving(false)
        return
      }

      const response = await fetch('/api/event-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_date: formData.start_date,
          start_date: formData.start_date,
          end_date: formData.end_date || formData.start_date,
          display_date_label: formData.display_date_label || null,
          team_name: formData.team_name || null,
          team_size: Number.isNaN(parsedTeamSize) ? null : parsedTeamSize,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || 'No se pudo guardar la configuración')
      }
    } catch (err) {
      setError('Error al guardar la configuración')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración del Evento</h1>
        <p className="text-muted-foreground mt-2">
          Define las fechas generales y datos globales que se renderizan en toda la web
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Configuración guardada exitosamente
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Fechas Generales del Evento</CardTitle>
            <CardDescription>
              Estas fechas se muestran en inicio, evento y footer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de inicio *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de cierre</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_date_label">Texto personalizado para fechas</Label>
                <Input
                  id="display_date_label"
                  value={formData.display_date_label}
                  onChange={(e) => setFormData({ ...formData, display_date_label: e.target.value })}
                  placeholder="Ejemplo: 1 y 2 de mayo de 2026"
                />
                <p className="text-xs text-muted-foreground">
                  Si lo dejas en blanco, la web genera el texto automáticamente según el rango
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="team_name">Nombre del equipo</Label>
                  <Input
                    id="team_name"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    placeholder="Equipo universitario independiente NutriKids"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_size">Número de integrantes</Label>
                  <Input
                    id="team_size"
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-note">Nota interna</Label>
                <Textarea
                  id="event-note"
                  value={`Texto renderizado actual: ${renderedDateLabel}`}
                  readOnly
                  rows={2}
                  className="text-sm"
                />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vista Actual</CardTitle>
            <CardDescription>
              Resumen de lo que se está mostrando en la página principal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Fecha de inicio</Label>
                <p className="text-base font-semibold">{formatDateLabel(formData.start_date)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Fecha de cierre</Label>
                <p className="text-base font-semibold">{formatDateLabel(formData.end_date || formData.start_date)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Texto visible</Label>
                <p className="text-base font-semibold">{renderedDateLabel}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Equipo</Label>
                <p className="text-base font-semibold">
                  {(formData.team_name || 'Equipo NutriKids')} · {formData.team_size || '31'} integrantes
                </p>
              </div>
              {settings && (
                <div>
                  <Label className="text-muted-foreground">Última actualización</Label>
                  <p>{new Date(settings.updated_at).toLocaleString('es-ES')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import type { Activity } from '@/lib/db/types/database'
import { LEGACY_SHIFT_TO_CURRENT, SHIFTS } from '@/lib/constants'

function normalizeShiftForForm(shift: string) {
  if (shift in SHIFTS) return shift

  const legacyMapped = LEGACY_SHIFT_TO_CURRENT[shift as keyof typeof LEGACY_SHIFT_TO_CURRENT]
  return legacyMapped || 'day1'
}

export default function ActivitiesAdminPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    shift: 'day1',
    time: '',
    location: '',
    capacity: '30',
  })

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/activities')
      const data = await response.json()

      if (data.success) {
        setActivities(data.data || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar las actividades')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingId ? 'PUT' : 'POST'
      const body = editingId
        ? { id: editingId, ...formData, capacity: parseInt(formData.capacity, 10) }
        : { ...formData, capacity: parseInt(formData.capacity, 10) }

      const response = await fetch('/api/activities', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        await fetchActivities()
        setOpenDialog(false)
        setEditingId(null)
        setFormData({
          title: '',
          description: '',
          date: '',
          shift: 'day1',
          time: '',
          location: '',
          capacity: '30',
        })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al guardar la actividad')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id)
    setFormData({
      title: activity.title,
      description: activity.description,
      date: activity.date,
      shift: normalizeShiftForForm(activity.shift),
      time: activity.time,
      location: activity.location,
      capacity: activity.capacity.toString(),
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return

    try {
      const response = await fetch(`/api/activities?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchActivities()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al eliminar la actividad')
      console.error(err)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      date: '',
      shift: 'day1',
      time: '',
      location: '',
      capacity: '30',
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestionar Actividades</h1>
        <p className="text-muted-foreground mt-2">
          Crea, edita y elimina actividades para ambas jornadas
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Actividad' : 'Nueva Actividad'}
              </DialogTitle>
              <DialogDescription>
                Completa los detalles de la actividad
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shift">Jornada *</Label>
                  <Select value={normalizeShiftForForm(formData.shift)} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                    <SelectTrigger id="shift">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SHIFTS).map(([key, shift]) => (
                        <SelectItem key={key} value={key}>
                          {shift.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidad *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividades ({activities.length})</CardTitle>
          <CardDescription>
            Lista de todas las actividades programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay actividades creadas aún
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead className="hidden sm:table-cell">Jornada</TableHead>
                    <TableHead className="hidden lg:table-cell">Ubicación</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => {
                    const normalizedShift = normalizeShiftForForm(activity.shift)
                    const shift = SHIFTS[normalizedShift as keyof typeof SHIFTS]
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">
                          {new Date(activity.date).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {shift?.label || activity.shift}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm">
                          {activity.location}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(activity.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Fragment, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Trash2, Download, ChevronDown, ChevronRight } from 'lucide-react'
import type { Registration } from '@/lib/db/types/database'

const JORNADA_LABELS: Record<string, string> = {
  day1: 'Día 1 · Jornada con niños',
  day2: 'Día 2 · Jornada con familias',
  both: 'Ambas jornadas',
  morning: 'Día 1 · Jornada con niños',
  afternoon: 'Día 2 · Jornada con familias',
}

const DIAGNOSTICO_LABELS: Record<string, string> = {
  si_actualmente: 'Sí, actualmente tengo anemia',
  si_recuperado: 'Sí, pero ya me recuperé',
  no_nunca: 'No, nunca',
  no_se: 'No sé / No me han examinado',
}

function humanizeUnderscoreValue(value: string) {
  return value.replace(/_/g, ' ').trim()
}

function getJornadaLabel(jornada: string) {
  return JORNADA_LABELS[jornada] || jornada
}

function getDiagnosticoLabel(diagnostico: string) {
  return DIAGNOSTICO_LABELS[diagnostico] || humanizeUnderscoreValue(diagnostico)
}

export default function RegistrationsAdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/registrations')
      const data = await response.json()

      if (data.success) {
        setRegistrations(data.data || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar los registros')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return

    try {
      const response = await fetch(`/api/registrations?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchRegistrations()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al eliminar el registro')
      console.error(err)
    }
  }

  const toggleExpandedRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const exportToCSV = () => {
    const headers = [
      'Nombres',
      'Apellidos',
      'DNI',
      'Edad',
      'Sexo',
      'Celular',
      'Correo',
      'Jornada',
      'Diagnóstico',
      'Cómo se enteró',
      'Comentarios',
      'Fecha de registro',
    ]

    const rows = registrations.map((reg) => [
      reg.nombres,
      reg.apellidos,
      reg.dni,
      reg.edad,
      reg.sexo,
      reg.celular,
      reg.correo,
      getJornadaLabel(reg.jornada),
      getDiagnosticoLabel(reg.diagnostico),
      reg.como_se_entero,
      reg.comentarios || '',
      new Date(reg.created_at).toLocaleDateString('es-ES'),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `registros-nutrikids-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Registros de Participación</h1>
        <p className="text-muted-foreground mt-2">
          Visualiza y gestiona todos los registros de participantes
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Descargar CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros ({registrations.length})</CardTitle>
          <CardDescription>
            Todos los registros de participantes en NutriKids. Usa la flecha para ver el detalle completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Cargando...</p>
          ) : registrations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay registros aún
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12" />
                    <TableHead>Participante</TableHead>
                    <TableHead className="hidden md:table-cell">Jornada</TableHead>
                    <TableHead className="hidden lg:table-cell">Correo</TableHead>
                    <TableHead className="hidden xl:table-cell">Fecha</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => {
                    const isExpanded = expandedRows.has(reg.id)

                    return (
                      <Fragment key={reg.id}>
                        <TableRow>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleExpandedRow(reg.id)}
                              aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium whitespace-normal">
                            <div>{reg.nombres} {reg.apellidos}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              DNI: {reg.dni} · {reg.edad} años · {reg.sexo}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">
                            {getJornadaLabel(reg.jornada)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {reg.correo}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-sm">
                            {new Date(reg.created_at).toLocaleDateString('es-ES')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(reg.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {isExpanded && (
                          <TableRow key={`${reg.id}-details`} className="bg-muted/30 hover:bg-muted/30">
                            <TableCell />
                            <TableCell colSpan={5} className="whitespace-normal py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Nombres</p>
                                  <p className="font-medium">{reg.nombres}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Apellidos</p>
                                  <p className="font-medium">{reg.apellidos}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">DNI</p>
                                  <p className="font-medium">{reg.dni}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Edad</p>
                                  <p className="font-medium">{reg.edad} años</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Sexo</p>
                                  <p className="font-medium">{reg.sexo}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Celular</p>
                                  <p className="font-medium">{reg.celular}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Correo</p>
                                  <p className="font-medium break-all">{reg.correo}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Jornada</p>
                                  <p className="font-medium">{getJornadaLabel(reg.jornada)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Diagnóstico</p>
                                  <p className="font-medium">{getDiagnosticoLabel(reg.diagnostico)}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Cómo se enteró</p>
                                  <p className="font-medium">{reg.como_se_entero}</p>
                                </div>
                                <div className="xl:col-span-2">
                                  <p className="text-muted-foreground">Comentarios</p>
                                  <p className="font-medium">{reg.comentarios || 'Sin comentarios'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Fecha de registro</p>
                                  <p className="font-medium">
                                    {new Date(reg.created_at).toLocaleString('es-ES')}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
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

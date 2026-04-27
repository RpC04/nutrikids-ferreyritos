'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { GENDER_OPTIONS, HOW_FOUND_OPTIONS, SHIFTS, MIN_AGE, MAX_AGE } from '@/lib/constants'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function RegistrationForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    edad: '',
    sexo: '',
    celular: '',
    correo: '',
    jornada: '',
    diagnostico: '',
    como_se_entero: '',
    comentarios: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate required fields
      const edad = parseInt(formData.edad, 10)
      if (isNaN(edad) || edad < MIN_AGE || edad > MAX_AGE) {
        setError(`La edad debe estar entre ${MIN_AGE} y ${MAX_AGE} años`)
        setLoading(false)
        return
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          edad,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || 'Error al enviar el registro')
        setLoading(false)
        return
      }

      setSuccess(true)
      setFormData({
        nombres: '',
        apellidos: '',
        dni: '',
        edad: '',
        sexo: '',
        celular: '',
        correo: '',
        jornada: '',
        diagnostico: '',
        como_se_entero: '',
        comentarios: '',
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="registro" className="py-12 px-4 bg-background">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Participación</CardTitle>
            <CardDescription>
              Completa este formulario para registrarte en NutriKids
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ¡Registro enviado exitosamente! Te contactaremos pronto.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres *</Label>
                  <Input
                    id="nombres"
                    placeholder="Ej: Juan"
                    value={formData.nombres}
                    onChange={(e) => handleChange('nombres', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos *</Label>
                  <Input
                    id="apellidos"
                    placeholder="Ej: Pérez García"
                    value={formData.apellidos}
                    onChange={(e) => handleChange('apellidos', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* DNI y Edad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI *</Label>
                  <Input
                    id="dni"
                    placeholder="Ej: 12345678"
                    value={formData.dni}
                    onChange={(e) => handleChange('dni', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input
                    id="edad"
                    type="number"
                    min={MIN_AGE}
                    max={MAX_AGE}
                    placeholder="Ej: 10"
                    value={formData.edad}
                    onChange={(e) => handleChange('edad', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Sexo */}
              <div className="space-y-3">
                <Label>Sexo *</Label>
                <RadioGroup value={formData.sexo} onValueChange={(value) => handleChange('sexo', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="sexo-m" />
                    <Label htmlFor="sexo-m" className="font-normal cursor-pointer">
                      Masculino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="sexo-f" />
                    <Label htmlFor="sexo-f" className="font-normal cursor-pointer">
                      Femenino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Otro" id="sexo-otro" />
                    <Label htmlFor="sexo-otro" className="font-normal cursor-pointer">
                      Otro
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Celular y Correo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celular">Celular *</Label>
                  <Input
                    id="celular"
                    placeholder="Ej: 987654321"
                    value={formData.celular}
                    onChange={(e) => handleChange('celular', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="Ej: correo@example.com"
                    value={formData.correo}
                    onChange={(e) => handleChange('correo', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Jornada */}
              <div className="space-y-2">
                <Label htmlFor="jornada">Jornada de preferencia *</Label>
                <Select value={formData.jornada} onValueChange={(value) => handleChange('jornada', value)}>
                  <SelectTrigger id="jornada">
                    <SelectValue placeholder="Selecciona una jornada" />
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

              {/* Diagnóstico */}
              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico nutricional (si aplica) *</Label>
                <Textarea
                  id="diagnostico"
                  placeholder="Describe cualquier condición nutricional especial..."
                  value={formData.diagnostico}
                  onChange={(e) => handleChange('diagnostico', e.target.value)}
                  required
                  rows={3}
                />
              </div>

              {/* Cómo se enteró */}
              <div className="space-y-2">
                <Label htmlFor="como_se_entero">¿Cómo te enteraste de NutriKids? *</Label>
                <Select value={formData.como_se_entero} onValueChange={(value) => handleChange('como_se_entero', value)}>
                  <SelectTrigger id="como_se_entero">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOW_FOUND_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Comentarios */}
              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios adicionales</Label>
                <Textarea
                  id="comentarios"
                  placeholder="Cuéntanos algo más que consideres importante..."
                  value={formData.comentarios}
                  onChange={(e) => handleChange('comentarios', e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Enviando...' : 'Registrarse'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

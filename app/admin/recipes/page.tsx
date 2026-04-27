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
import { Plus, Trash2, Edit2, AlertCircle } from 'lucide-react'
import type { Recipe } from '@/lib/db/types/database'

export default function RecipesAdminPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    preparation: '',
    preparation_time_minutes: '',
    servings: '',
    notes: '',
    image_url: '',
  })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recipes')
      const data = await response.json()

      if (data.success) {
        setRecipes(data.data || [])
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al cargar las recetas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const parsedPreparationTime = formData.preparation_time_minutes
        ? parseInt(formData.preparation_time_minutes, 10)
        : null
      const parsedServings = formData.servings
        ? parseInt(formData.servings, 10)
        : null

      if (formData.preparation_time_minutes && (parsedPreparationTime === null || Number.isNaN(parsedPreparationTime))) {
        setError('El tiempo de preparación debe ser un número válido')
        setLoading(false)
        return
      }

      if (formData.servings && (parsedServings === null || Number.isNaN(parsedServings))) {
        setError('Las porciones deben ser un número válido')
        setLoading(false)
        return
      }

      const method = editingId ? 'PUT' : 'POST'
      const payload = {
        ...formData,
        preparation_time_minutes: parsedPreparationTime,
        servings: parsedServings,
        notes: formData.notes || null,
      }

      const body = editingId
        ? { id: editingId, ...payload }
        : payload

      const response = await fetch('/api/recipes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        await fetchRecipes()
        setOpenDialog(false)
        setEditingId(null)
        setFormData({
          title: '',
          description: '',
          ingredients: '',
          preparation: '',
          preparation_time_minutes: '',
          servings: '',
          notes: '',
          image_url: '',
        })
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al guardar la receta')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingId(recipe.id)
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients,
      preparation: recipe.preparation,
      preparation_time_minutes:
        typeof recipe.preparation_time_minutes === 'number'
          ? recipe.preparation_time_minutes.toString()
          : '',
      servings: typeof recipe.servings === 'number' ? recipe.servings.toString() : '',
      notes: recipe.notes || '',
      image_url: recipe.image_url || '',
    })
    setOpenDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta receta?')) return

    try {
      const response = await fetch(`/api/recipes?id=${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        await fetchRecipes()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Error al eliminar la receta')
      console.error(err)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      ingredients: '',
      preparation: '',
      preparation_time_minutes: '',
      servings: '',
      notes: '',
      image_url: '',
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestionar Recetas</h1>
        <p className="text-muted-foreground mt-2">
          Crea, edita y elimina recetas nutricionales
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
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Receta' : 'Nueva Receta'}
              </DialogTitle>
              <DialogDescription>
                Completa los detalles de la receta
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

              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredientes *</Label>
                <Textarea
                  id="ingredients"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  rows={3}
                  placeholder="Uno por línea"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preparation">Preparación *</Label>
                <Textarea
                  id="preparation"
                  value={formData.preparation}
                  onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preparation_time_minutes">Tiempo de preparación (min)</Label>
                  <Input
                    id="preparation_time_minutes"
                    type="number"
                    min="1"
                    value={formData.preparation_time_minutes}
                    onChange={(e) => setFormData({ ...formData, preparation_time_minutes: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servings">Porciones</Label>
                  <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Tip nutricional</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Ejemplo: Acompaña con limón para mejorar la absorción del hierro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
          <CardTitle>Recetas ({recipes.length})</CardTitle>
          <CardDescription>
            Lista de todas las recetas disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay recetas creadas aún
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Tiempo / Porciones</TableHead>
                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">{recipe.title}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">
                        {typeof recipe.preparation_time_minutes === 'number'
                          ? `${recipe.preparation_time_minutes} min`
                          : 'Sin tiempo'}
                        {' · '}
                        {typeof recipe.servings === 'number'
                          ? `${recipe.servings} porciones`
                          : 'Sin porciones'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {recipe.description.length > 50
                          ? `${recipe.description.substring(0, 50)}...`
                          : recipe.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(recipe)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(recipe.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { RecipeCard } from './recipe-card'
import type { Recipe } from '@/lib/db/types/database'
import { Skeleton } from '@/components/ui/skeleton'

export function RecipesSection() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [contentUnavailable, setContentUnavailable] = useState(false)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('/api/recipes')
        const data = await response.json()

        if (response.ok && data.success) {
          setRecipes(data.data || [])
          setContentUnavailable(false)
        } else {
          setRecipes([])
          setContentUnavailable(true)
        }
      } catch (err) {
        setRecipes([])
        setContentUnavailable(true)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  if (loading) {
    return (
      <section className="py-12 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Recetas Nutritivas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="recetas" className="py-12 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Recetas Nutritivas</h2>
        <p className="text-muted-foreground mb-8">
          Descubre deliciosas recetas saludables para los niños
        </p>

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-10 px-6 text-center">
            <h3 className="text-lg font-semibold">Estamos preparando nuevas recetas</h3>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {contentUnavailable
                ? 'En este momento no fue posible cargar el contenido. Vuelve en unos minutos para ver nuevas publicaciones.'
                : 'Aun no hay recetas publicadas. Pronto compartiremos ideas saludables para toda la familia.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

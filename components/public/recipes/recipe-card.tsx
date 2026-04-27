'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Recipe } from '@/lib/db/types/database'
import Image from 'next/image'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {recipe.image_url && (
        <div className="relative w-full h-48 bg-muted">
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{recipe.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {recipe.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Ingredientes:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {recipe.ingredients}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-2">Preparación:</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
            {recipe.preparation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

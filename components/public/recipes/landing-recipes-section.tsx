import type { Recipe } from '@/lib/db/types/database'

interface LandingRecipesSectionProps {
  recipesLoading: boolean
  recipes: Recipe[]
  recipesUnavailable: boolean
}

export function LandingRecipesSection({
  recipesLoading,
  recipes,
  recipesUnavailable,
}: LandingRecipesSectionProps) {
  return (
    <section id="recetas" className="nk-section nk-section-white">
      <div className="nk-container">
        <div className="nk-section-tag">Nutricion</div>
        <h2 className="nk-h2">Recetas <span>saludables</span></h2>
        <p className="nk-section-intro">Recetas ricas en hierro, faciles de preparar y con ingredientes accesibles para toda la familia.</p>

        {recipesLoading ? (
          <div className="nk-empty-card nk-fade-in">Cargando recetas...</div>
        ) : recipes.length === 0 ? (
          <div className="nk-empty-card nk-fade-in">
            <h3>Estamos preparando nuevas recetas</h3>
            <p>
              {recipesUnavailable
                ? 'En este momento no fue posible cargar el contenido. Vuelve en unos minutos para ver nuevas publicaciones.'
                : 'Aun no hay recetas publicadas. Pronto compartiremos ideas saludables para toda la familia.'}
            </p>
          </div>
        ) : (
          <div className="nk-recetas-grid nk-fade-in">
            {recipes.map((recipe, index) => (
              <article className="nk-receta-card" key={recipe.id}>
                <div className="nk-receta-header">
                  <div className="nk-receta-num">{index + 1}</div>
                  <div>
                    <div className="nk-receta-title">{recipe.title}</div>
                    <div className="nk-receta-time">
                      ⏱ {typeof recipe.preparation_time_minutes === 'number' ? `${recipe.preparation_time_minutes} min` : 'Tiempo por confirmar'}
                      {' · '}
                      {typeof recipe.servings === 'number' ? `${recipe.servings} porciones` : 'Porciones por confirmar'}
                    </div>
                  </div>
                </div>
                <div className="nk-receta-body">
                  <div className="nk-receta-ingredientes">Ingredientes principales</div>
                  <p>{recipe.ingredients}</p>
                  
                  <div className="nk-receta-ingredientes">Preparación</div>
                  <p className="nk-receta-preparation">{recipe.preparation}</p>
                  <div className="nk-receta-tip">
                    💡 {recipe.notes || recipe.description || 'Acompana con alimentos ricos en vitamina C para mejorar la absorcion del hierro.'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

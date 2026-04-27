'use client'

import { useEffect, useState } from 'react'
import { ActivityCard } from './activity-card'
import type { Activity } from '@/lib/db/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [contentUnavailable, setContentUnavailable] = useState(false)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/activities')
        const data = await response.json()

        if (response.ok && data.success) {
          setActivities(data.data || [])
          setContentUnavailable(false)
        } else {
          setActivities([])
          setContentUnavailable(true)
        }
      } catch (err) {
        setActivities([])
        setContentUnavailable(true)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const morningActivities = activities.filter((a) => a.shift === 'morning')
  const afternoonActivities = activities.filter((a) => a.shift === 'afternoon')

  if (loading) {
    return (
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Actividades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="actividades" className="py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-2">Actividades</h2>
        <p className="text-muted-foreground mb-8">
          Participa en nuestras actividades educativas y divertidas
        </p>

        {activities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/70 py-10 px-6 text-center">
            <h3 className="text-lg font-semibold">Las actividades estaran disponibles pronto</h3>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              {contentUnavailable
                ? 'No pudimos cargar las actividades por ahora. Revisa nuevamente en unos minutos.'
                : 'Todavia no se han publicado actividades para esta fecha. En breve veras nuevas opciones aqui.'}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Todas las jornadas</TabsTrigger>
              <TabsTrigger value="morning">Mañana</TabsTrigger>
              <TabsTrigger value="afternoon">Tarde</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="space-y-6">
                {morningActivities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Jornada de Mañana</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {morningActivities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </div>
                )}

                {afternoonActivities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Jornada de Tarde</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {afternoonActivities.map((activity) => (
                        <ActivityCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="morning" className="mt-6">
              {morningActivities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay actividades en la jornada de mañana
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {morningActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="afternoon" className="mt-6">
              {afternoonActivities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No hay actividades en la jornada de tarde
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {afternoonActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  )
}

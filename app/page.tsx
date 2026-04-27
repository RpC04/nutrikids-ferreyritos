'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Activity, EventSettings, Recipe } from '@/lib/db/types/database'
import { MAX_AGE, MIN_AGE } from '@/lib/constants'
import { AnemiaInfoSection } from '@/components/public/anemia/anemia-info-section'
import { LandingRecipesSection } from '@/components/public/recipes/landing-recipes-section'
import { TeamWorkSection } from '@/components/public/team/team-work-section'

type CanonicalShift = 'day1' | 'day2' | 'both'

interface RegistrationFormState {
    nombres: string
    apellidos: string
    dni: string
    edad: string
    sexo: string
    celular: string
    correo: string
    jornada: string
    diagnostico: string
    como_se_entero: string
    comentarios: string
}

const REGISTRATION_INITIAL_STATE: RegistrationFormState = {
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
}

function getTodayDateValue() {
    return new Date().toISOString().split('T')[0]
}

function addDaysToDateValue(dateValue: string, days: number) {
    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return dateValue

    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
}

function normalizeShift(value: string | null | undefined): CanonicalShift {
    if (!value) return 'day1'

    const normalized = value.toLowerCase()
    if (normalized === 'day1' || normalized === 'day2' || normalized === 'both') {
        return normalized
    }

    if (normalized === 'morning') return 'day1'
    if (normalized === 'afternoon') return 'day2'
    return 'day1'
}

function formatDateHuman(dateValue: string | null | undefined) {
    if (!dateValue) return 'Fecha pendiente'

    const [year, month, day] = dateValue.split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    
    if (Number.isNaN(date.getTime())) return 'Fecha pendiente'

    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

function formatDateCompact(dateValue: string | null | undefined) {
    if (!dateValue) return 'Fecha pendiente'

    const [year, month, day] = dateValue.split('-')
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    
    if (Number.isNaN(date.getTime())) return 'Fecha pendiente'

    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })
}

function getRenderedDateRange(settings: Partial<EventSettings>) { 

    const startDateValue = settings.start_date || settings.event_date
    const endDateValue = settings.end_date || settings.start_date || settings.event_date

    if (!startDateValue) return 'Fechas por confirmar'
    
    const [sYear, sMonth, sDay] = startDateValue.split('-')
    const start = new Date(Number(sYear), Number(sMonth) - 1, Number(sDay))

    const [eYear, eMonth, eDay] = (endDateValue || startDateValue).split('-')
    const end = new Date(Number(eYear), Number(eMonth) - 1, Number(eDay))

    if (startDateValue === endDateValue) {
        return formatDateCompact(startDateValue)
    }

    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        const monthName = start.toLocaleDateString('es-ES', { month: 'long' })
        return `${start.getDate()} y ${end.getDate()} de ${monthName} de ${start.getFullYear()}`
    }

    return `${formatDateCompact(startDateValue)} al ${formatDateCompact(endDateValue)}`
}

function getEventDayCount(startDateValue: string, endDateValue: string) {
    const [sYear, sMonth, sDay] = startDateValue.split('-')
    const start = new Date(Number(sYear), Number(sMonth) - 1, Number(sDay))

    const [eYear, eMonth, eDay] = endDateValue.split('-')
    const end = new Date(Number(eYear), Number(eMonth) - 1, Number(eDay))

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1

    const diffInMs = end.getTime() - start.getTime()
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1
    return Math.max(totalDays, 1)
}

export default function HomePage() {
    const defaultStartDate = getTodayDateValue()
    const defaultEndDate = addDaysToDateValue(defaultStartDate, 1)

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [activities, setActivities] = useState<Activity[]>([])
    const [eventSettings, setEventSettings] = useState<Partial<EventSettings>>({
        start_date: defaultStartDate,
        end_date: defaultEndDate,
        event_date: defaultStartDate,
        display_date_label: '',
        team_name: 'Equipo universitario independiente NutriKids',
        team_size: 31,
    })

    const [recipesLoading, setRecipesLoading] = useState(true)
    const [activitiesLoading, setActivitiesLoading] = useState(true)
    const [contentUnavailable, setContentUnavailable] = useState({
        recipes: false,
        activities: false,
    })

    const [registrationForm, setRegistrationForm] = useState<RegistrationFormState>(REGISTRATION_INITIAL_STATE)
    const [registrationSending, setRegistrationSending] = useState(false)
    const [registrationSuccess, setRegistrationSuccess] = useState(false)
    const [registrationError, setRegistrationError] = useState<string | null>(null)

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch('/api/recipes')
                const data = await response.json()

                if (response.ok && data.success) {
                    setRecipes(Array.isArray(data.data) ? data.data : [])
                    setContentUnavailable((prev) => ({ ...prev, recipes: false }))
                } else {
                    setRecipes([])
                    setContentUnavailable((prev) => ({ ...prev, recipes: true }))
                }
            } catch (error) {
                console.error(error)
                setRecipes([])
                setContentUnavailable((prev) => ({ ...prev, recipes: true }))
            } finally {
                setRecipesLoading(false)
            }
        }

        const fetchActivities = async () => {
            try {
                const response = await fetch('/api/activities')
                const data = await response.json()

                if (response.ok && data.success) {
                    setActivities(Array.isArray(data.data) ? data.data : [])
                    setContentUnavailable((prev) => ({ ...prev, activities: false }))
                } else {
                    setActivities([])
                    setContentUnavailable((prev) => ({ ...prev, activities: true }))
                }
            } catch (error) {
                console.error(error)
                setActivities([])
                setContentUnavailable((prev) => ({ ...prev, activities: true }))
            } finally {
                setActivitiesLoading(false)
            }
        }

        const fetchEventSettings = async () => {
            try {
                const response = await fetch('/api/event-settings')
                const data = await response.json()

                if (response.ok && data.success && data.data) {
                    const startDate = data.data.start_date || data.data.event_date
                    const endDate = data.data.end_date || startDate

                    setEventSettings({
                        ...data.data,
                        start_date: startDate,
                        end_date: endDate,
                        display_date_label: data.data.display_date_label || '',
                        team_name: data.data.team_name || 'Equipo universitario independiente NutriKids',
                        team_size: typeof data.data.team_size === 'number' ? data.data.team_size : 31,
                    })
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchRecipes()
        fetchActivities()
        fetchEventSettings()
    }, [defaultEndDate, defaultStartDate])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible')
                    }
                })
            },
            { threshold: 0.1 }
        )

        const animatedElements = document.querySelectorAll('.nk-fade-in')
        animatedElements.forEach((element) => observer.observe(element))

        return () => observer.disconnect()
    }, [recipes.length, activities.length])

    const startDateValue = eventSettings.start_date || eventSettings.event_date || defaultStartDate
    const endDateValue = eventSettings.end_date || eventSettings.start_date || eventSettings.event_date || defaultEndDate

    const renderedDateRange = useMemo(
        () => getRenderedDateRange(eventSettings),
        [eventSettings]
    )

    const eventDays = getEventDayCount(startDateValue, endDateValue)
    const normalizedActivities = activities.map((activity) => ({
        ...activity,
        shift: normalizeShift(activity.shift),
    }))

    const day1Activities = normalizedActivities.filter((activity) => activity.shift === 'day1')
    const day2Activities = normalizedActivities.filter((activity) => activity.shift === 'day2')
    const bothActivities = normalizedActivities.filter((activity) => activity.shift === 'both')

    const activitiesForSidebar =
        bothActivities.length > 0
            ? bothActivities
            : normalizedActivities.slice(0, 5)

    const eventLocation =
        normalizedActivities.find((activity) => activity.location)?.location ||
        'I.E. Escuela Una Sonrisa de Amor USDA, El Porvenir, Trujillo'

    const teamSize =
        typeof eventSettings.team_size === 'number' && Number.isFinite(eventSettings.team_size)
            ? eventSettings.team_size
            : 31

    const handleRegistrationChange = (field: keyof RegistrationFormState, value: string) => {
        setRegistrationForm((prev) => ({
            ...prev,
            [field]: value,
        }))
        setRegistrationError(null)
    }

    const handleRegistrationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setRegistrationSending(true)
        setRegistrationError(null)
        setRegistrationSuccess(false)

        try {
            const edad = parseInt(registrationForm.edad, 10)
            if (Number.isNaN(edad) || edad < MIN_AGE || edad > MAX_AGE) {
                setRegistrationError(`La edad debe estar entre ${MIN_AGE} y ${MAX_AGE} anos.`)
                setRegistrationSending(false)
                return
            }

            const fallbackEmail = `sin-correo+${Date.now()}@nutrikids.local`
            const celularValue = registrationForm.celular.trim() || 'No especificado'
            const correoValue = registrationForm.correo.trim() || fallbackEmail

            if (celularValue.length > 20) {
                setRegistrationError('El celular no puede exceder 20 caracteres.')
                setRegistrationSending(false)
                return
            }

            if (correoValue.length > 255) {
                setRegistrationError('El correo no puede exceder 255 caracteres.')
                setRegistrationSending(false)
                return
            }

            const payload = {
                ...registrationForm,
                edad,
                celular: celularValue,
                correo: correoValue,
            }

            const response = await fetch('/api/registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                setRegistrationError(data.error || 'No se pudo enviar el registro. Intenta nuevamente.')
                setRegistrationSending(false)
                return
            }

            setRegistrationSuccess(true)
            setRegistrationForm(REGISTRATION_INITIAL_STATE)
        } catch (error) {
            console.error(error)
            setRegistrationError('No se pudo enviar el formulario en este momento. Intenta nuevamente.')
        } finally {
            setRegistrationSending(false)
        }
    }

    return (
        <main className="nk-main">
            <nav className="nk-nav">
                <a href="#inicio" className="nk-nav-logo">
                    Nutri<span>Kids</span>
                </a>
                <ul className="nk-nav-links">
                    <li><a href="#inicio">Inicio</a></li>
                    <li><a href="#quienes">Quienes somos</a></li>
                    <li><a href="#anemia">Sobre la anemia</a></li>
                    <li><a href="#recetas">Recetas</a></li>
                    <li><a href="#evento">Evento</a></li>
                    <li><a href="#equipo">Equipo</a></li>
                </ul>
                <a href="#registro" className="nk-nav-cta">Registrate gratis</a>
            </nav>

            <section id="inicio" className="nk-hero">
                <div className="nk-hero-bg" />
                <div className="nk-hero-content">
                    <div className="nk-hero-badge">Proyecto universitario · El Porvenir, Trujillo · Sin fines de lucro</div>
                    <h1 className="nk-h1">
                        NutriKids:<br />
                        <em>Por una infancia<br />libre de anemia</em>
                    </h1>
                    <p className="nk-hero-sub">
                        {eventSettings.team_name || 'Equipo universitario independiente NutriKids'} llevando educacion nutricional gratuita a la I.E. Escuela Una Sonrisa de Amor.
                    </p>
                    <div className="nk-hero-btns">
                        <a href="#evento" className="nk-btn-primary">Ver el evento</a>
                        <a href="#registro" className="nk-btn-secondary">Registrarme</a>
                    </div>
                    <div className="nk-hero-stats">
                        <div className="nk-stat-item">
                            <div className="nk-stat-num">{teamSize}</div>
                            <div className="nk-stat-label">integrantes del<br />equipo NutriKids</div>
                        </div>
                        <div className="nk-stat-item">
                            <div className="nk-stat-num">48</div>
                            <div className="nk-stat-label">ninos beneficiados<br />5 y 6 de primaria</div>
                        </div>
                        <div className="nk-stat-item">
                            <div className="nk-stat-num">{eventDays}</div>
                            <div className="nk-stat-label">dias de jornada<br />{renderedDateRange}</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="quienes" className="nk-section nk-section-white">
                <div className="nk-container">
                    <div className="nk-quienes-grid">
                        <div>
                            <div className="nk-section-tag">Quienes somos</div>
                            <h2 className="nk-h2">Un equipo unido por <span>una causa</span></h2>
                            <p className="nk-paragraph">
                                Somos un equipo universitario independiente de <strong>{teamSize} integrantes</strong> que,
                                en el marco del curso de Gestion de Proyectos de <strong>Ferreycorp</strong>, decidimos hacer algo concreto por nuestra comunidad.
                            </p>
                            <p className="nk-paragraph">
                                Identificamos que la anemia afecta silenciosamente a miles de niños en El Porvenir, y desde ahí nació <strong>NutriKids</strong>: un proyecto educativo-comunitario sin fines de lucro, autofinanciado por el propio equipo, dirigido a los alumnos de 5° y 6° grado de la I.E. Escuela Una Sonrisa de Amor.
                            </p>
                            <p className="nk-paragraph">
                                Llevamos informacion, dinamicas y recursos directamente a los ninos y sus familias.
                                Porque la salud no deberia depender de donde naciste.
                            </p>
                            <div className="nk-mision-box">
                                <h3>Nuestra mision</h3>
                                <p>
                                    Brindar educación nutricional de calidad a los niños de 5° y 6° grado de la I.E. Escuela Una Sonrisa de Amor y a sus familias, promoviendo hábitos alimentarios saludables para prevenir la anemia desde la infancia.
                                </p>
                            </div>
                        </div>

                        <div className="nk-quienes-visual nk-fade-in">
                            <div className="nk-value-card">
                                <div className="nk-value-icon">💛</div>
                                <div>
                                    <div className="nk-value-title">Compromiso</div>
                                    <div className="nk-value-desc">Actuamos porque creemos que la salud es un derecho de todos.</div>
                                </div>
                            </div>
                            <div className="nk-value-card">
                                <div className="nk-value-icon">🤝</div>
                                <div>
                                    <div className="nk-value-title">Solidaridad</div>
                                    <div className="nk-value-desc">Trabajamos en equipo, sin fines de lucro, por el bien comun.</div>
                                </div>
                            </div>
                            <div className="nk-value-card">
                                <div className="nk-value-icon">📚</div>
                                <div>
                                    <div className="nk-value-title">Educacion</div>
                                    <div className="nk-value-desc">Informamos con evidencia y lenguaje cercano a la comunidad.</div>
                                </div>
                            </div>
                            <div className="nk-value-card">
                                <div className="nk-value-icon">❤️</div>
                                <div>
                                    <div className="nk-value-title">Vocacion de servicio</div>
                                    <div className="nk-value-desc">Ponemos a las personas en el centro de todo lo que hacemos.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <AnemiaInfoSection />

            <LandingRecipesSection
                recipesLoading={recipesLoading}
                recipes={recipes}
                recipesUnavailable={contentUnavailable.recipes}
            />

            <section id="evento" className="nk-section nk-section-cream">
                <div className="nk-container">
                    <div className="nk-section-tag">Taller presencial</div>
                    <h2 className="nk-h2">Unete a nuestro <span>evento gratuito</span></h2>
                    <p className="nk-section-intro">Dos jornadas educativas completamente gratuitas, autofinanciadas por el equipo NutriKids.</p>

                    <div className="nk-evento-grid nk-fade-in">
                        <div>
                            <div className="nk-evento-info-box nk-evento-day1">
                                <h3>📅 Dia 1 — Jornada con ninos</h3>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">📅</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Fecha</div>
                                        <div className="nk-evento-detail-value">{formatDateHuman(startDateValue)}</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">⏱</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Duracion</div>
                                        <div className="nk-evento-detail-value">Aproximadamente 2 horas</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">👦</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Dirigido a</div>
                                        <div className="nk-evento-detail-value">Ninos de 5 y 6 de primaria</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">📍</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Lugar</div>
                                        <div className="nk-evento-detail-value">{eventLocation}</div>
                                    </div>
                                </div>
                                <div className="nk-evento-footnote">
                                    {day1Activities.length > 0
                                        ? `${day1Activities.length} actividad(es) programada(s) para esta jornada.`
                                        : 'Dinamicas ludicas, video interactivo, materiales informativos y bocaditos nutritivos.'}
                                </div>
                            </div>

                            <div className="nk-evento-info-box nk-evento-day2">
                                <h3>📅 Dia 2 — Jornada con familias</h3>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">📅</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Fecha</div>
                                        <div className="nk-evento-detail-value">{formatDateHuman(endDateValue)}</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">⏱</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Duracion</div>
                                        <div className="nk-evento-detail-value">Aproximadamente 2 horas</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">👨‍👩‍👧</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Dirigido a</div>
                                        <div className="nk-evento-detail-value">Padres y apoderados de los estudiantes</div>
                                    </div>
                                </div>
                                <div className="nk-evento-detail">
                                    <div className="nk-evento-detail-icon">📍</div>
                                    <div>
                                        <div className="nk-evento-detail-label">Lugar</div>
                                        <div className="nk-evento-detail-value">{eventLocation}</div>
                                    </div>
                                </div>
                                <div className="nk-evento-footnote">
                                    {day2Activities.length > 0
                                        ? `${day2Activities.length} actividad(es) programada(s) para esta jornada.`
                                        : 'Charlas sobre prevencion de anemia, materiales accesibles y bocaditos nutritivos.'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="nk-note-box">
                                <p className="nk-note-title">⚠️ Nota importante</p>
                                <p className="nk-note-text">
                                    Esta iniciativa no implica intervencion medica ni diagnostico clinico.
                                    Es un proyecto 100% educativo-comunitario.
                                </p>
                            </div>

                            <h3 className="nk-subtitle">Actividades en ambas jornadas</h3>

                            {activitiesLoading ? (
                                <div className="nk-empty-card">Cargando actividades...</div>
                            ) : (
                                <div className="nk-actividades-list">
                                    {/* Actividad 1 */}
                                    <div className="nk-actividad">
                                        <div className="nk-actividad-icon">🎮</div>
                                        <div>
                                            <div className="nk-actividad-title">Dinámicas lúdicas</div>
                                            <div className="nk-actividad-desc">
                                                Actividades interactivas y divertidas sobre nutrición para los niños
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad 2 */}
                                    <div className="nk-actividad">
                                        <div className="nk-actividad-icon">🎬</div>
                                        <div>
                                            <div className="nk-actividad-title">Video educativo interactivo</div>
                                            <div className="nk-actividad-desc">
                                                Visualización de contenido sobre nutrición y buena alimentación
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad 3 */}
                                    <div className="nk-actividad">
                                        <div className="nk-actividad-icon">📋</div>
                                        <div>
                                            <div className="nk-actividad-title">Charlas sobre anemia</div>
                                            <div className="nk-actividad-desc">
                                                Información clara y accesible sobre prevención para padres
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad 4 */}
                                    <div className="nk-actividad">
                                        <div className="nk-actividad-icon">📦</div>
                                        <div>
                                            <div className="nk-actividad-title">Entrega de materiales y KITs</div>
                                            <div className="nk-actividad-desc">
                                                Materiales informativos y recuerdos temáticos para todos
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actividad 5 */}
                                    <div className="nk-actividad">
                                        <div className="nk-actividad-icon">🍎</div>
                                        <div>
                                            <div className="nk-actividad-title">Bocaditos nutritivos</div>
                                            <div className="nk-actividad-desc">
                                                Snacks saludables para todos los participantes en ambas jornadas
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="nk-funding-box">
                                💚 <strong>Financiamiento:</strong> Autogestion del equipo y alianzas locales. Sin costo para la institucion ni para los participantes.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <TeamWorkSection teamSize={teamSize} />

            <section id="registro" className="nk-section nk-register-section">
                <div className="nk-container nk-register-head">
                    <div className="nk-section-tag">Formulario</div>
                    <h2 className="nk-h2">Confirma tu <span>asistencia</span></h2>
                    <p className="nk-section-intro">El registro es completamente gratuito. Te avisaremos con los detalles finales del evento.</p>
                </div>

                <div className="nk-form-card nk-fade-in">
                    <form onSubmit={handleRegistrationSubmit}>
                        <div className="nk-form-grid">
                            <div className="nk-field-group">
                                <label htmlFor="nombres">Nombres <span className="nk-req">*</span></label>
                                <input
                                    id="nombres"
                                    name="nombres"
                                    type="text"
                                    placeholder="Ej. Maria Elena"
                                    value={registrationForm.nombres}
                                    onChange={(event) => handleRegistrationChange('nombres', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="nk-field-group">
                                <label htmlFor="apellidos">Apellidos <span className="nk-req">*</span></label>
                                <input
                                    id="apellidos"
                                    name="apellidos"
                                    type="text"
                                    placeholder="Ej. Rodriguez Diaz"
                                    value={registrationForm.apellidos}
                                    onChange={(event) => handleRegistrationChange('apellidos', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="nk-field-group">
                                <label htmlFor="dni">DNI <span className="nk-req">*</span></label>
                                <input
                                    id="dni"
                                    name="dni"
                                    type="text"
                                    placeholder="Ej. 45678901"
                                    maxLength={8}
                                    value={registrationForm.dni}
                                    onChange={(event) => handleRegistrationChange('dni', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="nk-field-group">
                                <label htmlFor="edad">Edad <span className="nk-req">*</span></label>
                                <input
                                    id="edad"
                                    name="edad"
                                    type="number"
                                    min={MIN_AGE}
                                    max={MAX_AGE}
                                    placeholder="Ej. 28"
                                    value={registrationForm.edad}
                                    onChange={(event) => handleRegistrationChange('edad', event.target.value)}
                                    required
                                />
                            </div>

                            <div className="nk-field-group">
                                <label htmlFor="sexo">Sexo <span className="nk-req">*</span></label>
                                <select
                                    id="sexo"
                                    name="sexo"
                                    value={registrationForm.sexo}
                                    onChange={(event) => handleRegistrationChange('sexo', event.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="F">Femenino</option>
                                    <option value="M">Masculino</option>
                                    <option value="Otro">Prefiero no indicar</option>
                                </select>
                            </div>

                            <div className="nk-field-group">
                                <label htmlFor="celular">Celular</label>
                                <input
                                    id="celular"
                                    name="celular"
                                    type="tel"
                                    placeholder="Ej. 987 654 321"
                                    maxLength={20}
                                    value={registrationForm.celular}
                                    onChange={(event) => handleRegistrationChange('celular', event.target.value)}
                                />
                            </div>

                            <div className="nk-field-group nk-full">
                                <label htmlFor="correo">Correo electronico</label>
                                <input
                                    id="correo"
                                    name="correo"
                                    type="email"
                                    placeholder="Ej. correo@gmail.com"
                                    value={registrationForm.correo}
                                    onChange={(event) => handleRegistrationChange('correo', event.target.value)}
                                />
                            </div>

                            <div className="nk-field-group nk-full">
                                <label htmlFor="jornada">A que jornada asistiras? <span className="nk-req">*</span></label>
                                <select
                                    id="jornada"
                                    name="jornada"
                                    value={registrationForm.jornada}
                                    onChange={(event) => handleRegistrationChange('jornada', event.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="day1">Dia 1 · Jornada con ninos</option>
                                    <option value="day2">Dia 2 · Jornada con padres y apoderados</option>
                                    <option value="both">Ambas jornadas</option>
                                </select>
                            </div>

                            <div className="nk-field-group nk-full">
                                <label htmlFor="diagnostico">Te han diagnosticado anemia antes? <span className="nk-req">*</span></label>
                                <select
                                    id="diagnostico"
                                    name="diagnostico"
                                    value={registrationForm.diagnostico}
                                    onChange={(event) => handleRegistrationChange('diagnostico', event.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="si_actualmente">Si, actualmente tengo anemia</option>
                                    <option value="si_recuperado">Si, pero ya me recupere</option>
                                    <option value="no_nunca">No, nunca</option>
                                    <option value="no_se">No se / No me han examinado</option>
                                </select>
                            </div>

                            <div className="nk-field-group nk-full">
                                <label htmlFor="como_se_entero">Como te enteraste del evento? <span className="nk-req">*</span></label>
                                <select
                                    id="como_se_entero"
                                    name="como_se_entero"
                                    value={registrationForm.como_se_entero}
                                    onChange={(event) => handleRegistrationChange('como_se_entero', event.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="redes_sociales">Redes sociales</option>
                                    <option value="pagina_web">Pagina web</option>
                                    <option value="volante_afiche">Volante / afiche</option>
                                    <option value="familiar_amigo">Un familiar o amigo</option>
                                    <option value="institucion_educativa">La institucion educativa</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div className="nk-field-group nk-full">
                                <label htmlFor="comentarios">Comentarios adicionales</label>
                                <textarea
                                    id="comentarios"
                                    name="comentarios"
                                    placeholder="Escribe aqui si tienes alguna pregunta..."
                                    value={registrationForm.comentarios}
                                    onChange={(event) => handleRegistrationChange('comentarios', event.target.value)}
                                />
                            </div>
                        </div>

                        {registrationError && (
                            <div className="nk-form-error">{registrationError}</div>
                        )}

                        {registrationSuccess && (
                            <div className="nk-form-success">
                                Tu registro fue enviado con exito. Te contactaremos con los detalles del evento.
                            </div>
                        )}

                        <button type="submit" className="nk-form-submit" disabled={registrationSending}>
                            {registrationSending ? 'Enviando registro...' : 'Confirmar mi asistencia →'}
                        </button>
                    </form>
                </div>
            </section>

            <footer className="nk-footer">
                <div className="nk-footer-logo">Nutri<span>Kids</span></div>
                <p className="nk-footer-claim">NutriKids: Por una infancia libre de anemia</p>
                <p>
                    Proyecto educativo-comunitario sin fines de lucro · Gestion de Proyectos Ferreycorp
                    <br />
                    I.E. Escuela Una Sonrisa de Amor USDA · El Porvenir, Trujillo, Peru
                    <br />
                    {renderedDateRange}
                </p>
                <p className="nk-footer-team">
                    {(eventSettings.team_name || 'Equipo universitario independiente NutriKids')} · {teamSize} integrantes
                </p>
            </footer>
        </main>
    )
}

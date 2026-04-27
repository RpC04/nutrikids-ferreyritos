interface TeamWorkSectionProps {
  teamSize: number
}

export function TeamWorkSection({ teamSize }: TeamWorkSectionProps) {
  return (
    <section id="equipo" className="nk-section nk-section-white">
      <div className="nk-container">
        <div className="nk-section-tag">Equipo de trabajo</div>
        <h2 className="nk-h2">Personas que hacen posible <span>NutriKids</span></h2>
        <p className="nk-section-intro">
          Somos {teamSize} estudiantes y profesionales organizados para disenar, ejecutar y sostener un proyecto con impacto comunitario real.
        </p>

        <div className="nk-team-grid nk-fade-in">
          <div className="nk-team-card">
            <h3>Coordinacion general</h3>
            <p>Planificacion del proyecto, seguimiento de metas, gestion de aliados y articulacion con la institucion educativa.</p>
          </div>
          <div className="nk-team-card">
            <h3>Contenido nutricional</h3>
            <p>Diseno de materiales didacticos, fichas de alimentacion saludable y mensajes de prevencion de anemia basados en evidencia.</p>
          </div>
          <div className="nk-team-card">
            <h3>Logistica y dinamicas</h3>
            <p>Preparacion de actividades ludicas, organizacion de kits, coordinacion de espacios y tiempos de cada jornada.</p>
          </div>
          <div className="nk-team-card">
            <h3>Comunicacion comunitaria</h3>
            <p>Convocatoria de familias, atencion de consultas, acompanamiento durante el registro y difusion de resultados del proyecto.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

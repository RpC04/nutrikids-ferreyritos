export function AnemiaInfoSection() {
  return (
    <section id="anemia" className="nk-section nk-section-cream">
      <div className="nk-container">
        <div className="nk-section-tag">Informacion</div>
        <h2 className="nk-h2">Todo sobre <span>la anemia</span></h2>
        <p className="nk-section-intro">Conoce que es, como detectarla y como prevenirla con informacion clara y confiable.</p>

        <div className="nk-info-cards nk-fade-in">
          <div className="nk-info-card">
            <div className="nk-info-card-icon">🩸</div>
            <h3>Que es la anemia?</h3>
            <p>
              Es una condicion en la que el cuerpo no tiene suficientes globulos rojos saludables
              para transportar oxigeno. La causa mas frecuente es la deficiencia de hierro.
            </p>
          </div>
          <div className="nk-info-card">
            <div className="nk-info-card-icon">🔬</div>
            <h3>Como se diagnostica?</h3>
            <p>
              Mediante un analisis de sangre llamado hemograma. Se considera anemia cuando la hemoglobina
              esta por debajo de los valores esperados para la edad y condicion de salud.
            </p>
          </div>
          <div className="nk-info-card nk-info-card-accent">
            <div className="nk-info-card-icon">⚠️</div>
            <h3>Consecuencias</h3>
            <p>
              Fatiga, bajo rendimiento escolar, dificultad para concentrarse, retraso en el desarrollo,
              mayor riesgo de infecciones y complicaciones en etapas criticas de crecimiento.
            </p>
          </div>
          <div className="nk-info-card">
            <div className="nk-info-card-icon">🥗</div>
            <h3>Como prevenirla?</h3>
            <p>
              Consumiendo alimentos ricos en hierro como carnes, higado, sangrecita, lentejas y espinaca.
              Acompanarlos con vitamina C mejora la absorcion del hierro.
            </p>
          </div>
        </div>

        <h3 className="nk-subtitle">Consejos practicos</h3>
        <div className="nk-consejos-grid nk-fade-in">
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Incluye menestras al menos 3 veces por semana</div>
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Acompana el hierro con jugo de naranja o limon</div>
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Evita te y cafe inmediatamente despues de comer</div>
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Realiza controles de hemoglobina cada 6 meses</div>
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Dale a tus hijos fruta citrica en las comidas</div>
          <div className="nk-consejo"><span className="nk-consejo-check">✔</span> Acude al centro de salud si hay cansancio persistente</div>
        </div>
      </div>
    </section>
  )
}

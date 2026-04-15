# Product Backlog — {issue-number}

<!-- STATUS: PENDING -->

---

## Épica: [REQUERIDO] {nombre de la épica}

> Descripción breve del objetivo de negocio que agrupa todas las features a continuación.
> Una épica responde a: ¿Qué capacidad de negocio se habilita?

---

### Feature: [REQUERIDO] {nombre de la feature}

> Descripción de la funcionalidad que agrupa los PBIs a continuación.
> Una feature responde a: ¿Qué puede hacer el usuario que antes no podía?

---

#### PBI: [REQUERIDO] {título del PBI}

**Historia de usuario**

> Como {rol}, quiero {acción} para {beneficio}.

**Criterios de Aceptación (BDD)**

- Dado {contexto inicial}, cuando {acción del usuario}, entonces {resultado observable}.
- Dado {contexto inicial}, cuando {acción del usuario}, entonces {resultado observable}.
- Dado {contexto inicial}, cuando {acción del usuario}, entonces {resultado observable}.

**Notas y supuestos**

> Restricciones, dependencias o supuestos relevantes para este PBI.
> Si no hay ninguno, escribir: "Sin notas adicionales."

---

<!-- Repetir bloques "#### PBI:" según sea necesario dentro de la misma Feature -->
<!-- Repetir bloques "### Feature:" según sea necesario dentro de la misma Épica -->
<!-- Repetir bloques "## Épica:" si el backlog cubre más de una épica -->

---

## Checklist de completitud [REQUERIDO]

> El coordinador verifica que todos los ítems están marcados antes de avanzar al Checkpoint 1.

- [ ] Cada Épica tiene nombre y descripción de objetivo de negocio
- [ ] Cada Feature describe qué puede hacer el usuario que antes no podía
- [ ] Cada PBI tiene historia de usuario en formato "Como / quiero / para"
- [ ] Cada PBI tiene al menos 3 criterios de aceptación en formato BDD (Given/When/Then)
- [ ] Los criterios de aceptación usan verbos de comportamiento observable — sin mencionar tecnología
- [ ] Las notas y supuestos están rellenas (o declaran explícitamente que no hay ninguna)
- [ ] No hay secciones `[REQUERIDO]` sin completar ni marcadores de placeholder como "..."

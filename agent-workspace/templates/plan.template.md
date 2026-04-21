# Plan de validación técnica — Issue #{issue-number}

> Generado por: Tech Lead Agent  
> Artefactos auditados: `design-decision.md` · `test-cases.md` · PBI Acceptance Criteria (`pipeline-state.json`)

---

## Resumen de la validación [REQUERIDO]

> Una o dos oraciones que describan el resultado general de la auditoría.

---

## Checklist de auditoría [REQUERIDO]

> Cada ítem debe evaluarse explícitamente. No dejar sin marcar.

- [ ] Violaciones de SOLID detectadas *(si hay, describir en "Hallazgos")*
- [ ] Acoplamiento entre capas no definido en `architectural-principles.instructions.md` *(si hay, describir)*
- [ ] Edge cases de la spec no cubiertos en el diseño *(si hay, describir)*
- [ ] Impacto en features existentes (cross-feature impact) no considerado *(si hay, describir)*
- [ ] Dependencias circulares potenciales *(si hay, describir)*
- [ ] Inconsistencias con `styling.instructions.md` o `testing.instructions.md` *(si hay, describir)*

---

## Hallazgos clasificados [REQUERIDO]

> Cada hallazgo debe incluir: descripción del problema, riesgo concreto en los próximos 12 meses, y recomendación.
> Si no hay hallazgos en una categoría, escribir explícitamente: "Ninguno."

### BLOQUEANTE

> Violaciones que impiden continuar sin rediseño.

Ninguno.

### MAYOR

> Problemas que requieren cambio en el diseño pero no en la spec.

Ninguno.

### MENOR

> Observaciones o mejoras recomendadas.

Ninguno.

---

## Veredicto [REQUERIDO]

> El veredicto es el resultado formal de la auditoría. Si es NEEDS_REVISION, el coordinador reinvoca al Architect con este documento como contexto.

- [ ] `APPROVED` — el diseño es coherente y puede avanzar a la fase de tests
- [ ] `NEEDS_REVISION: {motivo breve}` — el Architect debe revisar antes de continuar

---

## Estado del contexto [REQUERIDO]

- [ ] Completé esta auditoría con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al auditar las siguientes secciones: *(listar)*

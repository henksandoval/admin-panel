# Informe de revisión — Issue #{issue-number}

> Generado por: Code Reviewer Agent  
> Artefactos auditados: `design-decision.md` · `completion-report.md` · `dev-decisions.md`

---

## Hallazgos BLOQUEANTE [REQUERIDO]

> Violaciones de arquitectura que requieren rediseño. Si el coordinador detecta uno o más ítems aquí, retrocede a la fase de diseño y requiere checkpoint humano.
> Si no hay ninguno, escribir: "Ninguno."

Ninguno.

---

## Hallazgos MAYOR [REQUERIDO]

> Rework significativo sin cambiar el diseño. El Dev Agent corrige sin retroceder fases.
> Si no hay ninguno, escribir: "Ninguno."

Ninguno.

---

## Hallazgos MENOR [REQUERIDO]

> Correcciones puntuales o recomendaciones no bloqueantes.
> Si no hay ninguno, escribir: "Ninguno."

Ninguno.

---

## Recomendación de merge [REQUERIDO]

> Exactamente una de las tres opciones. El coordinador parsea esta sección para decidir el siguiente paso.

- [ ] `MERGE_READY` — la implementación cumple todos los criterios de calidad
- [ ] `MERGE_WITH_FIXES: {lista de correcciones}` — se puede mergear tras corregir los hallazgos MAYOR/MENOR listados
- [ ] `DO_NOT_MERGE: {razón}` — hay hallazgos BLOQUEANTE que requieren rediseño

---

## Estado del contexto [REQUERIDO]

- [ ] Completé esta revisión con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al revisar las siguientes partes: *(listar)*

---

## Checklist de completitud [REQUERIDO]

- [ ] Se auditó coherencia con screaming architecture
- [ ] Se verificaron SOLID, DRY, acoplamiento entre capas
- [ ] Se revisaron las decisiones autónomas del Dev contra el diseño aprobado
- [ ] Todos los hallazgos están clasificados (BLOQUEANTE / MAYOR / MENOR)
- [ ] La recomendación de merge está presente y es una de las tres opciones válidas
- [ ] El "Estado del contexto" está completado

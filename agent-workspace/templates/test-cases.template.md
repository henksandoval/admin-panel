# Test Cases — Issue #{issue-number}

> Generado por: QA Analyst  
> Artefactos de entrada: `spec.md` · `design-decision.md` · `plan.md`

---

## Escenarios de la spec [REQUERIDO]

> Derivados directamente de los criterios de aceptación de `spec.md`.
> Cada fila debe identificar el origen del criterio y justificar por qué vale la pena conservar el escenario.

| ID | Tipo | Origen | Escenario / Propósito | Precondiciones | Pasos clave | Resultado esperado | Justificación de valor |
|---|---|---|---|---|---|---|---|
| TC-01 | Critical path | spec: CA-01 | ... | ... | ... | ... | ... |

---

## Escenarios inferidos [OPCIONAL]

> Edge cases o escenarios de resiliencia inferidos a partir del diseño.
> Marcar explícitamente que son inferidos para que el humano pueda aceptarlos o descartarlos durante CP3.

| ID | Tipo | Origen | Escenario / Propósito | Precondiciones | Pasos clave | Resultado esperado | Justificación de valor |
|---|---|---|---|---|---|---|---|
| TC-INF-01 | Edge case | inferred | ... | ... | ... | ... | ... |

---

## Resumen de cobertura [REQUERIDO]

- Total de test cases: {N}
- Por tipo: Critical path ({n}), Error state ({n}), Edge case ({n}), Resilience ({n})
- Criterios de aceptación cubiertos: {N}/{total}
- Criterios sin cobertura: {lista con justificación, o "Ninguno"}
- Escenarios descartados deliberadamente: {lista con justificación, o "Ninguno"}

---

## Estado del contexto [REQUERIDO]

- [ ] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar las siguientes secciones: *(listar)*

---

## Checklist de completitud [REQUERIDO]

- [ ] Todos los criterios de aceptación de la spec tienen al menos un escenario asociado
- [ ] Los escenarios inferidos están marcados con su origen y justificación
- [ ] La sección "Resumen de cobertura" está completa
- [ ] Ningún test case menciona Angular, Vitest, Playwright, `data-testid` ni detalles de implementación
- [ ] El "Estado del contexto" está completado

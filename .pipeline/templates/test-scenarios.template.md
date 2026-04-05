# Test Scenarios — Issue #{issue-number}

> Generado por: QA Agent  
> Artefactos de entrada: `spec.md` · `design-decision.md`

---

## Escenarios de la spec [REQUERIDO]

> Derivados directamente de los criterios de aceptación de `spec.md`.
> Cada escenario incluye: ID, criterio de aceptación de origen, descripción del comportamiento a verificar.

| ID | Origen (criterio de aceptación) | Escenario |
|---|---|---|
| TS-01 | CA-01 | Dado {contexto}, cuando {acción}, entonces {resultado observable} |
| TS-02 | CA-02 | ... |
| TS-03 | CA-03 | ... |

---

## Escenarios inferidos [OPCIONAL]

> Edge cases técnicos que la spec no menciona explícitamente pero que son relevantes para la robustez.
> El humano puede rechazar cualquiera de estos durante el checkpoint.
> Marcar claramente el origen de cada uno.

| ID | Tipo | Escenario | Justificación |
|---|---|---|---|
| TS-INF-01 | timeout de red | ... | ... |
| TS-INF-02 | input inválido | ... | ... |

---

## Número de tests fallidos declarado [REQUERIDO]

> El QA declara cuántos tests están en fase RED. El coordinador verifica este número contra la salida de `npm run test -- --run`.

**Tests escritos:** {N}  
**Tests en rojo (fase RED):** {N}  
**Tests en verde (helpers / utils sin implementación real):** {N}

---

## Estado del contexto [REQUERIDO]

- [ ] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar las siguientes secciones: *(listar)*

---

## Checklist de completitud [REQUERIDO]

- [ ] Todos los criterios de aceptación de la spec tienen al menos un escenario asociado
- [ ] Los escenarios inferidos están marcados con su origen y justificación
- [ ] El número de tests fallidos está declarado
- [ ] Los `data-testid` usados en los tests son coherentes con los "Elementos UI observables" del diseño
- [ ] Los tests fallan por assertion, no por error de compilación (`npm run test -- --run` lo confirma)
- [ ] El "Estado del contexto" está completado

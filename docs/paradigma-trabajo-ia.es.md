# Paradigma de Trabajo con IA en este Proyecto

Este documento explica como trabajar de forma efectiva con Copilot usando agentes, prompts, skills, instrucciones y (cuando aplique) MCP.

El objetivo no es solo "pedir codigo", sino operar con un flujo profesional: descubrir, planificar, implementar, validar y reportar.

## 1. Principio central

Piensa en la IA como un equipo con roles:

- Orquestador: coordina el trabajo completo.
- Explorador: analiza el repositorio sin tocar codigo.
- Implementador: aplica cambios concretos y valida.

En este repo esos roles ya existen con estos agentes:

- delivery-orchestrator
- context-explorer
- implementation-engineer

Referencia: .github/agents/

## 2. Flujo recomendado de extremo a extremo

### Paso 1: Definir el objetivo

Antes de pedir cambios, define:

- Resultado esperado
- Alcance (que si tocar y que no)
- Criterios de aceptacion
- Restricciones del repo

Plantilla rapida:

- Goal: resultado funcional esperado
- Scope: include/exclude
- Acceptance criteria: comportamiento observable
- Constraints: respetar reglas del repo

### Paso 2: Descubrir contexto (read-only)

Usa context-explorer cuando no tengas claro:

- donde esta la logica correcta
- que modulos dependen del cambio
- que tests se deben ajustar

Este paso reduce cambios incorrectos y evita refactors innecesarios.

### Paso 3: Implementar con dif minimo

Usa implementation-engineer para:

- aplicar cambios focalizados
- seguir patrones existentes
- evitar ruido en archivos no relacionados

### Paso 4: Validar con gates obligatorios

En este proyecto se valida siempre en este orden:

1. npm run lint
2. npm test
3. npm run build

Si uno falla, se corrige antes de seguir.

### Paso 5: Reportar resultado

El cierre ideal incluye:

- que se cambio
- en que archivos
- resultado de validaciones
- riesgos remanentes

## 3. Cuando usar cada artefacto

### Instrucciones de workspace

Usalas para reglas globales y estables del proyecto.

Ubicacion: .github/copilot-instructions.md y .github/AGENTS.md

### Instrucciones por archivo

Usalas para reglas por tipo de archivo o carpeta.

Ubicacion: .github/instructions/*.instructions.md

Ejemplo: reglas especificas para spec de unit/e2e.

### Prompts

Usalos para tareas puntuales y repetibles de una sola ejecucion.

Ubicacion: .github/prompts/*.prompt.md

En este repo ya tienes:

- implement-feature
- fix-bug
- review-changes

### Skills

Usalos para workflows multietapa reutilizables.

Ubicacion: .github/skills/<skill>/SKILL.md

En este repo ya tienes:

- angular-change-delivery

### Agentes personalizados

Usalos cuando quieras roles con fronteras claras y delegacion.

Ubicacion: .github/agents/*.agent.md

### MCP

Usalo cuando necesites datos/sistemas externos (APIs, docs internas, servicios).

Nota: MCP no reemplaza prompts/agentes; los potencia con contexto externo.

## 4. Modo operativo diario (recomendado)

Para feature:

1. Ejecuta prompt implement-feature o agente delivery-orchestrator.
2. Pide discovery de impacto.
3. Implementa dif minimo.
4. Valida lint/test/build.
5. Cierra con resumen y riesgos.

Para bug:

1. Ejecuta fix-bug.
2. Exige analisis de causa raiz antes de editar.
3. Implementa fix + test de regresion.
4. Valida lint/test/build.

Para revision:

1. Ejecuta review-changes.
2. Prioriza bugs, regresiones y cobertura faltante.
3. Reporta hallazgos por severidad.

## 5. Reglas de calidad que no debes romper

- Material controla color y tipografia; Tailwind solo layout/spacing.
- Strings de UI con $localize y id @@.
- Tests tipo caja negra y selectores data-testid.
- Mantener diffs enfocados y sin churn innecesario.
- Codigo y tests en ingles (regla del repo).

## 6. Errores comunes al adoptar este paradigma

- Usar un solo prompt gigante para todo.
  Solucion: dividir en discovery -> implementacion -> validacion.

- Descripciones vagas en prompts/skills/agentes.
  Solucion: usar "Use when..." con palabras clave concretas.

- applyTo demasiado amplio en instrucciones.
  Solucion: usar globs especificos por carpeta/extension.

- Saltar validaciones por "ahorrar tiempo".
  Solucion: mantener gates fijos lint/test/build.

## 7. Checklist de ejecucion rapida

Antes:

- Objetivo y alcance claros
- Artefacto correcto (prompt, skill o agente)
- Restricciones del repo en mente

Durante:

- Discovery cuando haya incertidumbre
- Cambios minimos
- Tests segun impacto

Despues:

- lint -> test -> build
- Resumen de cambios y riesgos

## 8. Referencias de este repositorio

- .github/copilot-instructions.md
- .github/AGENTS.md
- .github/agents/
- .github/prompts/
- .github/skills/angular-change-delivery/SKILL.md
- .github/instructions/
- docs/agent-customization.cheatsheet.es.md

Este paradigma te permite pasar de "asistencia de codigo" a "entrega guiada por IA" con control, trazabilidad y calidad consistente.

# Revision de la arquitectura de agentes

## Alcance revisado

Se revisaron los agentes normativos en ingles de `.github/agents/`, sus skills referenciados en `.github/skills/`, la configuracion de `agent-workspace/config.json` y las plantillas de `agent-workspace/templates/`.

## Veredicto ejecutivo

La arquitectura esta bien pensada a nivel de **orquestacion y separacion de responsabilidades**. Hay una intencion clara de construir un pipeline gobernado, auditable y con checkpoints humanos. El problema principal no es conceptual sino de **consistencia operativa**: hoy existen varios desalineamientos entre agentes, skills, plantillas y artefactos que pueden romper el flujo o generar comportamientos ambiguos.

## Fortalezas

### 1. Separacion de roles solida

La distribucion de responsabilidades esta bien delimitada:

- `Pipeline Coordinator` actua como orquestador delgado y evita invadir fases de ejecucion o diseno (`.github/agents/pipeline-coordinator.agent.md:11-13`, `209-224`).
- `Product Owner`, `Software Architect`, `Tech Lead`, `QA Analyst`, `Developer` y `Code Reviewer` tienen contratos diferenciados y complementarios.
- La presencia de un `Test Developer` especializado fortalece el enfoque RED/GREEN y evita mezclar implementacion con escritura de tests (`.github/agents/developer.agent.md:83-98`, `.github/agents/test-developer.agent.md:8-17`).

### 2. Buen diseno de governance

El pipeline incorpora mecanismos de control que suelen faltar en sistemas multi-agent:

- checkpoints humanos,
- `pipeline-state.json` como estado persistente,
- contadores de ciclos,
- `AGENT_STATUS` / `STATUS` como protocolo de handoff,
- modo conservador para casos no cubiertos.

Esto reduce improvisacion y hace trazable el avance (`.github/agents/pipeline-coordinator.agent.md:20-58`, `105-186`).

### 3. Defensa en profundidad

La secuencia `Architect -> Tech Lead -> QA -> Developer -> Code Reviewer` crea varias capas de validacion con objetivos distintos:

- el Architect decide,
- el Tech Lead desafia el diseno,
- QA convierte el comportamiento en pruebas,
- Dev implementa,
- Reviewer verifica la fidelidad del codigo al diseno.

Ese encadenamiento es una fortaleza real porque evita que un solo agente concentre especificacion, diseno, implementacion y auditoria.

### 4. Instrucciones de proyecto bien integradas

Los agentes mas sensibles al codigo remiten a instrucciones del repositorio y no intentan reinventar las reglas locales. Eso mejora alineacion con la arquitectura real del proyecto (`.github/agents/software-architect.agent.md:38-44`, `.github/agents/developer.agent.md:54-59`, `.github/agents/code-reviewer.agent.md:75-83`).

### 5. Consideracion explicita del contexto y de la saturacion

Los templates incluyen secciones de "Estado del contexto" y checklists de completitud. Es una buena practica poco comun y valiosa para flujos largos porque fuerza honestidad operacional sobre la calidad del artefacto.

## Debilidades y riesgos

### 1. Drift critico entre agentes, skills y artefactos

Este es el problema mas importante.

#### 1.1 Specs y tests usan dos contratos distintos

- El `Product Owner` escribe `agent-workspace/{issue-number}/spec.md` (`.github/agents/product-owner.agent.md:24-30`).
- Pero el skill `clarify-requirements` sigue diciendo que debe crear `docs/specs/{feature-name}.md` (`.github/skills/clarify-requirements/SKILL.md:50-52`).
- `design-tests`, `implement-tests` e `implement-feature` tambien siguen trabajando sobre `docs/specs/{feature-name}.md` (`.github/skills/design-tests/SKILL.md:14-17`, `.github/skills/implement-tests/SKILL.md:16`, `.github/skills/implement-feature/SKILL.md:14-17`).

**Impacto:** los agentes estan acoplados a un pipeline basado en `agent-workspace`, pero varios skills siguen acoplados a un flujo anterior basado en `docs/specs/`. Eso puede producir ejecuciones incompatibles o artefactos duplicados.

#### 1.2 `test-cases.md` y `test-scenarios.md` estan mezclados

- El pipeline oficial usa `test-cases.md` (`.github/agents/qa-analyst.agent.md:12`, `36-66`; `.github/agents/developer.agent.md:77-88`; `.github/agents/pipeline-coordinator.agent.md:86-96`).
- Pero la plantilla disponible es `agent-workspace/templates/test-scenarios.template.md`.
- El `Code Reviewer` aun referencia `test-scenarios.md` como artefacto suspendible (`.github/agents/code-reviewer.agent.md:45`).
- El template de `completion-report.md` tambien referencia `test-scenarios.md` (`agent-workspace/templates/completion-report.template.md:18-22`).

**Impacto:** hay drift de nombres justo en el handoff QA -> Dev -> Review, que es una zona critica del pipeline.

#### 1.3 La definicion de QA y la plantilla de tests se contradicen

- `QA Analyst` se declara technology-agnostic y prohíbe referencias a Angular, Vitest o `data-testid` (`.github/agents/qa-analyst.agent.md:10-18`, `68-75`).
- Sin embargo la plantilla `test-scenarios.template.md` exige declarar coherencia de `data-testid` y contabilizar tests RED/green (`agent-workspace/templates/test-scenarios.template.md:34-57`), lo que pertenece mas al `Test Developer` que a QA.
- El skill `design-tests` tambien mezcla diseño de escenarios con exploracion de `data-testid` (`.github/skills/design-tests/SKILL.md:18-22`).

**Impacto:** el rol QA no esta completamente limpio; parte del contrato lo empuja hacia decisiones tecnicas que el propio agente dice no conocer.

### 2. La fase final de review tiene contradicciones de control

- El `Pipeline Coordinator` dice que CP4 existe **solo** si hay hallazgos `BLOQUEANTE` y que `MERGE_READY` o `MERGE_WITH_FIXES` fluyen a finalizacion (`.github/agents/pipeline-coordinator.agent.md:98-103`).
- Pero el `Code Reviewer` pone `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->` tanto para `MERGE_READY` como para `MERGE_WITH_FIXES` (`.github/agents/code-reviewer.agent.md:61-65`).
- Y el Coordinator, al ver `WAITING_FOR_APPROVAL`, siempre deriva a checkpoint (`.github/agents/pipeline-coordinator.agent.md:111-117`, `148-150`).

**Impacto:** la politica real de cierre no es univoca. No esta claro si toda revision requiere aprobacion humana o solo las bloqueantes. Tampoco queda claro donde se corrigen los `MAYOR/MENOR` de `MERGE_WITH_FIXES`.

### 3. El Project Assistant promete integracion ADO sin capacidad operacional suficiente

- Su descripcion y responsabilidades incluyen resolver y sincronizar Azure DevOps Work Items (`.github/agents/project-assistant.agent.md:2`, `10`, `48-58`).
- Pero el agente solo declara herramientas `['read', 'search', 'edit', 'todo']` (`.github/agents/project-assistant.agent.md:1-5`).
- No hay referencia a MCPs de Azure, CLI, web ni un skill especifico de integracion.

**Impacto:** el rol depende de una capacidad externa que no esta explicitamente conectada a su toolset. Es un riesgo de implementacion, especialmente en la fase de sync, donde el pipeline asume escritura real en ADO.

### 4. Las skills no estan totalmente rebaseadas al nuevo pipeline

Hay una clara evolucion hacia `agent-workspace/{issue-number}/`, pero varias skills aun responden a un modelo previo:

- `clarify-requirements`: crea spec en `docs/specs/`.
- `design-tests`: anade escenarios dentro de la spec, no en `test-cases.md`.
- `implement-tests`: busca `## Test Scenarios` dentro de `docs/specs/{feature-name}.md`.
- `implement-feature`: parte de `docs/specs/{feature-name}.md` y valida solo lint + test, sin build (`.github/skills/implement-feature/SKILL.md:73-90`).

**Impacto:** aunque los agentes principales ya describen el pipeline deseado, el comportamiento efectivo puede desviarse si los skills siguen siendo la fuente operativa dominante.

### 5. Inconsistencias menores de nomenclatura y numeracion

- `checkpoint-protocol` numera fases de forma distinta a `Pipeline Coordinator` (`.github/skills/checkpoint-protocol/SKILL.md:7-12` vs `.github/agents/pipeline-coordinator.agent.md:61-103`).
- `review-report.template.md` indica "Architect Reviewer Agent" en lugar de `Code Reviewer` (`agent-workspace/templates/review-report.template.md:3`).
- `waiting-for-approval.md` ya existe como plantilla final y no como `.template.md`, mientras otros artefactos usan convencion `*.template.md`.

**Impacto:** no bloquean por si solos, pero son sintomas de drift documental y aumentan la probabilidad de errores de coordinacion.

### 6. Desalineacion con la regla de idioma del pipeline

- `pipeline-language.instructions.md` establece que todos los artefactos del pipeline en `agent-workspace/**` deben escribirse en español.
- El `Test Developer` define un `Test Implementation Report` en ingles dentro de `agent-workspace/{issue-number}/test-implementation-report.md` (`.github/agents/test-developer.agent.md:60-80`).

**Impacto:** inconsistencia de governance. No rompe el flujo, pero debilita la uniformidad del sistema y puede causar revisiones o automation checks ambiguos.

## Aspectos relevantes adicionales

### 1. La arquitectura esta mas madura en governance que en integracion

El sistema piensa muy bien en:

- roles,
- checkpoints,
- escalaciones,
- trazabilidad,
- criterios de parada.

Pero esta menos consolidado en:

- contratos exactos de artefactos,
- acoplamiento skill <-> agent,
- consistencia de nombres,
- herramientas realmente disponibles por agente.

Es decir: la **logica de control** esta mas madura que la **superficie ejecutable**.

### 2. El enfoque adversarial es una decision muy acertada

Que `Software Architect` y `Tech Lead` deban escribir primero el caso en contra es una de las mejores decisiones del diseno. Reduce sesgo confirmatorio y aumenta calidad de las decisiones, especialmente en pipelines multi-agent donde el riesgo natural es que todos colaboren demasiado y desafien poco.

### 3. La existencia de `Doc Translator` y companions ES es una fortaleza organizacional

Hay una preocupacion legitima por mantener documentacion normativa en ingles y acompanamiento en español. Eso es positivo para adopcion interna y escalabilidad del sistema, siempre que el proceso de sincronizacion se mantenga estricto.

## Recomendaciones priorizadas

### Prioridad alta

1. **Unificar el contrato de artefactos del pipeline.** Elegir una sola familia de nombres y aplicarla en todos los agentes, skills y templates: `spec.md`, `design-decision.md`, `plan.md`, `test-cases.md`, `completion-report.md`, `review-report.md`.
2. **Rebasear todas las skills al pipeline actual.** Ninguna skill deberia seguir apuntando a `docs/specs/{feature-name}.md` si el pipeline oficial opera en `agent-workspace/{issue-number}/`.
3. **Resolver la politica de cierre de review.** Definir una sola verdad para `MERGE_READY`, `MERGE_WITH_FIXES` y `DO_NOT_MERGE`, incluyendo si CP4 siempre existe o solo en bloqueantes.
4. **Revisar el alcance del QA Analyst.** Si QA es technology-agnostic, sacar `data-testid`, conteo RED y detalles tecnicos de su contrato y moverlos al `Test Developer`.
5. **Dotar al Project Assistant de capacidades reales para ADO** o reducir su alcance documentalmente si la sincronizacion sera manual o externa.

### Prioridad media

1. Alinear templates con los agentes: crear `test-cases.template.md` y corregir referencias obsoletas a `test-scenarios.md`.
2. Corregir metadatos y etiquetas menores (`Architect Reviewer Agent`, numeracion de fases, nombres de plantillas).
3. Alinear idioma de todos los artefactos en `agent-workspace/**`, incluido `test-implementation-report.md`.

### Prioridad baja

1. Formalizar una matriz de contratos por fase: entrada, salida, marcador requerido, responsable de aprobacion, y agente consumidor.
2. Anadir una comprobacion automatica de drift entre `.github/agents/`, `.github/skills/` y `agent-workspace/templates/`.

## Conclusion

La base estrategica es buena: el pipeline tiene estructura, roles bien pensados y una filosofia fuerte de control y revision. Sin embargo, antes de escalarlo o confiar en ejecucion autonoma sostenida, conviene hacer una **ronda de consolidacion contractual**. Hoy el mayor riesgo no es que los agentes "piensen mal", sino que **operen sobre contratos distintos**.

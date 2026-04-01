# Chuleta Operativa: Personalizacion de Agentes en VS Code

Guia de uso rapido para decidir que crear, cuando usarlo y como evitar errores comunes.

## 1) Decision en 20 segundos

Si necesitas una regla que aplique casi siempre en el proyecto:
- Usa instrucciones de workspace en `.github/copilot-instructions.md` o `.github/AGENTS.md`.

Si necesitas reglas para archivos o carpetas concretas:
- Usa `.github/instructions/*.instructions.md` con `applyTo` especifico.

Si necesitas una tarea unica con entradas:
- Usa un prompt en `.github/prompts/*.prompt.md`.

Si necesitas un flujo multietapa reutilizable con recursos (scripts/plantillas):
- Usa un skill con `SKILL.md`.

Si necesitas aislamiento de contexto o restricciones de herramientas distintas por etapa:
- Usa un agente personalizado en `.github/agents/*.agent.md`.

Si necesitas enforcement tecnico automatico (bloquear/comprobar/ejecutar comandos):
- Usa hooks en `.github/hooks/*.json`.

Si necesitas datos o sistemas externos (APIs, docs internas, servicios):
- Usa MCP.

## 2) Mapa de donde va cada cosa

| Necesidad | Archivo/Tipo | Ubicacion |
|-----------|--------------|-----------|
| Reglas globales del proyecto | Workspace instructions | `.github/` |
| Reglas por patron de archivos | File instructions | `.github/instructions/` |
| Tarea puntual parametrizable | Prompt | `.github/prompts/` |
| Flujo reusable con pasos | Skill | `.github/skills/<name>/SKILL.md` |
| Especialista por rol o etapa | Custom agent | `.github/agents/` |
| Validaciones/comandos deterministas | Hook | `.github/hooks/` |
| Integraciones externas | MCP | configuracion MCP |

## 3) Workflow recomendado (practico)

1. Define alcance:
- Workspace (equipo/proyecto) o perfil de usuario (uso personal multi-proyecto).

2. Elige primitive correcto:
- Usa la tabla de decision de arriba.

3. Crea archivo minimo viable:
- Frontmatter valido.
- `description` concreta con frases "Use when...".
- Ejemplos reales de activacion.

4. Valida:
- Ubicacion correcta.
- YAML correcto.
- Nombre coherente con carpeta/archivo.

5. Prueba en chat:
- Verifica que se active cuando corresponde.
- Ajusta descripcion si no se dispara.

## 4) Patrones que si funcionan

Descripcion que dispara bien:
- Incluye verbos y contexto: "Use when reviewing PR comments", "Use when creating file-level instructions".

`applyTo` preciso:
- Bueno: `src/**/*.spec.ts`, `e2e/**/*.spec.ts`, `src/features/auth/**`.
- Evita `"**"` salvo que sea realmente global.

Skills para procesos recurrentes:
- Refactor con checklist.
- Setup de pruebas.
- Preparacion de release.

Agentes para delegacion real:
- Agente de exploracion (solo lectura).
- Agente de implementacion.
- Agente de validacion (lint/test/build).

## 5) Errores frecuentes y solucion

No se activa mi skill/instruccion:
- Revisa `description` (debe contener trigger phrases claras).
- Revisa ubicacion del archivo.
- Revisa que el nombre y estructura sean correctos.

Frontmatter falla sin error claro:
- Usa espacios, no tabs.
- Pon comillas si hay dos puntos en valores YAML.
- Verifica bloque `---` al inicio y cierre.

El contexto se llena demasiado:
- Evita `applyTo: "**"`.
- Divide instrucciones globales de instrucciones especificas.

No se aplica como esperaba:
- Haz mas especifica la descripcion.
- Reduce ambiguedad en casos de uso.
- Separa una instruccion grande en 2 o 3 mas concretas.

## 6) Mini checklists

Checklist para crear instruction:
- [ ] Esta en `.github/instructions/`.
- [ ] Tiene `applyTo` especifico.
- [ ] Regla accionable y verificable.
- [ ] Incluye ejemplos de uso/antiuso.

Checklist para crear skill:
- [ ] Flujo multietapa justificado.
- [ ] `description` con "Use when..." y keywords reales.
- [ ] Pasos claros de entrada/salida.
- [ ] Recursos asociados (si aplica).

Checklist para crear custom agent:
- [ ] Hay necesidad real de aislamiento de contexto.
- [ ] Herramientas permitidas/restringidas definidas.
- [ ] Objetivo del agente y limites bien delimitados.

## 7) Regla de oro

Si una necesidad aparece repetidamente en tu semana de trabajo, formalizala en instructions/skill/agent.
Si es algo puntual, resuelvelo con prompt simple.

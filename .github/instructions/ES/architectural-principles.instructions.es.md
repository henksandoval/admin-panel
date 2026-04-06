> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/architectural-principles.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/architectural-principles.instructions.md ref=5c6412d updated_at=2026-04-06 -->

---
description: "Úsalo cuando diseñes, crees, muevas o revises arquitectura de la app, límites de carpetas, imports, módulos compartidos, dominios core o estructura de features. Define la screaming architecture del proyecto y las reglas de extracción de módulos."
applyTo: "src/app/**/*.{ts,html,scss}"
---

# Architectural Principles

## Principio Central

Organiza la aplicación por dominio, no por tipo de artefacto técnico.

- Prefiere `core/auth`, `core/navigation`, `core/errors` en lugar de carpetas globales como `services/`, `guards/` o `models/`
- La estructura de carpetas debe comunicar la intención de negocio en primer lugar
- El árbol de directorios es un resultado de estas reglas, no la fuente de verdad

## Screaming Architecture

La estructura del proyecto debe hacer que los dominios principales sean obvios a primera vista.

- `core/` contiene dominios transversales con comportamiento reutilizable
- `features/` contiene capacidades de negocio orientadas al usuario y páginas
- `ui-kit/` contiene primitivas de presentación reutilizables y composiciones
- `layout/` contiene la shell de la aplicación y la orquestación del layout

No optimices la estructura solo por simetría. Optimízala para que un desarrollador nuevo pueda responder rápidamente a qué lugar pertenece una responsabilidad.

## Modularidad de los Dominios Core

Cada carpeta dentro de `core/` representa un dominio que debe ser independientemente comprensible y, en principio, extraíble como biblioteca propia.

Un dominio core debe:

- Poseer sus modelos internos, servicios, directivas, guards, interceptors, proveedores y helpers de prueba cuando los necesite
- Exponer una API pública deliberada mediante archivos `index.ts` donde sea apropiado
- Evitar filtrar detalles de implementación internos hacia otros dominios
- Mantenerse cohesionado en torno a un único propósito de dominio

Usa este test de extracción:

- Si el dominio se moviera a una biblioteca independiente, ¿sus responsabilidades seguirían teniendo sentido juntas?
- Si no, el límite probablemente está mal definido

## Organización Interna por Responsabilidad

Dentro de una carpeta de dominio, organiza por responsabilidad cuando el dominio lo necesite.

- Usa subcarpetas como `services/`, `directives/`, `interceptors/`, `guards/`, `models/`, `contracts/`, `tokens/`, `testing/`
- Crea una nueva subcarpeta cuando surja una responsabilidad diferenciada
- No crees carpetas cajón de sastre para lógica no relacionada

No todos los dominios necesitan las mismas subcarpetas. La estructura interna debe seguir las necesidades reales del dominio.

## Dirección de Dependencias

Respeta estas reglas de dependencia:

- `features/` puede depender de `core/`, `ui-kit/` y primitivas compartidas de Angular/plataforma
- `layout/` puede orquestar `core/`, `features/` y `ui-kit/` según sea necesario
- `core/` nunca debe depender de `features/`
- `core/` nunca debe depender de `ui-kit/`
- La colaboración entre dominios de `core/` debe ocurrir a través de APIs públicas estables, no mediante imports profundos en sus internos

Cuando una dependencia invertiría estas reglas, el diseño está mal. Mueve la responsabilidad o introduce un límite más claro.

## Límites de API Pública

Prefiere los imports desde la superficie pública de un dominio en lugar de imports profundos en sus internos.

- Bien: importar desde la raíz de un dominio o un barrel documentado
- Mal: importar desde una ruta de helper interna solo por conveniencia

Esto mantiene los dominios reemplazables y reduce el acoplamiento accidental.

## Heurísticas de Ubicación

Al añadir código nuevo, decide la ubicación con estas preguntas:

1. ¿Qué dominio posee este comportamiento?
2. ¿Es transversal o específico de una feature?
3. ¿Es lógica de negocio, composición de UI u orquestación de shell de la app?
4. ¿Introduce una nueva responsabilidad dentro de un dominio existente?

Usa las respuestas para elegir la carpeta. No partas del árbol actual buscando el hueco más cercano.

## Regla de Documentación

No documentes la app con un snapshot rígido del directorio, salvo para una necesidad temporal específica.

- Documenta las reglas arquitectónicas que generan la estructura
- Documenta los límites y la propiedad de los dominios
- Trata los nombres de carpetas y subcarpetas como una implementación de estos principios

Si el árbol cambia pero estos principios se mantienen, la documentación sigue siendo correcta.

## Contratos y Modelos

### core/contracts

Acuerdos con capas externas: APIs, SDKs, proveedores de terceros.

- Nomenclatura de archivo: `*.contract.ts` o `*.dto.ts`
- Estos tipos reflejan exactamente las formas de datos externos — no añadas lógica de negocio aquí

```typescript
// core/contracts/user.contract.ts
export interface UserDto {
  user_id: string;
  full_name: string;
}
```

### core/models

Modelos de dominio internos. Estos son los tipos con los que trabaja la aplicación.

- Nomenclatura de archivo: `*.model.ts`, `*.value.ts` o `*.types.ts`
- Estos tipos reflejan conceptos de dominio, no formas de API

```typescript
// core/models/user.model.ts
export interface User {
  id: string;
  fullName: string;
}
```

### Regla del Mapper

Nunca mezcles DTOs externos con modelos internos. Mapea siempre en el límite.

```typescript
// ✅ Mapea en la capa de servicio/repositorio
function toUser(dto: UserDto): User {
  return { id: dto.user_id, fullName: dto.full_name };
}
```

Los DTOs nunca deben aparecer en componentes, módulos de feature ni en ui-kit. Los componentes solo consumen modelos internos.

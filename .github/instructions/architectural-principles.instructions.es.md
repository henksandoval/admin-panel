> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/architectural-principles.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/architectural-principles.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
description: "Usar al diseñar, crear, mover o revisar la arquitectura de la aplicación, límites de carpetas, importaciones, módulos compartidos, dominios core o estructura de features. Define la arquitectura gritona del proyecto y las reglas de extracción de módulos."
applyTo: "src/app/**/*.{ts,html,scss}"
---

# Principios Arquitectónicos

## Principio Core

Organiza la aplicación por dominio, no por tipo de artefacto técnico.

- Prefiere `core/auth`, `core/navigation`, `core/errors` sobre carpetas globales como `services/`, `guards/` o `models/`
- La estructura de carpetas debe comunicar primero la intención de negocio
- El árbol de directorios es un resultado de estas reglas, no la fuente de verdad

## Screaming Architecture

La estructura del proyecto debe hacer que los dominios principales sean obvios a primera vista.

- `core/` contiene dominios transversales con comportamiento reutilizable
- `features/` contiene capacidades de negocio orientadas al usuario y páginas
- `ui-kit/` contiene primitivos de presentación reutilizables y composiciones
- `layout/` contiene el shell de la aplicación y la orquestación del layout

No optimices la estructura solo por simetría. Optimízala para que un nuevo desarrollador pueda responder rápidamente dónde pertenece una responsabilidad.

## Modularidad del Dominio Core

Cada carpeta dentro de `core/` representa un dominio que debe ser independientemente comprensible y, en principio, extraíble a su propia librería.

Un dominio core debe:

- Ser dueño de sus modelos internos, servicios, directivas, guards, interceptores, providers y helpers de prueba cuando sea necesario
- Exponer una API pública deliberada a través de archivos `index.ts` donde corresponda
- Evitar filtrar detalles de implementación interna entre dominios
- Mantenerse cohesivo en torno a un único propósito de dominio

Usa esta prueba de extracción:

- Si el dominio fuera trasladado a una librería independiente, ¿seguirían teniendo sentido sus responsabilidades juntas?
- Si no, el límite probablemente está mal

## Organización Interna por Responsabilidad

Dentro de una carpeta de dominio, organiza por responsabilidad cuando el dominio lo necesite.

- Usa subcarpetas como `services/`, `directives/`, `interceptors/`, `guards/`, `models/`, `contracts/`, `tokens/`, `testing/`
- Crea una nueva subcarpeta cuando emerge una responsabilidad distinta
- No crees carpetas "cajón de sastre" para lógica no relacionada

No todos los dominios necesitan las mismas subcarpetas. La estructura interna debe seguir las necesidades reales del dominio.

## Dirección de Dependencias

Respeta estas reglas de dependencia:

- `features/` puede depender de `core/`, `ui-kit/` y primitivos compartidos de Angular/plataforma
- `layout/` puede orquestar `core/`, `features/` y `ui-kit/` según sea necesario
- `core/` nunca debe depender de `features/`
- `core/` nunca debe depender de `ui-kit/`
- La colaboración entre dominios `core/` debe ocurrir a través de APIs públicas estables, no mediante importaciones profundas a sus internos

Cuando una dependencia invertiría estas reglas, el diseño está mal. Mueve la responsabilidad o introduce un límite más claro.

## Límites de API Pública

Prefiere las importaciones desde la superficie pública de un dominio sobre las importaciones profundas a sus internos.

- Bien: importar desde la raíz de un dominio o barrel documentado
- Mal: importar desde una ruta de helper interna solo porque es conveniente

Esto mantiene los dominios reemplazables y reduce el acoplamiento accidental.

## Heurísticas de Colocación

Al agregar código nuevo, decide la ubicación con estas preguntas:

1. ¿Qué dominio es dueño de este comportamiento?
2. ¿Es transversal o específico de una feature?
3. ¿Es lógica de negocio, composición de UI u orquestación del shell de la aplicación?
4. ¿Introduce una nueva responsabilidad dentro de un dominio existente?

Usa las respuestas para elegir la carpeta. No empieces desde el árbol actual y busques el espacio vacío más cercano.

## Regla de Documentación

No documentes la aplicación con una instantánea rígida de directorios a menos que haya una necesidad temporal específica.

- Documenta las reglas arquitectónicas que generan la estructura
- Documenta los límites y la propiedad de los dominios
- Trata los nombres de carpetas y subcarpetas como una implementación de estos principios

Si el árbol cambia pero estos principios se mantienen, la documentación sigue siendo correcta.

## Contratos y Modelos

### core/contracts

Acuerdos con capas externas: APIs, SDKs, proveedores de terceros.

- Nomenclatura de archivos: `*.contract.ts` o `*.dto.ts`
- Estos tipos reflejan exactamente las formas de datos externos — no agregues lógica de negocio aquí

```typescript
// core/contracts/user.contract.ts
export interface UserDto {
  user_id: string;
  full_name: string;
}
```

### core/models

Modelos de dominio internos. Estos son los tipos con los que trabaja la aplicación.

- Nomenclatura de archivos: `*.model.ts`, `*.value.ts` o `*.types.ts`
- Estos tipos reflejan conceptos del dominio, no formas de la API

```typescript
// core/models/user.model.ts
export interface User {
  id: string;
  fullName: string;
}
```

### Regla del Mapper

Nunca mezcles DTOs externos con modelos internos. Siempre mapea en el límite.

```typescript
// ✅ Mapea en la capa de servicio/repositorio
function toUser(dto: UserDto): User {
  return { id: dto.user_id, fullName: dto.full_name };
}
```

Los DTOs nunca deben aparecer en componentes, módulos de features o ui-kit. Los componentes solo consumen modelos internos.

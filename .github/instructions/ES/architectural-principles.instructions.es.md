> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/architectural-principles.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/architectural-principles.instructions.md ref=5c6412d updated_at=2026-04-08 -->

---
description: "Usar al diseñar, crear, mover o revisar arquitectura de la aplicación, límites de carpetas, importaciones, módulos compartidos, dominios core o estructura de features. Define la arquitectura gritante del proyecto y las reglas de extracción de módulos."
applyTo: "src/app/**/*.{ts,html,scss}"
---

# Principios Arquitectónicos

## Principio Central

Organiza la aplicación por dominio, no por tipo de artefacto técnico.

- Prefiere `core/auth`, `core/navigation`, `core/errors` sobre carpetas globales como `services/`, `guards/` o `models/`
- La estructura de carpetas debe comunicar la intención de negocio en primer lugar
- El árbol de directorios es una consecuencia de estas reglas, no la fuente de verdad

## Arquitectura Gritante

La estructura del proyecto debe hacer evidentes los dominios principales a primera vista.

- `core/` contiene dominios transversales con comportamiento reutilizable
- `features/` contiene capacidades de negocio orientadas al usuario y páginas
- `ui-kit/` contiene primitivas y composiciones de presentación reutilizables
- `layout/` contiene el shell de la aplicación y la orquestación del layout

No optimices la estructura por simetría únicamente. Optimízala para que un nuevo desarrollador pueda responder rápidamente a dónde pertenece una responsabilidad.

## Modularidad del Dominio Core

Cada carpeta dentro de `core/` representa un dominio que debe ser comprensible de forma independiente y, en principio, extraíble como su propia librería.

Un dominio core debe:

- Poseer sus modelos internos, servicios, directivas, Guards, Interceptores, providers y helpers de tests cuando sea necesario
- Exponer una API pública deliberada mediante archivos `index.ts` donde corresponda
- Evitar filtrar detalles de implementación interna entre dominios
- Mantenerse cohesionado alrededor de un único propósito de dominio

Usa este test de extracción:

- Si el dominio se moviera a una librería independiente, ¿sus responsabilidades seguirían teniendo sentido juntas?
- Si no, el límite probablemente es incorrecto

## Organización Interna por Responsabilidad

Dentro de una carpeta de dominio, organiza por responsabilidad cuando el dominio lo necesite.

- Usa subcarpetas como `services/`, `directives/`, `interceptors/`, `guards/`, `models/`, `contracts/`, `tokens/`, `testing/`
- Crea una nueva subcarpeta cuando emerge una responsabilidad diferenciada
- No crees carpetas comodín para lógica no relacionada

No todos los dominios necesitan las mismas subcarpetas. La estructura interna debe seguir las necesidades reales del dominio.

## Dirección de Dependencia

Respeta estas reglas de dependencia:

- `features/` puede depender de `core/`, `ui-kit/` y primitivas Angular/plataforma compartidas
- `layout/` puede orquestar `core/`, `features/` y `ui-kit/` según sea necesario
- `core/` nunca debe depender de `features/`
- `core/` nunca debe depender de `ui-kit/`
- La colaboración entre dominios `core/` debe ocurrir a través de APIs públicas estables, no mediante importaciones profundas a sus internos

Cuando una dependencia invertiría estas reglas, el diseño es incorrecto. Mueve la responsabilidad o introduce un límite más claro.

## Límites de API Pública

Prefiere importar desde la superficie pública de un dominio antes que importar profundamente en sus internos.

- Bien: importar desde la raíz de un dominio o un barrel documentado
- Mal: importar desde una ruta interna de un helper solo porque es conveniente

Esto mantiene los dominios reemplazables y reduce el Acoplamiento accidental.

## Heurísticas de Ubicación

Al añadir código nuevo, decide la ubicación con estas preguntas:

1. ¿Qué dominio posee este comportamiento?
2. ¿Es transversal o específico de una funcionalidad?
3. ¿Es lógica de negocio, composición de UI u orquestación del shell de la aplicación?
4. ¿Introduce una nueva responsabilidad dentro de un dominio existente?

Usa las respuestas para elegir la carpeta. No partas del árbol actual y busques el espacio vacío más cercano.

## Regla de Documentación

No documentes la aplicación con una instantánea rígida del directorio a menos que exista una necesidad temporal específica.

- Documenta las reglas arquitectónicas que generan la estructura
- Documenta los límites de dominio y la pertenencia
- Trata los nombres de carpetas y subcarpetas como una implementación de estos principios

Si el árbol cambia pero estos principios se mantienen, la documentación sigue siendo correcta.

## Contratos y Modelos

### core/contracts

Acuerdos con capas externas: APIs, SDKs, proveedores de terceros.

- Nomenclatura de archivos: `*.contract.ts` o `*.dto.ts`
- Estos tipos reflejan exactamente las formas de datos externos — no añadas lógica de negocio aquí

```typescript
// core/contracts/user.contract.ts
export interface UserDto {
  user_id: string;
  full_name: string;
}
```

### core/models

Modelos internos del dominio. Son los tipos con los que trabaja la aplicación.

- Nomenclatura de archivos: `*.model.ts`, `*.value.ts` o `*.types.ts`
- Estos tipos reflejan conceptos del dominio, no formas de API

```typescript
// core/models/user.model.ts
export interface User {
  id: string;
  fullName: string;
}
```

### Regla del Mapper

Nunca mezcles DTOs externos con modelos internos. Realiza el mapeo siempre en el límite.

```typescript
// ✅ Mapea en la capa de servicio/repositorio
function toUser(dto: UserDto): User {
  return { id: dto.user_id, fullName: dto.full_name };
}
```

Los DTOs nunca deben aparecer en componentes, módulos de funcionalidades ni en ui-kit. Los componentes solo consumen modelos internos.

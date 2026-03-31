# Auditoría de Pureza Arquitectónica — `core/`

> Fecha: 2026-03-31
> Alcance: todos los archivos `.ts` dentro de `src/app/core/`

---

VIOLACIÓN #1
ARCHIVO: src/app/core/auth/directives/has-permission.directive.spec.ts
LÍNEA: 9
IMPORTACIÓN ILEGAL: import { createMockAuthProvider, MOCK_USER } from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

VIOLACIÓN #2
ARCHIVO: src/app/core/auth/directives/has-role.directive.spec.ts
LÍNEA: 9
IMPORTACIÓN ILEGAL: import { createMockAuthProvider, MOCK_USER } from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

VIOLACIÓN #3
ARCHIVO: src/app/core/auth/guards/auth.guard.spec.ts
LÍNEA: 12
IMPORTACIÓN ILEGAL: import { createMockAuthProvider, MOCK_USER } from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

VIOLACIÓN #4
ARCHIVO: src/app/core/auth/interceptors/auth.interceptor.spec.ts
LÍNEA: 18
IMPORTACIÓN ILEGAL: import {
  createMockAuthProvider,
  createFailingAuthProvider,
  MOCK_TOKEN_RESPONSE,
} from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

VIOLACIÓN #5
ARCHIVO: src/app/core/auth/providers/jwt/jwt-auth.provider.spec.ts
LÍNEA: 9
IMPORTACIÓN ILEGAL: import { MOCK_TOKEN_RESPONSE, MOCK_USER } from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

VIOLACIÓN #6
ARCHIVO: src/app/core/auth/services/auth.service.spec.ts
LÍNEA: 10
IMPORTACIÓN ILEGAL: import { createFailingAuthProvider, createMockAuthProvider, MOCK_TOKEN_RESPONSE, MOCK_USER } from '@test-helpers/auth';
CAPA IMPORTADA: externa-desconocida
---

SUBDIRECTORIO: core/config → LIMPIO
SUBDIRECTORIO: core/errors → LIMPIO
SUBDIRECTORIO: core/feature-flags → LIMPIO
SUBDIRECTORIO: core/logging-audit → LIMPIO
SUBDIRECTORIO: core/navigation → LIMPIO
SUBDIRECTORIO: core/network → LIMPIO
SUBDIRECTORIO: core/notifications → LIMPIO

---

## Notas del auditor

El alias `@test-helpers/*` resuelve a `src/tests/helpers/` (configurado en `tsconfig.json`).
Dicho directorio está fuera de `core/`, no es una librería Angular ni una dependencia de terceros
(npm), por lo que su importación desde cualquier archivo de `core/` —incluyendo archivos
`.spec.ts`— viola el contrato de capas: *"core/ puede importar ÚNICAMENTE de librerías de Angular,
librerías de terceros (rxjs, etc.) y otros archivos DENTRO de core/"*.

Las 6 violaciones se concentran exclusivamente en archivos de test (`*.spec.ts`) dentro de
`core/auth/`, y todas apuntan al mismo helper externo `@test-helpers/auth`.

---

RESUMEN: 6 violaciones encontradas en 6 archivos.


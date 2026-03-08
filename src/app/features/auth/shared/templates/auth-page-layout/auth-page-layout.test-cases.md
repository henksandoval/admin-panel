# Test Cases: AuthPageLayoutComponent

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-AuthPageLayoutContentProjection | Componente | El contenido proyectado via `ng-content` se renderiza dentro de la tarjeta | Componente renderizado con contenido hijo arbitrario | 1. Montar `AuthPageLayoutComponent` con un elemento hijo. 2. Verificar el DOM. | El elemento hijo aparece dentro del contenedor `.auth-page-layout__card` | Es el único comportamiento funcional del componente; sin proyección de contenido todos los formularios de auth quedarían vacíos |

# Test Cases — AppTableUtils

| ID del Test | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado Esperado | Justificación de Valor |
|---|---|---|---|---|---|---|
| TC-SortNullsAtEnd | Unitario | `defaultTableSort` coloca los valores `null` al final independientemente de la dirección | Array con valores `null` mezclados | 1. Ordenar con `direction = 'asc'`. 2. Repetir con `'desc'`. | En ambos casos, los `null` son los últimos elementos. | Evita que celdas vacías interrumpan el ordenamiento visual y confundan al usuario. |
| TC-SortNoMutation | Unitario | `defaultTableSort` no muta el array original | Array de datos original | 1. Llamar `defaultTableSort` con el array. 2. Comparar la referencia original. | La referencia del array original no cambia. | Garantiza inmutabilidad para compatibilidad con la detección de cambios de Angular. |
| TC-CalcLastPageEmpty | Unitario | `calcLastPage` retorna 0 cuando no hay items | — | 1. Llamar `calcLastPage(0, 10)`. | Retorna `0`. | Edge case: la paginación no debe calcular páginas cuando no hay datos. |

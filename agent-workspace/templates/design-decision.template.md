# Design Decision — Issue #{issue-number}

<!-- STATUS: PENDING -->

---

## Enfoques considerados [REQUERIDO]

> Mínimo 2 enfoques. Para cada uno: descripción breve + trade-offs explícitos en extensibilidad, testeabilidad, coherencia con screaming architecture y compatibilidad con lazy loading.

### Enfoque A — {nombre}

**Descripción:** ...

**Trade-offs:**
- Extensibilidad: ...
- Testeabilidad: ...
- Coherencia arquitectónica: ...
- Lazy loading: ...

### Enfoque B — {nombre}

**Descripción:** ...

**Trade-offs:**
- Extensibilidad: ...
- Testeabilidad: ...
- Coherencia arquitectónica: ...
- Lazy loading: ...

---

## Enfoque elegido [REQUERIDO]

> Nombre del enfoque seleccionado y por qué se descartaron los demás.

**Elegido:** Enfoque {A/B/...}

**Descartados:**
- Enfoque {X}: descartado porque ...

---

## Justificación [REQUERIDO]

> Argumentación estructurada: primero el caso más sólido en contra, luego el caso más sólido a favor, luego el veredicto. No omitir el caso en contra.

### Caso en contra

> ¿En qué escenario concreto de los próximos 12 meses este enfoque fallaría o se volvería un problema?

...

### Caso a favor

> ¿Por qué este enfoque es la mejor opción para el contexto actual del proyecto?

...

### Veredicto

...

---

## Elementos UI observables [REQUERIDO]

> Lista de elementos que el usuario verá e interactuará. Sin nomenclatura de `data-testid`. Sin nombres de componentes. Solo descripciones de lo que el usuario percibe.

- Un campo de texto para ...
- Un botón que permite ...
- Un mensaje de error que aparece cuando ...
- Un indicador de carga visible mientras ...

---

## Comportamientos observables verificables [REQUERIDO]

> Comportamientos específicos que el QA Agent convertirá en tests. Deben ser directamente derivables de los criterios de aceptación de la spec.

- Al {acción}, el sistema {resultado observable}
- Cuando {condición}, se muestra {elemento observable}
- Si {error condition}, aparece {feedback observable}

---

## Restricciones de implementación [OPCIONAL]

> Decisiones técnicas que el Developer Agent debe respetar: patrones obligatorios, estructuras de archivos, convenciones específicas del dominio.

---

## Estimación de complejidad [REQUERIDO]

> Seleccionar uno. El coordinador usa este valor para decidir la estrategia de implementación.

- [ ] `simple` — menos de 5 archivos, 1 componente o servicio
- [ ] `moderate` — entre 5 y 15 archivos, 2–4 componentes o servicios
- [ ] `complex` — más de 15 archivos o dependencias cross-dominio *(requiere escalada al humano en v1)*

---

## Estado del contexto [REQUERIDO]

- [ ] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar las siguientes secciones: *(listar)*

---

## Checklist de completitud [REQUERIDO]

- [ ] Se consideraron al menos 2 enfoques con trade-offs explícitos
- [ ] El enfoque elegido tiene caso en contra documentado
- [ ] El enfoque elegido tiene caso a favor documentado
- [ ] La sección "Elementos UI observables" no menciona data-testid ni nombres de componentes
- [ ] La sección "Comportamientos observables verificables" está presente y es derivable de la spec
- [ ] La estimación de complejidad está seleccionada
- [ ] El "Estado del contexto" está completado

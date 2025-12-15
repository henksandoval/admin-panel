# 🤖 Prompts para IA Agent - Migración Tailwind

Este archivo contiene prompts listos para copiar y pegar cuando uses un IA Agent para realizar la migración.

---

## 📋 Prompt General (Usar al inicio)

```
Estoy trabajando en un proyecto Angular + Tailwind + Angular Material y necesito migrar de un enfoque con mucho CSS personalizado a un enfoque utility-first con Tailwind.

CONTEXTO DEL PROYECTO:
- Framework: Angular 20 standalone components
- Styling: Tailwind CSS 3.4 + Angular Material 20
- Sistema de temas: Dinámico con CSS Variables (--theme-primary-*)
- 6 temas de color intercambiables
- Dark mode con clase 'dark-theme'

OBJETIVOS:
1. Reducir CSS personalizado de ~1,100 líneas a ~200 líneas (85%)
2. Usar Tailwind utilities para el 90% de los estilos
3. Mantener SCSS solo para casos excepcionales
4. Preservar toda la funcionalidad existente
5. Mantener compatibilidad con sistema de temas

EXCEPCIONES PERMITIDAS EN SCSS:
✅ Gradientes con CSS variables: background: linear-gradient(135deg, var(--theme-primary-600), var(--theme-primary-700))
✅ Custom scrollbars: ::-webkit-scrollbar
✅ Pseudo-elementos complejos: ::before, ::after
✅ Animaciones keyframes complejas
✅ Transiciones de propiedades específicas (no 'all')
✅ CSS Variables del sistema de temas

REGLAS ESTRICTAS:
❌ NO crear clases CSS para layout básico (flex, grid, spacing)
❌ NO usar SCSS para colores, tipografía, spacing
❌ NO duplicar utilities que ya existen en Tailwind
❌ NO usar @apply excesivamente
❌ NO mezclar enfoques sin justificación

He preparado una documentación completa:
- MIGRACION_TAILWIND_UTILITY_FIRST.md (guía detallada paso a paso)
- RESUMEN_MIGRACION.md (vista ejecutiva)

¿Estás listo para ayudarme con la migración?
```

---

## 🔍 Prompts de Validación

### Validar un Componente Individual

```
TAREA: Validar la migración de [NOMBRE_COMPONENTE]

Verifica los siguientes aspectos:

1. ARCHIVO SCSS:
   - [ ] Tiene menos de 50 líneas (o está eliminado completamente)
   - [ ] Solo contiene excepciones legítimas:
     * Gradientes con CSS variables
     * Custom scrollbars
     * Pseudo-elementos complejos
     * Animaciones keyframes complejas
     * Transiciones de propiedades específicas
   - [ ] No hay duplicación con utilities de Tailwind

2. ARCHIVO HTML:
   - [ ] Usa principalmente clases de Tailwind
   - [ ] Mantiene clases CSS solo cuando es necesario (estados active, etc.)
   - [ ] No hay clases CSS obsoletas/sin usar

3. ARCHIVO TypeScript:
   - [ ] Si eliminaste SCSS, también eliminaste styleUrl del decorator
   - [ ] Si migraste :host, agregaste host binding al decorator
   - [ ] No hay errores de TypeScript

4. FUNCIONALIDAD:
   - [ ] El componente se ve idéntico al original
   - [ ] Todos los estados funcionan (hover, active, focus)
   - [ ] Animaciones y transiciones funcionan
   - [ ] Dark mode funciona correctamente
   - [ ] Responsive design funciona en todos los breakpoints
   - [ ] No hay errores en la consola del navegador
   - [ ] No hay warnings de Angular

5. PERFORMANCE:
   - [ ] No hay flickering o glitches visuales
   - [ ] Las transiciones son suaves
   - [ ] No hay layout shifts

Proporciona un reporte detallado de la validación.
```

### Validar Todo el Proyecto

```
TAREA: Validación final de la migración completa a Tailwind utility-first

Realiza una auditoría completa del proyecto:

1. MÉTRICAS:
   - [ ] Cuenta líneas totales de CSS custom antes vs después
   - [ ] Verifica que se alcanzó el objetivo de 85% reducción
   - [ ] Lista archivos SCSS que quedan y sus tamaños

2. CÓDIGO:
   - [ ] Busca clases CSS custom que puedan ser utilities de Tailwind
   - [ ] Busca código duplicado entre componentes
   - [ ] Identifica oportunidades de optimización

3. BUILD:
   - [ ] `ng build` ejecuta sin errores
   - [ ] `ng build --configuration production` ejecuta sin errores
   - [ ] Compara tamaño del bundle CSS antes vs después
   - [ ] No hay warnings relacionados a CSS/Tailwind

4. FUNCIONALIDAD COMPLETA:
   - [ ] Todas las rutas/componentes funcionan
   - [ ] Sistema de temas funciona (6 temas)
   - [ ] Dark mode funciona en todo el app
   - [ ] Responsive funciona en mobile/tablet/desktop
   - [ ] Todas las animaciones funcionan
   - [ ] Sidebar expand/collapse funciona
   - [ ] Settings panel funciona
   - [ ] Navigation funciona (todos los niveles)

5. DOCUMENTACIÓN:
   - [ ] Actualiza este documento si encontraste casos nuevos
   - [ ] Documenta decisiones importantes tomadas
   - [ ] Crea guía de mantenimiento para el futuro

Proporciona un reporte ejecutivo con:
- Métricas alcanzadas
- Problemas encontrados y solucionados
- Recomendaciones para el futuro
```

---

## 📊 Prompt de Análisis Inicial

```
TAREA: Analizar el estado actual antes de iniciar la migración

Realiza un análisis exhaustivo del proyecto:

1. INVENTARIO DE ARCHIVOS SCSS:
   - Lista todos los archivos .scss del proyecto
   - Cuenta líneas de código de cada uno
   - Identifica dependencias entre archivos

2. CATEGORIZACIÓN DE CSS:
   Para cada archivo, identifica:
   - ✅ CSS que DEBE migrarse a Tailwind (layout, spacing, colores básicos)
   - ⚠️ CSS que PUEDE mantenerse (gradientes, scrollbars, pseudo-elementos)
   - ❌ CSS que es DUDOSO (evaluar caso por caso)

3. DEPENDENCIAS:
   - Identifica uso de CSS variables
   - Identifica uso de @apply
   - Identifica uso de mixins/extends
   - Identifica imports entre archivos SCSS

4. COMPLEJIDAD:
   Asigna nivel de complejidad a cada archivo:
   - 🟢 Bajo: Puede eliminarse completamente
   - 🟡 Medio: Requiere refactoring moderado
   - 🔴 Alto: Requiere análisis cuidadoso

5. ORDEN DE EJECUCIÓN:
   Propone un orden óptimo basado en:
   - Complejidad (fácil a difícil)
   - Dependencias (sin dependencias primero)
   - Impacto (archivos pequeños primero para ganar confianza)

Proporciona un plan de ejecución detallado.
```

---

## 🆘 Prompts de Troubleshooting

### Problema: Estilos no se aplican

```
PROBLEMA: Los estilos de Tailwind no se están aplicando correctamente

DEBUG:
1. Verifica que las clases estén en el archivo:
   - Revisa src/**/*.{html,ts} en tailwind.config.js content
   
2. Verifica la sintaxis:
   - Las clases con / deben estar entre comillas: class="bg-white/10"
   - Las clases con [] deben ser correctas: class="z-[1000]"
   
3. Verifica purge/JIT:
   - Detén el servidor
   - Elimina .angular/cache
   - npm run start

4. Verifica el orden de especificidad:
   - Tailwind debe cargarse después de Material
   - Revisa el orden en styles.scss

5. Verifica dark mode:
   - Las clases dark: requieren clase 'dark-theme' en ancestor
   - Verifica que el toggle funciona

Identifica y soluciona el problema.
```

### Problema: Gradientes no funcionan

```
PROBLEMA: Los gradientes con variables CSS no se ven correctos

DEBUG:
1. Verifica las variables CSS:
   - Abre DevTools y revisa :root en Elements
   - Verifica que --theme-primary-* están definidas
   
2. Verifica la sintaxis del gradiente:
   - Debe ser: linear-gradient(135deg, var(--theme-primary-600), var(--theme-primary-700))
   - No: background-gradient(...)
   
3. Verifica el tema activo:
   - Revisa que body tiene la clase correcta: theme-default, theme-brand, etc.
   
4. Verifica el SCSS:
   - La clase debe estar aplicada en el HTML
   - El archivo SCSS debe estar referenciado en styleUrl

Identifica y soluciona el problema.
```

### Problema: Animaciones no funcionan

```
PROBLEMA: Las animaciones no funcionan después de la migración

DEBUG:
1. Para animaciones de Tailwind (animate-fade-in, etc.):
   - Verifica que están definidas en tailwind.config.js
   - Verifica que la clase está correctamente escrita
   
2. Para animaciones CSS (keyframes):
   - Verifica que el @keyframes está en el SCSS
   - Verifica que la clase animation: está aplicada
   - Verifica que el archivo SCSS está importado
   
3. Para transiciones:
   - Verifica que transition-* está aplicado
   - Verifica que la propiedad que cambia está especificada
   - Ejemplo: transition-transform vs transition-all

Identifica y soluciona el problema.
```

---

## 💡 Prompts de Optimización

### Optimizar tailwind.config.js

```
TAREA: Optimizar la configuración de Tailwind

Revisa tailwind.config.js y:

1. UTILITIES CUSTOM:
   - Identifica patrones que se repiten 5+ veces
   - Considera agregar utilities custom en extend

2. ANIMATIONS:
   - Revisa si las animaciones en keyframes se usan
   - Considera agregar más si se repiten en SCSS

3. COLORS:
   - Verifica que todos los colores en extend se usan
   - Considera eliminar colores no utilizados

4. SPACING:
   - Verifica si spacing custom se usa frecuentemente
   - Considera agregar más valores si es necesario

5. PLUGINS:
   - Evalúa si plugins de Tailwind ayudarían:
     * @tailwindcss/forms
     * @tailwindcss/typography
     * @tailwindcss/aspect-ratio

Proporciona recomendaciones de optimización.
```

### Consolidar themes/styles.scss

```
TAREA: Optimizar themes/styles.scss

Revisa el archivo y:

1. UTILITIES CUSTOM:
   - Identifica clases .app-* que se usan menos de 3 veces
   - Considera reemplazarlas con utilities inline

2. CSS VARIABLES:
   - Verifica que todas las variables se usan
   - Considera eliminar variables sin uso

3. MATERIAL OVERRIDES:
   - Verifica que todos los overrides son necesarios
   - Considera mover a componentes específicos

4. DUPLICACIÓN:
   - Busca lógica duplicada con Tailwind
   - Busca lógica duplicada entre utilities

5. ORGANIZACIÓN:
   - Considera separar en archivos:
     * variables.scss
     * material-overrides.scss
     * custom-utilities.scss

Proporciona un plan de optimización.
```

---

## 📝 Notas Finales

- Copia estos prompts según los necesites
- Personaliza con detalles específicos de tu caso
- Valida siempre visualmente después de cada cambio
- No tengas miedo de preguntar si algo no está claro

---

**Estos prompts están listos para usar con cualquier IA Agent (GitHub Copilot, ChatGPT, Claude, etc.)**


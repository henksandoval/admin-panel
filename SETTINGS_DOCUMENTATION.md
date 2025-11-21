# 🎨 Sistema de Settings (Themes & Schemes)

## ✅ Implementación Completada

Se ha agregado un **Panel de Settings** completo que permite al usuario personalizar la apariencia de la aplicación, tal como se muestra en la imagen de Fuse Admin.

---

## 🎯 Características Implementadas

### 1. **Panel de Settings Flotante**
- ✅ Botón flotante (FAB) en la esquina inferior derecha
- ✅ Panel deslizante desde la derecha (400px de ancho)
- ✅ Backdrop oscuro cuando está abierto
- ✅ Animaciones suaves de apertura/cierre
- ✅ Responsive (ocupa 100% del ancho en móvil)

### 2. **Sección THEME (6 temas de color)**
- ✅ **Default** (Blue) - #3b82f6
- ✅ **Brand** (Cyan) - #06b6d4
- ✅ **Teal** - #14b8a6
- ✅ **Rose** - #f43f5e
- ✅ **Purple** - #a855f7
- ✅ **Amber** - #f59e0b

**Características del Theme:**
- Grid de 3 columnas con círculos de color
- Marca de check (✓) en el tema activo
- Hover effect con scale
- Los temas cambian el color principal de toda la app
- Se aplica a: botones, enlaces activos, badges, etc.

### 3. **Sección SCHEME (3 esquemas de color)**
- ✅ **Auto** - Se adapta al sistema operativo
- ✅ **Dark** - Modo oscuro
- ✅ **Light** - Modo claro

**Características del Scheme:**
- Botones con íconos de Material Icons
- Gradiente morado cuando está activo
- Cambia entre modo claro y oscuro en toda la app
- El modo Auto detecta la preferencia del sistema

---

## 📁 Archivos Creados

```
src/app/core/
├── services/
│   └── settings.service.ts         ✅ Servicio de gestión de settings
└── components/
    └── settings-panel/
        ├── settings-panel.component.ts     ✅ Lógica del panel
        ├── settings-panel.component.html   ✅ Template del panel
        └── settings-panel.component.scss   ✅ Estilos del panel
```

**Modificados:**
- `layout.component.ts` - Importa SettingsPanelComponent
- `layout.component.html` - Incluye <app-settings-panel>
- `styles.scss` - Variables CSS de temas y dark mode

---

## 🔧 Cómo Funciona

### SettingsService

```typescript
// Gestiona el estado de la configuración
interface SettingsConfig {
  theme: Theme;   // 'default' | 'brand' | 'teal' | 'rose' | 'purple' | 'amber'
  scheme: Scheme; // 'auto' | 'dark' | 'light'
}

// Métodos públicos:
setTheme(theme: Theme): void
setScheme(scheme: Scheme): void
config: Signal<SettingsConfig>
```

**Funcionalidades:**
- ✅ Guarda la configuración en `localStorage`
- ✅ Carga la configuración al iniciar
- ✅ Aplica cambios en tiempo real con Angular Signals
- ✅ Agrega clases CSS al body: `theme-{name}` y `dark-mode`

### Sistema de Temas (CSS Variables)

Cada tema define variables CSS que se usan en toda la app:

```scss
:root {
  --theme-primary: #3b82f6;
  --theme-primary-light: #60a5fa;
  --theme-primary-dark: #2563eb;
  --theme-accent: #3b82f6;
}

body.theme-brand {
  --theme-primary: #06b6d4;
  // ...
}
```

Estas variables se aplican a:
- ✅ Botones de Material
- ✅ Enlaces activos en el sidebar
- ✅ Badges y notificaciones
- ✅ Componentes personalizados

### Dark Mode

Cuando se activa el dark mode (`body.dark-mode`):
- ✅ Fondos oscuros (#1e293b, #0f172a)
- ✅ Texto claro (#e2e8f0, #cbd5e0)
- ✅ Bordes adaptados
- ✅ Cards con fondo oscuro
- ✅ Toolbar con tema oscuro
- ✅ Inputs con fondo oscuro

---

## 🎨 Uso de los Temas

### Aplicar en HTML con Tailwind:
```html
<!-- El color primario del tema se aplica automáticamente -->
<button class="bg-blue-500">Button</button>
```

### Aplicar en CSS/SCSS:
```scss
.my-element {
  color: var(--theme-primary);
  background: var(--theme-primary-light);
  border-color: var(--theme-primary-dark);
}
```

### Aplicar en componentes de Material:
```html
<button mat-fab color="primary">
  <mat-icon>add</mat-icon>
</button>
```
El color `primary` usará el tema activo automáticamente.

---

## 🚀 Cómo Usar

### 1. Abrir el Panel de Settings
- Hacer clic en el botón flotante con ícono de engranaje (⚙️)
- El panel se deslizará desde la derecha

### 2. Cambiar el Theme
- Hacer clic en cualquiera de los 6 círculos de color
- El tema se aplicará inmediatamente
- Se mostrará un check (✓) en el tema activo

### 3. Cambiar el Scheme
- Hacer clic en uno de los 3 botones:
  - **Auto** 🔆 - Sigue la preferencia del sistema
  - **Dark** 🌙 - Modo oscuro siempre
  - **Light** ☀️ - Modo claro siempre
- El cambio se aplica al instante

### 4. Cerrar el Panel
- Hacer clic en el botón X del header
- Hacer clic en el backdrop (fondo oscuro)
- La configuración se guarda automáticamente

---

## 💾 Persistencia

La configuración se guarda en `localStorage` con la clave `app-settings`:

```json
{
  "theme": "purple",
  "scheme": "dark"
}
```

Al recargar la página, la configuración se restaura automáticamente.

---

## 📱 Responsive

**Desktop (> 640px):**
- Panel de 400px de ancho
- Botón en esquina inferior derecha

**Mobile (≤ 640px):**
- Panel ocupa 100% del ancho
- Desliza desde la derecha completa
- Botón más pequeño y cercano al borde

---

## 🎯 Próximas Mejoras Sugeridas

1. **Más temas**: Agregar más opciones de color
2. **Layout settings**: Opciones para cambiar el ancho del sidebar
3. **Font size**: Permitir ajustar el tamaño de fuente
4. **Compact mode**: Vista más compacta de la UI
5. **Export/Import**: Exportar e importar configuraciones

---

## 🔍 Ejemplo de Integración

El panel ya está integrado en el layout principal. Para usarlo en tu aplicación:

```typescript
// En cualquier componente, inyecta el servicio
import { SettingsService } from '@core/services/settings.service';

export class MyComponent {
  private settings = inject(SettingsService);
  
  // Leer la configuración actual
  currentTheme = this.settings.config().theme;
  
  // Cambiar programáticamente
  changeTheme() {
    this.settings.setTheme('purple');
  }
}
```

---

## ✅ Verificación

Para verificar que todo funciona:

1. **Abrir la app**: `npm start` → http://localhost:4200
2. **Hacer clic en el botón de Settings** (⚙️ abajo a la derecha)
3. **Probar cada tema**: Verás cambiar los colores del sidebar y botones
4. **Probar cada scheme**: La app cambiará entre claro y oscuro
5. **Recargar la página**: La configuración debe persistir

---

## 🎉 ¡Listo!

El sistema de Settings está completamente funcional y listo para usar. Los usuarios ahora pueden personalizar la apariencia de la aplicación según sus preferencias.

**Características destacadas:**
- ✅ 6 temas de color
- ✅ 3 esquemas (auto, dark, light)
- ✅ Persistencia en localStorage
- ✅ Aplicación en tiempo real
- ✅ Totalmente responsive
- ✅ Animaciones suaves
- ✅ Integrado con Angular Material

¡Disfruta personalizando tu Admin Panel! 🚀


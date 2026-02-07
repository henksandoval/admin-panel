# Admin Panel

Panel de administración empresarial con Angular 20.3, Material Design 3 y Tailwind CSS.

## Stack

- **Angular 20.3** - Standalone components, Signals API
- **Angular Material 20.2 (M3)** - Componentes y theming
- **Tailwind 3.4** - Layout y spacing
- **TypeScript 5.7** - Strict mode

## Inicio Rápido

```bash
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200)

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Ejecutar tests |

## Estructura

```
src/
├── app/
│   ├── features/           # Módulos de funcionalidad
│   ├── layout/             # Layout principal
│   └── shared/
│       ├── atoms/          # Componentes básicos
│       ├── molecules/      # Componentes compuestos
│       ├── organisms/      # Componentes complejos
│       └── templates/      # Layouts de página
└── themes/                 # Sistema de theming
```

## Documentación

**Antes de escribir código, lee [STYLE_GUIDE.md](docs/STYLE_GUIDE.md).**

Contiene las reglas de estilos, patrones de componentes y ejemplos.

## Temas

6 temas de color × 2 modos (light/dark) = 12 combinaciones.

Cambio dinámico:
```typescript
document.body.className = 'theme-azure dark-theme';
```

## Contribuir

1. Lee [STYLE_GUIDE.md](docs/STYLE_GUIDE.md)
2. Crea branch desde `main`
3. Verifica que `npm run build` pase
4. Crea Pull Request

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ─────────────────────────────────────────────────────────────────
    // REGLAS ARQUITECTÓNICAS - Constitución de Dependencias del Proyecto
    // ─────────────────────────────────────────────────────────────────
    {
      name: 'arch-ui-kit-no-core',
      severity: 'error',
      comment: 'ui-kit/ es una librería de componentes puros. No puede conocer core/ (servicios, auth, etc.).',
      from: { path: '^src/app/ui-kit/' },
      to:   { path: '^src/app/core/' }
    },
    {
      name: 'arch-ui-kit-no-features',
      severity: 'error',
      comment: 'ui-kit/ no puede importar desde features/. La dependencia va en sentido inverso.',
      from: { path: '^src/app/ui-kit/' },
      to:   { path: '^src/app/features/' }
    },
    {
      name: 'arch-ui-kit-no-layout',
      severity: 'error',
      comment: 'ui-kit/ no puede importar desde layout/.',
      from: { path: '^src/app/ui-kit/' },
      to:   { path: '^src/app/layout/' }
    },
    {
      name: 'arch-core-no-features',
      severity: 'error',
      comment: 'core/ provee servicios transversales. No puede depender de features/ concretas.',
      from: { path: '^src/app/core/' },
      to:   { path: '^src/app/features/' }
    },
    {
      name: 'arch-core-no-layout',
      severity: 'error',
      comment: 'core/ no puede importar desde layout/.',
      from: { path: '^src/app/core/' },
      to:   { path: '^src/app/layout/' }
    },
    {
      name: 'arch-layout-no-features',
      severity: 'error',
      comment: 'layout/ estructura la shell de la app pero no debe depender de features/ concretas.',
      from: { path: '^src/app/layout/' },
      to:   { path: '^src/app/features/' }
    },
    {
      name: 'arch-no-cross-feature',
      severity: 'error',
      comment: 'Las features no pueden importarse entre sí. Si comparten algo, extráelo a core/ o ui-kit/.',
      from: { path: '^src/app/features/([^/]+)/' },
      to: {
        path: '^src/app/features/',
        pathNot: '^src/app/features/$1/'    // ✅ $1 sí funciona
      }
    },
    {
      name: 'arch-no-direct-environment',
      severity: 'warn',
      comment:
        'Solo los archivos de configuración/bootstrap deben importar environments/ directamente. ' +
        'Dentro de la app usa InjectionTokens para inyectar la config.',
      from: {
        path: '^src/app/',
        pathNot: '^src/app/app\\.config\\.ts'
      },
      to: { path: '^src/environments/' }
    },
    {
      name: 'arch-no-barrel-bypass',
      severity: 'warn',
      from: {
        path: '^((.*)/[^/]+)/[^/]+$',  // CAMBIO: $1 = dir padre, $2 = dir abuelo
        pathNot: [
          '/index\\.ts$',         // Los barrels importan sus propios internals por diseño
          '\\.spec\\.ts$',        // Los specs importan lo que testean
          'route-loaders\\.ts$',   // Los route-loaders necesitan referencias directas para lazy loading
          '^src/tests/',
          '\\.routes\\.ts$',
          'app\\.config\\.ts$',
          '^src/app/core/config/',
          '^src/app/layout/',
          '^src/environments/', // Las configs pueden importar internals de environments/ por diseño
        ]
      },
      to: {
        path: '^src/',
        pathNot: [
          '^$1/[^/]+$',    // hermanos (mismo directorio que from)
          '^$2/[^/]+$',    // NUEVO: archivos directamente en el directorio padre
          '/index\\.ts$',  // importar el barrel ES correcto
          '^src/environments/', 
        ],
      },
    },
    // ─────────────────────────────────────────────────────────────────
    // REGLAS GENÉRICAS - Generadas por dependency-cruiser --init
    // ─────────────────────────────────────────────────────────────────
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise ' +
        'your solution (i.e. use dependency inversion, make sure the modules have a single responsibility) ',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or " +
        'remove it. If it\'s logical this module is an orphan (i.e. it\'s a config file), ' +
        'add an exception for it in your dependency-cruiser configuration. By default ' +
        'this rule does not scrutinize dot-files (e.g. .eslintrc.js), TypeScript declaration ' +
        'files (.d.ts), tsconfig.json and some of the babel and webpack configs.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)[.][^/]+[.](?:js|cjs|mjs|ts|cts|mts|json)$',
          '[.]d[.]ts$',
          '(^|/)tsconfig[.]json$',
          '(^|/)(?:babel|webpack)[.]config[.](?:js|cjs|mjs|ts|cts|mts|json)$',
          // Excepciones Angular habituales
          '[.]module[.]ts$',            // los módulos raíz suelen no ser importados directamente
          'main[.]ts$',
          'app[.]config[.]ts$',
          'app[.]routes[.]ts$',
          'index[.]ts$'                 // los barrels son "consumidos" externamente
        ]
      },
      to: {},
    },
    {
      name: 'no-deprecated-core',
      comment:
        'A module depends on a node core module that has been deprecated. Find an alternative - these are ' +
        "bound to exist - node doesn't deprecate lightly.",
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: [
          '^v8/tools/codemap$',
          '^v8/tools/consarray$',
          '^v8/tools/csvparser$',
          '^v8/tools/logreader$',
          '^v8/tools/profile_view$',
          '^v8/tools/profile$',
          '^v8/tools/SourceMap$',
          '^v8/tools/splaytree$',
          '^v8/tools/tickprocessor-driver$',
          '^v8/tools/tickprocessor$',
          '^node-inspect/lib/_inspect$',
          '^node-inspect/lib/internal/inspect_client$',
          '^node-inspect/lib/internal/inspect_repl$',
          '^async_hooks$',
          '^punycode$',
          '^domain$',
          '^constants$',
          '^sys$',
          '^_linklist$',
          '^_stream_wrap$'
        ],
      }
    },
    {
      name: 'not-to-deprecated',
      comment:
        'This module uses a (version of an) npm module that has been deprecated. Either upgrade to a later ' +
        'version of that module, or find an alternative. Deprecated modules are a security risk.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['deprecated']
      }
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment:
        "This module depends on an npm package that isn't in the 'dependencies' section of your package.json. " +
        "That's problematic as the package either (1) won't be available on live (2 - worse) will be " +
        'available on live with an non-guaranteed version. Fix it by adding the package to the dependencies ' +
        'in your package.json.',
      from: {},
      to: {
        dependencyTypes: ['npm-no-pkg', 'npm-unknown']
      }
    },
    {
      name: 'not-to-unresolvable',
      comment:
        "This module depends on a module that cannot be found ('resolved to disk'). If it's an npm " +
        'module: add it to your package.json. In all other cases you likely already know what to do.',
      severity: 'error',
      from: {},
      to: {
        couldNotResolve: true
      }
    },
    {
      name: 'no-duplicate-dep-types',
      comment:
        'Likely this module depends on an external (\'npm\') package that occurs more than once ' +
        'in your package.json i.e. bot as a devDependencies and in dependencies. This will cause ' +
        'maintenance problems later on.',
      severity: 'warn',
      from: {},
      to: {
        moreThanOneDependencyType: true,
        dependencyTypesNot: ['type-only']
      }
    },
    {
      name: 'not-to-spec',
      comment:
        'This module depends on a spec (test) file. The responsibility of a spec file is to test code. ' +
        "If there's something in a spec that's of use to other modules, it doesn't have that single " +
        'responsibility anymore. Factor it out into (e.g.) a separate utility/ helper or a mock.',
      severity: 'error',
      from: {},
      to: {
        path: '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$'
      }
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment:
        "This module depends on an npm package from the 'devDependencies' section of your " +
        'package.json. It looks like something that ships to production, though. To prevent problems ' +
        "with npm packages that aren't there on production declare it (only!) in the 'dependencies'" +
        'section of your package.json. If this module is development only - add it to the ' +
        'from.pathNot re of the not-to-dev-dep rule in the dependency-cruiser configuration',
      from: {
        path: '^(src)',
        pathNot: '[.](?:spec|test)[.](?:js|mjs|cjs|jsx|ts|mts|cts|tsx)$'
      },
      to: {
        dependencyTypes: ['npm-dev'],
        dependencyTypesNot: ['type-only'],
        pathNot: ['node_modules/@types/']
      }
    },
    {
      name: 'optional-deps-used',
      severity: 'info',
      comment:
        'This module depends on an npm package that is declared as an optional dependency ' +
        "in your package.json. As this makes sense in limited situations only, it's flagged here. " +
        'If you use an optional dependency here by design - add an exception to your' +
        'dependency-cruiser configuration.',
      from: {},
      to: {
        dependencyTypes: ['npm-optional']
      }
    },
    {
      name: 'peer-deps-used',
      comment:
        'This module depends on an npm package that is declared as a peer dependency ' +
        "in your package.json. This makes sense if your package is e.g. a plugin, but in " +
        "other cases - maybe not so much. If the use of a peer dependency is intentional " +
        'add an exception to your dependency-cruiser configuration.',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['npm-peer']
      }
    }
  ],

  options: {
    doNotFollow: {
      path: ['node_modules']
    },

    // Solo analiza los ficheros fuente de la app Angular
    includeOnly: ['^src/'],

    tsPreCompilationDeps: true,

    tsConfig: {
      fileName: 'tsconfig.json'
    },

    detectProcessBuiltinModuleCalls: true,

    // Descomenta para abrir ficheros directamente en VS Code al hacer clic en el SVG:
    // prefix: `vscode://file/${process.cwd()}/`,

    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['main', 'types', 'typings'],
    },

    skipAnalysisNotInRules: true,

    reporterOptions: {
      dot: {
        // Colapsa node_modules a nivel de paquete (no muestra las tripas)
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)',
        theme: {
          graph: { splines: 'ortho' },
          modules: [
            { criteria: { path: '^src/app/core/' },    attributes: { fillcolor: '#dbeafe', label: 'core' } },
            { criteria: { path: '^src/app/features/' }, attributes: { fillcolor: '#dcfce7', label: 'features' } },
            { criteria: { path: '^src/app/layout/' },  attributes: { fillcolor: '#fef9c3', label: 'layout' } },
            { criteria: { path: '^src/app/ui-kit/' },  attributes: { fillcolor: '#fce7f3', label: 'ui-kit' } },
          ],
          dependencies: [
            { criteria: { rules: [{ severity: 'error' }] }, attributes: { color: 'red', style: 'bold' } },
            { criteria: { rules: [{ severity: 'warn' }] },  attributes: { color: 'orange' } },
          ]
        }
      },
      archi: {
        // Vista de alto nivel: colapsa a nivel de capa (core, features, layout, ui-kit)
        collapsePattern: '^src/app/(?:core|features|layout|ui-kit)|node_modules/(?:@[^/]+/[^/]+|[^/]+)',
        theme: {
          graph: { splines: 'ortho', rankdir: 'TB' },
          modules: [
            { criteria: { path: '^src/app/core' },     attributes: { fillcolor: '#dbeafe', label: 'core/' } },
            { criteria: { path: '^src/app/features' },  attributes: { fillcolor: '#dcfce7', label: 'features/' } },
            { criteria: { path: '^src/app/layout' },   attributes: { fillcolor: '#fef9c3', label: 'layout/' } },
            { criteria: { path: '^src/app/ui-kit' },   attributes: { fillcolor: '#fce7f3', label: 'ui-kit/' } },
          ]
        }
      },
      text: {
        highlightFocused: true
      },
    }
  }
};
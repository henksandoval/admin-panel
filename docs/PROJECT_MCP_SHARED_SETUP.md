# Configuracion MCP compartida del proyecto

Este repositorio ahora versiona un archivo compartido en `.vscode/mcp.json` para que cualquier developer que abra el workspace en VS Code tenga la definicion base de los servidores MCP del proyecto.

## Que incluye el archivo compartido

El archivo `.vscode/mcp.json` registra estos servidores:

- `angular-cli`: expone el MCP oficial del Angular CLI para tareas del proyecto.
- `azure-mcp`: expone el Azure MCP Server oficial para consultar recursos de Azure desde el chat.

El archivo compartido **no almacena secretos**. Cada developer sigue autenticandose con su propia cuenta y sus propios permisos.

## Alcance de esta configuracion

Esta configuracion compartida aplica al **workspace de VS Code**.

- Si trabajas en VS Code con GitHub Copilot, el archivo vive dentro del repo y se comparte con el equipo.
- Si trabajas con GitHub Copilot CLI, debes seguir configurando MCP en tu entorno local porque la CLI usa su propio archivo de configuracion fuera del repositorio.

## Prerrequisitos

Antes de usar el servidor `azure-mcp`, asegúrate de tener:

1. VS Code con GitHub Copilot habilitado.
2. Node.js instalado.
3. Azure CLI instalada.
4. Acceso a la suscripcion o recursos de Azure que quieras consultar.

## Pasos para usar la configuracion del proyecto

### 1. Abrir el repositorio en VS Code

Abre la carpeta del proyecto `admin-panel` como workspace normal de VS Code.

### 2. Instalar dependencias locales necesarias

Si todavia no has preparado el entorno del proyecto:

```bash
npm install
```

### 3. Iniciar sesion en Azure

Autenticate con tu propia identidad:

```bash
az login
```

Si trabajas con varias suscripciones, selecciona la que vayas a usar:

```bash
az account set --subscription "<SUBSCRIPTION_ID_O_NOMBRE>"
```

### 4. Recargar VS Code

Despues de clonar el repo por primera vez, o despues de actualizar el archivo `.vscode/mcp.json`, recarga la ventana:

```text
Ctrl+Shift+P -> Developer: Reload Window
```

Esto fuerza a VS Code a releer la configuracion MCP del workspace.

### 5. Probar que Azure MCP responde

Abre el chat de Copilot en VS Code y usa una consulta simple, por ejemplo:

```text
Muestrame mis resource groups de Azure
```

O tambien:

```text
Lista los recursos de mi suscripcion por grupo
```

Si tu sesion de Azure es valida y tienes permisos, Copilot deberia poder resolver la consulta usando `azure-mcp`.

## Como manejar credenciales sin guardarlas en el repo

No agregues PATs, client secrets ni tokens al archivo `.vscode/mcp.json`.

Usa una de estas opciones seguras:

1. `az login` con tu usuario.
2. Variables de entorno locales en tu sistema.
3. Un secret manager corporativo, si el equipo ya usa uno.

## Si luego agregan un MCP adicional para Azure DevOps

Si en el futuro el equipo adopta un servidor MCP especifico para Azure DevOps, la recomendacion es mantener el mismo patron:

1. Versionar solo la configuracion no sensible en el repo.
2. Referenciar variables de entorno para organizacion, proyecto o tokens.
3. Documentar en `docs/` que secreto debe definir cada developer de forma local.

## Archivo versionado

La configuracion compartida vive en:

```text
.vscode/mcp.json
```

Esto permite que el proyecto distribuya una base comun sin exponer credenciales ni permisos de otros usuarios.

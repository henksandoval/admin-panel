# Configuración de Azure MCP Server

Guía paso a paso para conectar Azure MCP Server con la CLI de GitHub Copilot, basada en la documentación oficial de Microsoft Learn.

Fuente oficial:
https://learn.microsoft.com/es-es/azure/developer/azure-mcp-server/how-to/github-copilot-cli?tabs=visual-studio-code

---

## 1. Prerrequisitos

Asegúrate de tener instalado y configurado:

- GitHub Copilot CLI
- Azure CLI
- Node.js (para ejecutar el servidor con npx)

Además, debes iniciar sesión en Azure:

```bash
az login
```

---

## 2. Inicio de sesión para desarrollo local

Azure MCP Server usa autenticación de Microsoft Entra ID.

La guía oficial indica dos modos de autenticación:

- Modo de agente (InteractiveBrowserCredential)
- Modo de cadena de credenciales (múltiples fuentes en secuencia)

Para Visual Studio Code, puedes autenticarte también desde la paleta de comandos:

1. Abrir paleta: Ctrl+Shift+P (o Cmd+Shift+P en macOS)
2. Ejecutar comando: Azure: Sign In
3. Completar el flujo de autenticación

---

## 3. Agregar Azure MCP en GitHub Copilot CLI

1. Abre terminal
2. Inicia modo interactivo de Copilot CLI:

```bash
copilot
```

3. Abre el formulario de configuración MCP:

```bash
/mcp add
```

4. Completa los campos con estos valores:

- Server name: azure-mcp
- Server type: 1 (Local)
- Command: npx -y @azure/mcp@latest server start
- Environment variables: vacío (si usarás autenticación de Azure CLI)
- Tools: *

5. Guarda con Ctrl+S (o Cmd+S)
6. Sal con Esc

Alternativa .NET (según la nota oficial):

- Command: dotnet dnx -p Azure.Mcp server start

---

## 4. Verificar conexión

Dentro de la sesión interactiva de Copilot CLI, ejecuta:

```bash
/mcp show
```

Debes ver el servidor `azure-mcp` registrado, con salida similar a:

```text
MCP Server Configuration:
  azure-mcp (local): Command: npx
Total servers: 1
Config file: ~/.copilot/mcp-config.json
```

---

## 5. Uso básico

Con el servidor activo, ya puedes pedir contexto de Azure en lenguaje natural. Ejemplo:

```text
List my Azure resource groups.
```

Copilot CLI detecta la intención y usa las herramientas de `azure-mcp` para consultar tus recursos.

---

## 6. Administración de servidores MCP

Comandos útiles en Copilot CLI:

```bash
/mcp show
/mcp remove azure-mcp
/mcp help
```

---

## 7. ¿Es exclusivo de GitHub Copilot?

No. Azure MCP Server no es exclusivo de GitHub Copilot.

Puntos clave:

- MCP (Model Context Protocol) es un protocolo estándar para exponer herramientas/contexto a clientes compatibles.
- La documentación que usaste describe la integración específica con GitHub Copilot CLI.
- Si otro IA Agent o cliente soporta MCP y permite registrar servidores MCP (por stdio/comando), en principio también puede usar Azure MCP Server.

En resumen:

- Exclusivo de Copilot: no
- Compatible con otros agentes IA: sí, siempre que el cliente implemente soporte MCP

---

## 8. Recomendaciones prácticas para tu flujo

- Mantén autenticación con `az login` en el mismo entorno donde corre el cliente MCP.
- Empieza con la opción `npx -y @azure/mcp@latest server start` por simplicidad.
- Si en tu pipeline necesitas estabilidad reproducible, fija versión en vez de `@latest`.
- Documenta en el equipo qué cliente MCP usarán (Copilot CLI u otro) y dónde vive su archivo de configuración.

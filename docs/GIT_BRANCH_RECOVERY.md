# 🔄 Cómo Recuperar un Branch Eliminado en Git

**Fecha:** Enero 2026  
**Contexto:** Recuperación de branches locales eliminados accidentalmente

---

## 🎯 Resumen Ejecutivo

Git mantiene un historial de todas las referencias (commits, branches, etc.) en el **reflog** durante aproximadamente **30-90 días**. Esto significa que incluso si eliminas un branch, los commits siguen existiendo y puedes recuperarlos.

---

## 📋 Pasos para Recuperar un Branch Eliminado

### **Paso 1: Verificar el Estado Actual**

Primero, confirma qué branches existen actualmente:

```bash
git branch -a
```

**Salida esperada:**
```
  feature/pds
* master
```

En este caso, el branch `feature/pds-toggle-group` no aparece (fue eliminado).

---

### **Paso 2: Buscar el Branch en el Reflog**

El reflog guarda un historial de todas las operaciones de Git. Búscalo con:

```bash
git reflog --all | head -30
```

O en PowerShell:
```powershell
git reflog --all | Select-Object -First 30
```

**Salida esperada (extracto):**
```
245ea8c HEAD@{0}: checkout: moving from feature/pds to master
245ea8c refs/heads/feature/pds@{0}: branch: Created from master^0
bd08124 HEAD@{3}: commit: feat: ✨ Update import paths to use relative paths...
f0d90a9 HEAD@{4}: commit: feat: ✨ Refactor selects component...
ef01d46 HEAD@{5}: commit: feat: ✨ Integrate PDS Playground Template...
```

**🔍 Identificar el commit correcto:**
- Busca el último commit que pertenecía al branch eliminado
- En este caso: `bd08124` era el HEAD del branch `feature/pds-toggle-group`

---

### **Paso 3: Recrear el Branch desde el Commit**

Una vez identificado el hash del commit (ej: `bd08124`), recrea el branch:

```bash
git branch <nombre-del-branch> <hash-del-commit>
```

**Ejemplo real:**
```bash
git branch feature/pds-toggle-group bd08124
```

**✅ Resultado:**
El branch se crea apuntando exactamente al mismo commit donde estaba antes de eliminarse.

---

### **Paso 4: Verificar la Recuperación**

Confirma que el branch fue recuperado:

```bash
git branch -a
```

**Salida esperada:**
```
  feature/pds
  feature/pds-toggle-group  ← ✅ Recuperado
* master
```

---

### **Paso 5: Verificar el Historial de Commits**

Asegúrate de que todos los commits están presentes:

```bash
git log <nombre-del-branch> --oneline -10
```

**Ejemplo:**
```bash
git log feature/pds-toggle-group --oneline -10
```

**Salida esperada:**
```
bd08124 (feature/pds-toggle-group) feat: ✨ Update import paths...
f0d90a9 feat: ✨ Refactor selects component...
ef01d46 feat: ✨ Integrate PDS Playground Template...
ee830c8 feat: ✨ Refactor indicators component...
3b79fed feat: ✨ Introduce PDS Playground Template...
```

---

## 🔧 Comandos Completos (Cheat Sheet)

### **Recuperar Branch Eliminado:**

```bash
# 1. Ver branches actuales
git branch -a

# 2. Buscar en el reflog
git reflog --all | head -30          # Linux/Mac
git reflog --all | Select-Object -First 30  # PowerShell

# 3. Recuperar el branch
git branch <nombre-branch> <hash-commit>

# 4. Verificar recuperación
git branch -a

# 5. Ver historial del branch recuperado
git log <nombre-branch> --oneline -10

# 6. (Opcional) Cambiar al branch recuperado
git checkout <nombre-branch>
```

### **Fusionar a Master SIN hacer Checkout:**

```bash
# Estando en feature/branch, llevar cambios a master:

# Opción 1: Forzar master (más rápido)
git branch -f master HEAD

# Opción 2: Push local (más seguro)
git push . HEAD:master

# Opción 3: Fetch local
git fetch . HEAD:master

# Verificar que funcionó
git log master..HEAD --oneline  # Debe estar vacío
```

---

## 🚀 Cómo Fusionar a Master SIN Hacer Checkout

### **Problema Común:**
Estás en `feature/mi-branch` y quieres llevar los cambios a `master` sin hacer `git checkout master`.

### **Solución 1: Forzar master a tu posición actual** ⭐ (Más rápido)

```bash
# Estando en tu feature branch
git branch -f master HEAD
```

**¿Qué hace?**
- Mueve la referencia de `master` al commit actual (HEAD)
- NO cambia tu branch actual
- ⚠️ Solo úsalo si master NO tiene commits que quieras preservar

**Cuándo usarlo:**
- ✅ Cuando master está desactualizado y quieres que "alcance" tu branch
- ✅ Cuando estás seguro de que master no tiene trabajo importante
- ❌ NO lo uses si master tiene commits que feature/branch no tiene

---

### **Solución 2: Push local** (Más seguro)

```bash
# Estando en tu feature branch
git push . HEAD:master
```

**¿Qué hace?**
- "Empuja" tu branch actual a master localmente
- Es como un merge fast-forward
- Más seguro porque Git rechazará si hay conflictos

---

### **Solución 3: Merge sin checkout** (Más explícito)

```bash
# Estando en feature/branch
git fetch . feature/branch:master
```

**¿Qué hace?**
- Fusiona `feature/branch` en `master` sin cambiar de branch
- Solo funciona si es fast-forward (sin conflictos)

---

### **Verificación:**

Después de cualquier método, verifica que funcionó:

```bash
# Ver que master y tu branch apuntan al mismo commit
git log --oneline --graph --all --decorate | head -5

# Verificar que no hay diferencias
git log master..tu-branch --oneline  # Debe estar vacío
```

---

### **⚠️ Importante: ¿Qué NO hace `git rebase`?**

Confusión común:

```bash
❌ git rebase feature/branch  # Esto NO fusiona a master
```

**Lo que realmente hace `git rebase feature/branch`:**
- Toma los commits de tu branch actual (ej: master)
- Los re-aplica SOBRE feature/branch
- Es lo contrario de lo que probablemente querías

**Para fusionar feature → master, usa:**
```bash
✅ git checkout master && git merge feature/branch  # Forma tradicional
✅ git branch -f master HEAD  # Desde feature/branch, sin checkout
```

---

## 🛡️ Casos Especiales

### **Si no recuerdas el nombre del branch:**

Busca por mensaje de commit o autor:

```bash
git reflog --all | grep "mensaje del commit"
git reflog --all | grep "nombre.autor"
```

### **Si el reflog fue limpiado:**

Si han pasado más de 90 días o ejecutaste `git gc --prune=now`, es más difícil pero aún posible:

```bash
# Buscar commits "huérfanos"
git fsck --lost-found

# Los commits se guardan en .git/lost-found/commit/
```

### **Recuperar desde backup remoto:**

Si el branch estaba en GitHub/GitLab/Bitbucket:

```bash
# Fetch todos los branches remotos
git fetch --all

# Recrear desde el remoto
git checkout -b <nombre-branch> origin/<nombre-branch>
```

---

## ⚠️ Limitaciones Importantes

1. **Tiempo límite:** El reflog guarda historial por **30-90 días** (configurable)
2. **Solo commits locales:** Si nunca hiciste push, el remoto no puede ayudarte
3. **Garbage Collection:** `git gc` puede eliminar commits huérfanos antes de tiempo

---

## 🎓 Conceptos Clave

### **¿Qué es el Reflog?**
Un "diario" local de Git que registra cada movimiento del HEAD y referencias de branches. Es tu red de seguridad.

### **¿Por qué funciona esto?**
Git nunca elimina commits inmediatamente. Solo elimina la **referencia** (el branch), pero el commit sigue en la base de datos de Git hasta que `git gc` lo limpia.

### **Comandos relacionados:**
```bash
# Ver configuración del reflog
git config --get gc.reflogExpire        # Default: 90 días
git config --get gc.reflogExpireUnreachable  # Default: 30 días

# Desactivar expiración del reflog (no recomendado en producción)
git config gc.reflogExpire never
```

---

## 📚 Recursos Adicionales

- [Git Reflog Documentation](https://git-scm.com/docs/git-reflog)
- [Git Book - Maintenance and Data Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)
- [Stack Overflow: Recover deleted git branch](https://stackoverflow.com/questions/3640764/can-i-recover-a-branch-after-its-deletion-in-git)

---

## ✅ Checklist de Recuperación

- [ ] Ejecutar `git branch -a` para confirmar que el branch no existe
- [ ] Ejecutar `git reflog --all` para buscar el commit perdido
- [ ] Identificar el hash del último commit del branch eliminado
- [ ] Ejecutar `git branch <nombre> <hash>` para recrear el branch
- [ ] Verificar con `git branch -a` que el branch fue recreado
- [ ] Verificar con `git log <nombre> --oneline` que los commits están intactos
- [ ] (Opcional) Hacer push al remoto: `git push origin <nombre>`

---

## 💡 Buenas Prácticas

1. **Haz push frecuentemente:** Si el branch está en el remoto, siempre puedes recuperarlo
2. **No ejecutes `git gc --aggressive` a menos que sepas lo que haces**
3. **Usa branches de respaldo:** Antes de experimentos, crea un branch de seguridad
4. **Configura el reflog:** Aumenta el tiempo de expiración si trabajas en proyectos críticos:
   ```bash
   git config gc.reflogExpire 180.days.ago
   ```

---

## 🎉 Caso de Éxito Real

**Situación:** Branch `feature/pds-toggle-group` eliminado accidentalmente después de un rebase confuso  

**Problema adicional:** Se intentó usar `git rebase feature/pds-toggle-group` pensando que fusionaría los cambios a master, pero no lo hizo.

**Solución:** 
1. Identificado commit `bd08124` en reflog
2. Ejecutado `git branch feature/pds-toggle-group bd08124`
3. Verificado 20+ commits recuperados correctamente
4. **Fusionado a master SIN hacer checkout:** `git branch -f master HEAD` (estando en feature/pds-toggle-group)
5. Verificado con `git log master..feature/pds-toggle-group --oneline` (resultado vacío = éxito)
6. **Resultado:** Branch recuperado y cambios fusionados a master al 100% sin pérdida de datos

**Lección aprendida:**
- ✅ `git rebase` NO fusiona branches
- ✅ Puedes fusionar a master sin hacer checkout usando `git branch -f master HEAD`
- ✅ Siempre verifica con `git log master..feature-branch` después de fusionar

---

**Última actualización:** Enero 2026  
**Autor:** Admin Panel Development Team

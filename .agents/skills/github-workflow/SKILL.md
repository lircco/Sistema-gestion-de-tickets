---
name: github-workflow
description: Reglas e instrucciones para crear ramas, realizar Pull Requests (PRs), validar Actions y utilizar el GitHub CLI (gh). Utiliza esta skill siempre que el usuario pida mergear, subir cambios, revisar PRs o abrir PRs en GitHub.
---

# Flujo de Trabajo en GitHub (GitHub Workflow)

Este documento contiene las reglas estrictas de control de versiones y revisión de código para este proyecto. Como asistente, **DEBES** seguir estas reglas antes de ejecutar comandos Git/GitHub.

## Reglas de Ramas y PRs (OBLIGATORIAS)

1. **Ramas Principales:**
   - `main`: Entorno de producción. Solo acepta código estable.
   - `develop`: Entorno de integración y desarrollo.

2. **Creación de Cambios:**
   - Para cada nueva característica (`feature/`), arreglo de errores (`fix/`), u otra tarea, **SIEMPRE** debes crear una nueva rama a partir de `develop` (o tu rama actual si es correcto).
   - **NUNCA** trabajes ni hagas commits directamente en `main` o `develop`.

3. **Flujo de Pull Requests (PR):**
   - Una vez terminados los commits en tu rama, debes subirla al remoto (`git push`).
   - Debes abrir un Pull Request hacia `develop`.
   - Para llevar cambios a producción (`main`), el PR debe hacerse EXCLUSIVAMENTE desde `develop` hacia `main`. No se aceptan PRs desde ramas de features hacia `main` directamente.

4. **Consentimiento:**
   - **SIEMPRE** debes preguntar al usuario antes de hacer un Pull Request o de hacer un Merge ("¿Querés que abra un PR con estos cambios?", "¿Querés que haga merge de este PR?").

5. **Validación de Actions (Checks):**
   - Antes de realizar un merge, **DEBES** asegurarte de que todos los GitHub Actions del PR estén en estado "pasó exitosamente" (success).
   - Usa `gh pr checks` para validar el estado de los tests CI antes de aprobar o mergear.

---

## Cómo utilizar el GitHub CLI (gh)

El proyecto utiliza GitHub CLI (`gh`) para manejar los PRs desde la consola.

### Instalación (en caso de que falte)
Si el comando `gh` no funciona, debes instruir al usuario o intentar instalarlo (con su permiso):
- En Windows (PowerShell): `winget install --id GitHub.cli`
- Luego de instalar, requiere autenticación: `gh auth login`

### Comandos Útiles para el Agente
- **Crear un PR:** `gh pr create --base develop --title "feat: nombre" --body "Descripción detallada"`
- **Verificar estado de las Actions de un PR:** `gh pr checks`
- **Mergear un PR:** `gh pr merge --squash --delete-branch` (Recuerda: Solo si el usuario lo confirmó y las actions pasaron).

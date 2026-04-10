# Tokenizer — Documentación operativa

Entrada única para seguir el estado real del proyecto.

## Contenido

- `MASTER_STATE.md`: estado actual, límites y decisiones vigentes.
- `BACKLOG.md`: trabajo cerrado, abierto y diferido.
- `TASK_TEMPLATE.md`: plantilla breve para abrir tareas acotadas.

## Roles de carpetas

- `README.md`: documentación pública para uso y evaluación de la herramienta.
- `docs/`: web pública estática y assets de la UI.
- `project/`: documentación operativa interna.
- `fixtures/`: fixtures y snapshots de verificación.

## Verificación

- Validación normal: `node scripts/verify-fixtures.js`
- Regeneración manual de snapshots: `node scripts/verify-fixtures.js --update`
- La automatización del repo ejecuta solo la validación normal y debe fallar ante regresiones.

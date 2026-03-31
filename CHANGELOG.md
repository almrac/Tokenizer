# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

## [v0.5.0] - 2026-03-31

### Added

- Capa de normalización previa a validación/generación en CLI y web.
- Soporte de aliases top-level para mejorar compatibilidad con JSON reales:
  `color/colours`, `space/spaces`, `radii/borderRadius`, `shadow/boxShadow/elevation`, `type/text`.
- Normalización de aliases comunes en `typography`:
  `font-family/font_family`, `font-size/font_size`, `font-weight/font_weight`,
  `line-height/line_height`, `letter-spacing/letter_spacing`.
- Feedback de normalización:
  - CLI: mensajes `Info: ...`
  - Web UI: bloque de información no bloqueante.

### Changed

- El flujo ahora es: parseo JSON -> normalización -> validación -> generación.
- En conflictos entre clave canónica y alias, prevalece la canónica y se informa.

## [v0.4.4] - 2026-03-31

### Changed

- Refinamiento UX single-target-first:
  - el selector `Target principal` vuelve a ser el flujo principal y controla directamente la vista previa.
  - `Modo multi-export` se mantiene, pero queda como opción secundaria.
- La selección de vista activa se mantiene en el panel derecho y solo aparece cuando existen múltiples outputs.
- Se redujo la confusión entre selección de exportación y vista previa manteniendo compatibilidad con multi-export.

## [v0.4.3] - 2026-03-31

### Changed

- Simplificación de carga de ejemplos en la UI web: se elimina el sistema de múltiples presets.
- `Cargar ejemplo` ahora carga un único ejemplo básico (`colors` + `spacing`) para reducir confusión.
- Se mantiene `Limpiar` y el estado inicial vacío al abrir la herramienta.
- Sin cambios en el comportamiento multi-export de v0.4.2.

## [v0.4.2] - 2026-03-31

### Added

- Multi-export en CLI con `--target` en formato lista (por ejemplo `--target css,tailwind`).
- Selección multi-target en la UI web con generación simultánea por target.
- Selector de preview activo cuando hay múltiples outputs.

### Changed

- Acción `Descargar` en modo multi-target usa fallback sin dependencias: descarga secuencial de archivos.
- Acción `Copiar` en modo multi-target ahora copia únicamente el output activo.
- Documentación ampliada para modo single-target y multi-target.

## [v0.4.1] - 2026-03-31

### Added

- Sistema de presets en la UI web: `Basic`, `Full`, `Ionic-oriented`, `Tailwind-oriented`.
- Selector compacto de presets y carga inmediata desde la UI.

### Changed

- Botón de ejemplo adaptado para cargar el preset seleccionado.
- Prefijo de ejemplo actualizado de `nb` a `tk` en UI y documentación.
- `ionic` ahora mantiene colores nativos `--ion-color-*` y usa fallback con prefijo configurable para grupos no nativos (`spacing`, `typography`, `radius`, `shadows`).
- Validación de target actualizada para no marcar `spacing` como ignorado en `ionic`.

## [v0.4.0] - 2026-03-31

### Added

- Soporte ampliado de grupos de tokens en todos los targets existentes: `typography`, `radius`, `shadows`.
- Soporte de tipografía para estructuras por categorías (`fontFamily.base`) y por estilos (`body.fontSize`).
- Mapeo tipográfico más útil para `css`, `bootstrap` y `tailwind`.

### Changed

- `css`: tipografía ahora se genera con nombres directos tipo `--font-family-*`, `--font-size-*`, `--font-weight-*`, `--line-height-*`.
- `ionic`: mantiene colores y añade variables custom consistentes para `typography`, `radius` y `shadows`.
- `bootstrap`: mejora de mapeos SCSS para tipografía base y mapas tipográficos, además de radius/shadows con aliases base.
- `tailwind`: `theme.extend` ahora soporta tipografía tanto en estructura por categorías como por estilos.
- Muestra JSON de la web actualizada para reflejar la estructura recomendada en v0.4.0.

## [v0.3.4] - 2026-03-31

### Added

- Validación estructural de entrada en CLI y web UI.
- Feedback separado de errores y warnings en la UI web.

### Changed

- Reglas de validación para distinguir JSON inválido, estructura inválida y grupos ignorados/no soportados.

## [v0.3.3] - 2026-03-31

### Changed

- Mejora de legibilidad de salidas generadas con secciones y separación entre bloques.

## [v0.3.0] - 2026-03-31

### Added

- Reestructuración de la UI web hacia un workspace de dos columnas (configuración + resultado).
- Superficie de salida con presentación tipo editor para la vista previa.

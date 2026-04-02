# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

## [v0.8.2] - 2026-04-02

### Changed

- Expansión de la capa de plantillas de mapping para cubrir no solo `colors`, sino también `typography`, `radius`, `shadows` y `spacing` con la misma filosofía (mapeo seguro, probable, y omisión/fallback según target).
- Bootstrap:
  - mapeos nativos explícitos añadidos para `typography.fontSize.body`, `typography.fontWeight.regular`, `typography.lineHeight.body`, `radius.sm/default/lg`, `shadows.sm/md/default`, `spacing -> $spacers`.
  - generación de tipografía base alineada a mapeos semánticos (`body`/`regular`) y omisión con warning para claves tipográficas sin equivalente global claro.
  - `shadows` ahora usa mapeo global claro (`$box-shadow-sm`, `$box-shadow`) y omite variantes ambiguas.
  - warnings de validación refinados para reportar `typography`, `radius` y `shadows` Bootstrap sin equivalencia global clara.
- Alineación completa entre CLI y preview web para esta expansión de mappings y warnings.

## [v0.8.1] - 2026-04-02

### Changed

- Bootstrap refina su mapeo de `colors` con estrategia en tres niveles:
  mapeos semánticos seguros, globales probables y omisión con warning cuando no existe equivalencia SCSS clara.
- Soporte ampliado de mapeo seguro para roles Bootstrap:
  `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `light`, `dark` (incluyendo variantes tipo `primaryColor`).
- Soporte de mapeos globales probables en Bootstrap:
  `baseColor/textDefault/bodyColor/foreground/neutralText -> $body-color`,
  `baseBorderColor/borderColor/neutralBorder/dividerColor -> $border-color`,
  `surface/background/bodyBg/baseBg -> $body-bg`.
- Selección de tipografía base en Bootstrap más intencional:
  `fontSize.body`, `fontWeight.regular`, `lineHeight.body` priorizados para variables base cuando existen.
- Radius Bootstrap más útil:
  `$border-radius` ahora también puede tomar `radius.default` además de `radius.md`/`radius.base`.
- Alineación completa entre CLI y preview web para la misma lógica de mapeo/warnings de Bootstrap.

## [v0.8.0] - 2026-04-01

### Added

- Capa interna de plantillas de mapeo por target (`css`, `ionic`, `bootstrap`, `tailwind`) con contrato simple:
  `target`, `strategy`, `nativeMappings`, `groupRules`, `groupFallbacks`.
- Primer adapter de entrada `flatVariantCollection` (colors-only) para detectar y convertir colecciones planas con variantes internas.
- Metadatos de importación para adapter en `summary`:
  `sourcePattern`, `rootUsed`, `selectedVariant`.

### Changed

- Flujo de importación en CLI/web: ahora ejecuta adapters antes de selección de raíz y normalización canónica.
- `ionic`: mapeo nativo para `typography.fontFamily.base -> --ion-font-family` con fallback custom para el resto.
- `bootstrap`: uso explícito de mapeos nativos iniciales (`$primary`, `$font-family-base`, `$border-radius`) con fallback existente.
- Validación por target alineada a soporte derivado desde plantillas internas de mapeo.

### Safety

- Cuando una colección plana detectada contiene múltiples variantes internas y no existe selector explícito, la importación se bloquea con error claro (sin suposiciones silenciosas).

## [v0.7.0] - 2026-04-01

### Changed

- Pass de calidad y consistencia de outputs en generadores `css`, `ionic`, `bootstrap` y `tailwind`.
- Orden estable de claves y secciones para mejorar legibilidad y diffs en archivos generados.
- Ajuste de mapeo Bootstrap para colores en orden canónico (`primary`, `secondary`, `success`, `info`, `warning`, `danger`, `light`, `dark`).
- Mejora de warnings de omisión: `letterSpacing` en Bootstrap ahora se reporta explícitamente y se omite de forma intencional.
- Alineación del generador web (`docs/app.js`) con las mismas reglas de formato/orden para previews consistentes con CLI.

## [v0.6.1] - 2026-03-31

### Added

- Inspector ligero en la UI web con resumen de interpretación de entrada:
  raíz usada, grupos detectados, grupos ignorados, normalización y estado de advertencias.
- Resumen adicional en CLI:
  raíz usada, grupos detectados, ajustes de normalización y recuento de warnings.

### Changed

- `normalizeTokenInput` ahora expone un `summary` estructurado reutilizable por web y CLI.
- Flujo de feedback más transparente sin añadir complejidad ni rediseñar la interfaz.

## [v0.6.0] - 2026-03-31

### Added

- Pipeline de importación más robusto para detección de raíz de tokens:
  descubrimiento de candidatas + scoring simple + selección con umbral de confianza.
- `Import summary` ligero con raíz usada y grupos detectados.

### Changed

- Priorización explícita de grupos canónicos top-level cuando existen.
- Selección de raíz envuelta/anidada más predecible usando señales:
  cantidad de grupos canónicos, aliases mapeables, nombre de wrapper y coherencia del branch.
- Manejo de ambigüedad reforzado:
  si las candidatas principales tienen confianza similar, se devuelve error en lugar de extracción insegura.
- Feedback de importación más explicable en CLI y web.

## [v0.5.1] - 2026-03-31

### Added

- Compatibilidad de importación para exports JSON envueltos en raíces comunes:
  `tokens`, `global/globals`, `theme/themes`, `values`, `collection/collections`,
  `primitives`, `semantic/semanticTokens`, `designTokens`.
- Detección y extracción de raíz de tokens en estructuras anidadas simples cuando la intención es clara.
- Mensajes informativos de extracción en CLI y web (`Using token root from ...`).

### Changed

- Regla de precedencia: si existen grupos canónicos top-level y también en wrappers, se usa top-level.
- Manejo de ambigüedad reforzado: si hay múltiples posibles raíces sin preferencia clara, se devuelve error explícito.

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

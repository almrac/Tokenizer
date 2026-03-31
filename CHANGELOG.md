# Changelog

Todos los cambios importantes de este proyecto se documentan en este archivo.

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

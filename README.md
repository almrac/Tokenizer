# Tokenizer

Tokenizer es una herramienta ligera para convertir un `tokens.json` en archivos listos para distintos targets de frontend. Incluye una CLI para generar archivos en local y una interfaz web estática en `docs/`, preparada para publicarse con GitHub Pages.

## Versionado (fuente de verdad)

El archivo `VERSION` es la fuente de verdad de la versión actual.

Para actualizar versión de forma consistente:

```bash
node scripts/bump-version.js 0.7.1
```

Este comando actualiza:

- `VERSION`
- etiqueta visible en `docs/index.html` (`vX.Y.Z`)

`CHANGELOG.md` se mantiene manual para evitar inserciones frágiles.  
Al publicar una versión nueva, actualiza juntos: `VERSION`, `CHANGELOG.md` y etiqueta visible web.

## Qué hace

- Convierte tokens hacia `css`, `ionic`, `bootstrap` y `tailwind`
- Mantiene una estructura simple, sin dependencias ni build
- Funciona tanto desde Node.js como directamente en el navegador
- Genera nombres de archivo coherentes según el target seleccionado
- Permite exportar uno o varios targets en una sola ejecución

## Targets soportados actualmente

- `css` -> `tokens.css`
- `ionic` -> `variables.scss`
- `bootstrap` -> `bootstrap-overrides.scss`
- `tailwind` -> `tailwind.tokens.js`

## Grupos de tokens soportados actualmente

- `colors`
- `spacing`
- `typography`
- `radius`
- `shadows`

Tokenizer usa estos grupos como formato canónico interno.

## Normalización de entrada (v0.5.0)

Antes de validar y generar, Tokenizer intenta normalizar variaciones comunes del mundo real hacia el formato canónico.

Aliases top-level soportados:

- `color`, `colours` -> `colors`
- `space`, `spaces` -> `spacing`
- `radii`, `borderRadius` -> `radius`
- `shadow`, `boxShadow`, `elevation` -> `shadows`
- `type`, `text` -> `typography`

Aliases comunes dentro de `typography`:

- `font-family`, `font_family` -> `fontFamily`
- `font-size`, `font_size` -> `fontSize`
- `font-weight`, `font_weight` -> `fontWeight`
- `line-height`, `line_height` -> `lineHeight`
- `letter-spacing`, `letter_spacing` -> `letterSpacing`

Reglas:

- si puede normalizarse de forma segura, la generación continúa;
- si hay conflicto entre clave canónica y alias, prevalece la canónica y se informa;
- si tras normalizar la estructura sigue inválida, se devuelve error.

## Compatibilidad con exports reales (v0.5.1)

Además del formato canónico directo, Tokenizer puede recuperar grupos cuando vienen envueltos en estructuras comunes de exportación.

Wrappers reconocidos cuando el contenido parece una raíz de tokens:

- `tokens`
- `default`
- `global`, `globals`
- `theme`, `themes`
- `values`
- `collection`, `collections`
- `primitives`
- `semantic`, `semanticTokens`
- `designTokens`

Comportamiento de extracción:

- si hay grupos canónicos en top-level, se prioriza siempre top-level;
- si no hay grupos canónicos en top-level, Tokenizer busca una raíz candidata clara en wrappers/niveles anidados;
- si hay múltiples candidatos:
  - intenta preferir nombres como `global`, `default` o `base`;
  - si persiste la ambigüedad, devuelve error en lugar de adivinar.

Feedback de extracción:

- CLI: `Info: Using token root from "tokens"` o similar.
- Web UI: se muestra en el bloque informativo ligero junto con otras normalizaciones.

## Flujo de importación robusto (v0.6.0)

Tokenizer aplica un pipeline de importación antes de generar:

1. parseo JSON
2. descubrimiento de raíces candidatas
3. scoring/priorización de candidatas
4. selección de raíz (si hay confianza suficiente)
5. normalización de aliases
6. validación canónica
7. generación

Reglas de selección:

- si hay grupos canónicos claros en top-level, se priorizan;
- si no, se evalúan raíces candidatas por señales (grupos canónicos, aliases mapeables, nombre wrapper, coherencia estructural);
- si hay varias candidatas cercanas y la diferencia de confianza es baja, Tokenizer no adivina y devuelve error de ambigüedad.

Mensajes de importación:

- decisión de raíz (`Using token root from ...` o `Using top-level token groups...`);
- cuando hay múltiples candidatas y una gana claramente, se informa el motivo resumido;
- `Import summary` con raíz usada y grupos detectados.

## Calidad de salida (v0.7.0)

Tokenizer aplica reglas de formato consistentes para que los archivos generados sean más útiles en proyectos reales:

- orden estable de secciones: `colors`, `spacing`, `typography`, `radius`, `shadows`;
- comentarios por sección;
- separación con líneas en blanco entre secciones;
- omisión automática de secciones vacías;
- orden estable de claves para mejorar diff/revisión en git.

Notas por target:

- `css`: variables custom con naming consistente para tipografía (`font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`), radius y shadows.
- `ionic`: mantiene variables nativas `--ion-color-*` para colores y usa fallback custom con prefijo para grupos no nativos.
- `bootstrap`: Sass-first con política formal: mapeos nativos primero (`$primary`, `$font-family-base`, `$border-radius`, etc.), slots globales claros cuando aplica (`$body-color`, `$body-bg`, `$border-color`) y fallback explícito `$tk-*` para tokens útiles fuera de rango nativo.
- `tailwind`: salida limpia bajo `theme.extend` con `colors`, `spacing`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `borderRadius`, `boxShadow`.

## Política formal de exportación (v0.8.3)

Tokenizer aplica una política común en todos los targets (`css`, `ionic`, `bootstrap`, `tailwind`) y en todos los grupos (`colors`, `spacing`, `typography`, `radius`, `shadows`):

1. native-first cuando existe un slot nativo claro.
2. fallback extendido explícito cuando no hay slot nativo, pero el token sigue siendo útil.
3. warning + omisión solo como último recurso.

Notas por target:

- `css`: fallback custom-prefix como estrategia normal (`--tk-*` o prefijo configurado).
- `ionic`: usa slots nativos reales (`--ion-color-*`, `--ion-font-family`) solo cuando son claros; el resto va a fallback custom-prefix.
- `bootstrap`: Sass-first; usa variables/mapas nativos y mapeos globales probables (`$body-color`, `$border-color`, `$body-bg`) cuando aplica, y fallback explícito no nativo (`$tk-*`) para tokens útiles fuera del set Bootstrap.
- `tailwind`: prioriza `theme.extend` para todos los grupos soportados; fallback/omisión solo cuando no hay representación limpia.

## Plantillas internas de mapeo por framework (v0.8.0)

Tokenizer incorpora una capa interna de plantillas de mapeo por target para mantener reglas explícitas y fáciles de ampliar.

Targets incluidos:

- `css`
- `ionic`
- `bootstrap`
- `tailwind`

Cada plantilla define:

- `target`
- `strategy`
- `nativeMappings`
- `groupRules`
- `groupFallbacks`

Estrategia inicial:

- `native-first` cuando existe un mapeo nativo claro.
- fallback controlado cuando no hay mapeo nativo claro.
- `css` usa fallback con prefijo custom para todo.

Mapeos nativos iniciales:

- `ionic`: `colors.primary -> --ion-color-primary`, `colors.secondary -> --ion-color-secondary`, `typography.fontFamily.base -> --ion-font-family`
- `bootstrap`: `colors.primary/secondary/success/danger/warning/info/light/dark -> $...`, `typography.fontFamily.base -> $font-family-base`, `radius.md -> $border-radius`
- `tailwind`: grupos dirigidos a `theme.extend.*` (`colors`, `spacing`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `borderRadius`, `boxShadow`)

Esta capa es interna; no es todavía un sistema de settings de usuario.

## Expansión de plantillas por grupos (v0.8.2)

La capa de plantillas ya no cubre solo `colors`; ahora se aplica también a:

- `typography`
- `radius`
- `shadows`
- `spacing`

Resumen por framework:

- `css`: fallback custom-prefix en todos los grupos (`colors`, `typography`, `radius`, `shadows`, `spacing`).
- `ionic`: mantiene mapeos nativos solo cuando son claros (`colors` por whitelist y `typography.fontFamily.base`); el resto usa fallback custom-prefix.
- `bootstrap`: estrategia en tres niveles:
  1) mapeos seguros nativos,
  2) mapeos globales probables cuando hay señal fuerte,
  3) fallback explícito `$tk-*` para tokens útiles sin slot nativo/global claro; warning + omisión solo si el token realmente no es exportable.
- `tailwind`: mapeo directo a `theme.extend.*` para `colors`, `spacing`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `borderRadius`, `boxShadow`.

Bootstrap (grupos ampliados):

- `typography`: base prioriza `fontFamily.base`, `fontSize.body`, `fontWeight.regular`, `lineHeight.body`; claves adicionales se preservan con fallback `$tk-*` cuando no hay slot nativo/global.
- `radius`: aplica `sm`/`md|default`/`lg` como variables globales útiles (`$border-radius-sm`, `$border-radius`, `$border-radius-lg`) y preserva radios adicionales con `$tk-radius-*`.
- `shadows`: aplica mapeo global claro (`sm -> $box-shadow-sm`, `md|default -> $box-shadow`) y preserva variantes adicionales con `$tk-shadow-*`.
- `spacing`: mantiene mapeo en `$spacers`.

## Adapter de importación flatVariantCollection (colors-only, v0.8.0)

Tokenizer añade un primer adapter de entrada para colecciones planas con variantes internas por token.

Patrón detectado:

```json
{
  "variableCollection": {
    "primaryBg": { "mode1": "#ff6c00" },
    "dangerBg": { "mode1": "#f9c8cd" }
  }
}
```

Comportamiento:

- detecta raíces con estructura de colección plana token -> variantes;
- valida que los valores finales sean mayoritariamente colores (heurística segura);
- si solo existe una variante interna, la selecciona automáticamente;
- reconstruye estructura canónica:

```json
{
  "colors": {
    "primaryBg": "#ff6c00",
    "dangerBg": "#f9c8cd"
  }
}
```

Metadatos de importación (summary):

- `sourcePattern`: `flatVariantCollection`
- `rootUsed`: raíz detectada (por ejemplo `variableCollection`)
- `selectedVariant`: variante seleccionada automáticamente (por ejemplo `mode1`)

Seguridad ante múltiples variantes:

- si hay más de una variante interna y no hay selector explícito, Tokenizer no adivina;
- devuelve error claro para evitar importaciones ambiguas.

## Inspector ligero de entrada (v0.6.1)

La UI web muestra un resumen compacto de interpretación de entrada para reducir el efecto “caja negra”.

Incluye:

- raíz usada para importar (`Top-level`, `tokens`, `theme`, etc.);
- grupos canónicos detectados (`colors`, `spacing`, `typography`, `radius`, `shadows`);
- grupos ignorados/no soportados (solo cuando aplica);
- resumen de normalización (aliases y ajustes relevantes);
- estado de advertencias activo/inactivo.

Comportamiento:

- aparece cuando hay entrada;
- se actualiza al escribir, cargar ejemplo o limpiar;
- mantiene peso visual bajo y no compite con el flujo principal.

CLI (resumen ligero):

- raíz usada;
- grupos soportados detectados;
- cantidad de ajustes de normalización;
- grupos ignorados y recuento de warnings cuando aplica.

## Validación y feedback (v0.3.4)

- Se valida que la raíz del JSON sea un objeto.
- Se valida que los grupos top-level soportados (`colors`, `spacing`, `typography`, `radius`, `shadows`) sean objetos.
- Si hay grupos top-level no soportados, se muestran como advertencia y se ignoran.
- Si el target ignora algún grupo presente, se avisa pero la generación continúa.
- Para `bootstrap`, se advierte solo cuando un token no puede exportarse de forma segura ni como fallback extendido.
- Si no hay grupos soportados con contenido, la generación se bloquea con error.

Soporte por target:

- `css`: usa `colors`, `spacing`, `typography`, `radius`, `shadows`
- `ionic`: usa `colors` nativos y fallback custom para `spacing`, `typography`, `radius`, `shadows`
- `bootstrap`: usa todos los grupos; en `colors` aplica primero roles semánticos seguros, luego globales probables (`$body-color`, `$border-color`, `$body-bg`) y después fallback `$tk-color-*` para el resto útil
- `tailwind`: usa `colors`, `spacing`, `typography`, `radius`, `shadows`

Reglas de comportamiento:

- JSON inválido (sintaxis): error y no genera
- JSON válido pero raíz no objeto: error y no genera
- Objeto válido sin grupos soportados con contenido: error y no genera
- Objeto válido con grupos soportados + no soportados: warning y genera
- Objeto válido con grupos que el target ignora: warning y genera

Feedback por entorno:

- Web UI: muestra errores y advertencias en bloques separados bajo los controles
- Web UI: también muestra información de normalización en un bloque `info` discreto cuando aplica
- CLI: imprime `Error:` para bloqueos, `Warning:` para avisos no bloqueantes e `Info:` para normalizaciones aplicadas

## Notas por target (v0.4.0)

- `css`:
  usa `colors`, `spacing`, `typography`, `radius`, `shadows` como custom properties.
- `ionic`:
  mantiene el mapeo completo de `colors` con convención `--ion-color-*`.
  para grupos no nativos (`spacing`, `typography`, `radius`, `shadows`) usa fallback de variables custom con prefijo configurable (por ejemplo `--tk-spacing-md`).
- `bootstrap`:
  mapea `colors` de Bootstrap en tres niveles:
  roles semánticos seguros (`$primary`, `$secondary`, `$success`, `$danger`, `$warning`, `$info`, `$light`, `$dark`),
  globales probables (`$body-color`, `$border-color`, `$body-bg`) y fallback `$tk-color-*` cuando no hay equivalencia clara.
  También mantiene `$spacers`, variables de tipografía base (`$font-family-base`, `$font-size-base`, `$font-weight-base`, `$line-height-base`), mapas tipográficos (`$font-sizes`, `$font-weights`, `$line-heights`), `radius` y `shadows`.
- `tailwind`:
  mapea a `theme.extend` en `colors`, `spacing`, `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `borderRadius`, `boxShadow`.

## Formato esperado de `tokens.json`

```json
{
  "colors": {
    "primary": "#0d6efd",
    "secondary": "#6c757d",
    "success": "#198754",
    "danger": "#dc3545",
    "brand": "#7c4dff"
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem"
  },
  "typography": {
    "fontFamily": {
      "base": "Inter, sans-serif",
      "mono": "\"Fira Code\", monospace"
    },
    "fontSize": {
      "body": "0.875rem",
      "title": "1.25rem"
    },
    "fontWeight": {
      "regular": "400",
      "semibold": "600"
    },
    "lineHeight": {
      "body": "1.5",
      "title": "1.2"
    }
  },
  "radius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px"
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0, 0, 0, 0.12)",
    "md": "0 4px 12px rgba(0, 0, 0, 0.16)"
  }
}
```

## Uso por CLI

Ejecuta la herramienta desde la raíz del proyecto:

```bash
node index.js --target css
```

También puedes usar directamente el entrypoint de la CLI:

```bash
node cli/index.js --target css
```

Opciones disponibles:

- `--target` obligatorio. Targets válidos: `css`, `ionic`, `bootstrap`, `tailwind`
  también admite múltiples targets separados por coma, por ejemplo `css,tailwind`
- `--input` opcional. Por defecto usa `./tokens.json`
- `--output` opcional. Por defecto usa `./dist`
- `--prefix` opcional. Aplica a `css`, a variables custom de fallback en `ionic` y a variables extendidas de fallback en `bootstrap`

Ejemplos:

```bash
node index.js --target css --prefix tk
node index.js --target css --prefix --tk
node index.js --target ionic --input ./tokens.json --output ./dist
node index.js --target bootstrap
node index.js --target tailwind --output ./dist
node index.js --target css,tailwind --output ./dist
node index.js --target css,ionic,bootstrap --prefix tk
```

## Uso desde la web

La interfaz web vive en `docs/` y funciona completamente en el navegador.

Puedes abrirla localmente desde:

```text
docs/index.html
```

Desde la interfaz puedes:

- pegar el contenido de `tokens.json`
- subir un archivo `.json`
- elegir un target principal de salida (flujo por defecto)
- activar opcionalmente el modo multi-export para seleccionar varios targets
- indicar un prefijo para `css`
- cargar un ejemplo rápido
- limpiar el formulario
- previsualizar el archivo generado (si hay varios outputs, el selector de vista activa aparece en el panel derecho)
- copiar el output activo
- descargar el output activo o descargar varios archivos en secuencia en modo multi-export

Ejemplo en la UI:

- `Cargar ejemplo` inserta un JSON básico y limpio (`colors` + `spacing`) para empezar rápido.
- `Limpiar` restablece el estado vacío inicial.

Nota sobre prefijo:

- En la documentación y en la UI se usa `tk` como ejemplo genérico (`--tk-color-primary`).
- Puedes configurar cualquier prefijo según tu proyecto.

Modo multi-export:

- Flujo normal: el `target principal` controla directamente la vista previa y la exportación de un único archivo.
- Flujo opcional: activa `Modo multi-export` para marcar varios targets.
- En multi-export:
  - Tokenizer genera un archivo por target.
  - eliges los targets de exportación en el panel izquierdo.
  - cambias la vista activa en el panel de salida (derecha), sin alterar la selección de exportación.
  - la acción `Copiar` copia solo la vista activa.
  - la acción `Descargar` usa fallback sin dependencias: descarga secuencial de los archivos generados (no ZIP).

## GitHub Pages

El proyecto está pensado para publicar la web estática directamente desde `docs/`.

1. Ve a `Settings -> Pages` en tu repositorio.
2. En `Source`, selecciona `Deploy from a branch`.
3. Elige la rama principal del proyecto.
4. Selecciona la carpeta `/docs`.

Notas:

- No hace falta build.
- No hace falta backend.
- `.nojekyll` puede mantenerse en la raíz del repositorio.

## Estructura del proyecto

- `core/`: transformaciones puras por target
- `cli/`: parsing de argumentos y escritura de archivos
- `docs/`: interfaz web estática para demo y GitHub Pages
- `dist/`: ejemplos de salida generada

## Próximos pasos

- ampliar validaciones y mensajes de error según el target
- añadir más grupos de tokens manteniendo la misma simplicidad
- mejorar la documentación con más ejemplos reales de entrada y salida

## Roadmap corto

- `v0.3.1`: pulido visual final de la interfaz y consistencia de estados vacíos/acciones
- `v0.3.x`: mejoras incrementales de UX en la web estática sin añadir dependencias
- `v0.4.0` (objetivo): ampliar grupos de tokens manteniendo CLI y web ligeras

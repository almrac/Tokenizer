# Tokenizer

Tokenizer es una herramienta ligera para convertir un `tokens.json` en archivos listos para distintos targets de frontend. Incluye una CLI para generar archivos en local y una interfaz web estática en `docs/`, preparada para publicarse con GitHub Pages.

## Versionado

El archivo `VERSION` es la fuente de verdad de la versión actual.

Para actualizar la versión de forma consistente:

```bash
node scripts/bump-version.js 0.7.1
```

## Qué hace

- Lee un JSON de tokens.
- Normaliza estructura y aliases comunes.
- Valida y limpia valores inválidos por token.
- Genera salida para uno o varios targets:
  - `css`
  - `ionic`
  - `bootstrap`
  - `tailwind`

## Targets y archivos de salida

- `css` -> `tokens.css`
- `ionic` -> `variables.scss`
- `bootstrap` -> `bootstrap-overrides.scss`
- `tailwind` -> `tailwind.tokens.js`

## Política de exportación

Tokenizer aplica una política consistente:

1. `native-first`: usa mapping nativo cuando existe un slot claro.
2. fallback explícito: si no hay slot nativo pero el token sigue siendo útil.
3. warning + omisión como último recurso.

### Resumen por target

- `css`: salida basada en custom properties con prefijo configurable.
- `ionic`: usa slots nativos reales (`--ion-color-*`, `--ion-font-family`) cuando aplica; fallback custom para el resto.
- `bootstrap`: Sass-first. Usa variables/mapas nativos y fallback extendido explícito (`$<prefix>-*`) para tokens útiles fuera de slots nativos.
- `tailwind`: mapeo nativo a `theme.extend.*`.

## Prefijo (`--prefix`)

`--prefix` es opcional y se aplica a:

- variables custom en `css` (`--<prefix>-*`)
- fallback custom en `ionic` (`--<prefix>-*`)
- fallback extendido en `bootstrap` (`$<prefix>-*`)

Si no se indica, se usa `tk`.

Ejemplos:

```bash
node index.js --target css --prefix nb
node index.js --target ionic --prefix nb
node index.js --target bootstrap --prefix nb
```

## Uso CLI

Comando base:

```bash
node index.js --target <target> [--input ./tokens.json] [--output ./dist] [--prefix tk]
```

Ejemplos:

```bash
node index.js --target css
node index.js --target ionic --input ./tokens.json --output ./dist
node index.js --target bootstrap
node index.js --target tailwind --output ./dist
node index.js --target css,tailwind --output ./dist
node index.js --target css,ionic,bootstrap --prefix tk
```

### Parámetros

- `--target` (obligatorio): `css`, `ionic`, `bootstrap`, `tailwind`
  - también acepta lista separada por comas (`css,tailwind`)
- `--input` (opcional): ruta del JSON de entrada
  - por defecto `./tokens.json`
- `--output` (opcional): carpeta de salida
  - por defecto `./dist`
- `--prefix` (opcional): prefijo para salidas fallback

## Uso web (`docs/`)

La interfaz web permite:

- cargar archivo `.json` o pegar contenido manualmente
- elegir target principal o usar modo multi-export
- previsualizar salida por target
- copiar o descargar resultados
- revisar feedback en cuatro categorías:
  - `Información`
  - `Advertencias`
  - `Omisiones`
  - `Errores`

## Estructura de entrada soportada

Grupos canónicos soportados:

- `colors`
- `spacing`
- `typography`
- `radius`
- `shadows`

También se aceptan aliases comunes (por ejemplo `color`, `space`, `borderRadius`, `boxShadow`, `type`) y wrappers frecuentes (`tokens`, `theme`, `global`, etc.), manteniendo prioridad por estructura canónica top-level cuando existe.

## Normalización de valores

Tokenizer normaliza antes de generar:

- `spacing` y `radius`:
  - números no cero -> `px`
  - `0` -> `"0"`
- `typography.fontSize`:
  - números no cero -> `px`
  - `0` -> `"0"`
- `typography.lineHeight`:
  - valores unitless válidos se preservan unitless (`1.1`)
  - `"normal"` se preserva
  - valores con unidad se preservan
- `typography.fontWeight`:
  - se mantiene unitless (ej. `400`, `600`)

## Validación y limpieza

- Se validan formato de grupos y tipos esperados.
- Tokens inválidos de `colors`, `spacing` y `shadows` se omiten por path (sin bloquear todo el proceso).
- Grupos no soportados se reportan como advertencia.
- Si hay errores bloqueantes (JSON inválido, raíz inválida, ambigüedad de raíz, variante no resuelta), no se genera salida.

## Feedback que emite Tokenizer

- `Información`: resumen neutral de importación/estado.
- `Advertencias`: incidencias no bloqueantes.
- `Omisiones`: tokens o grupos omitidos y motivo.
- `Errores`: incidencias bloqueantes.

## Estructura del proyecto

- `index.js`: entrada CLI.
- `cli/`: parsing de argumentos y orquestación de generación.
- `core/`: normalización, validación, mappings y generadores por target.
- `docs/`: interfaz web estática.
- `scripts/`: utilidades de mantenimiento (por ejemplo versión).

## Notas

- No requiere dependencias externas para ejecutarse con Node.
- El historial detallado de cambios vive en `CHANGELOG.md`.

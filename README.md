# Tokenizer

Tokenizer convierte un `tokens.json` en archivos listos para `css`, `ionic`, `bootstrap` y `tailwind`. El repo incluye una CLI para generación local y una web estática en `docs/` para previsualizar, copiar y descargar resultados.

## Qué soporta

Grupos de entrada:

- `colors`
- `spacing`
- `typography`
- `radius`
- `shadows`

Entradas compatibles hoy:

- estructura canónica top-level
- wrappers comunes como `tokens`, `global`, `theme`, `collection`, `semanticTokens`
- aliases top-level como `color`, `space`, `borderRadius`, `boxShadow`, `type`
- flat collections compatibles con variantes, incluida selección explícita cuando hace falta

## Targets

- `css` -> `tokens.css`
- `ionic` -> `variables.scss`
- `bootstrap` -> `bootstrap-overrides.scss`
- `tailwind` -> `tailwind.tokens.js`

Resumen de salida:

- `css`: custom properties con prefijo configurable
- `ionic`: variables nativas cuando existe slot claro y fallback custom para el resto
- `bootstrap`: estrategia Sass-first con fallback explícito para tokens útiles fuera de slots nativos
- `tailwind`: mapeo a `theme.extend.*`

## Uso rápido

CLI:

```bash
node index.js --target css
node index.js --target css,tailwind --output ./dist
node index.js --target css --variant=dark
```

Web:

- carga o pega un JSON
- elige un target o modo multi-export
- selecciona variante cuando la importación detecte varias opciones compatibles
- copia o descarga la salida generada

Parámetros principales de CLI:

- `--target`: `css`, `ionic`, `bootstrap`, `tailwind` o lista separada por comas
- `--input`: ruta del JSON, por defecto `./tokens.json`
- `--output`: carpeta de salida, por defecto `./dist`
- `--prefix`: prefijo para variables fallback, por defecto `tk`
- `--variant=<name>`: fuerza una variante explícita en imports multi-variante compatibles

## Comportamiento actual

- normaliza aliases comunes y ciertos valores tipográficos y de longitud
- omite tokens inválidos de `colors`, `spacing` y `shadows` sin bloquear toda la ejecución
- bloquea con error cuando la raíz es ambigua o una colección multi-variante no se puede resolver de forma segura
- emite `Información`, `Advertencias`, `Omisiones` y `Errores`

## CLI y web

- La CLI genera archivos en `dist/`.
- La web usa la misma lógica de importación y generación para previsualización.
- Ambas soportan selección explícita de variante en los casos compatibles actuales.

## Límites actuales

- no soporta todavía todos los dumps crudos o complejos de Figma
- el soporte de text styles compuestos sigue siendo parcial
- no resuelve automáticamente variantes arbitrarias cuando no hay una selección segura
- en roots muy heterogéneos sigue priorizando bloqueo seguro antes que inferencia agresiva

## Versionado

`VERSION` es la referencia pública de versión. La web carga la versión visible desde `docs/version.json`, que debe mantenerse sincronizado con `VERSION` y con el último bloque publicado de `CHANGELOG.md`.

```bash
node scripts/bump-version.js <next-version>
```

Ese script actualiza `VERSION` y `docs/version.json`. La UI web lee ese archivo al arrancar, sin edición manual de `docs/index.html`.

## Estructura documental

- `README.md`: uso público del proyecto
- `docs/`: web pública estática
- `project/`: documentación operativa interna, con índice en `project/README.md`
- `fixtures/`: fixtures y snapshots de verificación

## Notas

- no requiere dependencias externas para ejecutarse con Node
- `CHANGELOG.md` contiene el historial publicado de cambios

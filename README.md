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
- roots heterogéneos conocidos cuando existe una rama dominante clara o una agregación segura bajo wrapper conocido
- hojas envueltas estilo Figma con `value/type` o `$value/$type`, incluida typography compatible y metadatos laterales permitidos
- dumps heterogéneos de Figma cuando existe una única ruta segura al valor (`value`, `$value` o `resolvedValue`), metadata lateral claramente ignorable y, si aplica, un único modo efectivo
- `typography.<style> = { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }`
- la misma estructura de `typography` envuelta en `value/type` o `$value/$type`
- text styles compuestos con `paragraphSpacing`, `paragraphIndent`, `textCase` o `textDecoration` como extras ignorados, sin reinterpretarlos
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

Perfil de target actual:

- CLI: `bootstrap` acepta opcionalmente `--target-profile=default|v4`
- Web: cuando el target principal es `bootstrap`, la UI muestra `Perfil de target` con `default` y `v4`
- `default` mantiene la salida baseline actual de `bootstrap`
- `v4` introduce una diferencia real y acotada: `radius.lg` deja de usar `$border-radius-lg` y se exporta como fallback explícito
- ejemplo práctico verificado: [project/examples.md](/mnt/proyectos/dev/Tokenizer/project/examples.md)

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
- `--target-profile=<name>`: disponible por ahora solo para `bootstrap`; perfiles válidos actuales: `default`, `v4`

## Comportamiento actual

- normaliza aliases comunes y ciertos valores tipográficos y de longitud
- omite tokens inválidos de `colors`, `spacing` y `shadows` sin bloquear toda la ejecución
- bloquea con error cuando la raíz es ambigua o una colección multi-variante no se puede resolver de forma segura
- emite `Información`, `Advertencias`, `Omisiones` y `Errores`

## CLI y web

- La CLI genera archivos en `dist/`.
- La web usa la misma lógica de importación y generación para previsualización.
- Ambas soportan selección explícita de variante en los casos compatibles actuales.
- `targetProfile` existe por ahora solo para `bootstrap`: en CLI vía `--target-profile` y en web mediante el selector `Perfil de target`.

## Límites actuales

- soporta un subconjunto seguro de hojas envueltas y un subconjunto conservador adicional de dumps heterogéneos de Figma
- soporta un subconjunto conocido de roots heterogéneos, pero no casos profundos o generales
- bloquea explícitamente casos con múltiples modos efectivos o múltiples rutas plausibles al valor dentro de dumps estilo Figma
- no resuelve automáticamente modos o variantes complejas dentro de dumps estilo Figma
- en text styles compuestos no resuelve modos o variantes internas
- en text styles compuestos no soporta objetos anidados complejos ni typography arbitraria más amplia
- los extras ignorados de text style no se reinterpretan ni se exportan
- no resuelve automáticamente variantes arbitrarias cuando no hay una selección segura
- en roots muy heterogéneos sigue priorizando bloqueo seguro antes que inferencia agresiva
- no existen todavía perfiles adicionales de `bootstrap` más allá de `default` y `v4`
- no existe soporte de perfil en otros targets
- la divergencia funcional actual por perfil en `bootstrap` está limitada a un subconjunto pequeño y verificable, no a una matriz amplia de compatibilidad
- siguen fuera de soporte los dumps arbitrarios de Figma, el multi-modo real y las referencias cruzadas o aliases amplios

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
- `project/examples.md`: ejemplos reales verificados de entrada, salida y bloqueos
- `fixtures/`: fixtures y snapshots de verificación

## Notas

- no requiere dependencias externas para ejecutarse con Node
- `CHANGELOG.md` contiene el historial publicado de cambios

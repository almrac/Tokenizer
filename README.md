# Tokenizer

Tokenizer es una herramienta ligera para convertir un `tokens.json` en archivos listos para distintos targets de frontend. Incluye una CLI para generar archivos en local y una interfaz web estática en `docs/`, preparada para publicarse con GitHub Pages.

## Qué hace

- Convierte tokens hacia `css`, `ionic`, `bootstrap` y `tailwind`
- Mantiene una estructura simple, sin dependencias ni build
- Funciona tanto desde Node.js como directamente en el navegador
- Genera nombres de archivo coherentes según el target seleccionado

## Targets soportados actualmente

- `css` -> `tokens.css`
- `ionic` -> `variables.scss`
- `bootstrap` -> `bootstrap-overrides.scss`
- `tailwind` -> `tailwind.tokens.js`

## Grupos de tokens soportados actualmente

- `colors`
- `spacing`

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
- `--input` opcional. Por defecto usa `./tokens.json`
- `--output` opcional. Por defecto usa `./dist`
- `--prefix` opcional. Solo aplica al target `css`

Ejemplos:

```bash
node index.js --target css --prefix nb
node index.js --target css --prefix --nb
node index.js --target ionic --input ./tokens.json --output ./dist
node index.js --target bootstrap
node index.js --target tailwind --output ./dist
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
- elegir el target de salida
- indicar un prefijo para `css`
- cargar un ejemplo rápido
- limpiar el formulario
- previsualizar el archivo generado
- copiar o descargar el resultado

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

# Tokenizer

Tokenizer is a small Node.js tool that reads `tokens.json` and generates one output file for a selected target. The token transformation logic lives in reusable pure functions under `core/`, and the CLI in `cli/` handles argument parsing and file output.

Supported targets:
- `css`
- `ionic`
- `bootstrap`
- `tailwind`

Supported token groups:
- `colors`
- `spacing`

## How To Run

Use Node.js to run the CLI from the project root:

```bash
node index.js --target css
```

You can also run the CLI entrypoint directly:

```bash
node cli/index.js --target css
```

Defaults:
- `--input` defaults to `./tokens.json`
- `--output` defaults to `./dist`
- `--prefix` only applies to the `css` target

## Example Commands

```bash
node index.js --target css --prefix nb
node index.js --target css --prefix --nb
node index.js --target ionic --input ./tokens.json --output ./dist
node index.js --target bootstrap
node index.js --target tailwind --output ./dist
```

Generated files:
- `css` -> `tokens.css`
- `ionic` -> `variables.scss`
- `bootstrap` -> `bootstrap-overrides.scss`
- `tailwind` -> `tailwind.tokens.js`

## Web UI

The project also includes a browser-only static interface.

Open it locally by opening this file directly in your browser:

```text
web/index.html
```

The web UI lets you:
- paste `tokens.json`
- upload a `.json` file
- choose a target
- set a prefix for the `css` target
- preview the generated output
- copy the output
- download the generated file

## GitHub Pages

To publish the static interface with GitHub Pages, publish the contents of the `web/` folder.

The page does not require a build step or server-side code.

## Example tokens.json

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

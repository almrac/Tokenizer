# Tokenizer — Ejemplos verificados

Casos reales de entrada/salida respaldados por fixtures y snapshots. Sirven para entender qué genera Tokenizer, qué normaliza y cuándo bloquea de forma segura.

Referencia: `node scripts/verify-fixtures.js`

## Cómo leer estos ejemplos

- La entrada mostrada está tomada de fixtures reales del repo.
- La salida mostrada resume el snapshot `css`; el resto de targets verificados viven en los mismos fixtures.
- Cuando aplica, se incluye el mensaje real de `Información`, `Advertencias` o `Errores`.

## 1. Caso canónico

Fixture: [canonical-full](/mnt/proyectos/dev/Tokenizer/fixtures/cases/canonical-full/fixture.json)

Entrada:

```json
{
  "colors": { "primary": "#0d6efd", "secondary": "#6c757d" },
  "spacing": { "xs": 4, "md": 16 },
  "typography": {
    "fontFamily": { "base": "Inter, sans-serif" },
    "fontSize": { "body": 16 }
  },
  "radius": { "sm": 4 },
  "shadows": { "sm": "0 1px 2px rgba(0, 0, 0, 0.16)" }
}
```

Qué interpreta:
- root `top-level`
- grupos soportados detectados directamente
- generación completa sin normalizaciones especiales

Salida esperada:

```css
:root {
  --color-primary: #0d6efd;
  --color-secondary: #6c757d;
  --spacing-xs: 4px;
  --spacing-md: 16px;
  --font-family-base: Inter, sans-serif;
  --font-size-body: 16px;
}
```

Feedback esperado:
- `Info: Import summary: root "top-level", grupos detectados: colors, spacing, typography, radius, shadows.`

## 2. Wrapper común

Fixture: [wrapper-common](/mnt/proyectos/dev/Tokenizer/fixtures/cases/wrapper-common/fixture.json)

Entrada:

```json
{
  "tokens": {
    "global": {
      "colors": { "primary": "#005bc0" },
      "spacing": { "sm": "8px" },
      "radius": { "md": 12 }
    }
  }
}
```

Qué interpreta:
- detecta `tokens.global` como root útil
- ignora el wrapper y genera desde esa rama

Salida esperada:

```css
:root {
  --color-primary: #005bc0;
  --spacing-sm: 8px;
  --radius-md: 12px;
}
```

Feedback esperado:
- `Info: Using token root from "tokens.global" (3 grupos canónicos, 0 aliases).`

## 3. Aliases top-level

Fixture: [aliases-top-level](/mnt/proyectos/dev/Tokenizer/fixtures/cases/aliases-top-level/fixture.json)

Entrada:

```json
{
  "color": { "primaryColor": "#1b84ff" },
  "space": { "sm": 8 },
  "type": {
    "font-family": { "base": "System UI" },
    "font-size": { "body": 15 }
  },
  "borderRadius": { "base": 6 }
}
```

Qué interpreta:
- `color -> colors`
- `space -> spacing`
- `type -> typography`
- aliases internos de typography como `font-family -> fontFamily`

Salida esperada:

```css
:root {
  --color-primary-color: #1b84ff;
  --spacing-sm: 8px;
  --font-family-base: System UI;
  --font-size-body: 15px;
  --radius-base: 6px;
}
```

Feedback esperado:
- varias líneas `Info:` indicando la normalización de grupos y claves

## 4. Variante explícita

Fixture: [flat-variant-explicit](/mnt/proyectos/dev/Tokenizer/fixtures/cases/flat-variant-explicit/fixture.json)

Entrada:

```json
{
  "collection": {
    "primary": { "projectA": "#0ea5e9", "projectB": "#0284c7" },
    "secondary": { "projectA": "#22c55e", "projectB": "#16a34a" }
  }
}
```

Ejecución:

```bash
node cli/index.js --input input.json --target css --variant=projectB
```

Qué interpreta:
- colección plana multi-variante compatible
- no adivina
- genera porque hay selección explícita válida

Salida esperada:

```css
:root {
  --color-primary: #0284c7;
  --color-secondary: #16a34a;
}
```

Feedback esperado:
- `Info: Se usó la variante explícita "projectB" en "collection".`

## 5. Flat variant ambigua que bloquea

Fixture: [flat-variant-ambiguous](/mnt/proyectos/dev/Tokenizer/fixtures/cases/flat-variant-ambiguous/fixture.json)

Entrada:

```json
{
  "collection": {
    "primary": { "projectA": "#0ea5e9", "projectB": "#0284c7" },
    "secondary": { "projectA": "#22c55e", "projectB": "#16a34a" }
  }
}
```

Qué interpreta:
- hay varias variantes no triviales
- no existe una selección automática segura

Comportamiento esperado:
- bloquea
- no genera salida

Error esperado:

```text
Error: Se detectó una colección con múltiples variantes en "collection". Variantes disponibles: projectA, projectB. No hay una selección automática segura. Selecciona una variante explícita para continuar.
```

## 6. Leaf envelopes Figma seguros

Fixture: [figma-leaf-envelope-basic](/mnt/proyectos/dev/Tokenizer/fixtures/cases/figma-leaf-envelope-basic/fixture.json)

Entrada:

```json
{
  "colors": {
    "primary": { "value": "#0d6efd", "type": "color" }
  },
  "spacing": {
    "sm": { "value": 8, "type": "number" }
  }
}
```

Qué interpreta:
- hojas envueltas con `value/type`
- unwrap seguro a valores escalares

Salida esperada:

```css
:root {
  --color-primary: #0d6efd;
  --spacing-sm: 8px;
}
```

Feedback esperado:
- `Info: Leaf token envelopes normalizados: ... hoja(s) convertida(s) a valor escalar.`

## 7. Typography compuesta envuelta

Fixture: [figma-typography-compound-value](/mnt/proyectos/dev/Tokenizer/fixtures/cases/figma-typography-compound-value/fixture.json)

Entrada:

```json
{
  "typography": {
    "body": {
      "value": {
        "fontFamily": "Inter, sans-serif",
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 1.5,
        "letterSpacing": "0.02em"
      },
      "type": "typography"
    }
  }
}
```

Qué interpreta:
- text style compuesto bajo `typography`
- unwrap seguro del objeto envuelto
- descomposición posterior en buckets ya soportados

Salida esperada:

```css
:root {
  --font-family-body: Inter, sans-serif;
  --font-size-body: 16px;
  --font-weight-body: 400;
  --line-height-body: 1.5;
  --letter-spacing-body: 0.02em;
}
```

Feedback esperado:
- `Info: Typography compound envelopes normalizados: ... estilo(s) convertidos a objeto plano.`

Nota:
- el fixture `figma-typography-compound-with-ignored-extras` verifica además que `paragraphSpacing`, `paragraphIndent`, `textCase` y `textDecoration` no bloquean el import, pero tampoco se exportan.

## 8. Root heterogéneo conocido soportado

Fixture: [heterogeneous-parent-aggregate-safe](/mnt/proyectos/dev/Tokenizer/fixtures/cases/heterogeneous-parent-aggregate-safe/fixture.json)

Entrada:

```json
{
  "theme": {
    "global": {
      "brand": { "colors": { "primary": "#0d6efd" } },
      "layout": { "spacing": { "sm": 8 } },
      "typeScale": {
        "typography": {
          "fontSize": { "body": 16 }
        }
      },
      "meta": { "collection": "global" }
    }
  }
}
```

Qué interpreta:
- root heterogéneo bajo wrapper conocido
- agregación segura de hijos directos complementarios
- metadatos laterales ignorados

Salida esperada:

```css
:root {
  --color-primary: #0d6efd;
  --spacing-sm: 8px;
  --font-size-body: 16px;
}
```

Feedback esperado:
- `Info: Detected multiple candidates; selected "theme.global" because it has stronger token-group signals ...`

## Qué sigue bloqueando o queda fuera

- flat variants sin selección segura
- roots heterogéneos profundos o con candidatas demasiado fuertes
- text styles compuestos con modos internos u objetos anidados complejos
- typography arbitraria más amplia o DTCG no acotada
- extras ignorados de text style: se aceptan para importar, pero no se exportan

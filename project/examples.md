# Tokenizer — Ejemplos verificados

Casos reales de entrada/salida respaldados por fixtures y snapshots. Sirven para entender qué genera Tokenizer, qué normaliza y cuándo bloquea de forma segura.

Referencia: `node scripts/verify-fixtures.js`

## Cómo leer estos ejemplos

- La entrada mostrada está tomada de fixtures reales del repo.
- La salida mostrada resume el snapshot `css`; el resto de targets verificados viven en los mismos fixtures.
- Cuando aplica, se incluye el mensaje real de `Información`, `Advertencias` o `Errores`.

Resultado operativo posible en estos ejemplos:

- `Genera`: la entrada entra en el subconjunto soportado actual.
- `Omite`: genera salida, pero descarta tokens inválidos con motivo explícito.
- `Bloquea`: no genera salida cuando no hay una interpretación segura.

## 1. Caso canónico

Fixture: [canonical-full](../fixtures/cases/canonical-full/fixture.json)

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

Fixture: [wrapper-common](../fixtures/cases/wrapper-common/fixture.json)

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

Fixture: [aliases-top-level](../fixtures/cases/aliases-top-level/fixture.json)

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

Fixture: [flat-variant-explicit](../fixtures/cases/flat-variant-explicit/fixture.json)

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

Fixture: [flat-variant-ambiguous](../fixtures/cases/flat-variant-ambiguous/fixture.json)

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

Fixture: [figma-leaf-envelope-basic](../fixtures/cases/figma-leaf-envelope-basic/fixture.json)

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

Fixture: [figma-typography-compound-value](../fixtures/cases/figma-typography-compound-value/fixture.json)

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

## 8. Bootstrap `v5.3` vs `v4`

Fixtures:
- [bootstrap-target-profile-default-regression](../fixtures/cases/bootstrap-target-profile-default-regression/fixture.json)
- [bootstrap-target-profile-v4-basic](../fixtures/cases/bootstrap-target-profile-v4-basic/fixture.json)
- [bootstrap-target-profile-v4-vs-default](../fixtures/cases/bootstrap-target-profile-v4-vs-default/fixture.json)
- [bootstrap-target-profile-v4-summary](../fixtures/cases/bootstrap-target-profile-v4-summary/fixture.json)

Entrada representativa:

```json
{
  "colors": { "primary": "#0d6efd" },
  "radius": { "sm": "0.125rem", "md": "0.25rem", "lg": "0.5rem" }
}
```

Cómo se selecciona:
- CLI: `node index.js --target bootstrap --target-profile=v5.3`
- CLI: `node index.js --target bootstrap --target-profile=default` (`default` se mantiene solo como alias retrocompatible)
- CLI: `node index.js --target bootstrap --target-profile=v4`
- Web: con target principal `bootstrap`, el selector `Perfil de target` permite elegir `v5.3` o `v4`

Qué significa cada perfil hoy:
- `bootstrap.v5.3`: mantiene el comportamiento baseline actual
- `bootstrap.v4`: cambia solo un punto verificable; `radius.lg` deja de mapearse a `$border-radius-lg` y cae a fallback explícito

Salida esperada con `v5.3`:

```scss
/* Radius */
$border-radius-sm: 0.125rem;
$border-radius-lg: 0.5rem;
$border-radius: 0.25rem;
```

Salida esperada con `v4`:

```scss
/* Radius */
$border-radius-sm: 0.125rem;
$border-radius: 0.25rem;
$tk-radius-lg: 0.5rem;
```

Feedback esperado:
- `Info: Target profile used: v4`

Resultado operativo:
- `Genera`
- la divergencia actual entre perfiles está limitada a `radius.lg`; no hay más diferencias funcionales documentadas por ahora

## 9. Root heterogéneo conocido soportado

Fixture: [heterogeneous-parent-aggregate-safe](../fixtures/cases/heterogeneous-parent-aggregate-safe/fixture.json)

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

## 10. Valores inválidos que se omiten sin bloquear

Fixture: [invalid-values](../fixtures/cases/invalid-values/fixture.json)

Entrada:

```json
{
  "colors": {
    "primary": "#0d6efd",
    "broken": "not-a-color"
  },
  "spacing": {
    "sm": 8,
    "broken": "wide"
  },
  "shadows": {
    "soft": "0 2px 6px rgba(0, 0, 0, 0.12)",
    "broken": 24
  }
}
```

Qué interpreta:
- root `top-level`
- algunos tokens válidos y otros inválidos por tipo
- la importación no bloquea; sanea y omite solo lo que no puede exportar

Salida esperada:

```css
:root {
  --color-primary: #0d6efd;
  --spacing-sm: 8px;
  --shadow-soft: 0 2px 6px rgba(0, 0, 0, 0.12);
}
```

Feedback esperado:
- `Info: Se omiten tokens inválidos en "colors": "colors.broken".`
- `Info: Se omiten tokens inválidos en "spacing": "spacing.broken".`
- `Info: Se omiten tokens inválidos en "shadows": "shadows.broken".`
- `Omisión: Se omitió colors.broken por valor de color inválido.`

## Qué sigue bloqueando o queda fuera

- flat variants sin selección segura
- roots heterogéneos profundos o con candidatas demasiado fuertes
- text styles compuestos con modos internos u objetos anidados complejos
- typography arbitraria más amplia o DTCG no acotada
- extras ignorados de text style: se aceptan para importar, pero no se exportan

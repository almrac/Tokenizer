# Fixtures de verificación

Base mínima de fixtures y snapshots para detectar regresiones en la CLI de Tokenizer.

## Estructura

- `cases/<fixture>/fixture.json`: metadatos del caso.
- `cases/<fixture>/input.json`: entrada real usada por la verificación.
- `cases/<fixture>/expected/`: snapshots esperados.

## Tipos de caso

- `success`: debe generar salida y snapshots por target.
- `error`: debe bloquear con error esperado y sin outputs.

## Cobertura actual

- canónico
- wrapper común
- aliases top-level
- flat variant resoluble
- flat variant con selección explícita
- flat variant ambigua
- valores inválidos con omisiones
- roots heterogéneos conocidos
- hojas envueltas estilo Figma con `value/type` y `$value/$type`
- casos ambiguos de hoja envuelta que no deben aplanarse

## Comando

```bash
node scripts/verify-fixtures.js
```

Para regenerar snapshots esperados a partir del comportamiento actual:

```bash
node scripts/verify-fixtures.js --update
```

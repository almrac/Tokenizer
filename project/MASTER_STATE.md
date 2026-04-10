# Tokenizer — Master State

## Estado actual
- Proyecto: Tokenizer
- Tipo: herramienta local + web estática
- Targets soportados: css, ionic, bootstrap, tailwind
- Grupos soportados: colors, spacing, typography, radius, shadows

## Capacidades estables
- Importación con detección de roots y wrappers comunes
- Normalización de aliases top-level y typography
- Soporte seguro para hojas envueltas estilo Figma con `value/$value`
- Soporte parcial para flat collections con variantes
- Política de exportación:
    - native-first
    - extended fallback
    - warning + omit last
- Mapeo por framework:
    - css
    - ionic
    - bootstrap
    - tailwind
- Validación de valores por tipo de token
- Feedback estructurado:
    - Información
    - Advertencias
    - Omisiones
    - Errores

## Estado de robustez actual
- Casos canónicos: estables
- Wrappers comunes: estables
- Hojas envueltas `value/$value` con metadata permitida: funcional
- Conflicto top-level vs root anidado: resuelto
- Flat collection multi-variante no trivial: bloquea correctamente
- Root mixto con aliases y variantes: funcional
- Validación de valores inválidos: funcional
- Omisiones con motivo: funcional

## Decisiones tomadas
- Priorizar top-level canónico cuando exista
- No adivinar variantes múltiples no triviales
- Usar `light/dark` con lógica explícita cuando aplique
- Mantener política formal de exportación común
- Bootstrap usa estrategia Sass-first
- Prefijo configurable aplica a css y fallbacks de ionic/bootstrap

## Problemas abiertos
- Compatibilidad más profunda con dumps complejos y heterogéneos de Figma
- Heurísticas más finas para colecciones heterogéneas
- Posible pulido adicional de naming en algunos casos edge

## Límites actuales
- Soporta un subconjunto seguro de hojas envueltas con `value/$value`, pero no todos los exports crudos de Figma
- No resuelve automáticamente modos o variantes complejas en dumps estilo Figma
- No resuelve automáticamente variantes arbitrarias (`projectA/projectB/...`)
- El soporte de text styles compuestos sigue siendo parcial

## Último estado conocido
- Hardening reciente completado
- Feedback estructurado estabilizado
- README reescrito y alineado con el estado real del proyecto

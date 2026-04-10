# Tokenizer — Master State

## Estado actual
- Proyecto: Tokenizer
- Tipo: herramienta local + web estática
- Targets soportados: css, ionic, bootstrap, tailwind
- Grupos soportados: colors, spacing, typography, radius, shadows

## Capacidades estables
- Importación con detección de roots y wrappers comunes
- Soporte verificable para roots heterogéneos conocidos con reglas conservadoras
- Normalización de aliases top-level y typography
- Soporte seguro para hojas envueltas estilo Figma con `value/$value`
- Soporte verificable para text styles compuestos en `typography` dentro de un subconjunto seguro
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
- Roots heterogéneos con rama dominante o agregación segura bajo wrapper conocido: funcional
- Hojas envueltas `value/$value` con metadata permitida: funcional
- Text styles compuestos directos o envueltos bajo `typography`: funcional en el subconjunto soportado
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
- Heurísticas más finas para roots heterogéneos profundos o generales
- Mejora de mensajes de ambigüedad en selección de root
- Soporte de modos o variantes internas dentro de text styles compuestos
- Soporte para objetos anidados complejos dentro de text styles compuestos
- Cobertura más amplia para typography arbitraria o DTCG
- Exportación de extras ignorados en text styles compuestos
- Posible pulido adicional de naming en algunos casos edge

## Límites actuales
- Soporta un subconjunto seguro de hojas envueltas con `value/$value`, pero no todos los exports crudos de Figma
- Soporta un subconjunto conocido de roots heterogéneos, pero no casos profundos o generales
- No resuelve automáticamente modos o variantes complejas en dumps estilo Figma
- No resuelve automáticamente variantes arbitrarias (`projectA/projectB/...`)
- Soporta `typography.<style> = { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }` y la misma estructura envuelta en `value/$value`
- Permite `paragraphSpacing`, `paragraphIndent`, `textCase` y `textDecoration` como extras ignorados, sin reinterpretarlos ni exportarlos
- No soporta todavía modos internos, objetos anidados complejos ni typography arbitraria más amplia
- No existe todavía selección de versión o perfil del target; hoy la exportación usa un único comportamiento por target

## Último estado conocido
- Hardening reciente completado
- Feedback estructurado estabilizado
- README reescrito y alineado con el estado real del proyecto

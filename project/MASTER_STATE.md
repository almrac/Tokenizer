# Tokenizer — Master State

## Estado actual
- Proyecto: Tokenizer
- Tipo: herramienta local + web estática
- Targets soportados: css, ionic, bootstrap, tailwind
- Grupos soportados: colors, spacing, typography, radius, shadows

## Capacidades estables
- Importación con detección de roots y wrappers comunes
- Soporte verificable para roots heterogéneos conocidos con reglas conservadoras
- Mensajes de ambigüedad e importación más claros y accionables
- Contrato mínimo de `targetProfile` en CLI y UI web, limitado inicialmente a `bootstrap`
- Normalización de aliases top-level y typography
- Soporte seguro para hojas envueltas estilo Figma con `value/$value`
- Adaptador temprano y conservador para dumps heterogéneos de Figma
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
- Dumps Figma heterogéneos con pruning conservador de metadata, extracción segura de valor y modo único efectivo: funcional en el subconjunto soportado
- Text styles compuestos directos o envueltos bajo `typography`: funcional en el subconjunto soportado
- `bootstrap.v5.3` como perfil de target baseline visible: funcional y equivalente al comportamiento existente
- `bootstrap.v4` como primer perfil funcional real: verificado con divergencia acotada en `radius.lg`
- La web mantiene `importNotes` como información de importación y no las eleva a advertencias reales
- La web resuelve el perfil de Bootstrap sobre los targets activos reales, también en multi-export
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
- No ampliar `targetProfile` por simetría o anticipación; un perfil nuevo solo se abre si cambia de forma clara mappings, compatibilidad o salida generada y ese cambio se puede verificar con fixtures
- Bootstrap es el único target con perfiles activos por ahora; Tailwind e Ionic no se abren mientras no exista una divergencia pequeña, útil y verificable comparable a `bootstrap.v4`

## Problemas abiertos
- Compatibilidad más profunda con dumps complejos y heterogéneos de Figma
- Heurísticas más finas para roots heterogéneos profundos o generales
- Perfiles adicionales de `bootstrap` más allá de `v4`
- Extensión de `targetProfile` a otros targets
- Cambios funcionales más amplios de mappings o compatibilidad por perfil
- Warnings específicos por degradación de compatibilidad según perfil
- Soporte de modos o variantes internas dentro de text styles compuestos
- Soporte para objetos anidados complejos dentro de text styles compuestos
- Cobertura más amplia para typography arbitraria o DTCG
- Exportación de extras ignorados en text styles compuestos
- Posible pulido adicional de naming en algunos casos edge

## Límites actuales
- Soporta un subconjunto seguro de hojas envueltas con `value/$value`, pero no todos los exports crudos de Figma
- Soporta además un subconjunto conservador de dumps heterogéneos de Figma con:
  pruning cerrado de metadata,
  extracción segura desde `value`, `$value` o `resolvedValue`,
  y unwrap de modo único efectivo en contenedores explícitos
- Soporta un subconjunto conocido de roots heterogéneos, pero no casos profundos o generales
- Bloquea explícitamente dumps Figma con múltiples modos efectivos o múltiples rutas plausibles al valor
- No resuelve automáticamente modos o variantes complejas en dumps estilo Figma
- No resuelve automáticamente variantes arbitrarias (`projectA/projectB/...`)
- Soporta `typography.<style> = { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing }` y la misma estructura envuelta en `value/$value`
- Permite `paragraphSpacing`, `paragraphIndent`, `textCase` y `textDecoration` como extras ignorados, sin reinterpretarlos ni exportarlos
- No soporta todavía modos internos, objetos anidados complejos ni typography arbitraria más amplia
- La CLI acepta `--target-profile=<name>` solo para `bootstrap`
- La UI web expone `Perfil de target` cuando el target principal es `bootstrap`
- `bootstrap.v5.3` mantiene la salida baseline actual
- `bootstrap.v4` introduce una divergencia real y acotada: `radius.lg` deja de mapearse a `$border-radius-lg` y cae a fallback explícito
- `default` queda solo como alias interno y retrocompatible de `bootstrap.v5.3`
- La UI muestra `v5.3` y `v4`, y la CLI puede aceptar `default` pero resuelve el summary a `v5.3`
- Las combinaciones inválidas de target/perfil devuelven error claro y el summary o inspector expone `targetProfileUsed` con el perfil real resuelto
- En web, `importNotes` siguen visibles en `Importación`, pero no cuentan como warnings reales ni activan el estado `Con advertencias`
- En multi-export, si `bootstrap` participa, el perfil aplicado ya no depende solo del target principal visible
- No existen perfiles funcionales adicionales fuera de `bootstrap.v5.3` y `bootstrap.v4`, ni soporte para otros targets
- No está previsto abrir perfiles nuevos mientras no aparezca una divergencia real, útil y verificable del mismo nivel que `bootstrap.v4`
- Tailwind no se abre por ahora porque su primer caso real implicaría un cambio de shape o artefacto demasiado grande para este bloque
- Ionic no se abre por ahora porque no existe todavía una divergencia pequeña y útil claramente identificada
- Siguen fuera de soporte los dumps arbitrarios de Figma, el multi-modo real, las múltiples rutas plausibles al valor, las referencias cruzadas amplias y las heurísticas más profundas de root

## Último estado conocido
- Hardening reciente completado
- Feedback estructurado estabilizado
- README reescrito y alineado con el estado real del proyecto

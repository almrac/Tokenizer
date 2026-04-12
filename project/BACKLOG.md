# Tokenizer — Backlog operativo

## Cerrado
- Normalización de aliases top-level
- Detección de roots y wrappers comunes
- Soporte verificable para roots heterogéneos conocidos con rama dominante o agregación segura
- Mejora de mensajes de ambigüedad en selección de root e importación
- Soporte seguro para hojas envueltas estilo Figma con `value/$value`
- Adaptador temprano y conservador para dumps heterogéneos de Figma en el subconjunto seguro
- Soporte verificable para `valuesByMode` con selector local explícito `defaultModeId` o `modeId`
- Soporte verificable para text styles compuestos directos y envueltos bajo `typography` en el subconjunto seguro
- Contrato mínimo de `targetProfile` en CLI y UI web para `bootstrap`
- Primer perfil funcional real `bootstrap.v4` con divergencia acotada y verificable
- La web mantiene `importNotes` separadas de las advertencias reales
- La web resuelve el perfil de Bootstrap sobre los targets activos reales en multi-export
- Flat variant collection (base)
- Selección explícita de variante en CLI
- Selección explícita de variante en UI
- Política formal de exportación
- Plantillas de mapeo por framework
- Expansión a typography, radius, shadows y spacing
- Validación de valores por tipo
- Feedback estructurado con advertencias y omisiones
- Respeto del prefijo configurable en css / ionic / bootstrap

## Aprobado con ajustes menores
- Naming y limpieza de ciertos outputs edge
- Copy puntual del inspector en casos específicos
- Documentación de límites con ejemplos reales adicionales

## Abierto
- Compatibilidad ampliada con dumps complejos y heterogéneos de Figma
- Mejora de heurísticas para roots heterogéneos profundos o generales
- Perfiles adicionales de `bootstrap` más allá de `v4`
- Extensión de `targetProfile` a otros targets
- Cambios funcionales más amplios de mappings o compatibilidad por perfil
- Warnings específicos por degradación de compatibilidad según perfil
- Modos o variantes internas dentro de text styles compuestos
- Objetos anidados complejos en text styles compuestos
- Cobertura general de typography arbitraria o DTCG más amplia
- Exportación de extras ignorados en text styles compuestos

Nota de criterio para `targetProfile`:
- No abrir perfiles nuevos por simetría; solo avanzar si aparece una diferencia clara de mappings, compatibilidad o salida generada con valor real y cobertura verificable
- Mantener `bootstrap` como único target con perfiles activos hasta que Tailwind o Ionic presenten un caso pequeño, útil y verificable comparable a `bootstrap.v4`
- Mantener `bootstrap.v5.3` como baseline visible y `default` solo como alias técnico interno y retrocompatible

Nota de criterio para Figma heterogéneo:
- El subconjunto actual ya soporta pruning cerrado de metadata, extracción segura de una única ruta de valor y unwrap de modo único; siguen abiertos solo los casos que exigen inferencia adicional o estructuras arbitrarias
- En `valuesByMode`, solo se soporta selector local explícito con coincidencia exacta; siguen abiertos el multi-modo real, la metadata externa de colección y la resolución por nombre arbitrario

## Más adelante
- Fixtures de test reales más amplios
- Suite de verificación semiautomática por target
- Documentación avanzada con casos reales de entrada/salida
- Supervisor operativo integrado en flujo del proyecto

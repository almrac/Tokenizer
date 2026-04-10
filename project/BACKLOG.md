# Tokenizer — Backlog operativo

## Cerrado
- Normalización de aliases top-level
- Detección de roots y wrappers comunes
- Soporte verificable para roots heterogéneos conocidos con rama dominante o agregación segura
- Soporte seguro para hojas envueltas estilo Figma con `value/$value`
- Soporte verificable para text styles compuestos directos y envueltos bajo `typography` en el subconjunto seguro
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
- Mejora de mensajes de ambigüedad en selección de root
- Modos o variantes internas dentro de text styles compuestos
- Objetos anidados complejos en text styles compuestos
- Cobertura general de typography arbitraria o DTCG más amplia
- Exportación de extras ignorados en text styles compuestos

## Más adelante
- Fixtures de test reales más amplios
- Suite de verificación semiautomática por target
- Documentación avanzada con casos reales de entrada/salida
- Supervisor operativo integrado en flujo del proyecto

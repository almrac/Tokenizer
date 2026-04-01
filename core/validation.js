const SUPPORTED_GROUPS = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
const { getTypographyBuckets } = require('./naming');
const { applyFlatVariantCollectionAdapter } = require('./import-adapters');
const { getTargetGroupSupportMap, resolveBootstrapSemanticColorRole } = require('./target-mappings');
const TOP_LEVEL_ALIASES = {
  color: 'colors',
  colour: 'colors',
  colours: 'colors',
  space: 'spacing',
  spaces: 'spacing',
  radii: 'radius',
  borderRadius: 'radius',
  shadow: 'shadows',
  boxShadow: 'shadows',
  elevation: 'shadows',
  type: 'typography',
  text: 'typography',
};
const TYPOGRAPHY_ALIASES = {
  'font-family': 'fontFamily',
  font_family: 'fontFamily',
  fontfamily: 'fontFamily',
  'font-size': 'fontSize',
  font_size: 'fontSize',
  fontsize: 'fontSize',
  'font-weight': 'fontWeight',
  font_weight: 'fontWeight',
  fontweight: 'fontWeight',
  'line-height': 'lineHeight',
  line_height: 'lineHeight',
  lineheight: 'lineHeight',
  'letter-spacing': 'letterSpacing',
  letter_spacing: 'letterSpacing',
  letterspacing: 'letterSpacing',
};
const WRAPPER_KEYS = {
  tokens: true,
  global: true,
  globals: true,
  theme: true,
  themes: true,
  values: true,
  collections: true,
  collection: true,
  primitives: true,
  semantic: true,
  semanticTokens: true,
  designTokens: true,
  default: true,
};
const PREFERRED_ROOT_NAMES = {
  global: true,
  globals: true,
  default: true,
  defaults: true,
  base: true,
};

const TARGET_GROUP_SUPPORT = getTargetGroupSupportMap();

const BOOTSTRAP_COLOR_NAMES = {
  primary: true,
  secondary: true,
  success: true,
  danger: true,
  warning: true,
  info: true,
  light: true,
  dark: true,
};

function isObjectRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function getAliasTargetKey(key, aliases) {
  const direct = aliases[key];

  if (direct) {
    return direct;
  }

  const lowered = String(key).toLowerCase();

  if (aliases[lowered]) {
    return aliases[lowered];
  }

  return null;
}

function hasCanonicalGroupShape(value) {
  if (!isObjectRecord(value)) {
    return false;
  }

  for (let i = 0; i < SUPPORTED_GROUPS.length; i += 1) {
    const key = SUPPORTED_GROUPS[i];

    if (Object.prototype.hasOwnProperty.call(value, key) && isObjectRecord(value[key])) {
      return true;
    }
  }

  return false;
}

function countKnownGroupKeys(value) {
  const keys = Object.keys(value || {});
  let canonicalCount = 0;
  let aliasCount = 0;
  let unrelatedCount = 0;

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (SUPPORTED_GROUPS.indexOf(key) !== -1) {
      canonicalCount += 1;
      continue;
    }

    if (getAliasTargetKey(key, TOP_LEVEL_ALIASES)) {
      aliasCount += 1;
      continue;
    }

    unrelatedCount += 1;
  }

  return {
    canonicalCount,
    aliasCount,
    unrelatedCount,
    totalKeys: keys.length,
  };
}

function collectTokenRootCandidates(source, basePath, depth, candidates) {
  if (!isObjectRecord(source) || depth > 3) {
    return;
  }

  const keys = Object.keys(source);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = source[key];
    const path = basePath ? basePath + '.' + key : key;
    const counts = countKnownGroupKeys(value);
    const looksLikeRoot = isObjectRecord(value) && (counts.canonicalCount > 0 || counts.aliasCount > 0);
    const shouldDive =
      isObjectRecord(value) &&
      (WRAPPER_KEYS[key] || WRAPPER_KEYS[String(key).toLowerCase()] || depth < 2);

    if (looksLikeRoot) {
      const pathParts = path.split('.');
      const leaf = pathParts[pathParts.length - 1];
      const leafLower = String(leaf).toLowerCase();
      const wrapperHint = WRAPPER_KEYS[key] || WRAPPER_KEYS[String(key).toLowerCase()];
      const preferredHint = PREFERRED_ROOT_NAMES[leaf] || PREFERRED_ROOT_NAMES[leafLower];
      const score =
        counts.canonicalCount * 12 +
        counts.aliasCount * 6 +
        (counts.canonicalCount + counts.aliasCount >= 2 ? 8 : 0) +
        (preferredHint ? 6 : 0) +
        (wrapperHint ? 4 : 0) -
        Math.min(counts.unrelatedCount, 4) * 2 -
        depth * 2;

      candidates.push({
        path,
        value,
        canonicalCount: counts.canonicalCount,
        aliasCount: counts.aliasCount,
        unrelatedCount: counts.unrelatedCount,
        totalKeys: counts.totalKeys,
        preferredHint: !!preferredHint,
        wrapperHint: !!wrapperHint,
        depth,
        score,
      });
    }

    if (shouldDive) {
      collectTokenRootCandidates(value, path, depth + 1, candidates);
    }
  }
}

function pickTokenRoot(rawTokens, info, errors) {
  const rootResult = {
    value: rawTokens,
    path: 'top-level',
  };

  if (!isObjectRecord(rawTokens)) {
    return rootResult;
  }

  const candidates = [];
  collectTokenRootCandidates(rawTokens, '', 0, candidates);

  if (hasCanonicalGroupShape(rawTokens)) {
    if (candidates.length > 0) {
      info.push('Using top-level token groups; wrapped candidates were ignored.');
    }
    return rootResult;
  }

  if (candidates.length === 0) {
    return rootResult;
  }

  if (candidates.length === 1) {
    info.push(
      'Using token root from "' +
        candidates[0].path +
        '" (' +
        candidates[0].canonicalCount +
        ' grupos canónicos, ' +
        candidates[0].aliasCount +
        ' aliases).'
    );
    return {
      value: candidates[0].value,
      path: candidates[0].path,
    };
  }

  const sorted = candidates.slice().sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const second = sorted[1];
  const scoreDelta = second ? best.score - second.score : best.score;

  if (scoreDelta < 4) {
    const topCandidates = sorted.slice(0, 3);
    errors.push(
      'Se detectaron múltiples posibles raíces de tokens: ' +
        topCandidates.map((item) => '"' + item.path + '"').join(', ') +
        '. La diferencia de confianza es baja; deja una raíz clara (por ejemplo, "global" o "default").'
    );
    return rootResult;
  }

  info.push(
    'Detected multiple candidates; selected "' +
      best.path +
      '" because it has stronger token-group signals (score ' +
      best.score +
      ' vs ' +
      second.score +
      ').'
  );

  return {
    value: best.value,
    path: best.path,
  };
}

function mergeObjectRecords(baseRecord, incomingRecord, context, normalizationNotes) {
  const merged = Object.assign({}, baseRecord);
  const keys = Object.keys(incomingRecord);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (!Object.prototype.hasOwnProperty.call(merged, key)) {
      merged[key] = incomingRecord[key];
      continue;
    }

    if (isObjectRecord(merged[key]) && isObjectRecord(incomingRecord[key])) {
      merged[key] = mergeObjectRecords(merged[key], incomingRecord[key], context + '.' + key, normalizationNotes);
      continue;
    }

    normalizationNotes.push(
      'Conflicto en "' + context + '.' + key + '": se mantiene el valor existente y se ignora el alias.'
    );
  }

  return merged;
}

function normalizeTypographyGroup(typographySource, normalizationNotes) {
  if (!isObjectRecord(typographySource)) {
    return typographySource;
  }

  const normalized = {};
  const keys = Object.keys(typographySource);

  for (let i = 0; i < keys.length; i += 1) {
    const originalKey = keys[i];
    const value = typographySource[originalKey];
    const mappedKey = getAliasTargetKey(originalKey, TYPOGRAPHY_ALIASES) || originalKey;
    const normalizedValue = isObjectRecord(value) ? normalizeTypographyGroup(value, normalizationNotes) : value;

    if (mappedKey !== originalKey) {
      normalizationNotes.push('Clave de typography normalizada de "' + originalKey + '" a "' + mappedKey + '".');
    }

    if (Object.prototype.hasOwnProperty.call(normalized, mappedKey)) {
      if (isObjectRecord(normalized[mappedKey]) && isObjectRecord(normalizedValue)) {
          normalized[mappedKey] = mergeObjectRecords(
            normalized[mappedKey],
            normalizedValue,
            'typography.' + mappedKey,
            normalizationNotes
          );
      } else {
        normalizationNotes.push(
          'Conflicto en "typography.' + mappedKey + '": se mantiene el valor existente y se ignora la variante.'
        );
      }
      continue;
    }

    normalized[mappedKey] = normalizedValue;
  }

  return normalized;
}

function normalizeTokenInput(rawTokens) {
  const importNotes = [];
  const normalizationNotes = [];
  const info = [];
  const errors = [];
  let normalized = rawTokens;
  let extractedRoot = rawTokens;
  let detectedGroups = [];
  const adapterResult = applyFlatVariantCollectionAdapter(rawTokens);
  const adaptedInput = adapterResult.adapted;
  const adapterMetadata = adapterResult.metadata;
  const summaryRootUsed = adapterMetadata.rootUsed || 'top-level';

  if (adapterMetadata.errors.length > 0) {
    errors.push.apply(errors, adapterMetadata.errors);
  }
  if (adapterMetadata.warnings.length > 0) {
    importNotes.push.apply(importNotes, adapterMetadata.warnings);
  }

  if (!isObjectRecord(adaptedInput) || errors.length > 0) {
    info.push.apply(info, importNotes);
    info.push.apply(info, normalizationNotes);

    return {
      normalized: adaptedInput,
      info: info,
      summary: {
        rootUsed: summaryRootUsed,
        detectedGroups,
        normalizationNotes,
        importNotes,
        sourcePattern: adapterMetadata.sourcePattern,
        selectedVariant: adapterMetadata.selectedVariant,
      },
      errors: errors,
    };
  }

  const rootSelection = pickTokenRoot(adaptedInput, importNotes, errors);
  extractedRoot = rootSelection.value;
  if (errors.length > 0) {
    info.push.apply(info, importNotes);
    info.push.apply(info, normalizationNotes);
    return {
      normalized: adaptedInput,
      info: info,
      summary: {
        rootUsed: summaryRootUsed,
        detectedGroups,
        normalizationNotes,
        importNotes,
        sourcePattern: adapterMetadata.sourcePattern,
        selectedVariant: adapterMetadata.selectedVariant,
      },
      errors: errors,
    };
  }

  normalized = {};
  const keys = Object.keys(extractedRoot);

  for (let i = 0; i < keys.length; i += 1) {
    const originalKey = keys[i];
    const value = extractedRoot[originalKey];
    const canonicalKey = getAliasTargetKey(originalKey, TOP_LEVEL_ALIASES) || originalKey;
    const isCanonical = SUPPORTED_GROUPS.indexOf(originalKey) !== -1;
    const normalizedValue =
      canonicalKey === 'typography' && isObjectRecord(value) ? normalizeTypographyGroup(value, normalizationNotes) : value;

    if (canonicalKey !== originalKey) {
      normalizationNotes.push('Grupo top-level normalizado de "' + originalKey + '" a "' + canonicalKey + '".');
    }

    if (!Object.prototype.hasOwnProperty.call(normalized, canonicalKey)) {
      normalized[canonicalKey] = normalizedValue;
      continue;
    }

    if (isCanonical) {
      normalizationNotes.push('Se mantiene el grupo canónico "' + canonicalKey + '" y se ignora la variante duplicada.');
      continue;
    }

    if (isObjectRecord(normalized[canonicalKey]) && isObjectRecord(normalizedValue)) {
      normalized[canonicalKey] = mergeObjectRecords(
        normalized[canonicalKey],
        normalizedValue,
        canonicalKey,
        normalizationNotes
      );
    } else {
      normalizationNotes.push(
        'Conflicto al normalizar "' + originalKey + '" en "' + canonicalKey + '": se mantiene el valor canónico.'
      );
    }
  }

  detectedGroups = SUPPORTED_GROUPS.filter((groupName) => groupHasValues(normalized, groupName));
  if (detectedGroups.length > 0) {
    importNotes.push(
      'Import summary: root "' +
        (adapterMetadata.rootUsed || rootSelection.path) +
        '", grupos detectados: ' +
        detectedGroups.join(', ') +
        '.'
    );
  }
  info.push.apply(info, importNotes);
  info.push.apply(info, normalizationNotes);

  return {
    normalized: normalized,
    info: info,
    summary: {
      rootUsed: adapterMetadata.rootUsed || rootSelection.path,
      detectedGroups: detectedGroups,
      normalizationNotes: normalizationNotes,
      importNotes: importNotes,
      sourcePattern: adapterMetadata.sourcePattern,
      selectedVariant: adapterMetadata.selectedVariant,
    },
    errors: errors,
  };
}

function groupHasValues(tokens, groupName) {
  if (!isObjectRecord(tokens) || !isObjectRecord(tokens[groupName])) {
    return false;
  }

  return Object.keys(tokens[groupName]).length > 0;
}

function joinList(values) {
  return values.map((value) => '"' + value + '"').join(', ');
}

function validateTokenInput(tokens, target) {
  const errors = [];
  const warnings = [];
  const support = TARGET_GROUP_SUPPORT[target] || TARGET_GROUP_SUPPORT.css;
  let supportedGroups = [];
  let unsupportedGroups = [];
  let ignoredByTarget = [];

  if (!isObjectRecord(tokens)) {
    errors.push('La raíz del JSON debe ser un objeto con grupos de tokens (por ejemplo: colors, spacing).');
    return {
      errors,
      warnings,
      supportedGroups,
      unsupportedGroups,
      ignoredByTarget,
    };
  }

  const topLevelKeys = Object.keys(tokens);
  unsupportedGroups = topLevelKeys.filter((key) => SUPPORTED_GROUPS.indexOf(key) === -1);

  if (unsupportedGroups.length > 0) {
    warnings.push('Grupos no soportados: ' + joinList(unsupportedGroups) + '. Se ignorarán en la generación.');
  }

  for (let i = 0; i < SUPPORTED_GROUPS.length; i += 1) {
    const groupName = SUPPORTED_GROUPS[i];

    if (Object.prototype.hasOwnProperty.call(tokens, groupName) && !isObjectRecord(tokens[groupName])) {
      errors.push('El grupo "' + groupName + '" debe ser un objeto.');
    }
  }

  if (errors.length > 0) {
    return {
      errors,
      warnings,
      supportedGroups,
      unsupportedGroups,
      ignoredByTarget,
    };
  }

  supportedGroups = SUPPORTED_GROUPS.filter((groupName) => groupHasValues(tokens, groupName));
  ignoredByTarget = supportedGroups.filter((groupName) => !support[groupName]);

  if (supportedGroups.length === 0) {
    if (unsupportedGroups.length > 0) {
      errors.push(
        'No hay grupos soportados con contenido para generar. Grupos soportados: ' +
        joinList(SUPPORTED_GROUPS) +
        '. Detectados no soportados: ' +
        joinList(unsupportedGroups) +
        '.'
      );
    } else {
      errors.push(
        'No se detectaron grupos soportados con contenido para generar. Añade al menos uno de: ' +
        joinList(SUPPORTED_GROUPS) +
        '.'
      );
    }
    return {
      errors,
      warnings,
      supportedGroups,
      unsupportedGroups,
      ignoredByTarget,
    };
  }

  if (ignoredByTarget.length > 0) {
    warnings.push('El target "' + target + '" ignora los grupos: ' + joinList(ignoredByTarget) + '.');
  }

  if (target === 'bootstrap' && isObjectRecord(tokens.colors)) {
    const colorKeys = Object.keys(tokens.colors);
    const ignoredColorKeys = colorKeys.filter((key) => {
      const mappedRole = resolveBootstrapSemanticColorRole(key);
      return !mappedRole || !BOOTSTRAP_COLOR_NAMES[mappedRole];
    });

    if (ignoredColorKeys.length > 0) {
      warnings.push('Bootstrap solo aplica colores estándar. Se ignorarán: ' + joinList(ignoredColorKeys) + '.');
    }
  }

  if (isObjectRecord(tokens.typography)) {
    const buckets = getTypographyBuckets(tokens.typography);
    const hasTypographyMappings =
      Object.keys(buckets.fontFamily).length > 0 ||
      Object.keys(buckets.fontSize).length > 0 ||
      Object.keys(buckets.fontWeight).length > 0 ||
      Object.keys(buckets.lineHeight).length > 0 ||
      Object.keys(buckets.letterSpacing).length > 0;

    if (!hasTypographyMappings && groupHasValues(tokens, 'typography')) {
      warnings.push(
        'El grupo "typography" no contiene claves mapeables (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing) y se ignorará.'
      );
    }

    if (target === 'bootstrap' && Object.keys(buckets.letterSpacing).length > 0) {
      warnings.push(
        'Bootstrap no tiene una variable global equivalente para "letterSpacing"; estos tokens se omiten.'
      );
    }
  }

  return {
    errors: errors,
    warnings: warnings,
    supportedGroups: supportedGroups,
    unsupportedGroups: unsupportedGroups,
    ignoredByTarget: ignoredByTarget,
  };
}

module.exports = {
  SUPPORTED_GROUPS: SUPPORTED_GROUPS,
  normalizeTokenInput: normalizeTokenInput,
  validateTokenInput: validateTokenInput,
};

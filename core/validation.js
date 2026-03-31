const SUPPORTED_GROUPS = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
const { getTypographyBuckets } = require('./naming');
const TOP_LEVEL_ALIASES = {
  color: 'colors',
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

const TARGET_GROUP_SUPPORT = {
  css: {
    colors: true,
    spacing: true,
    typography: true,
    radius: true,
    shadows: true,
  },
  ionic: {
    colors: true,
    spacing: true,
    typography: true,
    radius: true,
    shadows: true,
  },
  bootstrap: {
    colors: true,
    spacing: true,
    typography: true,
    radius: true,
    shadows: true,
  },
  tailwind: {
    colors: true,
    spacing: true,
    typography: true,
    radius: true,
    shadows: true,
  },
};

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

function mergeObjectRecords(baseRecord, incomingRecord, context, infoMessages) {
  const merged = Object.assign({}, baseRecord);
  const keys = Object.keys(incomingRecord);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (!Object.prototype.hasOwnProperty.call(merged, key)) {
      merged[key] = incomingRecord[key];
      continue;
    }

    if (isObjectRecord(merged[key]) && isObjectRecord(incomingRecord[key])) {
      merged[key] = mergeObjectRecords(merged[key], incomingRecord[key], context + '.' + key, infoMessages);
      continue;
    }

    infoMessages.push('Conflicto en "' + context + '.' + key + '": se mantiene el valor existente y se ignora el alias.');
  }

  return merged;
}

function normalizeTypographyGroup(typographySource, infoMessages) {
  if (!isObjectRecord(typographySource)) {
    return typographySource;
  }

  const normalized = {};
  const keys = Object.keys(typographySource);

  for (let i = 0; i < keys.length; i += 1) {
    const originalKey = keys[i];
    const value = typographySource[originalKey];
    const mappedKey = getAliasTargetKey(originalKey, TYPOGRAPHY_ALIASES) || originalKey;
    const normalizedValue = isObjectRecord(value) ? normalizeTypographyGroup(value, infoMessages) : value;

    if (mappedKey !== originalKey) {
      infoMessages.push('Clave de typography normalizada de "' + originalKey + '" a "' + mappedKey + '".');
    }

    if (Object.prototype.hasOwnProperty.call(normalized, mappedKey)) {
      if (isObjectRecord(normalized[mappedKey]) && isObjectRecord(normalizedValue)) {
        normalized[mappedKey] = mergeObjectRecords(
          normalized[mappedKey],
          normalizedValue,
          'typography.' + mappedKey,
          infoMessages
        );
      } else {
        infoMessages.push(
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
  const info = [];
  const errors = [];
  let normalized = rawTokens;

  if (!isObjectRecord(rawTokens)) {
    return {
      normalized: rawTokens,
      info: info,
      errors: errors,
    };
  }

  normalized = {};
  const keys = Object.keys(rawTokens);

  for (let i = 0; i < keys.length; i += 1) {
    const originalKey = keys[i];
    const value = rawTokens[originalKey];
    const canonicalKey = getAliasTargetKey(originalKey, TOP_LEVEL_ALIASES) || originalKey;
    const isCanonical = SUPPORTED_GROUPS.indexOf(originalKey) !== -1;
    const normalizedValue =
      canonicalKey === 'typography' && isObjectRecord(value) ? normalizeTypographyGroup(value, info) : value;

    if (canonicalKey !== originalKey) {
      info.push('Grupo top-level normalizado de "' + originalKey + '" a "' + canonicalKey + '".');
    }

    if (!Object.prototype.hasOwnProperty.call(normalized, canonicalKey)) {
      normalized[canonicalKey] = normalizedValue;
      continue;
    }

    if (isCanonical) {
      info.push('Se mantiene el grupo canónico "' + canonicalKey + '" y se ignora la variante duplicada.');
      continue;
    }

    if (isObjectRecord(normalized[canonicalKey]) && isObjectRecord(normalizedValue)) {
      normalized[canonicalKey] = mergeObjectRecords(
        normalized[canonicalKey],
        normalizedValue,
        canonicalKey,
        info
      );
    } else {
      info.push('Conflicto al normalizar "' + originalKey + '" en "' + canonicalKey + '": se mantiene el valor canónico.');
    }
  }

  return {
    normalized: normalized,
    info: info,
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
    const ignoredColorKeys = colorKeys.filter((key) => !BOOTSTRAP_COLOR_NAMES[key]);

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

const SUPPORTED_GROUPS = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
const { getTypographyBuckets } = require('./naming');

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
    spacing: false,
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
  validateTokenInput: validateTokenInput,
};

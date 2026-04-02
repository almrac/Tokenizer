const { flattenTokenEntries, getSortedKeys, getTokenGroups, getTypographyBuckets, toKebabCase } = require('./naming');
const {
  getNativeMapping,
  isBootstrapTypographyTokenMappable,
  normalizeTokenName,
  resolveBootstrapProbableGlobalColorVariable,
  resolveBootstrapRadiusVariable,
  resolveBootstrapShadowGlobalVariable,
  resolveBootstrapSemanticColorRole,
} = require('./target-mappings');

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
const BOOTSTRAP_COLOR_ORDER = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];

function normalizeSassPrefix(prefix) {
  if (prefix === null || typeof prefix === 'undefined') {
    return 'tk';
  }

  const trimmed = String(prefix).trim();

  if (!trimmed) {
    return 'tk';
  }

  const normalized = trimmed
    .replace(/^\$+/, '')
    .replace(/^-+/, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || 'tk';
}

// Bootstrap output uses native Sass slots first and emits explicit $<prefix>-* fallbacks for useful extra tokens.
function generateBootstrap(tokens, options) {
  const groups = getTokenGroups(tokens);
  const fallbackPrefix = normalizeSassPrefix(options && options.prefix);
  const lines = [];
  const spacingKeys = getSortedKeys(groups.spacing);
  const typographyBuckets = getTypographyBuckets(groups.typography);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const colorEntries = [];
  const typographyBaseLines = [];
  const typographyMapLines = [];
  const typographyFallbackLines = [];

  function buildExtendedSassVariable(group, tokenName) {
    return '$' + fallbackPrefix + '-' + group + '-' + (toKebabCase(tokenName) || tokenName);
  }

  function pickBaseEntry(bucket) {
    if (bucket.base) {
      return { name: 'base', value: bucket.base };
    }
    if (bucket.body) {
      return { name: 'body', value: bucket.body };
    }

    const keys = getSortedKeys(bucket);
    if (keys.length === 0) {
      return null;
    }

    return {
      name: keys[0],
      value: bucket[keys[0]],
    };
  }

  function pickBucketEntry(bucket, preferredKeys) {
    if (!bucket) {
      return null;
    }

    for (let i = 0; i < preferredKeys.length; i += 1) {
      if (bucket[preferredKeys[i]]) {
        return {
          name: preferredKeys[i],
          value: bucket[preferredKeys[i]],
        };
      }
    }

    return pickBaseEntry(bucket);
  }

  function buildScssMap(variableName, bucket, keyFilter) {
    const keys = getSortedKeys(bucket);
    const lines = [];

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (keyFilter && !keyFilter(key)) {
        continue;
      }

      if (lines.length === 0) {
        lines.push(variableName + ': (');
      }

      lines.push('  "' + key + '": ' + bucket[key] + ',');
    }

    if (lines.length === 0) {
      return null;
    }

    lines.push(');');
    return lines;
  }

  const colorKeys = getSortedKeys(groups.colors);
  const colorRoleAssignments = {};
  const globalColorAssignments = {};
  const globalColorOrder = ['$body-color', '$body-bg', '$border-color'];
  const consumedColorKeys = {};

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];
    const role = resolveBootstrapSemanticColorRole(key);
    const probableGlobalVariable = resolveBootstrapProbableGlobalColorVariable(key);

    if (role && BOOTSTRAP_COLOR_NAMES[role]) {
      const normalized = normalizeTokenName(key);
      const score = normalized === role ? 2 : 1;
      const previous = colorRoleAssignments[role];

      if (!previous || score > previous.score) {
        colorRoleAssignments[role] = {
          value: groups.colors[key],
          key: key,
          score: score,
        };
      }
      continue;
    }

    if (probableGlobalVariable) {
      const normalized = normalizeTokenName(key);
      const variableName = String(probableGlobalVariable).replace(/^\$/, '');
      const score = normalized === variableName ? 2 : 1;
      const previous = globalColorAssignments[probableGlobalVariable];

      if (!previous || score > previous.score) {
        globalColorAssignments[probableGlobalVariable] = {
          value: groups.colors[key],
          key: key,
          score: score,
        };
      }
    }
  }

  for (let i = 0; i < BOOTSTRAP_COLOR_ORDER.length; i += 1) {
    const role = BOOTSTRAP_COLOR_ORDER[i];
    const assignment = colorRoleAssignments[role];

    if (!assignment) {
      continue;
    }

    if (BOOTSTRAP_COLOR_NAMES[role]) {
      const colorVariable = getNativeMapping('bootstrap', 'colors.' + role) || '$' + role;
      colorEntries.push(colorVariable + ': ' + assignment.value + ';');
      consumedColorKeys[assignment.key] = true;
    }
  }

  for (let i = 0; i < globalColorOrder.length; i += 1) {
    const variableName = globalColorOrder[i];
    const assignment = globalColorAssignments[variableName];

    if (!assignment) {
      continue;
    }

    colorEntries.push(variableName + ': ' + assignment.value + ';');
    consumedColorKeys[assignment.key] = true;
  }

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];

    if (consumedColorKeys[key]) {
      continue;
    }

    colorEntries.push(buildExtendedSassVariable('color', key) + ': ' + groups.colors[key] + ';');
  }

  if (colorEntries.length > 0) {
    lines.push('/* Colors */');
    for (let i = 0; i < colorEntries.length; i += 1) {
      lines.push(colorEntries[i]);
    }
  }

  if (spacingKeys.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('/* Spacing */');
    lines.push('$spacers: (');
    for (let i = 0; i < spacingKeys.length; i += 1) {
      const key = spacingKeys[i];
      lines.push('  "' + key + '": ' + groups.spacing[key] + ',');
    }
    lines.push(');');
  }

  const consumedTypography = {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {},
  };
  const fontFamilyBase = pickBucketEntry(typographyBuckets.fontFamily, ['base', 'body']);
  const fontSizeBase = pickBucketEntry(typographyBuckets.fontSize, ['body', 'base']);
  const fontWeightBase = pickBucketEntry(typographyBuckets.fontWeight, ['regular', 'base']);
  const lineHeightBase = pickBucketEntry(typographyBuckets.lineHeight, ['body', 'base']);

  if (fontFamilyBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontFamily.base') || '$font-family-base') + ': ' + fontFamilyBase.value + ';'
    );
    consumedTypography.fontFamily[fontFamilyBase.name] = true;
  }
  if (fontSizeBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontSize.body') || '$font-size-base') + ': ' + fontSizeBase.value + ';'
    );
    consumedTypography.fontSize[fontSizeBase.name] = true;
  }
  if (fontWeightBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontWeight.regular') || '$font-weight-base') + ': ' + fontWeightBase.value + ';'
    );
    consumedTypography.fontWeight[fontWeightBase.name] = true;
  }
  if (lineHeightBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.lineHeight.body') || '$line-height-base') + ': ' + lineHeightBase.value + ';'
    );
    consumedTypography.lineHeight[lineHeightBase.name] = true;
  }

  const fontSizesMap = buildScssMap('$font-sizes', typographyBuckets.fontSize, isBootstrapTypographyTokenMappable);
  const fontWeightsMap = buildScssMap('$font-weights', typographyBuckets.fontWeight, isBootstrapTypographyTokenMappable);
  const lineHeightsMap = buildScssMap('$line-heights', typographyBuckets.lineHeight, isBootstrapTypographyTokenMappable);

  if (fontSizesMap) {
    typographyMapLines.push(...fontSizesMap);
  }
  if (fontWeightsMap) {
    typographyMapLines.push(...fontWeightsMap);
  }
  if (lineHeightsMap) {
    typographyMapLines.push(...lineHeightsMap);
  }

  const fontSizeKeys = getSortedKeys(typographyBuckets.fontSize);
  const fontWeightKeys = getSortedKeys(typographyBuckets.fontWeight);
  const lineHeightKeys = getSortedKeys(typographyBuckets.lineHeight);
  const fontFamilyKeys = getSortedKeys(typographyBuckets.fontFamily);
  const letterSpacingKeys = getSortedKeys(typographyBuckets.letterSpacing);

  for (let i = 0; i < fontSizeKeys.length; i += 1) {
    const key = fontSizeKeys[i];
    if (isBootstrapTypographyTokenMappable(key)) {
      consumedTypography.fontSize[key] = true;
    }
  }
  for (let i = 0; i < fontWeightKeys.length; i += 1) {
    const key = fontWeightKeys[i];
    if (isBootstrapTypographyTokenMappable(key)) {
      consumedTypography.fontWeight[key] = true;
    }
  }
  for (let i = 0; i < lineHeightKeys.length; i += 1) {
    const key = lineHeightKeys[i];
    if (isBootstrapTypographyTokenMappable(key)) {
      consumedTypography.lineHeight[key] = true;
    }
  }

  for (let i = 0; i < fontFamilyKeys.length; i += 1) {
    const key = fontFamilyKeys[i];
    if (!consumedTypography.fontFamily[key]) {
      typographyFallbackLines.push(
        buildExtendedSassVariable('font-family', key) + ': ' + typographyBuckets.fontFamily[key] + ';'
      );
    }
  }
  for (let i = 0; i < fontSizeKeys.length; i += 1) {
    const key = fontSizeKeys[i];
    if (!consumedTypography.fontSize[key]) {
      typographyFallbackLines.push(buildExtendedSassVariable('font-size', key) + ': ' + typographyBuckets.fontSize[key] + ';');
    }
  }
  for (let i = 0; i < fontWeightKeys.length; i += 1) {
    const key = fontWeightKeys[i];
    if (!consumedTypography.fontWeight[key]) {
      typographyFallbackLines.push(
        buildExtendedSassVariable('font-weight', key) + ': ' + typographyBuckets.fontWeight[key] + ';'
      );
    }
  }
  for (let i = 0; i < lineHeightKeys.length; i += 1) {
    const key = lineHeightKeys[i];
    if (!consumedTypography.lineHeight[key]) {
      typographyFallbackLines.push(
        buildExtendedSassVariable('line-height', key) + ': ' + typographyBuckets.lineHeight[key] + ';'
      );
    }
  }
  for (let i = 0; i < letterSpacingKeys.length; i += 1) {
    const key = letterSpacingKeys[i];
    typographyFallbackLines.push(
      buildExtendedSassVariable('letter-spacing', key) + ': ' + typographyBuckets.letterSpacing[key] + ';'
    );
  }

  if (typographyBaseLines.length > 0 || typographyMapLines.length > 0 || typographyFallbackLines.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('/* Typography */');
    for (let i = 0; i < typographyBaseLines.length; i += 1) {
      lines.push(typographyBaseLines[i]);
    }

    if (typographyMapLines.length > 0) {
      if (typographyBaseLines.length > 0) {
        lines.push('');
      }
      for (let i = 0; i < typographyMapLines.length; i += 1) {
        lines.push(typographyMapLines[i]);
      }
    }

    if (typographyFallbackLines.length > 0) {
      if (typographyBaseLines.length > 0 || typographyMapLines.length > 0) {
        lines.push('');
      }
      for (let i = 0; i < typographyFallbackLines.length; i += 1) {
        lines.push(typographyFallbackLines[i]);
      }
    }
  }

  if (radiusEntries.length > 0) {
    const radiusMap = {};
    const radiusLines = [];
    const consumedRadiusKeys = {};

    for (let i = 0; i < radiusEntries.length; i += 1) {
      radiusMap[radiusEntries[i].name] = radiusEntries[i].value;
    }

    if (radiusMap.sm) {
      radiusLines.push((getNativeMapping('bootstrap', 'radius.sm') || '$border-radius-sm') + ': ' + radiusMap.sm + ';');
      consumedRadiusKeys.sm = true;
    }

    if (radiusMap.lg) {
      radiusLines.push((getNativeMapping('bootstrap', 'radius.lg') || '$border-radius-lg') + ': ' + radiusMap.lg + ';');
      consumedRadiusKeys.lg = true;
    }

    if (radiusMap.base || radiusMap.default || radiusMap.md) {
      const nativeRadius =
        getNativeMapping('bootstrap', 'radius.md') ||
        getNativeMapping('bootstrap', 'radius.default') ||
        resolveBootstrapRadiusVariable('md') ||
        '$border-radius';
      radiusLines.push(nativeRadius + ': ' + (radiusMap.md || radiusMap.default || radiusMap.base) + ';');
      if (radiusMap.md) {
        consumedRadiusKeys.md = true;
      }
      if (radiusMap.default) {
        consumedRadiusKeys.default = true;
      }
      if (radiusMap.base) {
        consumedRadiusKeys.base = true;
      }
    }

    for (let i = 0; i < radiusEntries.length; i += 1) {
      const name = radiusEntries[i].name;
      if (consumedRadiusKeys[name]) {
        continue;
      }
      radiusLines.push(buildExtendedSassVariable('radius', name) + ': ' + radiusEntries[i].value + ';');
    }

    if (radiusLines.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Radius */');
      lines.push(...radiusLines);
    }
  }

  if (shadowEntries.length > 0) {
    const globalShadowAssignments = {};
    const globalShadowOrder = ['$box-shadow-sm', '$box-shadow'];
    const consumedShadowKeys = {};
    const shadowLines = [];

    for (let i = 0; i < shadowEntries.length; i += 1) {
      const name = shadowEntries[i].name;
      const globalVariable = resolveBootstrapShadowGlobalVariable(name);
      const normalized = normalizeTokenName(name);
      const score = normalized === 'md' || normalized === 'default' || normalized === 'base' || normalized === 'sm' ? 2 : 1;
      const previous = globalShadowAssignments[globalVariable];

      if (!globalVariable) {
        continue;
      }

      if (!previous || score > previous.score) {
        globalShadowAssignments[globalVariable] = {
          value: shadowEntries[i].value,
          key: name,
          score: score,
        };
      }
    }

    for (let i = 0; i < globalShadowOrder.length; i += 1) {
      const variableName = globalShadowOrder[i];
      const assignment = globalShadowAssignments[variableName];

      if (!assignment) {
        continue;
      }

      shadowLines.push(variableName + ': ' + assignment.value + ';');
      consumedShadowKeys[assignment.key] = true;
    }

    for (let i = 0; i < shadowEntries.length; i += 1) {
      const name = shadowEntries[i].name;
      if (consumedShadowKeys[name]) {
        continue;
      }
      shadowLines.push(buildExtendedSassVariable('shadow', name) + ': ' + shadowEntries[i].value + ';');
    }

    if (shadowLines.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Shadows */');
      lines.push(...shadowLines);
    }
  }

  return lines.join('\n') + '\n';
}

module.exports = generateBootstrap;

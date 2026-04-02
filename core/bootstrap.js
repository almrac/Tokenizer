const { flattenTokenEntries, getSortedKeys, getTokenGroups, getTypographyBuckets } = require('./naming');
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

// Bootstrap output is limited to recognized color overrides plus the spacers map.
function generateBootstrap(tokens) {
  const groups = getTokenGroups(tokens);
  const lines = [];
  const spacingKeys = getSortedKeys(groups.spacing);
  const typographyBuckets = getTypographyBuckets(groups.typography);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const colorEntries = [];
  const typographyBaseLines = [];
  const typographyMapLines = [];

  function pickBaseValue(bucket) {
    if (bucket.base) {
      return bucket.base;
    }
    if (bucket.body) {
      return bucket.body;
    }

    const keys = getSortedKeys(bucket);
    if (keys.length === 0) {
      return null;
    }

    return bucket[keys[0]];
  }

  function pickBucketValue(bucket, preferredKeys) {
    if (!bucket) {
      return null;
    }

    for (let i = 0; i < preferredKeys.length; i += 1) {
      if (bucket[preferredKeys[i]]) {
        return bucket[preferredKeys[i]];
      }
    }

    return pickBaseValue(bucket);
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
    }
  }

  for (let i = 0; i < globalColorOrder.length; i += 1) {
    const variableName = globalColorOrder[i];
    const assignment = globalColorAssignments[variableName];

    if (!assignment) {
      continue;
    }

    colorEntries.push(variableName + ': ' + assignment.value + ';');
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

  const fontFamilyBase = pickBucketValue(typographyBuckets.fontFamily, ['base', 'body']);
  const fontSizeBase = pickBucketValue(typographyBuckets.fontSize, ['body', 'base']);
  const fontWeightBase = pickBucketValue(typographyBuckets.fontWeight, ['regular', 'base']);
  const lineHeightBase = pickBucketValue(typographyBuckets.lineHeight, ['body', 'base']);

  if (fontFamilyBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontFamily.base') || '$font-family-base') + ': ' + fontFamilyBase + ';'
    );
  }
  if (fontSizeBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontSize.body') || '$font-size-base') + ': ' + fontSizeBase + ';'
    );
  }
  if (fontWeightBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.fontWeight.regular') || '$font-weight-base') + ': ' + fontWeightBase + ';'
    );
  }
  if (lineHeightBase) {
    typographyBaseLines.push(
      (getNativeMapping('bootstrap', 'typography.lineHeight.body') || '$line-height-base') + ': ' + lineHeightBase + ';'
    );
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

  if (typographyBaseLines.length > 0 || typographyMapLines.length > 0) {
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
  }

  if (radiusEntries.length > 0) {
    const radiusMap = {};
    const radiusLines = [];

    for (let i = 0; i < radiusEntries.length; i += 1) {
      radiusMap[radiusEntries[i].name] = radiusEntries[i].value;
    }

    if (radiusMap.sm) {
      radiusLines.push((getNativeMapping('bootstrap', 'radius.sm') || '$border-radius-sm') + ': ' + radiusMap.sm + ';');
    }

    if (radiusMap.lg) {
      radiusLines.push((getNativeMapping('bootstrap', 'radius.lg') || '$border-radius-lg') + ': ' + radiusMap.lg + ';');
    }

    if (radiusMap.base || radiusMap.default || radiusMap.md) {
      const nativeRadius =
        getNativeMapping('bootstrap', 'radius.md') ||
        getNativeMapping('bootstrap', 'radius.default') ||
        resolveBootstrapRadiusVariable('md') ||
        '$border-radius';
      radiusLines.push(nativeRadius + ': ' + (radiusMap.md || radiusMap.default || radiusMap.base) + ';');
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
          score: score,
        };
      }
    }

    if (Object.keys(globalShadowAssignments).length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Shadows */');

      for (let i = 0; i < globalShadowOrder.length; i += 1) {
        const variableName = globalShadowOrder[i];
        const assignment = globalShadowAssignments[variableName];

        if (!assignment) {
          continue;
        }

        lines.push(variableName + ': ' + assignment.value + ';');
      }
    }
  }

  return lines.join('\n') + '\n';
}

module.exports = generateBootstrap;

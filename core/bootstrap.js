const { flattenTokenEntries, getSortedKeys, getTokenGroups, getTypographyBuckets } = require('./naming');
const {
  getNativeMapping,
  normalizeTokenName,
  resolveBootstrapProbableGlobalColorVariable,
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

  function buildScssMap(variableName, bucket) {
    const keys = getSortedKeys(bucket);
    if (keys.length === 0) {
      return null;
    }

    const lines = [variableName + ': ('];
    for (let i = 0; i < keys.length; i += 1) {
      lines.push('  "' + keys[i] + '": ' + bucket[keys[i]] + ',');
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
    typographyBaseLines.push('$font-size-base: ' + fontSizeBase + ';');
  }
  if (fontWeightBase) {
    typographyBaseLines.push('$font-weight-base: ' + fontWeightBase + ';');
  }
  if (lineHeightBase) {
    typographyBaseLines.push('$line-height-base: ' + lineHeightBase + ';');
  }

  const fontSizesMap = buildScssMap('$font-sizes', typographyBuckets.fontSize);
  const fontWeightsMap = buildScssMap('$font-weights', typographyBuckets.fontWeight);
  const lineHeightsMap = buildScssMap('$line-heights', typographyBuckets.lineHeight);

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
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('/* Radius */');
    for (let i = 0; i < radiusEntries.length; i += 1) {
      lines.push('$border-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
    }

    const radiusMap = {};
    for (let i = 0; i < radiusEntries.length; i += 1) {
      radiusMap[radiusEntries[i].name] = radiusEntries[i].value;
    }
    if (radiusMap.base || radiusMap.default || radiusMap.md) {
      const nativeRadius = getNativeMapping('bootstrap', 'radius.md') || '$border-radius';
      lines.push(nativeRadius + ': ' + (radiusMap.md || radiusMap.default || radiusMap.base) + ';');
    }
  }

  if (shadowEntries.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('/* Shadows */');
    for (let i = 0; i < shadowEntries.length; i += 1) {
      lines.push('$box-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
    }

    const shadowMap = {};
    for (let i = 0; i < shadowEntries.length; i += 1) {
      shadowMap[shadowEntries[i].name] = shadowEntries[i].value;
    }
    if (shadowMap.base || shadowMap.md) {
      lines.push('$box-shadow: ' + (shadowMap.base || shadowMap.md) + ';');
    }
  }

  return lines.join('\n') + '\n';
}

module.exports = generateBootstrap;

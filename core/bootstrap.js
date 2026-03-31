const { flattenTokenEntries, getTokenGroups, getTypographyBuckets } = require('./naming');

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

// Bootstrap output is limited to recognized color overrides plus the spacers map.
function generateBootstrap(tokens) {
  const groups = getTokenGroups(tokens);
  const lines = [];
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);
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

    const keys = Object.keys(bucket);
    if (keys.length === 0) {
      return null;
    }

    return bucket[keys[0]];
  }

  function buildScssMap(variableName, bucket) {
    const keys = Object.keys(bucket);
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

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];

    if (BOOTSTRAP_COLOR_NAMES[key]) {
      colorEntries.push('$' + key + ': ' + groups.colors[key] + ';');
    }
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

  const fontFamilyBase = pickBaseValue(typographyBuckets.fontFamily);
  const fontSizeBase = pickBaseValue(typographyBuckets.fontSize);
  const fontWeightBase = pickBaseValue(typographyBuckets.fontWeight);
  const lineHeightBase = pickBaseValue(typographyBuckets.lineHeight);

  if (fontFamilyBase) {
    typographyBaseLines.push('$font-family-base: ' + fontFamilyBase + ';');
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
    if (radiusMap.base || radiusMap.md) {
      lines.push('$border-radius: ' + (radiusMap.base || radiusMap.md) + ';');
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

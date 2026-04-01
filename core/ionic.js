const {
  buildCssVariableName,
  buildRootBlock,
  bucketToEntries,
  flattenTokenEntries,
  getSortedKeys,
  getTokenGroups,
  getTypographyBuckets,
  normalizeCssPrefix,
  toKebabCase,
} = require('./naming');
const { getNativeMapping, resolveIonicNativeColorRole } = require('./target-mappings');

// Ionic is more useful when each color includes the companion variables its theme system expects.
function clampChannel(value) {
  if (value < 0) {
    return 0;
  }

  if (value > 255) {
    return 255;
  }

  return value;
}

function hexToRgb(hex) {
  const normalized = String(hex).trim().replace(/^#/, '');

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(rgb) {
  const parts = [rgb.r, rgb.g, rgb.b];
  let value = '#';

  for (let i = 0; i < parts.length; i += 1) {
    const part = clampChannel(parts[i]).toString(16);
    value += part.length === 1 ? '0' + part : part;
  }

  return value;
}

function shiftColor(rgb, amount) {
  return {
    r: clampChannel(Math.round(rgb.r + amount)),
    g: clampChannel(Math.round(rgb.g + amount)),
    b: clampChannel(Math.round(rgb.b + amount)),
  };
}

function getContrastRgb(rgb) {
  const brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;

  if (brightness >= 186) {
    return { r: 0, g: 0, b: 0 };
  }

  return { r: 255, g: 255, b: 255 };
}

function buildColorLines(name, value) {
  const nativeRole = resolveIonicNativeColorRole(name);
  const mappedBase = nativeRole ? getNativeMapping('ionic', 'colors.' + nativeRole) : null;
  const baseVariable = mappedBase || null;
  const rgb = hexToRgb(value);

  if (!baseVariable) {
    return null;
  }

  if (!rgb) {
    return [
      '  ' + baseVariable + ': ' + value + ';',
    ];
  }

  const contrast = getContrastRgb(rgb);
  const shade = shiftColor(rgb, -18);
  const tint = shiftColor(rgb, 18);

  return [
    '  ' + baseVariable + ': ' + value + ';',
    '  --ion-color-' + nativeRole + '-rgb: ' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ';',
    '  --ion-color-' + nativeRole + '-contrast: ' + rgbToHex(contrast) + ';',
    '  --ion-color-' + nativeRole + '-contrast-rgb: ' + contrast.r + ', ' + contrast.g + ', ' + contrast.b + ';',
    '  --ion-color-' + nativeRole + '-shade: ' + rgbToHex(shade) + ';',
    '  --ion-color-' + nativeRole + '-tint: ' + rgbToHex(tint) + ';',
  ];
}

function generateIonic(tokens, options) {
  const groups = getTokenGroups(tokens);
  const prefix = normalizeCssPrefix(options && options.prefix);
  const colorKeys = getSortedKeys(groups.colors);
  const spacingEntries = flattenTokenEntries(groups.spacing);
  const typographyBuckets = getTypographyBuckets(groups.typography);
  const typographyEntries = []
    .concat(bucketToEntries(typographyBuckets.fontFamily).map((entry) => ({ group: 'font-family', entry })))
    .concat(bucketToEntries(typographyBuckets.fontSize).map((entry) => ({ group: 'font-size', entry })))
    .concat(bucketToEntries(typographyBuckets.fontWeight).map((entry) => ({ group: 'font-weight', entry })))
    .concat(bucketToEntries(typographyBuckets.lineHeight).map((entry) => ({ group: 'line-height', entry })))
    .concat(bucketToEntries(typographyBuckets.letterSpacing).map((entry) => ({ group: 'letter-spacing', entry })));
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const lines = [];

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];
    const nativeRole = resolveIonicNativeColorRole(key);
    const mappedBase = nativeRole ? getNativeMapping('ionic', 'colors.' + nativeRole) : null;
    const fallbackTokenName = toKebabCase(key) || key;
    const colorLines = mappedBase
      ? (buildColorLines(key, groups.colors[key]) || ['  ' + mappedBase + ': ' + groups.colors[key] + ';'])
      : ['  ' + buildCssVariableName(prefix, 'color', fallbackTokenName) + ': ' + groups.colors[key] + ';'];

    if (i === 0) {
      lines.push('  /* Colors */');
    }

    for (let j = 0; j < colorLines.length; j += 1) {
      lines.push(colorLines[j]);
    }

    if (i < colorKeys.length - 1) {
      lines.push('');
    }
  }

  if (spacingEntries.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('  /* Spacing */');
    for (let i = 0; i < spacingEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'spacing', spacingEntries[i].name) + ': ' + spacingEntries[i].value + ';');
    }
  }

  if (typographyEntries.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('  /* Typography */');
    for (let i = 0; i < typographyEntries.length; i += 1) {
      const entry = typographyEntries[i];
      let tokenPath = null;

      if (entry.group === 'font-family') {
        tokenPath = 'typography.fontFamily.' + entry.entry.name;
      } else if (entry.group === 'font-size') {
        tokenPath = 'typography.fontSize.' + entry.entry.name;
      } else if (entry.group === 'font-weight') {
        tokenPath = 'typography.fontWeight.' + entry.entry.name;
      } else if (entry.group === 'line-height') {
        tokenPath = 'typography.lineHeight.' + entry.entry.name;
      } else if (entry.group === 'letter-spacing') {
        tokenPath = 'typography.letterSpacing.' + entry.entry.name;
      }

      const nativeMapping = tokenPath ? getNativeMapping('ionic', tokenPath) : null;
      const variableName =
        nativeMapping || buildCssVariableName(prefix, entry.group, entry.entry.name);

      lines.push('  ' + variableName + ': ' + entry.entry.value + ';');
    }
  }

  if (radiusEntries.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('  /* Radius */');
    for (let i = 0; i < radiusEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'radius', radiusEntries[i].name) + ': ' + radiusEntries[i].value + ';');
    }
  }

  if (shadowEntries.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('  /* Shadows */');
    for (let i = 0; i < shadowEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'shadow', shadowEntries[i].name) + ': ' + shadowEntries[i].value + ';');
    }
  }

  return buildRootBlock(lines);
}

module.exports = generateIonic;

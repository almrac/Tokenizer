const {
  buildCssVariableName,
  buildRootBlock,
  flattenTokenEntries,
  getTokenGroups,
  normalizeCssPrefix,
} = require('./naming');

// CSS output includes both supported token groups in a single :root block.
function generateCss(tokens, options) {
  const groups = getTokenGroups(tokens);
  const prefix = normalizeCssPrefix(options && options.prefix);
  const lines = [];
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);
  const typographyEntries = flattenTokenEntries(groups.typography);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];
    lines.push('  ' + buildCssVariableName(prefix, 'color', key) + ': ' + groups.colors[key] + ';');
  }

  for (let i = 0; i < spacingKeys.length; i += 1) {
    const key = spacingKeys[i];
    lines.push('  ' + buildCssVariableName(prefix, 'spacing', key) + ': ' + groups.spacing[key] + ';');
  }

  for (let i = 0; i < typographyEntries.length; i += 1) {
    lines.push('  ' + buildCssVariableName(prefix, 'typography', typographyEntries[i].name) + ': ' + typographyEntries[i].value + ';');
  }

  for (let i = 0; i < radiusEntries.length; i += 1) {
    lines.push('  ' + buildCssVariableName(prefix, 'radius', radiusEntries[i].name) + ': ' + radiusEntries[i].value + ';');
  }

  for (let i = 0; i < shadowEntries.length; i += 1) {
    lines.push('  ' + buildCssVariableName(prefix, 'shadow', shadowEntries[i].name) + ': ' + shadowEntries[i].value + ';');
  }

  return buildRootBlock(lines);
}

module.exports = generateCss;

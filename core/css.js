const { buildCssVariableName, buildRootBlock, getTokenGroups, normalizeCssPrefix } = require('./naming');

// CSS output includes both supported token groups in a single :root block.
function generateCss(tokens, options) {
  const groups = getTokenGroups(tokens);
  const prefix = normalizeCssPrefix(options && options.prefix);
  const lines = [];
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];
    lines.push('  ' + buildCssVariableName(prefix, 'color', key) + ': ' + groups.colors[key] + ';');
  }

  for (let i = 0; i < spacingKeys.length; i += 1) {
    const key = spacingKeys[i];
    lines.push('  ' + buildCssVariableName(prefix, 'spacing', key) + ': ' + groups.spacing[key] + ';');
  }

  return buildRootBlock(lines);
}

module.exports = generateCss;

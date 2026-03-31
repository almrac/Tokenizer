const { flattenTokenEntries, getTokenGroups } = require('./naming');

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
  const typographyEntries = flattenTokenEntries(groups.typography);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];

    if (BOOTSTRAP_COLOR_NAMES[key]) {
      lines.push('$' + key + ': ' + groups.colors[key] + ';');
    }
  }

  lines.push('$spacers: (');

  for (let i = 0; i < spacingKeys.length; i += 1) {
    const key = spacingKeys[i];
    lines.push('  "' + key + '": ' + groups.spacing[key] + ',');
  }

  lines.push(');');

  for (let i = 0; i < radiusEntries.length; i += 1) {
    lines.push('$border-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
  }

  for (let i = 0; i < shadowEntries.length; i += 1) {
    lines.push('$box-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
  }

  for (let i = 0; i < typographyEntries.length; i += 1) {
    lines.push('$typography-' + typographyEntries[i].name + ': ' + typographyEntries[i].value + ';');
  }

  return lines.join('\n') + '\n';
}

module.exports = generateBootstrap;

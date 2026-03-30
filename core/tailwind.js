const { getTokenGroups } = require('./naming');

// Tailwind consumes a CommonJS config fragment with colors and spacing under theme.extend.
function generateTailwind(tokens) {
  const groups = getTokenGroups(tokens);
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);
  const lines = [];

  lines.push('module.exports = {');
  lines.push('  theme: {');
  lines.push('    extend: {');
  lines.push('      colors: {');

  for (let i = 0; i < colorKeys.length; i += 1) {
    const key = colorKeys[i];
    lines.push('        ' + JSON.stringify(key) + ': ' + JSON.stringify(groups.colors[key]) + ',');
  }

  lines.push('      },');
  lines.push('      spacing: {');

  for (let i = 0; i < spacingKeys.length; i += 1) {
    const key = spacingKeys[i];
    lines.push('        ' + JSON.stringify(key) + ': ' + JSON.stringify(groups.spacing[key]) + ',');
  }

  lines.push('      }');
  lines.push('    }');
  lines.push('  }');
  lines.push('};');

  return lines.join('\n') + '\n';
}

module.exports = generateTailwind;

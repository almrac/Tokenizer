const { flattenTokenEntries, getSortedKeys, getTokenGroups, getTypographyBuckets } = require('./naming');

function buildObjectSection(indent, label, source, comment) {
  const keys = getSortedKeys(source);

  if (keys.length === 0) {
    return null;
  }

  const lines = [];
  if (comment) {
    lines.push(indent + '/* ' + comment + ' */');
  }
  lines.push(indent + label + ': {');

  for (let i = 0; i < keys.length; i += 1) {
    lines.push(indent + '  ' + JSON.stringify(keys[i]) + ': ' + JSON.stringify(source[keys[i]]) + ',');
  }

  lines.push(indent + '}');
  return lines;
}

function buildEntrySection(indent, label, entries, comment) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const lines = [];
  if (comment) {
    lines.push(indent + '/* ' + comment + ' */');
  }
  lines.push(indent + label + ': {');

  for (let i = 0; i < entries.length; i += 1) {
    lines.push(indent + '  ' + JSON.stringify(entries[i].name) + ': ' + JSON.stringify(entries[i].value) + ',');
  }

  lines.push(indent + '}');
  return lines;
}

function pushSections(lines, sections) {
  const validSections = [];

  for (let i = 0; i < sections.length; i += 1) {
    if (sections[i]) {
      validSections.push(sections[i]);
    }
  }

  for (let i = 0; i < validSections.length; i += 1) {
    const section = validSections[i];

    for (let j = 0; j < section.length; j += 1) {
      const isLastLine = j === section.length - 1;
      const shouldComma = i < validSections.length - 1 && isLastLine;
      lines.push(shouldComma ? section[j] + ',' : section[j]);
    }

    if (i < validSections.length - 1) {
      lines.push('');
    }
  }
}

// Tailwind consumes a CommonJS config fragment with colors and spacing under theme.extend.
function generateTailwind(tokens) {
  const groups = getTokenGroups(tokens);
  const colorKeys = getSortedKeys(groups.colors);
  const spacingKeys = getSortedKeys(groups.spacing);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const typographyBuckets = getTypographyBuckets(groups.typography);
  const typographySections = [];
  const sections = [];
  const lines = [];

  lines.push('module.exports = {');
  lines.push('  theme: {');
  lines.push('    extend: {');
  if (colorKeys.length > 0) {
    sections.push(['      /* Colors */', '      colors: {']);
    for (let i = 0; i < colorKeys.length; i += 1) {
      const key = colorKeys[i];
      sections[sections.length - 1].push('        ' + JSON.stringify(key) + ': ' + JSON.stringify(groups.colors[key]) + ',');
    }
    sections[sections.length - 1].push('      }');
  }

  if (spacingKeys.length > 0) {
    sections.push(['      /* Spacing */', '      spacing: {']);
    for (let i = 0; i < spacingKeys.length; i += 1) {
      const key = spacingKeys[i];
      sections[sections.length - 1].push('        ' + JSON.stringify(key) + ': ' + JSON.stringify(groups.spacing[key]) + ',');
    }
    sections[sections.length - 1].push('      }');
  }

  typographySections.push(buildObjectSection('      ', 'fontFamily', typographyBuckets.fontFamily));
  typographySections.push(buildObjectSection('      ', 'fontSize', typographyBuckets.fontSize));
  typographySections.push(buildObjectSection('      ', 'fontWeight', typographyBuckets.fontWeight));
  typographySections.push(buildObjectSection('      ', 'lineHeight', typographyBuckets.lineHeight));
  typographySections.push(buildObjectSection('      ', 'letterSpacing', typographyBuckets.letterSpacing));

  for (let i = 0; i < typographySections.length; i += 1) {
    if (typographySections[i]) {
      typographySections[i].unshift('      /* Typography */');
      break;
    }
  }

  for (let i = 0; i < typographySections.length; i += 1) {
    sections.push(typographySections[i]);
  }

  sections.push(buildEntrySection('      ', 'borderRadius', radiusEntries, 'Radius'));
  sections.push(buildEntrySection('      ', 'boxShadow', shadowEntries, 'Shadows'));

  pushSections(lines, sections);

  lines.push('    }');
  lines.push('  }');
  lines.push('};');

  return lines.join('\n') + '\n';
}

module.exports = generateTailwind;

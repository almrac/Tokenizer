const { flattenTokenEntries, getTokenGroups, isPlainObject, toKebabCase } = require('./naming');

function createTypographyBuckets() {
  return {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {},
  };
}

function fillTypographyBuckets(typography, buckets) {
  const source = isPlainObject(typography) ? typography : {};
  const keys = Object.keys(source);

  for (let i = 0; i < keys.length; i += 1) {
    const tokenName = toKebabCase(keys[i]);
    const tokenValue = source[keys[i]];

    if (!tokenName || !isPlainObject(tokenValue)) {
      continue;
    }

    if (tokenValue.fontFamily) {
      buckets.fontFamily[tokenName] = tokenValue.fontFamily;
    }

    if (tokenValue.fontSize) {
      buckets.fontSize[tokenName] = tokenValue.fontSize;
    }

    if (tokenValue.fontWeight) {
      buckets.fontWeight[tokenName] = String(tokenValue.fontWeight);
    }

    if (tokenValue.lineHeight) {
      buckets.lineHeight[tokenName] = String(tokenValue.lineHeight);
    }

    if (tokenValue.letterSpacing) {
      buckets.letterSpacing[tokenName] = String(tokenValue.letterSpacing);
    }
  }
}

function buildObjectSection(indent, label, source, comment) {
  const keys = Object.keys(source);

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
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const typographyBuckets = createTypographyBuckets();
  const typographySections = [];
  const sections = [];
  const lines = [];

  fillTypographyBuckets(groups.typography, typographyBuckets);

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

const {
  buildCssVariableName,
  buildRootBlock,
  bucketToEntries,
  flattenTokenEntries,
  getTokenGroups,
  getTypographyBuckets,
  normalizeCssPrefix,
} = require('./naming');

// CSS output includes both supported token groups in a single :root block.
function generateCss(tokens, options) {
  const groups = getTokenGroups(tokens);
  const prefix = normalizeCssPrefix(options && options.prefix);
  const lines = [];
  const colorKeys = Object.keys(groups.colors);
  const spacingKeys = Object.keys(groups.spacing);
  const typographyBuckets = getTypographyBuckets(groups.typography);
  const typographyEntries = []
    .concat(bucketToEntries(typographyBuckets.fontFamily).map((entry) => ({ group: 'font-family', entry })))
    .concat(bucketToEntries(typographyBuckets.fontSize).map((entry) => ({ group: 'font-size', entry })))
    .concat(bucketToEntries(typographyBuckets.fontWeight).map((entry) => ({ group: 'font-weight', entry })))
    .concat(bucketToEntries(typographyBuckets.lineHeight).map((entry) => ({ group: 'line-height', entry })))
    .concat(bucketToEntries(typographyBuckets.letterSpacing).map((entry) => ({ group: 'letter-spacing', entry })));
  const radiusEntries = flattenTokenEntries(groups.radius);
  const shadowEntries = flattenTokenEntries(groups.shadows);
  const sections = [];

  function addSection(label, entries, formatter) {
    if (!entries || entries.length === 0) {
      return;
    }

    const sectionLines = ['  /* ' + label + ' */'];

    for (let i = 0; i < entries.length; i += 1) {
      sectionLines.push(formatter(entries[i]));
    }

    sections.push(sectionLines);
  }

  addSection('Colors', colorKeys, function (key) {
    return '  ' + buildCssVariableName(prefix, 'color', key) + ': ' + groups.colors[key] + ';';
  });

  addSection('Spacing', spacingKeys, function (key) {
    return '  ' + buildCssVariableName(prefix, 'spacing', key) + ': ' + groups.spacing[key] + ';';
  });

  addSection('Typography', typographyEntries, function (entry) {
    return '  ' + buildCssVariableName(prefix, entry.group, entry.entry.name) + ': ' + entry.entry.value + ';';
  });

  addSection('Radius', radiusEntries, function (entry) {
    return '  ' + buildCssVariableName(prefix, 'radius', entry.name) + ': ' + entry.value + ';';
  });

  addSection('Shadows', shadowEntries, function (entry) {
    return '  ' + buildCssVariableName(prefix, 'shadow', entry.name) + ': ' + entry.value + ';';
  });

  for (let i = 0; i < sections.length; i += 1) {
    if (i > 0) {
      lines.push('');
    }

    for (let j = 0; j < sections[i].length; j += 1) {
      lines.push(sections[i][j]);
    }
  }

  return buildRootBlock(lines);
}

module.exports = generateCss;

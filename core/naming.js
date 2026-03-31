// Shared naming and formatting helpers used by all pure generators.

function normalizeCssPrefix(prefix) {
  if (!prefix) {
    return '--';
  }

  const trimmed = String(prefix).trim();

  if (!trimmed) {
    return '--';
  }

  return '--' + trimmed.replace(/^-+/, '') + '-';
}

function buildCssVariableName(prefix, group, tokenName) {
  return prefix + group + '-' + tokenName;
}

function getTokenGroups(tokens) {
  const safeTokens = tokens && typeof tokens === 'object' ? tokens : {};
  const colors = safeTokens.colors && typeof safeTokens.colors === 'object' ? safeTokens.colors : {};
  const spacing = safeTokens.spacing && typeof safeTokens.spacing === 'object' ? safeTokens.spacing : {};
  const typography = safeTokens.typography && typeof safeTokens.typography === 'object' ? safeTokens.typography : {};
  const radius = safeTokens.radius && typeof safeTokens.radius === 'object' ? safeTokens.radius : {};
  const shadows = safeTokens.shadows && typeof safeTokens.shadows === 'object' ? safeTokens.shadows : {};

  return {
    colors: colors,
    spacing: spacing,
    typography: typography,
    radius: radius,
    shadows: shadows,
  };
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function toKebabCase(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function flattenTokenEntries(groupTokens) {
  const source = isPlainObject(groupTokens) ? groupTokens : {};
  const entries = [];
  const keys = Object.keys(source);

  function pushEntries(baseKey, value) {
    if (isPlainObject(value)) {
      const nestedKeys = Object.keys(value);

      for (let i = 0; i < nestedKeys.length; i += 1) {
        pushEntries(baseKey + '-' + toKebabCase(nestedKeys[i]), value[nestedKeys[i]]);
      }

      return;
    }

    if (Array.isArray(value)) {
      entries.push({
        name: baseKey,
        value: value.join(', '),
      });
      return;
    }

    if (value === null || typeof value === 'undefined') {
      return;
    }

    entries.push({
      name: baseKey,
      value: String(value),
    });
  }

  for (let i = 0; i < keys.length; i += 1) {
    const key = toKebabCase(keys[i]);

    if (!key) {
      continue;
    }

    pushEntries(key, source[keys[i]]);
  }

  return entries;
}

function buildRootBlock(lines) {
  if (lines.length === 0) {
    return ':root {\n}\n';
  }

  return ':root {\n' + lines.join('\n') + '\n}\n';
}

module.exports = {
  buildCssVariableName: buildCssVariableName,
  buildRootBlock: buildRootBlock,
  flattenTokenEntries: flattenTokenEntries,
  getTokenGroups: getTokenGroups,
  isPlainObject: isPlainObject,
  normalizeCssPrefix: normalizeCssPrefix,
  toKebabCase: toKebabCase,
};

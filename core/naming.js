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

function sortTokenKeys(keys) {
  return keys.slice().sort(function (a, b) {
    return String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}

function getSortedKeys(source) {
  return sortTokenKeys(Object.keys(source || {}));
}

function flattenTokenEntries(groupTokens) {
  const source = isPlainObject(groupTokens) ? groupTokens : {};
  const entries = [];
  const keys = getSortedKeys(source);

  function pushEntries(baseKey, value) {
    if (isPlainObject(value)) {
      const nestedKeys = getSortedKeys(value);

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

const TYPOGRAPHY_CATEGORIES = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];

function normalizeTokenValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (value === null || typeof value === 'undefined') {
    return null;
  }

  if (isPlainObject(value)) {
    return null;
  }

  return String(value);
}

function getTypographyBuckets(typographyTokens) {
  const source = isPlainObject(typographyTokens) ? typographyTokens : {};
  const buckets = {
    fontFamily: {},
    fontSize: {},
    fontWeight: {},
    lineHeight: {},
    letterSpacing: {},
  };
  const topKeys = getSortedKeys(source);

  for (let i = 0; i < topKeys.length; i += 1) {
    const topKey = topKeys[i];
    const topValue = source[topKey];
    const topCategoryIndex = TYPOGRAPHY_CATEGORIES.indexOf(topKey);

    if (topCategoryIndex !== -1) {
      if (isPlainObject(topValue)) {
        const variantKeys = getSortedKeys(topValue);

        for (let j = 0; j < variantKeys.length; j += 1) {
          const variantName = toKebabCase(variantKeys[j]);
          const normalized = normalizeTokenValue(topValue[variantKeys[j]]);

          if (variantName && normalized !== null) {
            buckets[topKey][variantName] = normalized;
          }
        }
      } else {
        const normalized = normalizeTokenValue(topValue);

        if (normalized !== null) {
          buckets[topKey].base = normalized;
        }
      }

      continue;
    }

    if (!isPlainObject(topValue)) {
      continue;
    }

    const styleName = toKebabCase(topKey);
    if (!styleName) {
      continue;
    }

    for (let j = 0; j < TYPOGRAPHY_CATEGORIES.length; j += 1) {
      const category = TYPOGRAPHY_CATEGORIES[j];
      const normalized = normalizeTokenValue(topValue[category]);

      if (normalized !== null) {
        buckets[category][styleName] = normalized;
      }
    }
  }

  return buckets;
}

function bucketToEntries(bucket) {
  const entries = [];
  const keys = getSortedKeys(bucket);

  for (let i = 0; i < keys.length; i += 1) {
    entries.push({
      name: keys[i],
      value: bucket[keys[i]],
    });
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
  bucketToEntries: bucketToEntries,
  flattenTokenEntries: flattenTokenEntries,
  getTokenGroups: getTokenGroups,
  getTypographyBuckets: getTypographyBuckets,
  getSortedKeys: getSortedKeys,
  isPlainObject: isPlainObject,
  normalizeCssPrefix: normalizeCssPrefix,
  sortTokenKeys: sortTokenKeys,
  toKebabCase: toKebabCase,
};

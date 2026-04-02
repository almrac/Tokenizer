function isObjectRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

const SUPPORTED_GROUPS = {
  colors: true,
  spacing: true,
  typography: true,
  radius: true,
  shadows: true,
};
const TOP_LEVEL_ALIASES = {
  color: 'colors',
  colour: 'colors',
  colours: 'colors',
  space: 'spacing',
  spaces: 'spacing',
  radii: 'radius',
  borderRadius: 'radius',
  shadow: 'shadows',
  boxShadow: 'shadows',
  elevation: 'shadows',
  type: 'typography',
  text: 'typography',
};

function isColorLike(value) {
  const text = String(value || '').trim();

  if (!text) {
    return false;
  }

  if (/^#[0-9a-fA-F]{3,8}$/.test(text)) {
    return true;
  }

  if (/^(rgb|rgba|hsl|hsla)\(/i.test(text)) {
    return true;
  }

  if (/^var\(--[^)]+\)$/.test(text)) {
    return true;
  }

  return /^oklch\(/i.test(text);
}

function collectObjectPathCandidates(source, basePath, depth, candidates) {
  if (!isObjectRecord(source) || depth > 3) {
    return;
  }

  const keys = Object.keys(source);
  candidates.push({
    path: basePath || 'top-level',
    value: source,
    depth: depth,
  });

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const value = source[key];

    if (!isObjectRecord(value)) {
      continue;
    }

    collectObjectPathCandidates(value, basePath ? basePath + '.' + key : key, depth + 1, candidates);
  }
}

function inspectFlatVariantCollection(collection) {
  const tokenNames = Object.keys(collection || {});
  const variantKeysByToken = [];
  let scalarCount = 0;
  let colorLikeCount = 0;

  if (tokenNames.length === 0) {
    return null;
  }

  for (let i = 0; i < tokenNames.length; i += 1) {
    const tokenName = tokenNames[i];
    const tokenValue = collection[tokenName];

    if (!isObjectRecord(tokenValue)) {
      return null;
    }

    const variantKeys = Object.keys(tokenValue);

    if (variantKeys.length === 0) {
      return null;
    }

    variantKeysByToken.push(variantKeys);

    for (let j = 0; j < variantKeys.length; j += 1) {
      const variantValue = tokenValue[variantKeys[j]];

      if (isObjectRecord(variantValue) || Array.isArray(variantValue) || variantValue === null || typeof variantValue === 'undefined') {
        return null;
      }

      scalarCount += 1;
      if (isColorLike(variantValue)) {
        colorLikeCount += 1;
      }
    }
  }

  if (scalarCount === 0) {
    return null;
  }

  const mergedVariantKeys = {};
  for (let i = 0; i < variantKeysByToken.length; i += 1) {
    const keys = variantKeysByToken[i];

    for (let j = 0; j < keys.length; j += 1) {
      mergedVariantKeys[keys[j]] = true;
    }
  }

  return {
    tokenCount: tokenNames.length,
    variantKeys: Object.keys(mergedVariantKeys),
    colorLikeRatio: colorLikeCount / scalarCount,
  };
}

function resolveCanonicalGroupName(key) {
  if (!key) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(SUPPORTED_GROUPS, key)) {
    return key;
  }

  if (Object.prototype.hasOwnProperty.call(TOP_LEVEL_ALIASES, key)) {
    return TOP_LEVEL_ALIASES[key];
  }

  const lowered = String(key).toLowerCase();
  if (Object.prototype.hasOwnProperty.call(TOP_LEVEL_ALIASES, lowered)) {
    return TOP_LEVEL_ALIASES[lowered];
  }

  return null;
}

function replacePathValue(source, path, replacement) {
  if (path === 'top-level') {
    return replacement;
  }

  const parts = String(path).split('.');

  function walk(node, index) {
    if (!isObjectRecord(node)) {
      return node;
    }

    const key = parts[index];
    const clone = Object.assign({}, node);

    if (index === parts.length - 1) {
      clone[key] = replacement;
      return clone;
    }

    clone[key] = walk(node[key], index + 1);
    return clone;
  }

  return walk(source, 0);
}

function resolveAutoVariant(variantKeys) {
  const keys = Array.isArray(variantKeys) ? variantKeys.slice() : [];

  if (keys.length === 1) {
    return {
      selectedVariant: keys[0],
      reason: 'single',
    };
  }

  if (keys.length === 2) {
    const byLower = {};

    for (let i = 0; i < keys.length; i += 1) {
      byLower[String(keys[i]).toLowerCase()] = keys[i];
    }

    if (byLower.light && byLower.dark) {
      return {
        selectedVariant: byLower.light,
        reason: 'light-dark-default',
      };
    }
  }

  return null;
}

function applyFlatVariantCollectionAdapter(rawTokens) {
  const metadata = {
    sourcePattern: null,
    rootUsed: null,
    selectedVariant: null,
    warnings: [],
    errors: [],
    applied: false,
  };

  if (!isObjectRecord(rawTokens)) {
    return {
      adapted: rawTokens,
      metadata: metadata,
    };
  }

  const objectCandidates = [];
  collectObjectPathCandidates(rawTokens, '', 0, objectCandidates);

  for (let i = 0; i < objectCandidates.length; i += 1) {
    const rootCandidate = objectCandidates[i];
    const rootValue = rootCandidate.value;
    const keys = Object.keys(rootValue);

    for (let j = 0; j < keys.length; j += 1) {
      const key = keys[j];
      const maybeCollection = rootValue[key];

      if (!isObjectRecord(maybeCollection)) {
        continue;
      }

      const inspection = inspectFlatVariantCollection(maybeCollection);

      if (!inspection) {
        continue;
      }

      if (inspection.colorLikeRatio < 0.7) {
        continue;
      }

      metadata.sourcePattern = 'flatVariantCollection';
      const collectionPath = rootCandidate.path === 'top-level' ? key : rootCandidate.path + '.' + key;
      metadata.rootUsed = collectionPath;

      const autoVariant = resolveAutoVariant(inspection.variantKeys);

      if (!autoVariant) {
        metadata.errors.push(
          'Flat variant collection "' +
            collectionPath +
            '" contiene múltiples variantes (' +
            inspection.variantKeys.join(', ') +
            '). Indica una variante explícita para importar.'
        );
        return {
          adapted: rawTokens,
          metadata: metadata,
        };
      }

      const selectedVariant = autoVariant.selectedVariant;
      const colorTokens = {};
      const tokenNames = Object.keys(maybeCollection);

      for (let k = 0; k < tokenNames.length; k += 1) {
        const tokenName = tokenNames[k];
        const value = maybeCollection[tokenName][selectedVariant];

        if (value === null || typeof value === 'undefined') {
          continue;
        }

        colorTokens[tokenName] = String(value);
      }

      metadata.selectedVariant = selectedVariant;
      metadata.applied = true;

      const siblingKeys = keys.filter((item) => item !== key);
      const siblingGroupSignals = siblingKeys.filter((siblingKey) => !!resolveCanonicalGroupName(siblingKey));
      const extractedKeyGroup = resolveCanonicalGroupName(key);
      const shouldMergeIntoSiblingRoot = extractedKeyGroup === 'colors' || siblingGroupSignals.length > 0;
      if (shouldMergeIntoSiblingRoot) {
        metadata.rootUsed = rootCandidate.path;
      }

      if (autoVariant.reason === 'light-dark-default') {
        metadata.warnings.push(
            'Se ha seleccionado automáticamente la variante "light" en "' + metadata.rootUsed + '".'
        );
      } else {
        metadata.warnings.push(
          'Flat variant collection detectada en "' +
            metadata.rootUsed +
            '" y normalizada a "colors" usando la variante "' +
            selectedVariant +
            '".'
        );
      }

      if (shouldMergeIntoSiblingRoot) {
        const rebuiltRoot = Object.assign({}, rootValue);
        rebuiltRoot[key] = colorTokens;

        return {
          adapted: replacePathValue(rawTokens, rootCandidate.path, rebuiltRoot),
          metadata: metadata,
        };
      }

      return {
        adapted: {
          colors: colorTokens,
        },
        metadata: metadata,
      };
    }
  }

  return {
    adapted: rawTokens,
    metadata: metadata,
  };
}

module.exports = {
  applyFlatVariantCollectionAdapter: applyFlatVariantCollectionAdapter,
};

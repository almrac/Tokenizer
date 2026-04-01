function isObjectRecord(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

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

  if (/^oklch\(/i.test(text)) {
    return true;
  }

  return false;
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
      metadata.rootUsed = rootCandidate.path === 'top-level' ? key : rootCandidate.path + '.' + key;

      if (inspection.variantKeys.length !== 1) {
        metadata.errors.push(
          'Flat variant collection "' +
            metadata.rootUsed +
            '" contiene múltiples variantes (' +
            inspection.variantKeys.join(', ') +
            '). Indica una variante explícita para importar.'
        );
        return {
          adapted: rawTokens,
          metadata: metadata,
        };
      }

      const selectedVariant = inspection.variantKeys[0];
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
      metadata.warnings.push(
        'Flat variant collection detectada en "' +
          metadata.rootUsed +
          '" y normalizada a "colors" usando la variante "' +
          selectedVariant +
          '".'
      );

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

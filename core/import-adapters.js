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
const TOKEN_VALUE_KEYS = {
  value: true,
  $value: true,
};
const TOKEN_METADATA_KEYS = {
  type: true,
  $type: true,
  description: true,
  $description: true,
  name: true,
  id: true,
};
const TYPOGRAPHY_CATEGORY_KEYS = {
  fontFamily: true,
  fontSize: true,
  fontWeight: true,
  lineHeight: true,
  letterSpacing: true,
  'font-family': true,
  font_family: true,
  fontsize: true,
  'font-size': true,
  font_size: true,
  fontweight: true,
  'font-weight': true,
  font_weight: true,
  lineheight: true,
  'line-height': true,
  line_height: true,
  letterspacing: true,
  'letter-spacing': true,
  letter_spacing: true,
};
const TYPOGRAPHY_IGNORED_EXTRA_KEYS = {
  paragraphSpacing: true,
  paragraphIndent: true,
  textCase: true,
  textDecoration: true,
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

function resolveExplicitVariant(variantKeys, requestedVariant) {
  const available = Array.isArray(variantKeys) ? variantKeys.slice() : [];
  const requested = typeof requestedVariant === 'string' ? requestedVariant.trim() : '';

  if (!requested) {
    return {
      selectedVariant: null,
      error: null,
    };
  }

  if (available.indexOf(requested) !== -1) {
    return {
      selectedVariant: requested,
      error: null,
    };
  }

  const requestedLower = requested.toLowerCase();
  const caseInsensitiveMatches = available.filter((key) => String(key).toLowerCase() === requestedLower);

  if (caseInsensitiveMatches.length === 1) {
    return {
      selectedVariant: caseInsensitiveMatches[0],
      error: null,
    };
  }

  if (caseInsensitiveMatches.length > 1) {
    return {
      selectedVariant: null,
      error:
        'La variante explícita "' +
        requested +
        '" coincide con múltiples variantes por mayúsculas/minúsculas (' +
        caseInsensitiveMatches.join(', ') +
        '). No hay una coincidencia única; usa el nombre exacto.',
    };
  }

  return {
    selectedVariant: null,
    error: null,
  };
}

function isScalarValue(value) {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  );
}

function unwrapLeafTokenEnvelope(value, metadata) {
  if (!isObjectRecord(value)) {
    return value;
  }

  const keys = Object.keys(value);
  let valueKey = null;

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (TOKEN_VALUE_KEYS[key]) {
      if (valueKey) {
        return value;
      }
      valueKey = key;
      continue;
    }

    if (!TOKEN_METADATA_KEYS[key]) {
      return value;
    }
  }

  if (!valueKey) {
    return value;
  }

  if (!isScalarValue(value[valueKey])) {
    return value;
  }

  metadata.unwrappedCount += 1;
  metadata.applied = true;
  return value[valueKey];
}

function unwrapLeafTokenEnvelopesDeep(value, metadata) {
  const direct = unwrapLeafTokenEnvelope(value, metadata);

  if (!isObjectRecord(direct)) {
    return direct;
  }

  const clone = {};
  const keys = Object.keys(direct);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    clone[key] = unwrapLeafTokenEnvelopesDeep(direct[key], metadata);
  }

  return clone;
}

function unwrapTypographyCompoundEnvelope(value, metadata) {
  if (!isObjectRecord(value)) {
    return value;
  }

  const keys = Object.keys(value);
  let valueKey = null;

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];

    if (TOKEN_VALUE_KEYS[key]) {
      if (valueKey) {
        return value;
      }
      valueKey = key;
      continue;
    }

    if (!TOKEN_METADATA_KEYS[key]) {
      return value;
    }
  }

  if (!valueKey) {
    return value;
  }

  const innerValue = value[valueKey];
  if (!isObjectRecord(innerValue)) {
    return value;
  }

  const innerKeys = Object.keys(innerValue);
  if (innerKeys.length === 0) {
    return value;
  }

  let hasSupportedTypographyCategory = false;

  for (let i = 0; i < innerKeys.length; i += 1) {
    const key = innerKeys[i];
    const innerLeaf = innerValue[key];

    if (TYPOGRAPHY_CATEGORY_KEYS[key]) {
      if (isObjectRecord(innerLeaf) || Array.isArray(innerLeaf)) {
        return value;
      }
      hasSupportedTypographyCategory = true;
      continue;
    }

    if (TYPOGRAPHY_IGNORED_EXTRA_KEYS[key]) {
      if (isObjectRecord(innerLeaf) || Array.isArray(innerLeaf)) {
        return value;
      }
      continue;
    }

    return value;
  }

  if (!hasSupportedTypographyCategory) {
    return value;
  }

  metadata.unwrappedCount += 1;
  metadata.applied = true;
  return Object.assign({}, innerValue);
}

function unwrapTypographyCompoundEnvelopesDeep(value, metadata, underTypography) {
  const direct = underTypography ? unwrapTypographyCompoundEnvelope(value, metadata) : value;

  if (!isObjectRecord(direct)) {
    return direct;
  }

  const clone = {};
  const keys = Object.keys(direct);

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const childUnderTypography = underTypography || resolveCanonicalGroupName(key) === 'typography';
    clone[key] = unwrapTypographyCompoundEnvelopesDeep(direct[key], metadata, childUnderTypography);
  }

  return clone;
}

function applyLeafTokenEnvelopeAdapter(rawTokens) {
  const metadata = {
    sourcePattern: null,
    rootUsed: null,
    selectedVariant: null,
    variantSelectionMode: null,
    warnings: [],
    errors: [],
    applied: false,
    unwrappedCount: 0,
  };

  if (!isObjectRecord(rawTokens)) {
    return {
      adapted: rawTokens,
      metadata: metadata,
    };
  }

  const adapted = unwrapLeafTokenEnvelopesDeep(rawTokens, metadata);

  if (metadata.applied) {
    metadata.sourcePattern = 'leafTokenEnvelope';
    metadata.warnings.push(
      'Leaf token envelopes normalizados: ' + metadata.unwrappedCount + ' hoja(s) convertida(s) a valor escalar.'
    );
  }

  return {
    adapted: adapted,
    metadata: metadata,
  };
}

function applyTypographyCompoundAdapter(rawTokens) {
  const metadata = {
    sourcePattern: null,
    rootUsed: null,
    selectedVariant: null,
    variantSelectionMode: null,
    warnings: [],
    errors: [],
    applied: false,
    unwrappedCount: 0,
  };

  if (!isObjectRecord(rawTokens)) {
    return {
      adapted: rawTokens,
      metadata: metadata,
    };
  }

  const adapted = unwrapTypographyCompoundEnvelopesDeep(rawTokens, metadata, false);

  if (metadata.applied) {
    metadata.sourcePattern = 'typographyCompoundEnvelope';
    metadata.warnings.push(
      'Typography compound envelopes normalizados: ' + metadata.unwrappedCount + ' estilo(s) convertidos a objeto plano.'
    );
  }

  return {
    adapted: adapted,
    metadata: metadata,
  };
}

function applyFlatVariantCollectionAdapter(rawTokens, options) {
  const importOptions = isObjectRecord(options) ? options : {};
  const explicitVariant = typeof importOptions.explicitVariant === 'string' ? importOptions.explicitVariant.trim() : '';
  const metadata = {
    sourcePattern: null,
    rootUsed: null,
    selectedVariant: null,
    variantSelectionMode: null,
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
      const requestedVariant = resolveExplicitVariant(inspection.variantKeys, explicitVariant);

      if (requestedVariant.error) {
        metadata.errors.push(requestedVariant.error);
        return {
          adapted: rawTokens,
          metadata: metadata,
        };
      }

      if (explicitVariant && !requestedVariant.selectedVariant) {
        metadata.errors.push(
          'La variante explícita "' +
            explicitVariant +
            '" no existe en "' +
            collectionPath +
            '". Variantes disponibles: ' +
            inspection.variantKeys.join(', ') +
            '. Usa una de las variantes listadas.'
        );
        return {
          adapted: rawTokens,
          metadata: metadata,
        };
      }

      const autoVariant = resolveAutoVariant(inspection.variantKeys);

      if (!autoVariant && !requestedVariant.selectedVariant) {
        metadata.errors.push(
          'Se detectó una colección con múltiples variantes en "' +
            collectionPath +
            '". Variantes disponibles: ' +
            inspection.variantKeys.join(', ') +
            '. No hay una selección automática segura. Selecciona una variante explícita para continuar.'
        );
        return {
          adapted: rawTokens,
          metadata: metadata,
        };
      }

      const selectedVariant = requestedVariant.selectedVariant || autoVariant.selectedVariant;
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
      metadata.variantSelectionMode = requestedVariant.selectedVariant ? 'explicit' : autoVariant.reason;
      metadata.applied = true;

      const siblingKeys = keys.filter((item) => item !== key);
      const siblingGroupSignals = siblingKeys.filter((siblingKey) => !!resolveCanonicalGroupName(siblingKey));
      const extractedKeyGroup = resolveCanonicalGroupName(key);
      const shouldMergeIntoSiblingRoot = extractedKeyGroup === 'colors' || siblingGroupSignals.length > 0;
      if (shouldMergeIntoSiblingRoot) {
        metadata.rootUsed = rootCandidate.path;
      }

      if (requestedVariant.selectedVariant) {
        metadata.warnings.push('Se usó la variante explícita "' + selectedVariant + '" en "' + metadata.rootUsed + '".');
      } else if (autoVariant.reason === 'light-dark-default') {
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
  applyLeafTokenEnvelopeAdapter: applyLeafTokenEnvelopeAdapter,
  applyTypographyCompoundAdapter: applyTypographyCompoundAdapter,
  applyFlatVariantCollectionAdapter: applyFlatVariantCollectionAdapter,
};

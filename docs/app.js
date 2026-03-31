(function () {
  var basicExampleTokens = {
    colors: {
      primary: '#005bc0',
      secondary: '#5d5f65',
      success: '#2ea96d',
      danger: '#d74a49'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px'
    }
  };

  var outputFiles = {
    css: 'tokens.css',
    ionic: 'variables.scss',
    bootstrap: 'bootstrap-overrides.scss',
    tailwind: 'tailwind.tokens.js'
  };

  var bootstrapColorNames = {
    primary: true,
    secondary: true,
    success: true,
    danger: true,
    warning: true,
    info: true,
    light: true,
    dark: true
  };
  var supportedGroups = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
  var topLevelAliases = {
    color: 'colors',
    colours: 'colors',
    space: 'spacing',
    spaces: 'spacing',
    radii: 'radius',
    borderRadius: 'radius',
    shadow: 'shadows',
    boxShadow: 'shadows',
    elevation: 'shadows',
    type: 'typography',
    text: 'typography'
  };
  var typographyAliases = {
    'font-family': 'fontFamily',
    font_family: 'fontFamily',
    fontfamily: 'fontFamily',
    'font-size': 'fontSize',
    font_size: 'fontSize',
    fontsize: 'fontSize',
    'font-weight': 'fontWeight',
    font_weight: 'fontWeight',
    fontweight: 'fontWeight',
    'line-height': 'lineHeight',
    line_height: 'lineHeight',
    lineheight: 'lineHeight',
    'letter-spacing': 'letterSpacing',
    letter_spacing: 'letterSpacing',
    letterspacing: 'letterSpacing'
  };
  var targetGroupSupport = {
    css: { colors: true, spacing: true, typography: true, radius: true, shadows: true },
    ionic: { colors: true, spacing: true, typography: true, radius: true, shadows: true },
    bootstrap: { colors: true, spacing: true, typography: true, radius: true, shadows: true },
    tailwind: { colors: true, spacing: true, typography: true, radius: true, shadows: true }
  };

  var tokensInput = document.querySelector('[data-ui="tokens-input"]');
  var fileInput = document.querySelector('[data-ui="file-input"]');
  var targetSelect = document.querySelector('[data-ui="target-select"]');
  var multiExportToggle = document.querySelector('[data-ui="multi-export-toggle"]');
  var targetGroup = document.querySelector('[data-ui="target-group"]');
  var targetOptions = Array.prototype.slice.call(document.querySelectorAll('[data-ui="target-option"]'));
  var previewSwitch = document.querySelector('[data-ui="preview-switch"]');
  var previewTabs = document.querySelector('[data-ui="preview-tabs"]');
  var prefixField = document.querySelector('[data-ui="prefix-field"]');
  var prefixInput = document.querySelector('[data-ui="prefix-input"]');
  var filename = document.querySelector('[data-ui="filename"]');
  var outputPreview = document.querySelector('[data-ui="output-preview"]');
  var errorMessage = document.querySelector('[data-ui="error-message"]');
  var infoMessage = document.querySelector('[data-ui="info-message"]');
  var warningMessage = document.querySelector('[data-ui="warning-message"]');
  var copyButton = document.querySelector('[data-ui="copy-button"]');
  var downloadButton = document.querySelector('[data-ui="download-button"]');
  var statusBadge = document.querySelector('[data-ui="status-badge"]');
  var exampleButton = document.querySelector('[data-ui="example-button"]');
  var clearButton = document.querySelector('[data-ui="clear-button"]');
  var emptyState = document.querySelector('[data-ui="empty-state"]');
  var defaultCopyLabel = 'Copiar';
  var copyResetTimer = 0;
  var generatedOutputs = {};
  var activePreviewTarget = 'css';
  var preferredPreviewTarget = '';

  function normalizeCssPrefix(prefix) {
    if (!prefix) {
      return '--';
    }

    var trimmed = String(prefix).trim();
    var normalized;

    if (!trimmed) {
      return '--';
    }

    normalized = trimmed.replace(/^-+/, '');

    if (!normalized) {
      return '--';
    }

    return '--' + normalized + '-';
  }

  function getTokenGroups(tokens) {
    var safeTokens = tokens && typeof tokens === 'object' ? tokens : {};
    var colors = safeTokens.colors && typeof safeTokens.colors === 'object' ? safeTokens.colors : {};
    var spacing = safeTokens.spacing && typeof safeTokens.spacing === 'object' ? safeTokens.spacing : {};
    var typography = safeTokens.typography && typeof safeTokens.typography === 'object' ? safeTokens.typography : {};
    var radius = safeTokens.radius && typeof safeTokens.radius === 'object' ? safeTokens.radius : {};
    var shadows = safeTokens.shadows && typeof safeTokens.shadows === 'object' ? safeTokens.shadows : {};

    return {
      colors: colors,
      spacing: spacing,
      typography: typography,
      radius: radius,
      shadows: shadows
    };
  }

  function joinQuoted(values) {
    return values.map(function (value) {
      return '"' + value + '"';
    }).join(', ');
  }

  function groupHasValues(tokens, groupName) {
    if (!isPlainObject(tokens) || !isPlainObject(tokens[groupName])) {
      return false;
    }

    return Object.keys(tokens[groupName]).length > 0;
  }

  function getAliasTargetKey(key, aliases) {
    var direct = aliases[key];
    var lowered;

    if (direct) {
      return direct;
    }

    lowered = String(key).toLowerCase();

    if (aliases[lowered]) {
      return aliases[lowered];
    }

    return null;
  }

  function mergeObjectRecords(baseRecord, incomingRecord, context, infoMessages) {
    var merged = Object.assign({}, baseRecord);
    var keys = Object.keys(incomingRecord);
    var i;
    var key;

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];

      if (!Object.prototype.hasOwnProperty.call(merged, key)) {
        merged[key] = incomingRecord[key];
        continue;
      }

      if (isPlainObject(merged[key]) && isPlainObject(incomingRecord[key])) {
        merged[key] = mergeObjectRecords(merged[key], incomingRecord[key], context + '.' + key, infoMessages);
        continue;
      }

      infoMessages.push('Conflicto en "' + context + '.' + key + '": se mantiene el valor existente y se ignora el alias.');
    }

    return merged;
  }

  function normalizeTypographyGroup(typographySource, infoMessages) {
    var normalized;
    var keys;
    var i;
    var originalKey;
    var value;
    var mappedKey;
    var normalizedValue;

    if (!isPlainObject(typographySource)) {
      return typographySource;
    }

    normalized = {};
    keys = Object.keys(typographySource);

    for (i = 0; i < keys.length; i += 1) {
      originalKey = keys[i];
      value = typographySource[originalKey];
      mappedKey = getAliasTargetKey(originalKey, typographyAliases) || originalKey;
      normalizedValue = isPlainObject(value) ? normalizeTypographyGroup(value, infoMessages) : value;

      if (mappedKey !== originalKey) {
        infoMessages.push('Clave de typography normalizada de "' + originalKey + '" a "' + mappedKey + '".');
      }

      if (Object.prototype.hasOwnProperty.call(normalized, mappedKey)) {
        if (isPlainObject(normalized[mappedKey]) && isPlainObject(normalizedValue)) {
          normalized[mappedKey] = mergeObjectRecords(
            normalized[mappedKey],
            normalizedValue,
            'typography.' + mappedKey,
            infoMessages
          );
        } else {
          infoMessages.push(
            'Conflicto en "typography.' + mappedKey + '": se mantiene el valor existente y se ignora la variante.'
          );
        }
        continue;
      }

      normalized[mappedKey] = normalizedValue;
    }

    return normalized;
  }

  function normalizeTokenInput(rawTokens) {
    var info = [];
    var errors = [];
    var normalized;
    var keys;
    var i;
    var originalKey;
    var value;
    var canonicalKey;
    var isCanonical;
    var normalizedValue;

    if (!isPlainObject(rawTokens)) {
      return {
        normalized: rawTokens,
        info: info,
        errors: errors
      };
    }

    normalized = {};
    keys = Object.keys(rawTokens);

    for (i = 0; i < keys.length; i += 1) {
      originalKey = keys[i];
      value = rawTokens[originalKey];
      canonicalKey = getAliasTargetKey(originalKey, topLevelAliases) || originalKey;
      isCanonical = supportedGroups.indexOf(originalKey) !== -1;
      normalizedValue =
        canonicalKey === 'typography' && isPlainObject(value) ? normalizeTypographyGroup(value, info) : value;

      if (canonicalKey !== originalKey) {
        info.push('Grupo top-level normalizado de "' + originalKey + '" a "' + canonicalKey + '".');
      }

      if (!Object.prototype.hasOwnProperty.call(normalized, canonicalKey)) {
        normalized[canonicalKey] = normalizedValue;
        continue;
      }

      if (isCanonical) {
        info.push('Se mantiene el grupo canónico "' + canonicalKey + '" y se ignora la variante duplicada.');
        continue;
      }

      if (isPlainObject(normalized[canonicalKey]) && isPlainObject(normalizedValue)) {
        normalized[canonicalKey] = mergeObjectRecords(
          normalized[canonicalKey],
          normalizedValue,
          canonicalKey,
          info
        );
      } else {
        info.push('Conflicto al normalizar "' + originalKey + '" en "' + canonicalKey + '": se mantiene el valor canónico.');
      }
    }

    return {
      normalized: normalized,
      info: info,
      errors: errors
    };
  }

  function validateTokenInput(tokens, target) {
    var errors = [];
    var warnings = [];
    var support = targetGroupSupport[target] || targetGroupSupport.css;
    var topLevelKeys;
    var unsupportedTopLevel;
    var supportedPresentGroups;
    var ignoredGroups;
    var colorKeys;
    var ignoredColorKeys;
    var i;
    var groupName;

    if (!isPlainObject(tokens)) {
      errors.push('La raíz del JSON debe ser un objeto con grupos de tokens (por ejemplo: colors, spacing).');
      return {
        errors: errors,
        warnings: warnings,
        supportedGroups: [],
        unsupportedGroups: [],
        ignoredGroups: []
      };
    }

    topLevelKeys = Object.keys(tokens);
    unsupportedTopLevel = topLevelKeys.filter(function (key) {
      return supportedGroups.indexOf(key) === -1;
    });

    if (unsupportedTopLevel.length > 0) {
      warnings.push('Grupos no soportados: ' + joinQuoted(unsupportedTopLevel) + '. Se ignorarán en la generación.');
    }

    for (i = 0; i < supportedGroups.length; i += 1) {
      groupName = supportedGroups[i];

      if (Object.prototype.hasOwnProperty.call(tokens, groupName) && !isPlainObject(tokens[groupName])) {
        errors.push('El grupo "' + groupName + '" debe ser un objeto.');
      }
    }

    if (errors.length > 0) {
      return {
        errors: errors,
        warnings: warnings,
        supportedGroups: [],
        unsupportedGroups: unsupportedTopLevel,
        ignoredGroups: []
      };
    }

    supportedPresentGroups = supportedGroups.filter(function (name) {
      return groupHasValues(tokens, name);
    });
    ignoredGroups = supportedPresentGroups.filter(function (name) {
      return !support[name];
    });

    if (supportedPresentGroups.length === 0) {
      if (unsupportedTopLevel.length > 0) {
        errors.push(
          'No hay grupos soportados con contenido para generar. Grupos soportados: ' +
          joinQuoted(supportedGroups) +
          '. Detectados no soportados: ' +
          joinQuoted(unsupportedTopLevel) +
          '.'
        );
      } else {
        errors.push(
          'No se detectaron grupos soportados con contenido para generar. Añade al menos uno de: ' +
          joinQuoted(supportedGroups) +
          '.'
        );
      }

      return {
        errors: errors,
        warnings: warnings,
        supportedGroups: supportedPresentGroups,
        unsupportedGroups: unsupportedTopLevel,
        ignoredGroups: ignoredGroups
      };
    }

    if (ignoredGroups.length > 0) {
      warnings.push('El target "' + target + '" ignora los grupos: ' + joinQuoted(ignoredGroups) + '.');
    }

    if (target === 'bootstrap' && isPlainObject(tokens.colors)) {
      colorKeys = Object.keys(tokens.colors);
      ignoredColorKeys = colorKeys.filter(function (key) {
        return !bootstrapColorNames[key];
      });

      if (ignoredColorKeys.length > 0) {
        warnings.push('Bootstrap solo aplica colores estándar. Se ignorarán: ' + joinQuoted(ignoredColorKeys) + '.');
      }
    }

    if (isPlainObject(tokens.typography)) {
      var typographyBuckets = getTypographyBuckets(tokens.typography);
      var hasTypographyMappings =
        Object.keys(typographyBuckets.fontFamily).length > 0 ||
        Object.keys(typographyBuckets.fontSize).length > 0 ||
        Object.keys(typographyBuckets.fontWeight).length > 0 ||
        Object.keys(typographyBuckets.lineHeight).length > 0 ||
        Object.keys(typographyBuckets.letterSpacing).length > 0;

      if (!hasTypographyMappings && groupHasValues(tokens, 'typography')) {
        warnings.push(
          'El grupo "typography" no contiene claves mapeables (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing) y se ignorará.'
        );
      }
    }

    return {
      errors: errors,
      warnings: warnings,
      supportedGroups: supportedPresentGroups,
      unsupportedGroups: unsupportedTopLevel,
      ignoredGroups: ignoredGroups
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
    var source = isPlainObject(groupTokens) ? groupTokens : {};
    var keys = Object.keys(source);
    var entries = [];

    function pushEntries(baseKey, value) {
      var nestedKeys;
      var i;

      if (isPlainObject(value)) {
        nestedKeys = Object.keys(value);

        for (i = 0; i < nestedKeys.length; i += 1) {
          pushEntries(baseKey + '-' + toKebabCase(nestedKeys[i]), value[nestedKeys[i]]);
        }

        return;
      }

      if (Array.isArray(value)) {
        entries.push({
          name: baseKey,
          value: value.join(', ')
        });
        return;
      }

      if (value === null || typeof value === 'undefined') {
        return;
      }

      entries.push({
        name: baseKey,
        value: String(value)
      });
    }

    for (var i = 0; i < keys.length; i += 1) {
      var key = toKebabCase(keys[i]);

      if (!key) {
        continue;
      }

      pushEntries(key, source[keys[i]]);
    }

    return entries;
  }

  var typographyCategories = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'];

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
    var source = isPlainObject(typographyTokens) ? typographyTokens : {};
    var buckets = {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    };
    var topKeys = Object.keys(source);
    var i;
    var j;
    var topKey;
    var topValue;
    var styleName;
    var variantKeys;
    var variantName;
    var normalized;
    var category;

    for (i = 0; i < topKeys.length; i += 1) {
      topKey = topKeys[i];
      topValue = source[topKey];

      if (typographyCategories.indexOf(topKey) !== -1) {
        if (isPlainObject(topValue)) {
          variantKeys = Object.keys(topValue);

          for (j = 0; j < variantKeys.length; j += 1) {
            variantName = toKebabCase(variantKeys[j]);
            normalized = normalizeTokenValue(topValue[variantKeys[j]]);

            if (variantName && normalized !== null) {
              buckets[topKey][variantName] = normalized;
            }
          }
        } else {
          normalized = normalizeTokenValue(topValue);

          if (normalized !== null) {
            buckets[topKey].base = normalized;
          }
        }

        continue;
      }

      if (!isPlainObject(topValue)) {
        continue;
      }

      styleName = toKebabCase(topKey);
      if (!styleName) {
        continue;
      }

      for (j = 0; j < typographyCategories.length; j += 1) {
        category = typographyCategories[j];
        normalized = normalizeTokenValue(topValue[category]);

        if (normalized !== null) {
          buckets[category][styleName] = normalized;
        }
      }
    }

    return buckets;
  }

  function bucketToEntries(bucket) {
    var entries = [];
    var keys = Object.keys(bucket);
    var i;

    for (i = 0; i < keys.length; i += 1) {
      entries.push({
        name: keys[i],
        value: bucket[keys[i]]
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

  function buildCssVariableName(prefix, group, tokenName) {
    if (prefix === '--') {
      return '--' + group + '-' + tokenName;
    }

    return prefix + group + '-' + tokenName;
  }

  function clampChannel(value) {
    if (value < 0) {
      return 0;
    }

    if (value > 255) {
      return 255;
    }

    return value;
  }

  function hexToRgb(hex) {
    var normalized = String(hex).trim().replace(/^#/, '');

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
      return null;
    }

    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgbToHex(rgb) {
    var parts = [rgb.r, rgb.g, rgb.b];
    var value = '#';
    var i;

    for (i = 0; i < parts.length; i += 1) {
      var part = clampChannel(parts[i]).toString(16);
      value += part.length === 1 ? '0' + part : part;
    }

    return value;
  }

  function shiftColor(rgb, amount) {
    return {
      r: clampChannel(Math.round(rgb.r + amount)),
      g: clampChannel(Math.round(rgb.g + amount)),
      b: clampChannel(Math.round(rgb.b + amount))
    };
  }

  function getContrastRgb(rgb) {
    var brightness = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;

    if (brightness >= 186) {
      return { r: 0, g: 0, b: 0 };
    }

    return { r: 255, g: 255, b: 255 };
  }

  function generateCss(tokens, options) {
    var groups = getTokenGroups(tokens);
    var prefix = normalizeCssPrefix(options && options.prefix);
    var lines = [];
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var typographyBuckets = getTypographyBuckets(groups.typography);
    var typographyEntries = []
      .concat(bucketToEntries(typographyBuckets.fontFamily).map(function (entry) { return { group: 'font-family', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.fontSize).map(function (entry) { return { group: 'font-size', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.fontWeight).map(function (entry) { return { group: 'font-weight', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.lineHeight).map(function (entry) { return { group: 'line-height', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.letterSpacing).map(function (entry) { return { group: 'letter-spacing', entry: entry }; }));
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var sections = [];
    var i;
    var j;

    function addSection(label, entries, formatter) {
      var sectionLines = [];

      if (!entries || entries.length === 0) {
        return;
      }

      sectionLines.push('  /* ' + label + ' */');

      for (i = 0; i < entries.length; i += 1) {
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

    for (i = 0; i < sections.length; i += 1) {
      if (i > 0) {
        lines.push('');
      }

      for (j = 0; j < sections[i].length; j += 1) {
        lines.push(sections[i][j]);
      }
    }

    return buildRootBlock(lines);
  }

  function buildIonicColorLines(name, value) {
    var rgb = hexToRgb(value);

    if (!rgb) {
      return [
        '  --ion-color-' + name + ': ' + value + ';'
      ];
    }

    var contrast = getContrastRgb(rgb);
    var shade = shiftColor(rgb, -18);
    var tint = shiftColor(rgb, 18);

    return [
      '  --ion-color-' + name + ': ' + value + ';',
      '  --ion-color-' + name + '-rgb: ' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ';',
      '  --ion-color-' + name + '-contrast: ' + rgbToHex(contrast) + ';',
      '  --ion-color-' + name + '-contrast-rgb: ' + contrast.r + ', ' + contrast.g + ', ' + contrast.b + ';',
      '  --ion-color-' + name + '-shade: ' + rgbToHex(shade) + ';',
      '  --ion-color-' + name + '-tint: ' + rgbToHex(tint) + ';'
    ];
  }

  function generateIonic(tokens, options) {
    var groups = getTokenGroups(tokens);
    var prefix = normalizeCssPrefix(options && options.prefix);
    var keys = Object.keys(groups.colors);
    var spacingEntries = flattenTokenEntries(groups.spacing);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var typographyBuckets = getTypographyBuckets(groups.typography);
    var typographyEntries = []
      .concat(bucketToEntries(typographyBuckets.fontFamily).map(function (entry) { return { group: 'font-family', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.fontSize).map(function (entry) { return { group: 'font-size', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.fontWeight).map(function (entry) { return { group: 'font-weight', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.lineHeight).map(function (entry) { return { group: 'line-height', entry: entry }; }))
      .concat(bucketToEntries(typographyBuckets.letterSpacing).map(function (entry) { return { group: 'letter-spacing', entry: entry }; }));
    var lines = [];
    var i;
    var j;
    var colorLines;

    for (i = 0; i < keys.length; i += 1) {
      colorLines = buildIonicColorLines(keys[i], groups.colors[keys[i]]);

      if (i === 0) {
        lines.push('  /* Colors */');
      }

      for (j = 0; j < colorLines.length; j += 1) {
        lines.push(colorLines[j]);
      }

      if (i < keys.length - 1) {
        lines.push('');
      }
    }

    if (spacingEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Spacing */');
      for (i = 0; i < spacingEntries.length; i += 1) {
        lines.push('  ' + buildCssVariableName(prefix, 'spacing', spacingEntries[i].name) + ': ' + spacingEntries[i].value + ';');
      }
    }

    if (typographyEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Typography */');
      for (i = 0; i < typographyEntries.length; i += 1) {
        lines.push('  ' + buildCssVariableName(prefix, typographyEntries[i].group, typographyEntries[i].entry.name) + ': ' + typographyEntries[i].entry.value + ';');
      }
    }

    if (radiusEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Radius */');
      for (i = 0; i < radiusEntries.length; i += 1) {
        lines.push('  ' + buildCssVariableName(prefix, 'radius', radiusEntries[i].name) + ': ' + radiusEntries[i].value + ';');
      }
    }

    if (shadowEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Shadows */');
      for (i = 0; i < shadowEntries.length; i += 1) {
        lines.push('  ' + buildCssVariableName(prefix, 'shadow', shadowEntries[i].name) + ': ' + shadowEntries[i].value + ';');
      }
    }

    return buildRootBlock(lines);
  }

  function generateBootstrap(tokens) {
    var groups = getTokenGroups(tokens);
    var lines = [];
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var typographyBuckets = getTypographyBuckets(groups.typography);
    var colorEntries = [];
    var typographyBaseLines = [];
    var typographyMapLines = [];
    var i;
    var radiusMap = {};
    var shadowMap = {};

    function pickBaseValue(bucket) {
      var keys;
      if (bucket.base) {
        return bucket.base;
      }
      if (bucket.body) {
        return bucket.body;
      }
      keys = Object.keys(bucket);
      return keys.length > 0 ? bucket[keys[0]] : null;
    }

    function buildScssMap(variableName, bucket) {
      var keys = Object.keys(bucket);
      var mapLines = [];
      var j;

      if (keys.length === 0) {
        return null;
      }

      mapLines.push(variableName + ': (');
      for (j = 0; j < keys.length; j += 1) {
        mapLines.push('  "' + keys[j] + '": ' + bucket[keys[j]] + ',');
      }
      mapLines.push(');');
      return mapLines;
    }

    for (i = 0; i < colorKeys.length; i += 1) {
      if (bootstrapColorNames[colorKeys[i]]) {
        colorEntries.push('$' + colorKeys[i] + ': ' + groups.colors[colorKeys[i]] + ';');
      }
    }

    if (colorEntries.length > 0) {
      lines.push('/* Colors */');
      for (i = 0; i < colorEntries.length; i += 1) {
        lines.push(colorEntries[i]);
      }
    }

    if (spacingKeys.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Spacing */');
      lines.push('$spacers: (');
      for (i = 0; i < spacingKeys.length; i += 1) {
        lines.push('  "' + spacingKeys[i] + '": ' + groups.spacing[spacingKeys[i]] + ',');
      }
      lines.push(');');
    }

    var fontFamilyBase = pickBaseValue(typographyBuckets.fontFamily);
    var fontSizeBase = pickBaseValue(typographyBuckets.fontSize);
    var fontWeightBase = pickBaseValue(typographyBuckets.fontWeight);
    var lineHeightBase = pickBaseValue(typographyBuckets.lineHeight);

    if (fontFamilyBase) {
      typographyBaseLines.push('$font-family-base: ' + fontFamilyBase + ';');
    }
    if (fontSizeBase) {
      typographyBaseLines.push('$font-size-base: ' + fontSizeBase + ';');
    }
    if (fontWeightBase) {
      typographyBaseLines.push('$font-weight-base: ' + fontWeightBase + ';');
    }
    if (lineHeightBase) {
      typographyBaseLines.push('$line-height-base: ' + lineHeightBase + ';');
    }

    var fontSizesMap = buildScssMap('$font-sizes', typographyBuckets.fontSize);
    var fontWeightsMap = buildScssMap('$font-weights', typographyBuckets.fontWeight);
    var lineHeightsMap = buildScssMap('$line-heights', typographyBuckets.lineHeight);

    if (fontSizesMap) {
      typographyMapLines = typographyMapLines.concat(fontSizesMap);
    }
    if (fontWeightsMap) {
      typographyMapLines = typographyMapLines.concat(fontWeightsMap);
    }
    if (lineHeightsMap) {
      typographyMapLines = typographyMapLines.concat(lineHeightsMap);
    }

    if (typographyBaseLines.length > 0 || typographyMapLines.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Typography */');
      for (i = 0; i < typographyBaseLines.length; i += 1) {
        lines.push(typographyBaseLines[i]);
      }

      if (typographyMapLines.length > 0) {
        if (typographyBaseLines.length > 0) {
          lines.push('');
        }
        for (i = 0; i < typographyMapLines.length; i += 1) {
          lines.push(typographyMapLines[i]);
        }
      }
    }

    if (radiusEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Radius */');
      for (i = 0; i < radiusEntries.length; i += 1) {
        lines.push('$border-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
        radiusMap[radiusEntries[i].name] = radiusEntries[i].value;
      }

      if (radiusMap.base || radiusMap.md) {
        lines.push('$border-radius: ' + (radiusMap.base || radiusMap.md) + ';');
      }
    }

    if (shadowEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('/* Shadows */');
      for (i = 0; i < shadowEntries.length; i += 1) {
        lines.push('$box-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
        shadowMap[shadowEntries[i].name] = shadowEntries[i].value;
      }

      if (shadowMap.base || shadowMap.md) {
        lines.push('$box-shadow: ' + (shadowMap.base || shadowMap.md) + ';');
      }
    }

    return lines.join('\n') + '\n';
  }

  function buildObjectSection(indent, label, source, comment) {
    var keys = Object.keys(source);
    var lines = [];
    var i;

    if (keys.length === 0) {
      return null;
    }

    if (comment) {
      lines.push(indent + '/* ' + comment + ' */');
    }

    lines.push(indent + label + ': {');

    for (i = 0; i < keys.length; i += 1) {
      lines.push(indent + '  ' + JSON.stringify(keys[i]) + ': ' + JSON.stringify(source[keys[i]]) + ',');
    }

    lines.push(indent + '}');
    return lines;
  }

  function buildEntrySection(indent, label, entries, comment) {
    var lines = [];
    var i;

    if (!entries || entries.length === 0) {
      return null;
    }

    if (comment) {
      lines.push(indent + '/* ' + comment + ' */');
    }

    lines.push(indent + label + ': {');

    for (i = 0; i < entries.length; i += 1) {
      lines.push(indent + '  ' + JSON.stringify(entries[i].name) + ': ' + JSON.stringify(entries[i].value) + ',');
    }

    lines.push(indent + '}');
    return lines;
  }

  function pushSections(lines, sections) {
    var validSections = [];
    var i;
    var j;
    var section;
    var isLastLine;
    var shouldComma;

    for (i = 0; i < sections.length; i += 1) {
      if (sections[i]) {
        validSections.push(sections[i]);
      }
    }

    for (i = 0; i < validSections.length; i += 1) {
      section = validSections[i];

      for (j = 0; j < section.length; j += 1) {
        isLastLine = j === section.length - 1;
        shouldComma = i < validSections.length - 1 && isLastLine;
        lines.push(shouldComma ? section[j] + ',' : section[j]);
      }

      if (i < validSections.length - 1) {
        lines.push('');
      }
    }
  }

  function generateTailwind(tokens) {
    var groups = getTokenGroups(tokens);
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var typographyBuckets = getTypographyBuckets(groups.typography);
    var typographySections = [];
    var sections = [];
    var lines = [];
    var i;

    lines.push('module.exports = {');
    lines.push('  theme: {');
    lines.push('    extend: {');

    if (colorKeys.length > 0) {
      sections.push(['      /* Colors */', '      colors: {']);
      for (i = 0; i < colorKeys.length; i += 1) {
        sections[sections.length - 1].push('        ' + JSON.stringify(colorKeys[i]) + ': ' + JSON.stringify(groups.colors[colorKeys[i]]) + ',');
      }
      sections[sections.length - 1].push('      }');
    }

    if (spacingKeys.length > 0) {
      sections.push(['      /* Spacing */', '      spacing: {']);
      for (i = 0; i < spacingKeys.length; i += 1) {
        sections[sections.length - 1].push('        ' + JSON.stringify(spacingKeys[i]) + ': ' + JSON.stringify(groups.spacing[spacingKeys[i]]) + ',');
      }
      sections[sections.length - 1].push('      }');
    }

    typographySections.push(buildObjectSection('      ', 'fontFamily', typographyBuckets.fontFamily));
    typographySections.push(buildObjectSection('      ', 'fontSize', typographyBuckets.fontSize));
    typographySections.push(buildObjectSection('      ', 'fontWeight', typographyBuckets.fontWeight));
    typographySections.push(buildObjectSection('      ', 'lineHeight', typographyBuckets.lineHeight));
    typographySections.push(buildObjectSection('      ', 'letterSpacing', typographyBuckets.letterSpacing));

    for (i = 0; i < typographySections.length; i += 1) {
      if (typographySections[i]) {
        typographySections[i].unshift('      /* Typography */');
        break;
      }
    }

    for (i = 0; i < typographySections.length; i += 1) {
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

  function getGenerator(target) {
    if (target === 'css') {
      return generateCss;
    }

    if (target === 'ionic') {
      return generateIonic;
    }

    if (target === 'bootstrap') {
      return generateBootstrap;
    }

    if (target === 'tailwind') {
      return generateTailwind;
    }

    throw new Error('Unsupported target: ' + target);
  }

  function getSelectedTargets() {
    if (!multiExportToggle || !multiExportToggle.checked) {
      return [targetSelect && targetSelect.value ? targetSelect.value : 'css'];
    }

    var selected = [];
    var i;

    for (i = 0; i < targetOptions.length; i += 1) {
      if (targetOptions[i].checked) {
        selected.push(targetOptions[i].value);
      }
    }

    return selected;
  }

  function setSelectedTargets(targets) {
    var targetSet = {};
    var i;

    for (i = 0; i < targets.length; i += 1) {
      targetSet[targets[i]] = true;
    }

    for (i = 0; i < targetOptions.length; i += 1) {
      targetOptions[i].checked = !!targetSet[targetOptions[i].value];
    }
  }

  function ensureAtLeastOneTarget(changedOption) {
    if (!multiExportToggle || !multiExportToggle.checked) {
      return;
    }

    if (getSelectedTargets().length > 0) {
      return;
    }

    if (changedOption) {
      changedOption.checked = true;
    } else if (targetSelect && targetSelect.value) {
      setSelectedTargets([targetSelect.value]);
    } else if (targetOptions.length > 0) {
      targetOptions[0].checked = true;
    }
  }

  function updateMultiExportVisibility() {
    if (!targetGroup) {
      return;
    }

    targetGroup.hidden = !multiExportToggle || !multiExportToggle.checked;
  }

  function syncSelectedTargetsWithPrimaryTarget() {
    if (!targetSelect || targetOptions.length === 0) {
      return;
    }

    setSelectedTargets([targetSelect.value]);
  }

  function updatePrefixVisibility() {
    var selectedTargets = getSelectedTargets();
    var shouldShow = selectedTargets.indexOf('css') !== -1 || selectedTargets.indexOf('ionic') !== -1;
    prefixField.hidden = !shouldShow;
  }

  function updateEmptyState(output) {
    emptyState.hidden = !!output;
  }

  function setError(message) {
    if (!message) {
      errorMessage.hidden = true;
      errorMessage.textContent = '';
      return;
    }

    errorMessage.hidden = false;
    errorMessage.textContent = message;
  }

  function setWarning(message) {
    if (!message) {
      warningMessage.hidden = true;
      warningMessage.textContent = '';
      return;
    }

    warningMessage.hidden = false;
    warningMessage.textContent = message;
  }

  function setInfo(message) {
    if (!message) {
      infoMessage.hidden = true;
      infoMessage.textContent = '';
      return;
    }

    infoMessage.hidden = false;
    infoMessage.textContent = message;
  }

  function getCurrentFileName(target) {
    return outputFiles[target];
  }

  function triggerDownload(fileName, content) {
    var blob = new Blob([content], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function updatePreviewSelector() {
    var targets = Object.keys(generatedOutputs);
    var i;
    var tab;

    previewTabs.textContent = '';

    for (i = 0; i < targets.length; i += 1) {
      tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'preview-tab';
      tab.textContent = targets[i];
      tab.setAttribute('data-target', targets[i]);
      previewTabs.appendChild(tab);
    }

    previewSwitch.hidden = targets.length <= 1;

    if (targets.length > 0) {
      if (targets.length === 1) {
        activePreviewTarget = targets[0];
      } else if (preferredPreviewTarget && targets.indexOf(preferredPreviewTarget) !== -1) {
        activePreviewTarget = preferredPreviewTarget;
      } else if (targets.indexOf(activePreviewTarget) === -1) {
        activePreviewTarget = targets[0];
      }

      for (i = 0; i < previewTabs.children.length; i += 1) {
        if (previewTabs.children[i].getAttribute('data-target') === activePreviewTarget) {
          previewTabs.children[i].classList.add('is-active');
        } else {
          previewTabs.children[i].classList.remove('is-active');
        }
      }
    }
  }

  function renderActivePreview() {
    var output = generatedOutputs[activePreviewTarget] || '';
    outputPreview.value = output;
    updateActionState(output, activePreviewTarget);
  }

  function setCopyButtonLabel(label) {
    if (copyResetTimer) {
      window.clearTimeout(copyResetTimer);
      copyResetTimer = 0;
    }

    copyButton.textContent = label;
  }

  function resetCopyButtonLabel(delay) {
    copyResetTimer = window.setTimeout(function () {
      copyButton.textContent = defaultCopyLabel;
      copyResetTimer = 0;
    }, delay || 1400);
  }

  function updateActionState(output, target) {
    var hasOutput = !!output;

    copyButton.disabled = !hasOutput;
    downloadButton.disabled = !hasOutput;
    updateEmptyState(output);
    statusBadge.hidden = !hasOutput;
    filename.textContent = hasOutput ? getCurrentFileName(target || activePreviewTarget) : '';

    if (!hasOutput) {
      setCopyButtonLabel(defaultCopyLabel);
    }
  }

  function renderOutput() {
    var targets;
    var generator;
    var rawTokens;
    var parsedTokens;
    var normalization;
    var normalizationInfoText;
    var validation;
    var warnings = [];
    var warningsMap = {};
    var errorsMap = {};
    var i;
    var j;
    var key;
    var target;
    var output;
    var hasErrors = false;
    var newOutputs = {};
    var validationWarning;

    updateMultiExportVisibility();
    updatePrefixVisibility();
    ensureAtLeastOneTarget();
    targets = getSelectedTargets();

    try {
      rawTokens = JSON.parse(tokensInput.value);
    } catch (error) {
      setError(tokensInput.value.trim() ? 'El JSON no es válido. Revisa comas, comillas y llaves antes de generar la salida.' : '');
      setInfo('');
      setWarning('');
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      return;
    }

    normalization = normalizeTokenInput(rawTokens);
    parsedTokens = normalization.normalized;
    normalizationInfoText = normalization.info.join('\n');

    for (i = 0; i < targets.length; i += 1) {
      target = targets[i];
      validation = validateTokenInput(parsedTokens, target);

      for (j = 0; j < validation.errors.length; j += 1) {
        errorsMap[validation.errors[j]] = true;
      }

      for (j = 0; j < validation.warnings.length; j += 1) {
        validationWarning = targets.length > 1 ? '[' + target + '] ' + validation.warnings[j] : validation.warnings[j];
        warningsMap[validationWarning] = true;
      }

      if (validation.errors.length > 0) {
        hasErrors = true;
      }
    }

    for (key in warningsMap) {
      if (Object.prototype.hasOwnProperty.call(warningsMap, key)) {
        warnings.push(key);
      }
    }

    if (hasErrors) {
      var errors = [];
      for (key in errorsMap) {
        if (Object.prototype.hasOwnProperty.call(errorsMap, key)) {
          errors.push(key);
        }
      }
      setError(errors.join('\n'));
      setInfo(normalizationInfoText);
      setWarning(warnings.join('\n'));
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      return;
    }

    try {
      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];
        generator = getGenerator(target);
        output = generator(parsedTokens, {
          prefix: prefixInput.value
        });
        newOutputs[target] = output;
      }
      setError('');
      setInfo(normalizationInfoText);
      setWarning(warnings.join('\n'));
    } catch (error) {
      setError('No se pudo generar la salida para alguno de los targets seleccionados. Revisa el contenido de los tokens e inténtalo de nuevo.');
      setInfo(normalizationInfoText);
      setWarning(warnings.join('\n'));
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      return;
    }

    generatedOutputs = newOutputs;
    updatePreviewSelector();
    renderActivePreview();
  }

  function handleFileUpload(event) {
    var file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    file.text().then(function (text) {
      tokensInput.value = text;
      setError('');
      setInfo('');
      renderOutput();
    }).catch(function () {
      setError('No se pudo leer el archivo seleccionado. Comprueba que sea un JSON de texto válido.');
    });
  }

  function copyOutput() {
    if (!outputPreview.value) {
      return;
    }

    navigator.clipboard.writeText(outputPreview.value).then(function () {
      setCopyButtonLabel('Copiado');
      resetCopyButtonLabel(1200);
    }).catch(function () {
      setCopyButtonLabel('Copia manual');
      resetCopyButtonLabel(1800);
      setError('No se pudo copiar automáticamente. El navegador bloqueó el portapapeles; puedes copiar el contenido manualmente desde la vista previa.');
    });
  }

  function downloadOutput() {
    var targets = Object.keys(generatedOutputs);
    var i;

    if (targets.length === 0) {
      return;
    }

    if (targets.length === 1) {
      triggerDownload(getCurrentFileName(targets[0]), generatedOutputs[targets[0]]);
      return;
    }

    for (i = 0; i < targets.length; i += 1) {
      (function (target, delay) {
        window.setTimeout(function () {
          triggerDownload(getCurrentFileName(target), generatedOutputs[target]);
        }, delay);
      }(targets[i], i * 140));
    }
  }

  function loadExample() {
    tokensInput.value = JSON.stringify(basicExampleTokens, null, 2);
    fileInput.value = '';
    setError('');
    setInfo('');
    setWarning('');
    renderOutput();
  }

  function clearAll() {
    tokensInput.value = '';
    outputPreview.value = '';
    prefixInput.value = '';
    fileInput.value = '';
    generatedOutputs = {};
    setError('');
    setInfo('');
    setWarning('');
    renderOutput();
  }

  tokensInput.value = '';
  if (targetSelect) {
    targetSelect.value = targetSelect.value || 'css';
  }
  syncSelectedTargetsWithPrimaryTarget();
  if (multiExportToggle) {
    multiExportToggle.checked = false;
  }
  updateMultiExportVisibility();
  updateActionState('', targetSelect && targetSelect.value ? targetSelect.value : 'css');

  tokensInput.addEventListener('input', renderOutput);
  if (targetSelect) {
    targetSelect.addEventListener('change', function () {
      preferredPreviewTarget = targetSelect.value;
      if (!multiExportToggle || !multiExportToggle.checked) {
        syncSelectedTargetsWithPrimaryTarget();
      }
      renderOutput();
    });
  }
  if (multiExportToggle) {
    multiExportToggle.addEventListener('change', function () {
      if (multiExportToggle.checked) {
        ensureAtLeastOneTarget();
      } else {
        syncSelectedTargetsWithPrimaryTarget();
        preferredPreviewTarget = targetSelect && targetSelect.value ? targetSelect.value : 'css';
      }
      renderOutput();
    });
  }
  for (var i = 0; i < targetOptions.length; i += 1) {
    (function (option) {
      option.addEventListener('change', function () {
        if (!multiExportToggle || !multiExportToggle.checked) {
          return;
        }
        ensureAtLeastOneTarget(option);
        if (option.checked) {
          preferredPreviewTarget = option.value;
        }
        renderOutput();
      });
    }(targetOptions[i]));
  }
  previewTabs.addEventListener('click', function (event) {
    var target = event.target && event.target.getAttribute('data-target');

    if (!target) {
      return;
    }

    activePreviewTarget = target;
    preferredPreviewTarget = target;
    renderActivePreview();
  });
  prefixInput.addEventListener('input', renderOutput);
  fileInput.addEventListener('change', handleFileUpload);
  copyButton.addEventListener('click', copyOutput);
  downloadButton.addEventListener('click', downloadOutput);
  exampleButton.addEventListener('click', loadExample);
  clearButton.addEventListener('click', clearAll);

  renderOutput();
}());

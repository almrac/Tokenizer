(function () {
  var sampleTokens = '{\n' +
    '  "colors": {\n' +
    '    "primary": "#0d6efd",\n' +
    '    "secondary": "#6c757d",\n' +
    '    "success": "#198754",\n' +
    '    "danger": "#dc3545",\n' +
    '    "brand": "#7c4dff"\n' +
    '  },\n' +
    '  "spacing": {\n' +
    '    "xs": "0.25rem",\n' +
    '    "sm": "0.5rem",\n' +
    '    "md": "1rem",\n' +
    '    "lg": "1.5rem"\n' +
    '  },\n' +
    '  "typography": {\n' +
    '    "fontFamily": {\n' +
    '      "base": "Inter, sans-serif",\n' +
    '      "mono": "\\"Fira Code\\", monospace"\n' +
    '    },\n' +
    '    "fontSize": {\n' +
    '      "body": "0.875rem",\n' +
    '      "title": "1.25rem"\n' +
    '    },\n' +
    '    "fontWeight": {\n' +
    '      "regular": "400",\n' +
    '      "semibold": "600"\n' +
    '    },\n' +
    '    "lineHeight": {\n' +
    '      "body": "1.5",\n' +
    '      "title": "1.2"\n' +
    '    }\n' +
    '  },\n' +
    '  "radius": {\n' +
    '    "sm": "4px",\n' +
    '    "md": "8px",\n' +
    '    "lg": "12px"\n' +
    '  },\n' +
    '  "shadows": {\n' +
    '    "sm": "0 1px 2px rgba(0, 0, 0, 0.12)",\n' +
    '    "md": "0 4px 12px rgba(0, 0, 0, 0.16)"\n' +
    '  }\n' +
    '}';

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
  var targetGroupSupport = {
    css: { colors: true, spacing: true, typography: true, radius: true, shadows: true },
    ionic: { colors: true, spacing: false, typography: true, radius: true, shadows: true },
    bootstrap: { colors: true, spacing: true, typography: true, radius: true, shadows: true },
    tailwind: { colors: true, spacing: true, typography: true, radius: true, shadows: true }
  };

  var tokensInput = document.querySelector('[data-ui="tokens-input"]');
  var fileInput = document.querySelector('[data-ui="file-input"]');
  var targetSelect = document.querySelector('[data-ui="target-select"]');
  var prefixField = document.querySelector('[data-ui="prefix-field"]');
  var prefixInput = document.querySelector('[data-ui="prefix-input"]');
  var filename = document.querySelector('[data-ui="filename"]');
  var outputPreview = document.querySelector('[data-ui="output-preview"]');
  var errorMessage = document.querySelector('[data-ui="error-message"]');
  var warningMessage = document.querySelector('[data-ui="warning-message"]');
  var copyButton = document.querySelector('[data-ui="copy-button"]');
  var downloadButton = document.querySelector('[data-ui="download-button"]');
  var statusBadge = document.querySelector('[data-ui="status-badge"]');
  var exampleButton = document.querySelector('[data-ui="example-button"]');
  var clearButton = document.querySelector('[data-ui="clear-button"]');
  var emptyState = document.querySelector('[data-ui="empty-state"]');
  var defaultCopyLabel = 'Copiar';
  var copyResetTimer = 0;

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

  function generateIonic(tokens) {
    var groups = getTokenGroups(tokens);
    var keys = Object.keys(groups.colors);
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

    if (typographyEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Typography */');
      for (i = 0; i < typographyEntries.length; i += 1) {
        lines.push('  --ion-' + typographyEntries[i].group + '-' + typographyEntries[i].entry.name + ': ' + typographyEntries[i].entry.value + ';');
      }
    }

    if (radiusEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Radius */');
      for (i = 0; i < radiusEntries.length; i += 1) {
        lines.push('  --ion-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
      }
    }

    if (shadowEntries.length > 0) {
      if (lines.length > 0) {
        lines.push('');
      }
      lines.push('  /* Shadows */');
      for (i = 0; i < shadowEntries.length; i += 1) {
        lines.push('  --ion-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
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

  function updatePrefixVisibility() {
    prefixField.hidden = targetSelect.value !== 'css';
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

  function getCurrentFileName() {
    return outputFiles[targetSelect.value];
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

  function updateActionState(output) {
    var hasOutput = !!output;

    copyButton.disabled = !hasOutput;
    downloadButton.disabled = !hasOutput;
    updateEmptyState(output);
    statusBadge.hidden = !hasOutput;
    filename.textContent = hasOutput ? getCurrentFileName() : '';

    if (!hasOutput) {
      setCopyButtonLabel(defaultCopyLabel);
    }
  }

  function renderOutput() {
    var target = targetSelect.value;
    var generator;
    var parsedTokens;
    var validation;
    var output;

    updatePrefixVisibility();

    try {
      parsedTokens = JSON.parse(tokensInput.value);
    } catch (error) {
      output = '';
      setError(tokensInput.value.trim() ? 'El JSON no es válido. Revisa comas, comillas y llaves antes de generar la salida.' : '');
      setWarning('');
      outputPreview.value = output;
      updateActionState(output);
      return;
    }

    validation = validateTokenInput(parsedTokens, target);

    if (validation.errors.length > 0) {
      output = '';
      setError(validation.errors.join('\n'));
      setWarning(validation.warnings.join('\n'));
      outputPreview.value = output;
      updateActionState(output);
      return;
    }

    try {
      generator = getGenerator(target);
      output = generator(parsedTokens, {
        prefix: prefixInput.value
      });
      setError('');
      setWarning(validation.warnings.join('\n'));
    } catch (error) {
      output = '';
      setError('No se pudo generar la salida para este target. Revisa el contenido de los tokens e inténtalo de nuevo.');
      setWarning(validation.warnings.join('\n'));
    }

    outputPreview.value = output;
    updateActionState(output);
  }

  function handleFileUpload(event) {
    var file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    file.text().then(function (text) {
      tokensInput.value = text;
      setError('');
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
    if (!outputPreview.value) {
      return;
    }

    var blob = new Blob([outputPreview.value], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');

    link.href = url;
    link.download = getCurrentFileName();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function loadExample() {
    tokensInput.value = sampleTokens;
    fileInput.value = '';
    setError('');
    setWarning('');
    renderOutput();
  }

  function clearAll() {
    tokensInput.value = '';
    outputPreview.value = '';
    prefixInput.value = '';
    fileInput.value = '';
    setError('');
    setWarning('');
    renderOutput();
  }

  tokensInput.value = '';
  updateActionState('');

  tokensInput.addEventListener('input', renderOutput);
  targetSelect.addEventListener('change', renderOutput);
  prefixInput.addEventListener('input', renderOutput);
  fileInput.addEventListener('change', handleFileUpload);
  copyButton.addEventListener('click', copyOutput);
  downloadButton.addEventListener('click', downloadOutput);
  exampleButton.addEventListener('click', loadExample);
  clearButton.addEventListener('click', clearAll);

  renderOutput();
}());

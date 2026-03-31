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
    '    "body": {\n' +
    '      "fontFamily": "Inter, sans-serif",\n' +
    '      "fontSize": "1rem",\n' +
    '      "fontWeight": "400",\n' +
    '      "lineHeight": "1.5"\n' +
    '    },\n' +
    '    "title": {\n' +
    '      "fontFamily": "Inter, sans-serif",\n' +
    '      "fontSize": "1.5rem",\n' +
    '      "fontWeight": "700",\n' +
    '      "lineHeight": "1.2"\n' +
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

  var tokensInput = document.querySelector('[data-ui="tokens-input"]');
  var fileInput = document.querySelector('[data-ui="file-input"]');
  var targetSelect = document.querySelector('[data-ui="target-select"]');
  var prefixField = document.querySelector('[data-ui="prefix-field"]');
  var prefixInput = document.querySelector('[data-ui="prefix-input"]');
  var filename = document.querySelector('[data-ui="filename"]');
  var outputPreview = document.querySelector('[data-ui="output-preview"]');
  var errorMessage = document.querySelector('[data-ui="error-message"]');
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
    var typographyEntries = flattenTokenEntries(groups.typography);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var i;

    for (i = 0; i < colorKeys.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'color', colorKeys[i]) + ': ' + groups.colors[colorKeys[i]] + ';');
    }

    for (i = 0; i < spacingKeys.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'spacing', spacingKeys[i]) + ': ' + groups.spacing[spacingKeys[i]] + ';');
    }

    for (i = 0; i < typographyEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'typography', typographyEntries[i].name) + ': ' + typographyEntries[i].value + ';');
    }

    for (i = 0; i < radiusEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'radius', radiusEntries[i].name) + ': ' + radiusEntries[i].value + ';');
    }

    for (i = 0; i < shadowEntries.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'shadow', shadowEntries[i].name) + ': ' + shadowEntries[i].value + ';');
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
    var typographyEntries = flattenTokenEntries(groups.typography);
    var lines = [];
    var i;
    var j;
    var colorLines;

    lines.push('  /* Generated by Tokenizer. */');

    for (i = 0; i < keys.length; i += 1) {
      colorLines = buildIonicColorLines(keys[i], groups.colors[keys[i]]);

      if (i === 0) {
        lines.push('');
        lines.push('  /* Ionic color tokens. */');
      }

      for (j = 0; j < colorLines.length; j += 1) {
        lines.push(colorLines[j]);
      }

      if (i < keys.length - 1) {
        lines.push('');
      }
    }

    if (radiusEntries.length > 0) {
      lines.push('');
      lines.push('  /* Radius tokens. */');
      for (i = 0; i < radiusEntries.length; i += 1) {
        lines.push('  --ion-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
      }
    }

    if (shadowEntries.length > 0) {
      lines.push('');
      lines.push('  /* Shadow tokens. */');
      for (i = 0; i < shadowEntries.length; i += 1) {
        lines.push('  --ion-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
      }
    }

    if (typographyEntries.length > 0) {
      lines.push('');
      lines.push('  /* Typography tokens (flat aliases). */');
      for (i = 0; i < typographyEntries.length; i += 1) {
        lines.push('  --ion-typography-' + typographyEntries[i].name + ': ' + typographyEntries[i].value + ';');
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
    var typographyEntries = flattenTokenEntries(groups.typography);
    var colorEntries = [];
    var i;

    for (i = 0; i < colorKeys.length; i += 1) {
      if (bootstrapColorNames[colorKeys[i]]) {
        colorEntries.push('$' + colorKeys[i] + ': ' + groups.colors[colorKeys[i]] + ';');
      }
    }

    lines.push('// Generated by Tokenizer.');

    if (colorEntries.length > 0) {
      lines.push('');
      lines.push('// Bootstrap theme colors (recognized keys only).');
      for (i = 0; i < colorEntries.length; i += 1) {
        lines.push(colorEntries[i]);
      }
    }

    if (spacingKeys.length > 0) {
      lines.push('');
      lines.push('// Bootstrap spacing map.');
      lines.push('$spacers: (');
      for (i = 0; i < spacingKeys.length; i += 1) {
        lines.push('  "' + spacingKeys[i] + '": ' + groups.spacing[spacingKeys[i]] + ',');
      }
      lines.push(');');
    }

    if (radiusEntries.length > 0) {
      lines.push('');
      lines.push('// Border radius tokens.');
      for (i = 0; i < radiusEntries.length; i += 1) {
        lines.push('$border-radius-' + radiusEntries[i].name + ': ' + radiusEntries[i].value + ';');
      }
    }

    if (shadowEntries.length > 0) {
      lines.push('');
      lines.push('// Shadow tokens.');
      for (i = 0; i < shadowEntries.length; i += 1) {
        lines.push('$box-shadow-' + shadowEntries[i].name + ': ' + shadowEntries[i].value + ';');
      }
    }

    if (typographyEntries.length > 0) {
      lines.push('');
      lines.push('// Typography tokens (flat aliases).');
      for (i = 0; i < typographyEntries.length; i += 1) {
        lines.push('$typography-' + typographyEntries[i].name + ': ' + typographyEntries[i].value + ';');
      }
    }

    return lines.join('\n') + '\n';
  }

  function createTypographyBuckets() {
    return {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    };
  }

  function fillTypographyBuckets(typography, buckets) {
    var source = isPlainObject(typography) ? typography : {};
    var keys = Object.keys(source);
    var i;
    var tokenName;
    var tokenValue;

    for (i = 0; i < keys.length; i += 1) {
      tokenName = toKebabCase(keys[i]);
      tokenValue = source[keys[i]];

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
    var keys = Object.keys(source);
    var lines = [];
    var i;

    if (keys.length === 0) {
      return null;
    }

    if (comment) {
      lines.push(indent + '// ' + comment);
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
      lines.push(indent + '// ' + comment);
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
    }
  }

  function generateTailwind(tokens) {
    var groups = getTokenGroups(tokens);
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var typographyBuckets = createTypographyBuckets();
    var sections = [];
    var lines = [];
    var i;

    fillTypographyBuckets(groups.typography, typographyBuckets);

    lines.push('module.exports = {');
    lines.push('  // Generated by Tokenizer.');
    lines.push('  theme: {');
    lines.push('    extend: {');

    sections.push(['      // Color tokens.', '      colors: {']);
    for (i = 0; i < colorKeys.length; i += 1) {
      sections[sections.length - 1].push('        ' + JSON.stringify(colorKeys[i]) + ': ' + JSON.stringify(groups.colors[colorKeys[i]]) + ',');
    }
    sections[sections.length - 1].push('      }');

    sections.push(['      // Spacing tokens.', '      spacing: {']);
    for (i = 0; i < spacingKeys.length; i += 1) {
      sections[sections.length - 1].push('        ' + JSON.stringify(spacingKeys[i]) + ': ' + JSON.stringify(groups.spacing[spacingKeys[i]]) + ',');
    }
    sections[sections.length - 1].push('      }');

    sections.push(buildEntrySection('      ', 'borderRadius', radiusEntries, 'Radius tokens.'));
    sections.push(buildEntrySection('      ', 'boxShadow', shadowEntries, 'Shadow tokens.'));
    sections.push(buildObjectSection('      ', 'fontFamily', typographyBuckets.fontFamily, 'Typography tokens.'));
    sections.push(buildObjectSection('      ', 'fontSize', typographyBuckets.fontSize));
    sections.push(buildObjectSection('      ', 'fontWeight', typographyBuckets.fontWeight));
    sections.push(buildObjectSection('      ', 'lineHeight', typographyBuckets.lineHeight));
    sections.push(buildObjectSection('      ', 'letterSpacing', typographyBuckets.letterSpacing));

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
    var output;

    updatePrefixVisibility();

    try {
      parsedTokens = JSON.parse(tokensInput.value);
    } catch (error) {
      output = '';
      setError(tokensInput.value.trim() ? 'El JSON no es válido. Revisa comas, comillas y llaves antes de generar la salida.' : '');
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
    } catch (error) {
      output = '';
      setError('No se pudo generar la salida para este target. Revisa el contenido de los tokens e inténtalo de nuevo.');
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
    renderOutput();
  }

  function clearAll() {
    tokensInput.value = '';
    outputPreview.value = '';
    prefixInput.value = '';
    fileInput.value = '';
    setError('');
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

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

  var tokensInput = document.getElementById('tokens-input');
  var fileInput = document.getElementById('file-input');
  var targetSelect = document.getElementById('target-select');
  var prefixField = document.getElementById('prefix-field');
  var prefixInput = document.getElementById('prefix-input');
  var filename = document.getElementById('filename');
  var outputPreview = document.getElementById('output-preview');
  var errorMessage = document.getElementById('error-message');
  var copyButton = document.getElementById('copy-button');
  var downloadButton = document.getElementById('download-button');

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

    return {
      colors: colors,
      spacing: spacing
    };
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
    var i;

    for (i = 0; i < colorKeys.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'color', colorKeys[i]) + ': ' + groups.colors[colorKeys[i]] + ';');
    }

    for (i = 0; i < spacingKeys.length; i += 1) {
      lines.push('  ' + buildCssVariableName(prefix, 'spacing', spacingKeys[i]) + ': ' + groups.spacing[spacingKeys[i]] + ';');
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
    var lines = [];
    var i;
    var j;
    var colorLines;

    for (i = 0; i < keys.length; i += 1) {
      colorLines = buildIonicColorLines(keys[i], groups.colors[keys[i]]);

      for (j = 0; j < colorLines.length; j += 1) {
        lines.push(colorLines[j]);
      }
    }

    return buildRootBlock(lines);
  }

  function generateBootstrap(tokens) {
    var groups = getTokenGroups(tokens);
    var lines = [];
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var i;

    for (i = 0; i < colorKeys.length; i += 1) {
      if (bootstrapColorNames[colorKeys[i]]) {
        lines.push('$' + colorKeys[i] + ': ' + groups.colors[colorKeys[i]] + ';');
      }
    }

    lines.push('$spacers: (');

    for (i = 0; i < spacingKeys.length; i += 1) {
      lines.push('  "' + spacingKeys[i] + '": ' + groups.spacing[spacingKeys[i]] + ',');
    }

    lines.push(');');

    return lines.join('\n') + '\n';
  }

  function generateTailwind(tokens) {
    var groups = getTokenGroups(tokens);
    var colorKeys = Object.keys(groups.colors);
    var spacingKeys = Object.keys(groups.spacing);
    var lines = [];
    var i;

    lines.push('module.exports = {');
    lines.push('  theme: {');
    lines.push('    extend: {');
    lines.push('      colors: {');

    for (i = 0; i < colorKeys.length; i += 1) {
      lines.push('        ' + JSON.stringify(colorKeys[i]) + ': ' + JSON.stringify(groups.colors[colorKeys[i]]) + ',');
    }

    lines.push('      },');
    lines.push('      spacing: {');

    for (i = 0; i < spacingKeys.length; i += 1) {
      lines.push('        ' + JSON.stringify(spacingKeys[i]) + ': ' + JSON.stringify(groups.spacing[spacingKeys[i]]) + ',');
    }

    lines.push('      }');
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

  function renderOutput() {
    var target = targetSelect.value;
    var generator;
    var parsedTokens;
    var output = '';

    filename.textContent = 'Archivo generado: ' + getCurrentFileName();
    updatePrefixVisibility();

    try {
      parsedTokens = JSON.parse(tokensInput.value);
    } catch (error) {
      output = '';
      setError('JSON inválido. Revisa el contenido e inténtalo de nuevo.');
      outputPreview.value = output;
      copyButton.disabled = true;
      downloadButton.disabled = true;
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
      setError('Ocurrió un error al generar la salida.');
    }

    outputPreview.value = output;
    copyButton.disabled = !output;
    downloadButton.disabled = !output;
  }

  function handleFileUpload(event) {
    var file = event.target.files && event.target.files[0];

    if (!file) {
      return;
    }

    file.text().then(function (text) {
      tokensInput.value = text;
      renderOutput();
    }).catch(function () {
      setError('No se pudo leer el archivo seleccionado.');
    });
  }

  function copyOutput() {
    if (!outputPreview.value) {
      return;
    }

    navigator.clipboard.writeText(outputPreview.value).then(function () {
      copyButton.textContent = 'Copiado';
      window.setTimeout(function () {
        copyButton.textContent = 'Copiar';
      }, 1200);
    }).catch(function () {
      setError('No se pudo copiar. El navegador bloqueó el acceso al portapapeles.');
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

  tokensInput.value = sampleTokens;
  copyButton.disabled = true;
  downloadButton.disabled = true;

  tokensInput.addEventListener('input', renderOutput);
  targetSelect.addEventListener('change', renderOutput);
  prefixInput.addEventListener('input', renderOutput);
  fileInput.addEventListener('change', handleFileUpload);
  copyButton.addEventListener('click', copyOutput);
  downloadButton.addEventListener('click', downloadOutput);

  renderOutput();
}());

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
  var bootstrapColorOrder = ['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'];
  var supportedGroups = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
  var topLevelAliases = {
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
  var wrapperKeys = {
    tokens: true,
    global: true,
    globals: true,
    theme: true,
    themes: true,
    values: true,
    collections: true,
    collection: true,
    primitives: true,
    semantic: true,
    semanticTokens: true,
    designTokens: true,
    default: true
  };
  var preferredRootNames = {
    global: true,
    globals: true,
    default: true,
    defaults: true,
    base: true
  };
  var targetMappingTemplates = {
    css: {
      target: 'css',
      strategy: 'custom-prefix-fallback',
      exportPolicy: {
        nativeFirst: false,
        probableMappings: false,
        extendedFallback: 'default',
        warnAndOmit: 'last-resort'
      },
      nativeMappings: {},
      probableMappings: {},
      groupRules: {
        colors: 'css.custom-properties.colors',
        spacing: 'css.custom-properties.spacing',
        typography: 'css.custom-properties.typography',
        radius: 'css.custom-properties.radius',
        shadows: 'css.custom-properties.shadows'
      },
      groupFallbacks: {
        colors: 'custom-prefix',
        spacing: 'custom-prefix',
        typography: 'custom-prefix',
        radius: 'custom-prefix',
        shadows: 'custom-prefix'
      }
    },
    ionic: {
      target: 'ionic',
      strategy: 'native-first',
      exportPolicy: {
        nativeFirst: true,
        probableMappings: false,
        extendedFallback: 'default',
        warnAndOmit: 'last-resort'
      },
      nativeMappings: {
        'colors.primary': '--ion-color-primary',
        'colors.secondary': '--ion-color-secondary',
        'colors.tertiary': '--ion-color-tertiary',
        'colors.success': '--ion-color-success',
        'colors.warning': '--ion-color-warning',
        'colors.danger': '--ion-color-danger',
        'colors.light': '--ion-color-light',
        'colors.medium': '--ion-color-medium',
        'colors.dark': '--ion-color-dark',
        'typography.fontFamily.base': '--ion-font-family'
      },
      probableMappings: {},
      groupRules: {
        colors: 'ionic.css-variables.colors',
        spacing: 'css.custom-properties.spacing',
        typography: 'native-when-known-else-custom',
        radius: 'css.custom-properties.radius',
        shadows: 'css.custom-properties.shadows'
      },
      groupFallbacks: {
        spacing: 'custom-prefix',
        typography: 'custom-prefix',
        radius: 'custom-prefix',
        shadows: 'custom-prefix'
      }
    },
    bootstrap: {
      target: 'bootstrap',
      strategy: 'native-first-with-extended-fallback',
      exportPolicy: {
        nativeFirst: true,
        probableMappings: true,
        extendedFallback: 'explicit',
        warnAndOmit: 'last-resort'
      },
      nativeMappings: {
        'colors.primary': '$primary',
        'colors.secondary': '$secondary',
        'colors.success': '$success',
        'colors.danger': '$danger',
        'colors.warning': '$warning',
        'colors.info': '$info',
        'colors.light': '$light',
        'colors.dark': '$dark',
        'typography.fontFamily.base': '$font-family-base',
        'typography.fontSize.body': '$font-size-base',
        'typography.fontWeight.regular': '$font-weight-base',
        'typography.lineHeight.body': '$line-height-base',
        'radius.sm': '$border-radius-sm',
        'radius.md': '$border-radius',
        'radius.default': '$border-radius',
        'radius.lg': '$border-radius-lg',
        'shadows.sm': '$box-shadow-sm',
        'shadows.md': '$box-shadow',
        'shadows.default': '$box-shadow',
        'shadows.base': '$box-shadow',
        spacing: '$spacers'
      },
      probableMappings: {
        'colors.baseColor': '$body-color',
        'colors.bodyColor': '$body-color',
        'colors.baseBorderColor': '$border-color',
        'colors.borderColor': '$border-color',
        'colors.surface': '$body-bg',
        'colors.baseBg': '$body-bg',
        'colors.bodyBg': '$body-bg'
      },
      groupRules: {
        colors: 'bootstrap.scss.colors',
        spacing: 'bootstrap.scss.spacers-map',
        typography: 'bootstrap.scss.typography',
        radius: 'bootstrap.scss.radius',
        shadows: 'bootstrap.scss.shadows'
      },
      groupFallbacks: {
        colors: 'extended-sass-variable',
        spacing: 'scoped-map',
        typography: 'native-and-scss-maps-then-extended-sass-variable',
        radius: 'native-then-extended-sass-variable',
        shadows: 'native-then-extended-sass-variable'
      }
    },
    tailwind: {
      target: 'tailwind',
      strategy: 'native-first',
      exportPolicy: {
        nativeFirst: true,
        probableMappings: false,
        extendedFallback: 'rare',
        warnAndOmit: 'last-resort'
      },
      nativeMappings: {
        colors: 'theme.extend.colors',
        spacing: 'theme.extend.spacing',
        typography: {
          fontFamily: 'theme.extend.fontFamily',
          fontSize: 'theme.extend.fontSize',
          fontWeight: 'theme.extend.fontWeight',
          lineHeight: 'theme.extend.lineHeight',
          letterSpacing: 'theme.extend.letterSpacing'
        },
        radius: 'theme.extend.borderRadius',
        shadows: 'theme.extend.boxShadow'
      },
      probableMappings: {},
      groupRules: {
        colors: 'tailwind.theme.extend.colors',
        spacing: 'tailwind.theme.extend.spacing',
        typography: 'tailwind.theme.extend.typography',
        radius: 'tailwind.theme.extend.borderRadius',
        shadows: 'tailwind.theme.extend.boxShadow'
      },
      groupFallbacks: {
        colors: 'theme.extend.colors',
        spacing: 'theme.extend.spacing',
        typography: 'theme.extend.typography',
        radius: 'theme.extend.borderRadius',
        shadows: 'theme.extend.boxShadow'
      }
    }
  };
  var targetGroupSupport = buildTargetGroupSupport();
  var bootstrapV4Template = {
    target: targetMappingTemplates.bootstrap.target,
    strategy: targetMappingTemplates.bootstrap.strategy,
    exportPolicy: Object.assign({}, targetMappingTemplates.bootstrap.exportPolicy),
    nativeMappings: Object.assign({}, targetMappingTemplates.bootstrap.nativeMappings),
    probableMappings: Object.assign({}, targetMappingTemplates.bootstrap.probableMappings),
    groupRules: Object.assign({}, targetMappingTemplates.bootstrap.groupRules),
    groupFallbacks: Object.assign({}, targetMappingTemplates.bootstrap.groupFallbacks)
  };
  delete bootstrapV4Template.nativeMappings['radius.lg'];
  var targetProfileTemplates = {
    bootstrap: {
      default: targetMappingTemplates.bootstrap,
      v4: bootstrapV4Template
    }
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
  var variantField = document.querySelector('[data-ui="variant-field"]');
  var variantSelect = document.querySelector('[data-ui="variant-select"]');
  var variantHint = document.querySelector('[data-ui="variant-hint"]');
  var targetProfileField = document.querySelector('[data-ui="target-profile-field"]');
  var targetProfileSelect = document.querySelector('[data-ui="target-profile-select"]');
  var targetProfileHint = document.querySelector('[data-ui="target-profile-hint"]');
  var versionLabel = document.querySelector('[data-ui="version-label"]');
  var filename = document.querySelector('[data-ui="filename"]');
  var outputPreview = document.querySelector('[data-ui="output-preview"]');
  var errorMessage = document.querySelector('[data-ui="error-message"]');
  var warningMessage = document.querySelector('[data-ui="warning-message"]');
  var omissionMessage = document.querySelector('[data-ui="omission-message"]');
  var inspector = document.querySelector('[data-ui="inspector"]');
  var inspectorRoot = document.querySelector('[data-ui="inspector-root"]');
  var inspectorSupported = document.querySelector('[data-ui="inspector-supported"]');
  var inspectorIgnoredRow = document.querySelector('[data-ui="inspector-ignored-row"]');
  var inspectorIgnored = document.querySelector('[data-ui="inspector-ignored"]');
  var inspectorNormalizationRow = document.querySelector('[data-ui="inspector-normalization-row"]');
  var inspectorNormalization = document.querySelector('[data-ui="inspector-normalization"]');
  var inspectorImportRow = document.querySelector('[data-ui="inspector-import-row"]');
  var inspectorImport = document.querySelector('[data-ui="inspector-import"]');
  var inspectorOmissionRow = document.querySelector('[data-ui="inspector-omission-row"]');
  var inspectorOmission = document.querySelector('[data-ui="inspector-omission"]');
  var inspectorWarningState = document.querySelector('[data-ui="inspector-warning-state"]');
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

  function loadVisibleVersion() {
    if (!versionLabel || typeof fetch !== 'function') {
      return;
    }

    fetch('./version.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('version file not available');
        }
        return response.json();
      })
      .then(function (payload) {
        var version = payload && typeof payload.version === 'string' ? payload.version.trim() : '';

        if (!version) {
          return;
        }

        versionLabel.textContent = 'v' + version;
      })
      .catch(function () {
        // Keep the fallback label already rendered in the HTML.
      });
  }

  function setVariantOptions(variants, selectedValue, autoVariant) {
    var nextVariants = Array.isArray(variants) ? variants.slice() : [];
    var nextSelected = typeof selectedValue === 'string' ? selectedValue : '';
    var option;
    var i;

    variantSelect.textContent = '';
    option = document.createElement('option');
    option.value = '';
    option.textContent = autoVariant ? 'Automática (' + autoVariant + ')' : 'Selecciona una variante';
    variantSelect.appendChild(option);

    for (i = 0; i < nextVariants.length; i += 1) {
      option = document.createElement('option');
      option.value = nextVariants[i];
      option.textContent = nextVariants[i];
      variantSelect.appendChild(option);
    }

    variantSelect.value = nextSelected;
  }

  function updateVariantField(summary) {
    var variants = summary && summary.availableVariants ? summary.availableVariants : [];
    var autoVariant = summary && summary.autoSelectedVariant ? summary.autoSelectedVariant : '';
    var selectedVariant = summary && summary.variantSelectionMode === 'explicit' ? summary.selectedVariant : '';

    if (!variants || variants.length === 0) {
      variantField.hidden = true;
      setVariantOptions([], '', '');
      variantHint.textContent = 'Selecciona una variante explícita cuando la importación detecte varias opciones compatibles.';
      return;
    }

    variantField.hidden = false;
    setVariantOptions(variants, selectedVariant, autoVariant);

    if (autoVariant) {
      variantHint.textContent = 'Puedes mantener la selección automática o forzar una variante explícita.';
      return;
    }

    variantHint.textContent = 'Este caso no se resuelve automáticamente. Selecciona una variante válida para generar salida.';
  }

  function supportsTargetProfiles(target) {
    return !!targetProfileTemplates[target];
  }

  function getSupportedTargetProfiles(target) {
    if (!supportsTargetProfiles(target)) {
      return [];
    }

    return Object.keys(targetProfileTemplates[target]).sort();
  }

  function resolveTargetProfile(target, requestedProfile) {
    var requested = typeof requestedProfile === 'string' ? requestedProfile.trim() : '';

    if (!supportsTargetProfiles(target)) {
      return {
        targetProfileUsed: null,
        error: requested ? 'El target "' + target + '" no soporta perfiles de target.' : null
      };
    }

    if (!requested) {
      return {
        targetProfileUsed: 'default',
        error: null
      };
    }

    if (Object.prototype.hasOwnProperty.call(targetProfileTemplates[target], requested)) {
      return {
        targetProfileUsed: requested,
        error: null
      };
    }

    return {
      targetProfileUsed: null,
      error:
        'El perfil de target "' +
        requested +
        '" no existe para "' +
        target +
        '". Perfiles disponibles: ' +
        getSupportedTargetProfiles(target).join(', ') +
        '.'
    };
  }

  function getTargetTemplate(target, targetProfile) {
    var resolved;

    if (supportsTargetProfiles(target)) {
      resolved = resolveTargetProfile(target, targetProfile);
      if (resolved.targetProfileUsed) {
        return targetProfileTemplates[target][resolved.targetProfileUsed];
      }
    }

    return targetMappingTemplates[target] || targetMappingTemplates.css;
  }

  function getNativeMapping(target, tokenPath, targetProfile) {
    var template = getTargetTemplate(target, targetProfile);
    var nativeMappings = template && template.nativeMappings ? template.nativeMappings : {};

    if (Object.prototype.hasOwnProperty.call(nativeMappings, tokenPath)) {
      return nativeMappings[tokenPath];
    }

    return null;
  }

  function getSelectedTargetProfile() {
    var target = targetSelect && targetSelect.value ? targetSelect.value : 'css';

    if (!supportsTargetProfiles(target)) {
      return null;
    }

    return targetProfileSelect && targetProfileSelect.value ? targetProfileSelect.value : 'default';
  }

  function updateTargetProfileField() {
    var target = targetSelect && targetSelect.value ? targetSelect.value : 'css';
    var profiles = getSupportedTargetProfiles(target);
    var selectedValue = targetProfileSelect && targetProfileSelect.value ? targetProfileSelect.value : '';
    var option;
    var i;

    if (!targetProfileField || !targetProfileSelect) {
      return;
    }

    if (profiles.length === 0) {
      targetProfileField.hidden = true;
      targetProfileSelect.textContent = '';
      return;
    }

    targetProfileSelect.textContent = '';
    for (i = 0; i < profiles.length; i += 1) {
      option = document.createElement('option');
      option.value = profiles[i];
      option.textContent = profiles[i];
      targetProfileSelect.appendChild(option);
    }

    targetProfileField.hidden = false;
    targetProfileSelect.value = profiles.indexOf(selectedValue) !== -1 ? selectedValue : profiles[0];

    if (targetProfileHint) {
      targetProfileHint.textContent =
        'Disponible por ahora solo para bootstrap. default mantiene la salida actual; v4 degrada radius.lg a fallback explícito.';
    }
  }

  function normalizeTokenName(value) {
    return String(value || '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  function resolveIonicNativeColorRole(tokenName) {
    var normalized = normalizeTokenName(tokenName);
    var nativeRoles = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'];

    return nativeRoles.indexOf(normalized) !== -1 ? normalized : null;
  }

  function resolveBootstrapSemanticColorRole(tokenName) {
    var normalized = normalizeTokenName(tokenName);
    var roles = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    var i;
    var role;

    for (i = 0; i < roles.length; i += 1) {
      role = roles[i];

      if (
        normalized === role ||
        normalized === role + '-color' ||
        normalized === role + '-colour' ||
        normalized === 'color-' + role ||
        normalized === 'colour-' + role
      ) {
        return role;
      }
    }

    return null;
  }

  function resolveBootstrapProbableGlobalColorVariable(tokenName) {
    var normalized = normalizeTokenName(tokenName);
    var probableGlobals = {
      'base-color': '$body-color',
      'text-default': '$body-color',
      'body-color': '$body-color',
      foreground: '$body-color',
      'neutral-text': '$body-color',
      'base-border-color': '$border-color',
      'border-color': '$border-color',
      'neutral-border': '$border-color',
      'divider-color': '$border-color',
      surface: '$body-bg',
      background: '$body-bg',
      'body-bg': '$body-bg',
      'base-bg': '$body-bg'
    };

    if (Object.prototype.hasOwnProperty.call(probableGlobals, normalized)) {
      return probableGlobals[normalized];
    }

    return null;
  }

  function resolveBootstrapShadowGlobalVariable(tokenName) {
    var normalized = normalizeTokenName(tokenName);
    var globals = {
      sm: '$box-shadow-sm',
      md: '$box-shadow',
      default: '$box-shadow',
      base: '$box-shadow'
    };

    if (Object.prototype.hasOwnProperty.call(globals, normalized)) {
      return globals[normalized];
    }

    return null;
  }

  function isBootstrapTypographyTokenMappable(tokenName) {
    var normalized = normalizeTokenName(tokenName);
    var safeKeys = {
      base: true,
      body: true,
      caption: true,
      title: true,
      display: true,
      regular: true,
      medium: true,
      semibold: true,
      bold: true,
      light: true,
      normal: true,
      xxs: true,
      xs: true,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      '2xl': true,
      '3xl': true,
      '4xl': true,
      '5xl': true
    };

    if (!normalized) {
      return false;
    }

    if (/^(hover|active|focus|disabled|pressed|selected|visited)(-|$)/.test(normalized)) {
      return false;
    }

    if (/(hover|active|focus|disabled|overlay|component|button|input|card|modal|tooltip|popover|chip|badge|table|link)/.test(normalized)) {
      return false;
    }

    if (/^\d+$/.test(normalized)) {
      return true;
    }

    return !!safeKeys[normalized];
  }

  function resolveBootstrapRadiusVariable(tokenName) {
    var normalized = normalizeTokenName(tokenName);

    if (normalized === 'sm') {
      return '$border-radius-sm';
    }

    if (normalized === 'lg') {
      return '$border-radius-lg';
    }

    if (normalized === 'md' || normalized === 'default' || normalized === 'base') {
      return '$border-radius';
    }

    return null;
  }

  function buildTargetGroupSupport() {
    var targets = Object.keys(targetMappingTemplates);
    var support = {};
    var i;
    var j;
    var targetName;
    var byGroup;
    var groupName;
    var rules;

    for (i = 0; i < targets.length; i += 1) {
      targetName = targets[i];
      byGroup = {};
      rules = targetMappingTemplates[targetName] && targetMappingTemplates[targetName].groupRules ?
        targetMappingTemplates[targetName].groupRules :
        {};

      for (j = 0; j < supportedGroups.length; j += 1) {
        groupName = supportedGroups[j];
        byGroup[groupName] = !!rules[groupName];
      }

      support[targetName] = byGroup;
    }

    return support;
  }

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

  function normalizeSassPrefix(prefix) {
    var trimmed;
    var normalized;

    if (prefix === null || typeof prefix === 'undefined') {
      return 'tk';
    }

    trimmed = String(prefix).trim();

    if (!trimmed) {
      return 'tk';
    }

    normalized = trimmed
      .replace(/^\$+/, '')
      .replace(/^-+/, '')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();

    return normalized || 'tk';
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

  function isColorValue(value) {
    var text;

    if (typeof value !== 'string') {
      return false;
    }

    text = value.trim();

    if (!text) {
      return false;
    }

    if (/^#[0-9a-fA-F]{3}$/.test(text) || /^#[0-9a-fA-F]{4}$/.test(text) || /^#[0-9a-fA-F]{6}$/.test(text) || /^#[0-9a-fA-F]{8}$/.test(text)) {
      return true;
    }

    if (/^rgba?\(.+\)$/i.test(text) || /^hsla?\(.+\)$/i.test(text)) {
      return true;
    }

    if (/^transparent$/i.test(text) || /^currentcolor$/i.test(text)) {
      return true;
    }

    return /^var\(--[^)]+\)$/.test(text) || /^oklch\(.+\)$/i.test(text);
  }

  function getColorOmissionReason(value) {
    if (value === null || typeof value === 'undefined') {
      return 'valor nulo';
    }

    if (!isColorValue(value)) {
      return 'valor de color inválido';
    }

    return null;
  }

  function isSpacingValue(value) {
    var text;

    if (typeof value === 'number') {
      return Number.isFinite(value);
    }

    if (typeof value !== 'string') {
      return false;
    }

    text = value.trim();

    if (!text) {
      return false;
    }

    if (text === '0' || /^-?\d+(\.\d+)?$/.test(text)) {
      return true;
    }

    return (
      /^-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)$/i.test(text) ||
      /^(calc|min|max|clamp)\(.+\)$/i.test(text) ||
      /^var\(--[^)]+\)$/.test(text)
    );
  }

  function getSpacingOmissionReason(value) {
    if (value === null || typeof value === 'undefined') {
      return 'valor nulo';
    }

    if (!isSpacingValue(value)) {
      return 'valor de spacing inválido';
    }

    return null;
  }

  function isShadowValue(value) {
    var text;

    if (typeof value !== 'string') {
      return false;
    }

    text = value.trim();

    if (!text) {
      return false;
    }

    if (/^none$/i.test(text) || /^var\(--[^)]+\)$/.test(text)) {
      return true;
    }

    return (
      /(^|[\s,(])-?\d+(\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc|q)(?=[\s,)])/i.test(text) ||
      /(^|[\s,(])0(?=[\s,)])/i.test(text)
    );
  }

  function getShadowOmissionReason(value) {
    if (value === null || typeof value === 'undefined') {
      return 'valor nulo';
    }

    if (!isShadowValue(value)) {
      return 'formato de shadow inválido';
    }

    return null;
  }

  function sanitizeLeafGroup(source, reasonResolver, pathPrefix, invalidPaths) {
    var keys;
    var i;
    var key;
    var value;
    var path;
    var sanitized;
    var nested;

    if (!isPlainObject(source)) {
      return source;
    }

    sanitized = {};
    keys = Object.keys(source);

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      value = source[key];
      path = pathPrefix ? pathPrefix + '.' + key : key;

      if (isPlainObject(value)) {
        nested = sanitizeLeafGroup(value, reasonResolver, path, invalidPaths);
        if (isPlainObject(nested) && Object.keys(nested).length > 0) {
          sanitized[key] = nested;
        }
        continue;
      }

      var reason = reasonResolver(value);

      if (!reason) {
        sanitized[key] = value;
      } else {
        invalidPaths.push({
          path: path,
          reason: reason
        });
      }
    }

    return sanitized;
  }

  function groupHasValues(tokens, groupName) {
    if (!isPlainObject(tokens) || !isPlainObject(tokens[groupName])) {
      return false;
    }

    return Object.keys(tokens[groupName]).length > 0;
  }

  var supportedGroupsSet = {
    colors: true,
    spacing: true,
    typography: true,
    radius: true,
    shadows: true
  };

  function resolveCanonicalGroupName(key) {
    if (!key) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(supportedGroupsSet, key)) {
      return key;
    }

    if (Object.prototype.hasOwnProperty.call(topLevelAliases, key)) {
      return topLevelAliases[key];
    }

    var lowered = String(key).toLowerCase();
    if (Object.prototype.hasOwnProperty.call(topLevelAliases, lowered)) {
      return topLevelAliases[lowered];
    }

    return null;
  }

  function replacePathValue(source, path, replacement) {
    var parts;

    function walk(node, index) {
      var key;
      var clone;

      if (!isPlainObject(node)) {
        return node;
      }

      key = parts[index];
      clone = Object.assign({}, node);

      if (index === parts.length - 1) {
        clone[key] = replacement;
        return clone;
      }

      clone[key] = walk(node[key], index + 1);
      return clone;
    }

    if (path === 'top-level') {
      return replacement;
    }

    parts = String(path).split('.');
    return walk(source, 0);
  }

  function isColorLike(value) {
    var text = String(value || '').trim();

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
    var keys;
    var i;
    var key;
    var value;

    if (!isPlainObject(source) || depth > 3) {
      return;
    }

    keys = Object.keys(source);
    candidates.push({
      path: basePath || 'top-level',
      value: source,
      depth: depth
    });

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      value = source[key];

      if (!isPlainObject(value)) {
        continue;
      }

      collectObjectPathCandidates(value, basePath ? basePath + '.' + key : key, depth + 1, candidates);
    }
  }

  function inspectFlatVariantCollection(collection) {
    var tokenNames = Object.keys(collection || {});
    var variantKeysByToken = [];
    var scalarCount = 0;
    var colorLikeCount = 0;
    var i;
    var j;
    var tokenName;
    var tokenValue;
    var variantKeys;
    var variantValue;
    var mergedVariantKeys = {};

    if (tokenNames.length === 0) {
      return null;
    }

    for (i = 0; i < tokenNames.length; i += 1) {
      tokenName = tokenNames[i];
      tokenValue = collection[tokenName];

      if (!isPlainObject(tokenValue)) {
        return null;
      }

      variantKeys = Object.keys(tokenValue);
      if (variantKeys.length === 0) {
        return null;
      }

      variantKeysByToken.push(variantKeys);

      for (j = 0; j < variantKeys.length; j += 1) {
        variantValue = tokenValue[variantKeys[j]];

        if (isPlainObject(variantValue) || Array.isArray(variantValue) || variantValue === null || typeof variantValue === 'undefined') {
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

    for (i = 0; i < variantKeysByToken.length; i += 1) {
      for (j = 0; j < variantKeysByToken[i].length; j += 1) {
        mergedVariantKeys[variantKeysByToken[i][j]] = true;
      }
    }

    return {
      tokenCount: tokenNames.length,
      variantKeys: Object.keys(mergedVariantKeys),
      colorLikeRatio: colorLikeCount / scalarCount
    };
  }

  function resolveAutoVariant(variantKeys) {
    var keys = Array.isArray(variantKeys) ? variantKeys.slice() : [];
    var byLower = {};
    var i;

    if (keys.length === 1) {
      return {
        selectedVariant: keys[0],
        reason: 'single'
      };
    }

    if (keys.length === 2) {
      for (i = 0; i < keys.length; i += 1) {
        byLower[String(keys[i]).toLowerCase()] = keys[i];
      }

      if (byLower.light && byLower.dark) {
        return {
          selectedVariant: byLower.light,
          reason: 'light-dark-default'
        };
      }
    }

    return null;
  }

  function resolveExplicitVariant(variantKeys, requestedVariant) {
    var available = Array.isArray(variantKeys) ? variantKeys.slice() : [];
    var requested = typeof requestedVariant === 'string' ? requestedVariant.trim() : '';
    var requestedLower;
    var caseInsensitiveMatches;

    if (!requested) {
      return {
        selectedVariant: null,
        error: null
      };
    }

    if (available.indexOf(requested) !== -1) {
      return {
        selectedVariant: requested,
        error: null
      };
    }

    requestedLower = requested.toLowerCase();
    caseInsensitiveMatches = available.filter(function (key) {
      return String(key).toLowerCase() === requestedLower;
    });

    if (caseInsensitiveMatches.length === 1) {
      return {
        selectedVariant: caseInsensitiveMatches[0],
        error: null
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
          '). Usa el nombre exacto.'
      };
    }

    return {
      selectedVariant: null,
      error: null
    };
  }

  function applyFlatVariantCollectionAdapter(rawTokens, options) {
    var importOptions = isPlainObject(options) ? options : {};
    var explicitVariant = typeof importOptions.explicitVariant === 'string' ? importOptions.explicitVariant.trim() : '';
    var metadata = {
      sourcePattern: null,
      rootUsed: null,
      selectedVariant: null,
      availableVariants: [],
      autoSelectedVariant: null,
      variantSelectionMode: null,
      warnings: [],
      errors: [],
      applied: false
    };
    var objectCandidates;
    var i;
    var j;
    var rootCandidate;
    var rootValue;
    var keys;
    var key;
    var maybeCollection;
    var inspection;
    var requestedVariant;
    var autoVariant;
    var selectedVariant;
    var siblingKeys;
    var siblingGroupSignals;
    var extractedKeyGroup;
    var shouldMergeIntoSiblingRoot;
    var colorTokens;
    var tokenNames;
    var k;
    var tokenName;
    var tokenValue;

    if (!isPlainObject(rawTokens)) {
      return {
        adapted: rawTokens,
        metadata: metadata
      };
    }

    objectCandidates = [];
    collectObjectPathCandidates(rawTokens, '', 0, objectCandidates);

    for (i = 0; i < objectCandidates.length; i += 1) {
      rootCandidate = objectCandidates[i];
      rootValue = rootCandidate.value;
      keys = Object.keys(rootValue);

      for (j = 0; j < keys.length; j += 1) {
        key = keys[j];
        maybeCollection = rootValue[key];

        if (!isPlainObject(maybeCollection)) {
          continue;
        }

        inspection = inspectFlatVariantCollection(maybeCollection);
        if (!inspection || inspection.colorLikeRatio < 0.7) {
          continue;
        }

        metadata.sourcePattern = 'flatVariantCollection';
        metadata.availableVariants = inspection.variantKeys.slice();
        var collectionPath = rootCandidate.path === 'top-level' ? key : rootCandidate.path + '.' + key;
        metadata.rootUsed = collectionPath;
        requestedVariant = resolveExplicitVariant(inspection.variantKeys, explicitVariant);

        if (requestedVariant.error) {
          metadata.errors.push(requestedVariant.error);
          return {
            adapted: rawTokens,
            metadata: metadata
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
            '.'
          );
          return {
            adapted: rawTokens,
            metadata: metadata
          };
        }

        autoVariant = resolveAutoVariant(inspection.variantKeys);
        metadata.autoSelectedVariant = autoVariant ? autoVariant.selectedVariant : null;

        if (!autoVariant && !requestedVariant.selectedVariant) {
          metadata.errors.push(
            'Se detectó una colección con múltiples variantes en "' +
            collectionPath +
            '". Variantes disponibles: ' +
            inspection.variantKeys.join(', ') +
            '. Selecciona una variante explícita para continuar.'
          );
          return {
            adapted: rawTokens,
            metadata: metadata
          };
        }

        selectedVariant = requestedVariant.selectedVariant || autoVariant.selectedVariant;
        colorTokens = {};
        tokenNames = Object.keys(maybeCollection);

        for (k = 0; k < tokenNames.length; k += 1) {
          tokenName = tokenNames[k];
          tokenValue = maybeCollection[tokenName][selectedVariant];

          if (tokenValue === null || typeof tokenValue === 'undefined') {
            continue;
          }

          colorTokens[tokenName] = String(tokenValue);
        }

        metadata.selectedVariant = selectedVariant;
        metadata.variantSelectionMode = requestedVariant.selectedVariant ? 'explicit' : autoVariant.reason;
        metadata.applied = true;
        siblingKeys = keys.filter(function (item) { return item !== key; });
        siblingGroupSignals = siblingKeys.filter(function (siblingKey) {
          return !!resolveCanonicalGroupName(siblingKey);
        });
        extractedKeyGroup = resolveCanonicalGroupName(key);
        shouldMergeIntoSiblingRoot = extractedKeyGroup === 'colors' || siblingGroupSignals.length > 0;
        if (shouldMergeIntoSiblingRoot) {
          metadata.rootUsed = rootCandidate.path;
        }

        if (requestedVariant.selectedVariant) {
          metadata.warnings.push(
            'Se usó la variante explícita "' + selectedVariant + '" en "' + metadata.rootUsed + '".'
          );
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
          var rebuiltRoot = Object.assign({}, rootValue);
          rebuiltRoot[key] = colorTokens;

          return {
            adapted: replacePathValue(rawTokens, rootCandidate.path, rebuiltRoot),
            metadata: metadata
          };
        }

        return {
          adapted: {
            colors: colorTokens
          },
          metadata: metadata
        };
      }
    }

    return {
      adapted: rawTokens,
      metadata: metadata
    };
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

  function hasCanonicalGroupShape(value) {
    var i;
    var key;

    if (!isPlainObject(value)) {
      return false;
    }

    for (i = 0; i < supportedGroups.length; i += 1) {
      key = supportedGroups[i];

      if (Object.prototype.hasOwnProperty.call(value, key) && isPlainObject(value[key])) {
        return true;
      }
    }

    return false;
  }

  function countKnownGroupKeys(value) {
    var keys = Object.keys(value || {});
    var canonicalCount = 0;
    var aliasCount = 0;
    var unrelatedCount = 0;
    var i;
    var key;

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];

      if (supportedGroups.indexOf(key) !== -1) {
        canonicalCount += 1;
        continue;
      }

      if (getAliasTargetKey(key, topLevelAliases)) {
        aliasCount += 1;
        continue;
      }

      unrelatedCount += 1;
    }

    return {
      canonicalCount: canonicalCount,
      aliasCount: aliasCount,
      unrelatedCount: unrelatedCount,
      totalKeys: keys.length
    };
  }

  function collectTokenRootCandidates(source, basePath, depth, candidates) {
    var keys;
    var i;
    var key;
    var value;
    var path;
    var counts;
    var looksLikeRoot;
    var shouldDive;
    var pathParts;
    var leaf;
    var leafLower;
    var wrapperHint;
    var preferredHint;
    var score;

    if (!isPlainObject(source) || depth > 3) {
      return;
    }

    keys = Object.keys(source);

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      value = source[key];
      path = basePath ? basePath + '.' + key : key;
      counts = countKnownGroupKeys(value);
      looksLikeRoot = isPlainObject(value) && (counts.canonicalCount > 0 || counts.aliasCount > 0);
      shouldDive = isPlainObject(value) && (wrapperKeys[key] || wrapperKeys[String(key).toLowerCase()] || depth < 2);

      if (looksLikeRoot) {
        pathParts = path.split('.');
        leaf = pathParts[pathParts.length - 1];
        leafLower = String(leaf).toLowerCase();
        wrapperHint = wrapperKeys[key] || wrapperKeys[String(key).toLowerCase()];
        preferredHint = preferredRootNames[leaf] || preferredRootNames[leafLower];
        score =
          counts.canonicalCount * 12 +
          counts.aliasCount * 6 +
          (counts.canonicalCount + counts.aliasCount >= 2 ? 8 : 0) +
          (preferredHint ? 6 : 0) +
          (wrapperHint ? 4 : 0) -
          Math.min(counts.unrelatedCount, 4) * 2 -
          depth * 2;

        candidates.push({
          path: path,
          value: value,
          canonicalCount: counts.canonicalCount,
          aliasCount: counts.aliasCount,
          unrelatedCount: counts.unrelatedCount,
          totalKeys: counts.totalKeys,
          preferredHint: !!preferredHint,
          wrapperHint: !!wrapperHint,
          depth: depth,
          score: score
        });
      }

      if (shouldDive) {
        collectTokenRootCandidates(value, path, depth + 1, candidates);
      }
    }
  }

  function pickTokenRoot(rawTokens, info, errors) {
    var rootResult = {
      value: rawTokens,
      path: 'top-level'
    };
    var candidates;
    var sorted;
    var best;
    var second;
    var scoreDelta;
    var topCandidates;

    if (!isPlainObject(rawTokens)) {
      return rootResult;
    }

    candidates = [];
    collectTokenRootCandidates(rawTokens, '', 0, candidates);

    if (hasCanonicalGroupShape(rawTokens)) {
      if (candidates.length > 0) {
        info.push('Using top-level token groups; wrapped candidates were ignored.');
      }
      return rootResult;
    }

    if (candidates.length === 0) {
      return rootResult;
    }

    if (candidates.length === 1) {
      info.push(
        'Using token root from "' +
        candidates[0].path +
        '" (' +
        candidates[0].canonicalCount +
        ' grupos canónicos, ' +
        candidates[0].aliasCount +
        ' aliases).'
      );
      return {
        value: candidates[0].value,
        path: candidates[0].path
      };
    }

    sorted = candidates.slice().sort(function (a, b) {
      return b.score - a.score;
    });
    best = sorted[0];
    second = sorted[1];
    scoreDelta = second ? best.score - second.score : best.score;

    if (scoreDelta < 4) {
      topCandidates = sorted.slice(0, 3);
      errors.push(
        'Se detectaron múltiples posibles raíces de tokens: ' +
        topCandidates.map(function (item) { return '"' + item.path + '"'; }).join(', ') +
        '. La diferencia de confianza es baja; deja una raíz clara (por ejemplo, "global" o "default").'
      );
      return rootResult;
    }

    info.push(
      'Detected multiple candidates; selected "' +
      best.path +
      '" because it has stronger token-group signals (score ' +
      best.score +
      ' vs ' +
      second.score +
      ').'
    );
    return {
      value: best.value,
      path: best.path
    };
  }

  function mergeObjectRecords(baseRecord, incomingRecord, context, normalizationNotes) {
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
        merged[key] = mergeObjectRecords(merged[key], incomingRecord[key], context + '.' + key, normalizationNotes);
        continue;
      }

      normalizationNotes.push('Conflicto en "' + context + '.' + key + '": se mantiene el valor existente y se ignora el alias.');
    }

    return merged;
  }

  function normalizeTypographyGroup(typographySource, normalizationNotes) {
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
      normalizedValue = isPlainObject(value) ? normalizeTypographyGroup(value, normalizationNotes) : value;

      if (mappedKey !== originalKey) {
        normalizationNotes.push('Clave de typography normalizada de "' + originalKey + '" a "' + mappedKey + '".');
      }

      if (Object.prototype.hasOwnProperty.call(normalized, mappedKey)) {
        if (isPlainObject(normalized[mappedKey]) && isPlainObject(normalizedValue)) {
          normalized[mappedKey] = mergeObjectRecords(
            normalized[mappedKey],
            normalizedValue,
            'typography.' + mappedKey,
            normalizationNotes
          );
        } else {
          normalizationNotes.push(
            'Conflicto en "typography.' + mappedKey + '": se mantiene el valor existente y se ignora la variante.'
          );
        }
        continue;
      }

      normalized[mappedKey] = normalizedValue;
    }

    return normalized;
  }

  function normalizeLengthLikeLeaf(value) {
    var trimmed;

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (Object.is(value, 0) || value === 0) {
        return '0';
      }
      return String(value) + 'px';
    }

    if (typeof value !== 'string') {
      return value;
    }

    trimmed = value.trim();

    if (!trimmed) {
      return value;
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      if (Number(trimmed) === 0) {
        return '0';
      }
      return trimmed + 'px';
    }

    return value;
  }

  function normalizeLengthLikeTree(value) {
    var normalized;
    var keys;
    var i;
    var key;

    if (isPlainObject(value)) {
      normalized = {};
      keys = Object.keys(value);

      for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        normalized[key] = normalizeLengthLikeTree(value[key]);
      }

      return normalized;
    }

    return normalizeLengthLikeLeaf(value);
  }

  function normalizeTypographyLengthValues(typographySource) {
    var normalized;
    var keys;
    var i;
    var key;
    var value;

    if (!isPlainObject(typographySource)) {
      return typographySource;
    }

    normalized = {};
    keys = Object.keys(typographySource);

    for (i = 0; i < keys.length; i += 1) {
      key = keys[i];
      value = typographySource[key];

      if (key === 'fontWeight') {
        normalized[key] = value;
        continue;
      }

      if (key === 'fontSize' || key === 'lineHeight') {
        normalized[key] = key === 'lineHeight' ? normalizeLineHeightTree(value) : normalizeLengthLikeTree(value);
        continue;
      }

      normalized[key] = isPlainObject(value) ? normalizeTypographyLengthValues(value) : value;
    }

    return normalized;
  }

  function normalizeLineHeightLeaf(value) {
    var trimmed;

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (Object.is(value, 0) || value === 0) {
        return '0';
      }
      return String(value);
    }

    if (typeof value !== 'string') {
      return value;
    }

    trimmed = value.trim();

    if (!trimmed) {
      return value;
    }

    if (/^normal$/i.test(trimmed)) {
      return 'normal';
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      if (Number(trimmed) === 0) {
        return '0';
      }
      return trimmed;
    }

    return value;
  }

  function normalizeLineHeightTree(value) {
    var normalized;
    var keys;
    var i;
    var key;

    if (isPlainObject(value)) {
      normalized = {};
      keys = Object.keys(value);

      for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        normalized[key] = normalizeLineHeightTree(value[key]);
      }

      return normalized;
    }

    return normalizeLineHeightLeaf(value);
  }

  function normalizeTokenInput(rawTokens, options) {
    var importNotes = [];
    var normalizationNotes = [];
    var omissions = [];
    var info = [];
    var errors = [];
    var normalized;
    var extractedRoot;
    var rootSelection;
    var detectedGroups;
    var adapterResult;
    var adapterMetadata;
    var adaptedInput;
    var summaryRootUsed;
    var keys;
    var i;
    var originalKey;
    var value;
    var canonicalKey;
    var isCanonical;
    var normalizedValue;

    adapterResult = applyFlatVariantCollectionAdapter(rawTokens, options);
    adaptedInput = adapterResult.adapted;
    adapterMetadata = adapterResult.metadata;
    summaryRootUsed = adapterMetadata.rootUsed || 'top-level';

    if (adapterMetadata.errors.length > 0) {
      errors = errors.concat(adapterMetadata.errors);
    }
    if (adapterMetadata.warnings.length > 0) {
      importNotes = importNotes.concat(adapterMetadata.warnings);
    }

    if (!isPlainObject(adaptedInput) || errors.length > 0) {
      info.push.apply(info, importNotes);
      info.push.apply(info, normalizationNotes);

      return {
        normalized: adaptedInput,
        info: info,
        summary: {
          rootUsed: summaryRootUsed,
          detectedGroups: [],
          normalizationNotes: normalizationNotes,
          omissions: omissions,
          importNotes: importNotes,
          sourcePattern: adapterMetadata.sourcePattern,
          selectedVariant: adapterMetadata.selectedVariant,
          availableVariants: adapterMetadata.availableVariants,
          autoSelectedVariant: adapterMetadata.autoSelectedVariant,
          variantSelectionMode: adapterMetadata.variantSelectionMode
        },
        errors: errors
      };
    }

    rootSelection = pickTokenRoot(adaptedInput, importNotes, errors);
    extractedRoot = rootSelection.value;
    if (errors.length > 0) {
      info.push.apply(info, importNotes);
      info.push.apply(info, normalizationNotes);
      return {
        normalized: adaptedInput,
        info: info,
        summary: {
          rootUsed: adapterMetadata.rootUsed || rootSelection.path,
          detectedGroups: [],
          normalizationNotes: normalizationNotes,
          omissions: omissions,
          importNotes: importNotes,
          sourcePattern: adapterMetadata.sourcePattern,
          selectedVariant: adapterMetadata.selectedVariant,
          availableVariants: adapterMetadata.availableVariants,
          autoSelectedVariant: adapterMetadata.autoSelectedVariant,
          variantSelectionMode: adapterMetadata.variantSelectionMode
        },
        errors: errors
      };
    }

    normalized = {};
    keys = Object.keys(extractedRoot);

    for (i = 0; i < keys.length; i += 1) {
      originalKey = keys[i];
      value = extractedRoot[originalKey];
      canonicalKey = getAliasTargetKey(originalKey, topLevelAliases) || originalKey;
      isCanonical = supportedGroups.indexOf(originalKey) !== -1;
      normalizedValue =
        canonicalKey === 'typography' && isPlainObject(value) ? normalizeTypographyGroup(value, normalizationNotes) : value;

      if (canonicalKey !== originalKey) {
        normalizationNotes.push('Grupo top-level normalizado de "' + originalKey + '" a "' + canonicalKey + '".');
      }

      if (!Object.prototype.hasOwnProperty.call(normalized, canonicalKey)) {
        normalized[canonicalKey] = normalizedValue;
        continue;
      }

      if (isCanonical) {
        normalizationNotes.push('Se mantiene el grupo canónico "' + canonicalKey + '" y se ignora la variante duplicada.');
        continue;
      }

      if (isPlainObject(normalized[canonicalKey]) && isPlainObject(normalizedValue)) {
        normalized[canonicalKey] = mergeObjectRecords(
          normalized[canonicalKey],
          normalizedValue,
          canonicalKey,
          normalizationNotes
        );
      } else {
        normalizationNotes.push(
          'Conflicto al normalizar "' + originalKey + '" en "' + canonicalKey + '": se mantiene el valor canónico.'
        );
      }
    }

    if (isPlainObject(normalized.spacing)) {
      normalized.spacing = normalizeLengthLikeTree(normalized.spacing);
    }

    if (isPlainObject(normalized.radius)) {
      normalized.radius = normalizeLengthLikeTree(normalized.radius);
    }

    if (isPlainObject(normalized.typography)) {
      normalized.typography = normalizeTypographyLengthValues(normalized.typography);
    }

    var invalidColorPaths = [];
    var invalidSpacingPaths = [];
    var invalidShadowPaths = [];

    if (isPlainObject(normalized.colors)) {
      normalized.colors = sanitizeLeafGroup(normalized.colors, getColorOmissionReason, 'colors', invalidColorPaths);
    }

    if (isPlainObject(normalized.spacing)) {
      normalized.spacing = sanitizeLeafGroup(normalized.spacing, getSpacingOmissionReason, 'spacing', invalidSpacingPaths);
    }

    if (isPlainObject(normalized.shadows)) {
      normalized.shadows = sanitizeLeafGroup(normalized.shadows, getShadowOmissionReason, 'shadows', invalidShadowPaths);
    }

    if (invalidColorPaths.length > 0) {
      normalizationNotes.push(
        'Se omiten tokens inválidos en "colors": ' + joinQuoted(invalidColorPaths.map(function (item) { return item.path; })) + '.'
      );
      for (i = 0; i < invalidColorPaths.length; i += 1) {
        omissions.push({
          kind: 'token',
          path: invalidColorPaths[i].path,
          reason: invalidColorPaths[i].reason
        });
      }
    }

    if (invalidSpacingPaths.length > 0) {
      normalizationNotes.push(
        'Se omiten tokens inválidos en "spacing": ' + joinQuoted(invalidSpacingPaths.map(function (item) { return item.path; })) + '.'
      );
      for (i = 0; i < invalidSpacingPaths.length; i += 1) {
        omissions.push({
          kind: 'token',
          path: invalidSpacingPaths[i].path,
          reason: invalidSpacingPaths[i].reason
        });
      }
    }

    if (invalidShadowPaths.length > 0) {
      normalizationNotes.push(
        'Se omiten tokens inválidos en "shadows": ' + joinQuoted(invalidShadowPaths.map(function (item) { return item.path; })) + '.'
      );
      for (i = 0; i < invalidShadowPaths.length; i += 1) {
        omissions.push({
          kind: 'token',
          path: invalidShadowPaths[i].path,
          reason: invalidShadowPaths[i].reason
        });
      }
    }

    detectedGroups = supportedGroups.filter(function (groupName) {
      return groupHasValues(normalized, groupName);
    });
    if (detectedGroups.length > 0) {
      importNotes.push(
        'Import summary: root "' +
        (adapterMetadata.rootUsed || rootSelection.path) +
        '", grupos detectados: ' +
        detectedGroups.join(', ') +
        '.'
      );
    }
    info.push.apply(info, importNotes);
    info.push.apply(info, normalizationNotes);

    return {
      normalized: normalized,
      info: info,
      summary: {
        rootUsed: adapterMetadata.rootUsed || rootSelection.path,
        detectedGroups: detectedGroups,
        normalizationNotes: normalizationNotes,
        omissions: omissions,
        importNotes: importNotes,
        sourcePattern: adapterMetadata.sourcePattern,
        selectedVariant: adapterMetadata.selectedVariant,
        availableVariants: adapterMetadata.availableVariants,
        autoSelectedVariant: adapterMetadata.autoSelectedVariant,
        variantSelectionMode: adapterMetadata.variantSelectionMode
      },
      errors: errors
    };
  }

  function validateTokenInput(tokens, target) {
    var errors = [];
    var warnings = [];
    var omissions = [];
    var support = targetGroupSupport[target] || targetGroupSupport.css;
    var topLevelKeys;
    var unsupportedTopLevel;
    var supportedPresentGroups;
    var ignoredGroups;
    var i;
    var groupName;

    if (!isPlainObject(tokens)) {
      errors.push('La raíz del JSON debe ser un objeto con grupos de tokens (por ejemplo: colors, spacing).');
      return {
        errors: errors,
        warnings: warnings,
        omissions: omissions,
        supportedGroups: [],
        unsupportedGroups: [],
        ignoredGroups: []
      };
    }

    topLevelKeys = Object.keys(tokens);
    var nonCanonicalTopLevel = topLevelKeys.filter(function (key) {
      return supportedGroups.indexOf(key) === -1;
    });
    var alternativeRootGroups = nonCanonicalTopLevel.filter(function (key) {
      if (!wrapperKeys[key] && !wrapperKeys[String(key).toLowerCase()]) {
        return false;
      }

      return isPlainObject(tokens[key]);
    });
    unsupportedTopLevel = nonCanonicalTopLevel.filter(function (key) {
      return alternativeRootGroups.indexOf(key) === -1;
    });

    if (alternativeRootGroups.length > 0) {
      if (alternativeRootGroups.length === 1) {
        warnings.push(
          'Se detectó una rama alternativa en ' + joinQuoted(alternativeRootGroups) + ', pero se priorizó la estructura canónica de nivel principal.'
        );
      } else {
        warnings.push(
          'Se detectaron ramas alternativas en ' + joinQuoted(alternativeRootGroups) + ', pero se priorizó la estructura canónica de nivel principal.'
        );
      }
    }

    if (unsupportedTopLevel.length > 0) {
      warnings.push('Grupos no soportados: ' + joinQuoted(unsupportedTopLevel) + '. Se ignorarán en la generación.');
      for (i = 0; i < unsupportedTopLevel.length; i += 1) {
        omissions.push({
          kind: 'group',
          path: unsupportedTopLevel[i],
          reason: 'grupo no soportado'
        });
      }
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
        omissions: omissions,
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
        omissions: omissions,
        supportedGroups: supportedPresentGroups,
        unsupportedGroups: unsupportedTopLevel,
        ignoredGroups: ignoredGroups
      };
    }

    if (ignoredGroups.length > 0) {
      warnings.push('El target "' + target + '" ignora los grupos: ' + joinQuoted(ignoredGroups) + '.');
      for (i = 0; i < ignoredGroups.length; i += 1) {
        omissions.push({
          kind: 'group',
          path: ignoredGroups[i],
          reason: 'sin mapeo útil para el target seleccionado'
        });
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
      omissions: omissions,
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

  function sortTokenKeys(keys) {
    var scaleOrder = {
      xxs: 0,
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      '2xl': 6,
      '3xl': 7,
      '4xl': 8,
      '5xl': 9
    };

    return keys.slice().sort(function (a, b) {
      var aLower = String(a).toLowerCase();
      var bLower = String(b).toLowerCase();
      var aRank = Object.prototype.hasOwnProperty.call(scaleOrder, aLower) ? scaleOrder[aLower] : null;
      var bRank = Object.prototype.hasOwnProperty.call(scaleOrder, bLower) ? scaleOrder[bLower] : null;

      if (aRank !== null && bRank !== null) {
        return aRank - bRank;
      }

      if (aRank !== null) {
        return -1;
      }

      if (bRank !== null) {
        return 1;
      }

      return String(a).localeCompare(String(b), undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  function getSortedKeys(source) {
    return sortTokenKeys(Object.keys(source || {}));
  }

  function flattenTokenEntries(groupTokens) {
    var source = isPlainObject(groupTokens) ? groupTokens : {};
    var keys = getSortedKeys(source);
    var entries = [];

    function pushEntries(baseKey, value) {
      var nestedKeys;
      var i;

      if (isPlainObject(value)) {
        nestedKeys = getSortedKeys(value);

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
    var topKeys = getSortedKeys(source);
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
          variantKeys = getSortedKeys(topValue);

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
    var keys = getSortedKeys(bucket);
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
    var colorKeys = getSortedKeys(groups.colors);
    var spacingKeys = getSortedKeys(groups.spacing);
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
      var normalizedName = toKebabCase(key) || key;
      return '  ' + buildCssVariableName(prefix, 'color', normalizedName) + ': ' + groups.colors[key] + ';';
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
    var nativeRole = resolveIonicNativeColorRole(name);
    var mappedBase = nativeRole ? getNativeMapping('ionic', 'colors.' + nativeRole) : null;
    var baseVariable = mappedBase || null;
    var rgb = hexToRgb(value);

    if (!baseVariable) {
      return null;
    }

    if (!rgb) {
      return [
        '  ' + baseVariable + ': ' + value + ';'
      ];
    }

    var contrast = getContrastRgb(rgb);
    var shade = shiftColor(rgb, -18);
    var tint = shiftColor(rgb, 18);

    return [
      '  ' + baseVariable + ': ' + value + ';',
      '  --ion-color-' + nativeRole + '-rgb: ' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ';',
      '  --ion-color-' + nativeRole + '-contrast: ' + rgbToHex(contrast) + ';',
      '  --ion-color-' + nativeRole + '-contrast-rgb: ' + contrast.r + ', ' + contrast.g + ', ' + contrast.b + ';',
      '  --ion-color-' + nativeRole + '-shade: ' + rgbToHex(shade) + ';',
      '  --ion-color-' + nativeRole + '-tint: ' + rgbToHex(tint) + ';'
    ];
  }

  function generateIonic(tokens, options) {
    var groups = getTokenGroups(tokens);
    var prefix = normalizeCssPrefix(options && options.prefix);
    var keys = getSortedKeys(groups.colors);
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
      var nativeRole = resolveIonicNativeColorRole(keys[i]);
      var fallbackTokenName = toKebabCase(keys[i]) || keys[i];
      colorLines = nativeRole
        ? (buildIonicColorLines(keys[i], groups.colors[keys[i]]) || ['  ' + getNativeMapping('ionic', 'colors.' + nativeRole) + ': ' + groups.colors[keys[i]] + ';'])
        : ['  ' + buildCssVariableName(prefix, 'color', fallbackTokenName) + ': ' + groups.colors[keys[i]] + ';'];

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
        var entry = typographyEntries[i];
        var tokenPath = null;
        var nativeMapping;
        var variableName;

        if (entry.group === 'font-family') {
          tokenPath = 'typography.fontFamily.' + entry.entry.name;
        } else if (entry.group === 'font-size') {
          tokenPath = 'typography.fontSize.' + entry.entry.name;
        } else if (entry.group === 'font-weight') {
          tokenPath = 'typography.fontWeight.' + entry.entry.name;
        } else if (entry.group === 'line-height') {
          tokenPath = 'typography.lineHeight.' + entry.entry.name;
        } else if (entry.group === 'letter-spacing') {
          tokenPath = 'typography.letterSpacing.' + entry.entry.name;
        }

        nativeMapping = tokenPath ? getNativeMapping('ionic', tokenPath) : null;
        variableName = nativeMapping || buildCssVariableName(prefix, entry.group, entry.entry.name);
        lines.push('  ' + variableName + ': ' + entry.entry.value + ';');
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

  function generateBootstrap(tokens, options) {
    var groups = getTokenGroups(tokens);
    var fallbackPrefix = normalizeSassPrefix(options && options.prefix);
    var targetProfile = options && options.targetProfile;
    var lines = [];
    var spacingKeys = getSortedKeys(groups.spacing);
    var radiusEntries = flattenTokenEntries(groups.radius);
    var shadowEntries = flattenTokenEntries(groups.shadows);
    var typographyBuckets = getTypographyBuckets(groups.typography);
    var colorEntries = [];
    var typographyBaseLines = [];
    var typographyMapLines = [];
    var typographyFallbackLines = [];
    var i;

    function buildExtendedSassVariable(group, tokenName) {
      return '$' + fallbackPrefix + '-' + group + '-' + (toKebabCase(tokenName) || tokenName);
    }

    function pickBaseEntry(bucket) {
      var keys;
      if (bucket.base) {
        return { name: 'base', value: bucket.base };
      }
      if (bucket.body) {
        return { name: 'body', value: bucket.body };
      }
      keys = getSortedKeys(bucket);
      if (keys.length === 0) {
        return null;
      }
      return { name: keys[0], value: bucket[keys[0]] };
    }

    function pickBucketEntry(bucket, preferredKeys) {
      var j;

      if (!bucket) {
        return null;
      }

      for (j = 0; j < preferredKeys.length; j += 1) {
        if (bucket[preferredKeys[j]]) {
          return {
            name: preferredKeys[j],
            value: bucket[preferredKeys[j]]
          };
        }
      }

      return pickBaseEntry(bucket);
    }

    function buildScssMap(variableName, bucket, keyFilter) {
      var keys = getSortedKeys(bucket);
      var mapLines = [];
      var j;

      for (j = 0; j < keys.length; j += 1) {
        if (keyFilter && !keyFilter(keys[j])) {
          continue;
        }

        if (mapLines.length === 0) {
          mapLines.push(variableName + ': (');
        }

        mapLines.push('  "' + keys[j] + '": ' + bucket[keys[j]] + ',');
      }

      if (mapLines.length === 0) {
        return null;
      }

      mapLines.push(');');
      return mapLines;
    }

    var colorKeys = getSortedKeys(groups.colors);
    var colorRoleAssignments = {};
    var globalColorAssignments = {};
    var globalColorOrder = ['$body-color', '$body-bg', '$border-color'];
    var consumedColorKeys = {};

    for (i = 0; i < colorKeys.length; i += 1) {
      var tokenName = colorKeys[i];
      var role = resolveBootstrapSemanticColorRole(tokenName);
      var probableGlobalVariable = resolveBootstrapProbableGlobalColorVariable(tokenName);
      var normalizedTokenName;
      var score;
      var previous;

      if (role && bootstrapColorNames[role]) {
        normalizedTokenName = normalizeTokenName(tokenName);
        score = normalizedTokenName === role ? 2 : 1;
        previous = colorRoleAssignments[role];

        if (!previous || score > previous.score) {
          colorRoleAssignments[role] = {
            value: groups.colors[tokenName],
            key: tokenName,
            score: score
          };
        }
        continue;
      }

      if (probableGlobalVariable) {
        var variableName = String(probableGlobalVariable).replace(/^\$/, '');
        normalizedTokenName = normalizeTokenName(tokenName);
        score = normalizedTokenName === variableName ? 2 : 1;
        previous = globalColorAssignments[probableGlobalVariable];

        if (!previous || score > previous.score) {
          globalColorAssignments[probableGlobalVariable] = {
            value: groups.colors[tokenName],
            key: tokenName,
            score: score
          };
        }
      }
    }

    for (i = 0; i < bootstrapColorOrder.length; i += 1) {
      var roleName = bootstrapColorOrder[i];
      var assignment = colorRoleAssignments[roleName];

      if (!assignment) {
        continue;
      }

      if (bootstrapColorNames[roleName]) {
        var colorVariable = getNativeMapping('bootstrap', 'colors.' + roleName, targetProfile) || ('$' + roleName);
        colorEntries.push(colorVariable + ': ' + assignment.value + ';');
        consumedColorKeys[assignment.key] = true;
      }
    }

    for (i = 0; i < globalColorOrder.length; i += 1) {
      var globalVariableName = globalColorOrder[i];
      var globalAssignment = globalColorAssignments[globalVariableName];

      if (!globalAssignment) {
        continue;
      }

      colorEntries.push(globalVariableName + ': ' + globalAssignment.value + ';');
      consumedColorKeys[globalAssignment.key] = true;
    }

    for (i = 0; i < colorKeys.length; i += 1) {
      var colorKey = colorKeys[i];

      if (consumedColorKeys[colorKey]) {
        continue;
      }

      colorEntries.push(buildExtendedSassVariable('color', colorKey) + ': ' + groups.colors[colorKey] + ';');
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

    var consumedTypography = {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
      letterSpacing: {}
    };
    var fontFamilyBase = pickBucketEntry(typographyBuckets.fontFamily, ['base', 'body']);
    var fontSizeBase = pickBucketEntry(typographyBuckets.fontSize, ['body', 'base']);
    var fontWeightBase = pickBucketEntry(typographyBuckets.fontWeight, ['regular', 'base']);
    var lineHeightBase = pickBucketEntry(typographyBuckets.lineHeight, ['body', 'base']);

    if (fontFamilyBase) {
      typographyBaseLines.push(
        (getNativeMapping('bootstrap', 'typography.fontFamily.base', targetProfile) || '$font-family-base') + ': ' + fontFamilyBase.value + ';'
      );
      consumedTypography.fontFamily[fontFamilyBase.name] = true;
    }
    if (fontSizeBase) {
      typographyBaseLines.push(
        (getNativeMapping('bootstrap', 'typography.fontSize.body', targetProfile) || '$font-size-base') + ': ' + fontSizeBase.value + ';'
      );
      consumedTypography.fontSize[fontSizeBase.name] = true;
    }
    if (fontWeightBase) {
      typographyBaseLines.push(
        (getNativeMapping('bootstrap', 'typography.fontWeight.regular', targetProfile) || '$font-weight-base') + ': ' + fontWeightBase.value + ';'
      );
      consumedTypography.fontWeight[fontWeightBase.name] = true;
    }
    if (lineHeightBase) {
      typographyBaseLines.push(
        (getNativeMapping('bootstrap', 'typography.lineHeight.body', targetProfile) || '$line-height-base') + ': ' + lineHeightBase.value + ';'
      );
      consumedTypography.lineHeight[lineHeightBase.name] = true;
    }

    var fontSizesMap = buildScssMap('$font-sizes', typographyBuckets.fontSize, isBootstrapTypographyTokenMappable);
    var fontWeightsMap = buildScssMap('$font-weights', typographyBuckets.fontWeight, isBootstrapTypographyTokenMappable);
    var lineHeightsMap = buildScssMap('$line-heights', typographyBuckets.lineHeight, isBootstrapTypographyTokenMappable);

    if (fontSizesMap) {
      typographyMapLines = typographyMapLines.concat(fontSizesMap);
    }
    if (fontWeightsMap) {
      typographyMapLines = typographyMapLines.concat(fontWeightsMap);
    }
    if (lineHeightsMap) {
      typographyMapLines = typographyMapLines.concat(lineHeightsMap);
    }

    var fontSizeKeys = getSortedKeys(typographyBuckets.fontSize);
    var fontWeightKeys = getSortedKeys(typographyBuckets.fontWeight);
    var lineHeightKeys = getSortedKeys(typographyBuckets.lineHeight);
    var fontFamilyKeys = getSortedKeys(typographyBuckets.fontFamily);
    var letterSpacingKeys = getSortedKeys(typographyBuckets.letterSpacing);

    for (i = 0; i < fontSizeKeys.length; i += 1) {
      if (isBootstrapTypographyTokenMappable(fontSizeKeys[i])) {
        consumedTypography.fontSize[fontSizeKeys[i]] = true;
      }
    }
    for (i = 0; i < fontWeightKeys.length; i += 1) {
      if (isBootstrapTypographyTokenMappable(fontWeightKeys[i])) {
        consumedTypography.fontWeight[fontWeightKeys[i]] = true;
      }
    }
    for (i = 0; i < lineHeightKeys.length; i += 1) {
      if (isBootstrapTypographyTokenMappable(lineHeightKeys[i])) {
        consumedTypography.lineHeight[lineHeightKeys[i]] = true;
      }
    }

    for (i = 0; i < fontFamilyKeys.length; i += 1) {
      if (!consumedTypography.fontFamily[fontFamilyKeys[i]]) {
        typographyFallbackLines.push(
          buildExtendedSassVariable('font-family', fontFamilyKeys[i]) + ': ' + typographyBuckets.fontFamily[fontFamilyKeys[i]] + ';'
        );
      }
    }
    for (i = 0; i < fontSizeKeys.length; i += 1) {
      if (!consumedTypography.fontSize[fontSizeKeys[i]]) {
        typographyFallbackLines.push(
          buildExtendedSassVariable('font-size', fontSizeKeys[i]) + ': ' + typographyBuckets.fontSize[fontSizeKeys[i]] + ';'
        );
      }
    }
    for (i = 0; i < fontWeightKeys.length; i += 1) {
      if (!consumedTypography.fontWeight[fontWeightKeys[i]]) {
        typographyFallbackLines.push(
          buildExtendedSassVariable('font-weight', fontWeightKeys[i]) + ': ' + typographyBuckets.fontWeight[fontWeightKeys[i]] + ';'
        );
      }
    }
    for (i = 0; i < lineHeightKeys.length; i += 1) {
      if (!consumedTypography.lineHeight[lineHeightKeys[i]]) {
        typographyFallbackLines.push(
          buildExtendedSassVariable('line-height', lineHeightKeys[i]) + ': ' + typographyBuckets.lineHeight[lineHeightKeys[i]] + ';'
        );
      }
    }
    for (i = 0; i < letterSpacingKeys.length; i += 1) {
      typographyFallbackLines.push(
        buildExtendedSassVariable('letter-spacing', letterSpacingKeys[i]) + ': ' + typographyBuckets.letterSpacing[letterSpacingKeys[i]] + ';'
      );
    }

    if (typographyBaseLines.length > 0 || typographyMapLines.length > 0 || typographyFallbackLines.length > 0) {
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

      if (typographyFallbackLines.length > 0) {
        if (typographyBaseLines.length > 0 || typographyMapLines.length > 0) {
          lines.push('');
        }
        for (i = 0; i < typographyFallbackLines.length; i += 1) {
          lines.push(typographyFallbackLines[i]);
        }
      }
    }

    if (radiusEntries.length > 0) {
      var radiusMap = {};
      var radiusLines = [];
      var consumedRadiusKeys = {};

      for (i = 0; i < radiusEntries.length; i += 1) {
        radiusMap[radiusEntries[i].name] = radiusEntries[i].value;
      }

    if (radiusMap.sm) {
      var nativeRadiusSm = getNativeMapping('bootstrap', 'radius.sm', targetProfile);
      if (nativeRadiusSm) {
        radiusLines.push(nativeRadiusSm + ': ' + radiusMap.sm + ';');
        consumedRadiusKeys.sm = true;
      }
    }

    if (radiusMap.lg) {
      var nativeRadiusLg = getNativeMapping('bootstrap', 'radius.lg', targetProfile);
      if (nativeRadiusLg) {
        radiusLines.push(nativeRadiusLg + ': ' + radiusMap.lg + ';');
        consumedRadiusKeys.lg = true;
      }
    }

      if (radiusMap.base || radiusMap.default || radiusMap.md) {
        var nativeRadius =
          getNativeMapping('bootstrap', 'radius.md', targetProfile) ||
          getNativeMapping('bootstrap', 'radius.default', targetProfile) ||
          resolveBootstrapRadiusVariable('md') ||
          '$border-radius';
        radiusLines.push(nativeRadius + ': ' + (radiusMap.md || radiusMap.default || radiusMap.base) + ';');
        if (radiusMap.md) {
          consumedRadiusKeys.md = true;
        }
        if (radiusMap.default) {
          consumedRadiusKeys.default = true;
        }
        if (radiusMap.base) {
          consumedRadiusKeys.base = true;
        }
      }

      for (i = 0; i < radiusEntries.length; i += 1) {
        var radiusName = radiusEntries[i].name;
        if (consumedRadiusKeys[radiusName]) {
          continue;
        }
        radiusLines.push(buildExtendedSassVariable('radius', radiusName) + ': ' + radiusEntries[i].value + ';');
      }

      if (radiusLines.length > 0) {
        if (lines.length > 0) {
          lines.push('');
        }
        lines.push('/* Radius */');
        for (i = 0; i < radiusLines.length; i += 1) {
          lines.push(radiusLines[i]);
        }
      }
    }

    if (shadowEntries.length > 0) {
      var globalShadowAssignments = {};
      var globalShadowOrder = ['$box-shadow-sm', '$box-shadow'];
      var consumedShadowKeys = {};
      var shadowLines = [];

      for (i = 0; i < shadowEntries.length; i += 1) {
        var shadowName = shadowEntries[i].name;
        var globalShadowVariable = resolveBootstrapShadowGlobalVariable(shadowName);
        var normalizedShadowName = normalizeTokenName(shadowName);
        var shadowScore =
          normalizedShadowName === 'sm' ||
          normalizedShadowName === 'md' ||
          normalizedShadowName === 'default' ||
          normalizedShadowName === 'base' ? 2 : 1;
        var previousShadow = globalShadowAssignments[globalShadowVariable];

        if (!globalShadowVariable) {
          continue;
        }

        if (!previousShadow || shadowScore > previousShadow.score) {
          globalShadowAssignments[globalShadowVariable] = {
            value: shadowEntries[i].value,
            key: shadowName,
            score: shadowScore
          };
        }
      }

      for (i = 0; i < globalShadowOrder.length; i += 1) {
        var globalShadowName = globalShadowOrder[i];
        var globalShadowAssignment = globalShadowAssignments[globalShadowName];

        if (!globalShadowAssignment) {
          continue;
        }

        shadowLines.push(globalShadowName + ': ' + globalShadowAssignment.value + ';');
        consumedShadowKeys[globalShadowAssignment.key] = true;
      }

      for (i = 0; i < shadowEntries.length; i += 1) {
        var shadowKey = shadowEntries[i].name;
        if (consumedShadowKeys[shadowKey]) {
          continue;
        }
        shadowLines.push(buildExtendedSassVariable('shadow', shadowKey) + ': ' + shadowEntries[i].value + ';');
      }

      if (shadowLines.length > 0) {
        if (lines.length > 0) {
          lines.push('');
        }
        lines.push('/* Shadows */');
        for (i = 0; i < shadowLines.length; i += 1) {
          lines.push(shadowLines[i]);
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  function buildObjectSection(indent, label, source, comment) {
    var keys = getSortedKeys(source);
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
    var colorKeys = getSortedKeys(groups.colors);
    var spacingKeys = getSortedKeys(groups.spacing);
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
        var normalizedColorName = toKebabCase(colorKeys[i]) || colorKeys[i];
        sections[sections.length - 1].push('        ' + JSON.stringify(normalizedColorName) + ': ' + JSON.stringify(groups.colors[colorKeys[i]]) + ',');
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
    var prefixDependentFallbackModes = {
      'custom-prefix': true,
      'extended-sass-variable': true,
      'native-then-extended-sass-variable': true,
      'native-and-scss-maps-then-extended-sass-variable': true
    };
    var shouldShow = selectedTargets.some(function (target) {
      var template = getTargetTemplate(target);
      var groupFallbacks = template && template.groupFallbacks ? template.groupFallbacks : {};
      var fallbackKeys = Object.keys(groupFallbacks);
      var i;

      for (i = 0; i < fallbackKeys.length; i += 1) {
        if (prefixDependentFallbackModes[groupFallbacks[fallbackKeys[i]]]) {
          return true;
        }
      }

      return false;
    });
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

  function setOmission(message) {
    if (!message) {
      omissionMessage.hidden = true;
      omissionMessage.textContent = '';
      return;
    }

    omissionMessage.hidden = false;
    omissionMessage.textContent = message;
  }

  function hideInspector() {
    inspector.hidden = true;
    inspectorRoot.textContent = '-';
    inspectorSupported.textContent = '-';
    inspectorIgnoredRow.hidden = true;
    inspectorIgnored.textContent = '-';
    inspectorNormalizationRow.hidden = true;
    inspectorNormalization.textContent = '-';
    inspectorImportRow.hidden = true;
    inspectorImport.textContent = '-';
    inspectorOmissionRow.hidden = true;
    inspectorOmission.textContent = '-';
    inspectorWarningState.textContent = 'Sin advertencias';
  }

  function updateInspector(details) {
    var rootUsed = details && details.rootUsed ? details.rootUsed : 'top-level';
    var supported = details && details.supportedGroups ? details.supportedGroups : [];
    var ignored = details && details.ignoredGroups ? details.ignoredGroups : [];
    var normalizationNotes = details && details.normalizationNotes ? details.normalizationNotes : [];
    var importNotes = details && details.importNotes ? details.importNotes : [];
    var selectedVariant = details && details.selectedVariant ? details.selectedVariant : '';
    var targetProfileUsed = details && details.targetProfileUsed ? details.targetProfileUsed : '';
    var omissionCount = details && details.omissions ? details.omissions.length : 0;
    var warningCount = details && details.warningCount ? details.warningCount : 0;
    var hasMeaningfulDetails = warningCount > 0 || ignored.length > 0 || omissionCount > 0 || normalizationNotes.length > 0 || importNotes.length > 0 || !!selectedVariant || !!targetProfileUsed;
    var importSummary = importNotes.slice();
    var status = 'Sin advertencias';

    if (omissionCount > 0) {
      status = 'Con omisiones';
    } else if (warningCount > 0) {
      status = 'Con advertencias';
    }

    if (selectedVariant) {
      importSummary.push('Variante activa: "' + selectedVariant + '".');
    }
    if (targetProfileUsed) {
      importSummary.push('Target profile used: ' + targetProfileUsed + '.');
    }

    inspector.hidden = false;
    inspectorRoot.textContent = rootUsed === 'top-level' ? 'nivel principal' : rootUsed;
    inspectorSupported.textContent = supported.length > 0 ? supported.join(', ') : 'Ninguno';

    if (hasMeaningfulDetails && ignored.length > 0) {
      inspectorIgnoredRow.hidden = false;
      inspectorIgnored.textContent = ignored.join(', ');
    } else {
      inspectorIgnoredRow.hidden = true;
      inspectorIgnored.textContent = '-';
    }

    if (hasMeaningfulDetails && normalizationNotes.length > 0) {
      inspectorNormalizationRow.hidden = false;
      inspectorNormalization.textContent = normalizationNotes.join(' ');
    } else {
      inspectorNormalizationRow.hidden = true;
      inspectorNormalization.textContent = '-';
    }

    if (hasMeaningfulDetails && importSummary.length > 0) {
      inspectorImportRow.hidden = false;
      inspectorImport.textContent = importSummary.join(' ');
    } else {
      inspectorImportRow.hidden = true;
      inspectorImport.textContent = '-';
    }

    if (hasMeaningfulDetails && omissionCount > 0) {
      inspectorOmissionRow.hidden = false;
      inspectorOmission.textContent = details.omissions.join(' ');
    } else {
      inspectorOmissionRow.hidden = true;
      inspectorOmission.textContent = '-';
    }

    inspectorWarningState.textContent = status;
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
    var validation;
    var warnings = [];
    var warningsMap = {};
    var omissions = [];
    var omissionsMap = {};
    var errorsMap = {};
    var ignoredGroupMap = {};
    var warningCount = 0;
    var i;
    var j;
    var key;
    var target;
    var output;
    var hasErrors = false;
    var newOutputs = {};
    var validationWarning;
    var currentVariantSelection;
    var discoverySummary;
    var explicitVariant;
    var targetProfile;
    var targetProfileResolution;

    updateMultiExportVisibility();
    updatePrefixVisibility();
    updateTargetProfileField();
    ensureAtLeastOneTarget();
    targets = getSelectedTargets();
    targetProfile = getSelectedTargetProfile();
    targetProfileResolution =
      supportsTargetProfiles(targetSelect && targetSelect.value ? targetSelect.value : 'css')
        ? resolveTargetProfile(targetSelect && targetSelect.value ? targetSelect.value : 'css', targetProfile)
        : { targetProfileUsed: null, error: null };

    if (!tokensInput.value.trim()) {
      hideInspector();
    }

    try {
      rawTokens = JSON.parse(tokensInput.value);
    } catch (error) {
      updateVariantField(null);
      setError(tokensInput.value.trim() ? 'El JSON no es válido. Revisa comas, comillas y llaves antes de generar la salida.' : '');
      setWarning('');
      setOmission('');
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      if (tokensInput.value.trim()) {
        updateInspector({
          rootUsed: 'top-level',
          supportedGroups: [],
          ignoredGroups: [],
          normalizationNotes: [],
          omissions: [],
          selectedVariant: '',
          targetProfileUsed: targetProfileResolution.targetProfileUsed,
          warningCount: 0
        });
      }
      return;
    }

    currentVariantSelection = variantSelect.value;
    normalization = normalizeTokenInput(rawTokens);
    discoverySummary = normalization.summary || {};
    explicitVariant =
      discoverySummary.availableVariants && discoverySummary.availableVariants.indexOf(currentVariantSelection) !== -1
        ? currentVariantSelection
        : '';

    if (explicitVariant) {
      normalization = normalizeTokenInput(rawTokens, {
        explicitVariant: explicitVariant
      });
    }

    updateVariantField(normalization.summary);
    parsedTokens = normalization.normalized;

    if (normalization.errors.length > 0) {
      setError(normalization.errors.join('\n'));
      setWarning('');
      setOmission('');
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      updateInspector({
        rootUsed: normalization.summary && normalization.summary.rootUsed,
        supportedGroups: normalization.summary && normalization.summary.detectedGroups,
        ignoredGroups: [],
        normalizationNotes: normalization.summary && normalization.summary.normalizationNotes,
        omissions: [],
        importNotes: normalization.summary && normalization.summary.importNotes,
        selectedVariant: normalization.summary && normalization.summary.selectedVariant,
        targetProfileUsed: targetProfileResolution.targetProfileUsed,
        warningCount: 0
      });
      return;
    }

    if (targetProfileResolution.error) {
      setError(targetProfileResolution.error);
      setWarning('');
      setOmission('');
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      updateInspector({
        rootUsed: normalization.summary && normalization.summary.rootUsed,
        supportedGroups: normalization.summary && normalization.summary.detectedGroups,
        ignoredGroups: [],
        normalizationNotes: normalization.summary && normalization.summary.normalizationNotes,
        omissions: [],
        importNotes: normalization.summary && normalization.summary.importNotes,
        selectedVariant: normalization.summary && normalization.summary.selectedVariant,
        targetProfileUsed: targetProfileResolution.targetProfileUsed,
        warningCount: 0
      });
      return;
    }

    if (normalization.summary && normalization.summary.omissions) {
      for (i = 0; i < normalization.summary.omissions.length; i += 1) {
        var normOmission = normalization.summary.omissions[i];
        omissionsMap['Se omitió ' + normOmission.path + ' por ' + normOmission.reason + '.'] = true;
      }
    }

    if (normalization.summary && normalization.summary.importNotes) {
      for (i = 0; i < normalization.summary.importNotes.length; i += 1) {
        var importNote = normalization.summary.importNotes[i];
        if (importNote.indexOf('Import summary:') === 0) {
          continue;
        }
        warningsMap[importNote] = true;
      }
    }

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

      if (validation.omissions && validation.omissions.length > 0) {
        for (j = 0; j < validation.omissions.length; j += 1) {
          var omission = validation.omissions[j];
          if (omission.reason === 'grupo no soportado') {
            continue;
          }
          var omissionText = 'Se omitió ' + omission.path + ' por ' + omission.reason + '.';
          if (targets.length > 1) {
            omissionText = '[' + target + '] ' + omissionText;
          }
          omissionsMap[omissionText] = true;
        }
      }

      for (j = 0; j < validation.unsupportedGroups.length; j += 1) {
        ignoredGroupMap[validation.unsupportedGroups[j]] = true;
      }

      for (j = 0; j < validation.ignoredGroups.length; j += 1) {
        ignoredGroupMap[validation.ignoredGroups[j]] = true;
      }

      if (validation.errors.length > 0) {
        hasErrors = true;
      }
    }

    for (key in warningsMap) {
      if (Object.prototype.hasOwnProperty.call(warningsMap, key)) {
        warnings.push(key);
        warningCount += 1;
      }
    }

    for (key in omissionsMap) {
      if (Object.prototype.hasOwnProperty.call(omissionsMap, key)) {
        omissions.push(key);
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
      setWarning(warnings.join('\n'));
      setOmission(omissions.join('\n'));
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      updateInspector({
        rootUsed: normalization.summary && normalization.summary.rootUsed,
        supportedGroups: normalization.summary && normalization.summary.detectedGroups,
        ignoredGroups: Object.keys(ignoredGroupMap),
        normalizationNotes: normalization.summary && normalization.summary.normalizationNotes,
        omissions: omissions,
        importNotes: normalization.summary && normalization.summary.importNotes,
        selectedVariant: normalization.summary && normalization.summary.selectedVariant,
        targetProfileUsed: targetProfileResolution.targetProfileUsed,
        warningCount: warningCount
      });
      return;
    }

    try {
      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];
        generator = getGenerator(target);
        output = generator(parsedTokens, {
          prefix: prefixInput.value,
          targetProfile: target === 'bootstrap' ? targetProfileResolution.targetProfileUsed : null
        });
        newOutputs[target] = output;
      }
      setError('');
      setWarning(warnings.join('\n'));
      setOmission(omissions.join('\n'));
    } catch (error) {
      setError('No se pudo generar la salida para alguno de los targets seleccionados. Revisa el contenido de los tokens e inténtalo de nuevo.');
      setWarning(warnings.join('\n'));
      setOmission(omissions.join('\n'));
      generatedOutputs = {};
      updatePreviewSelector();
      renderActivePreview();
      updateInspector({
        rootUsed: normalization.summary && normalization.summary.rootUsed,
        supportedGroups: normalization.summary && normalization.summary.detectedGroups,
        ignoredGroups: Object.keys(ignoredGroupMap),
        normalizationNotes: normalization.summary && normalization.summary.normalizationNotes,
        omissions: omissions,
        importNotes: normalization.summary && normalization.summary.importNotes,
        selectedVariant: normalization.summary && normalization.summary.selectedVariant,
        targetProfileUsed: targetProfileResolution.targetProfileUsed,
        warningCount: warningCount
      });
      return;
    }

    generatedOutputs = newOutputs;
    updatePreviewSelector();
    renderActivePreview();
    if (tokensInput.value.trim()) {
      updateInspector({
        rootUsed: normalization.summary && normalization.summary.rootUsed,
        supportedGroups: normalization.summary && normalization.summary.detectedGroups,
        ignoredGroups: Object.keys(ignoredGroupMap),
        normalizationNotes: normalization.summary && normalization.summary.normalizationNotes,
        omissions: omissions,
        importNotes: normalization.summary && normalization.summary.importNotes,
        selectedVariant: normalization.summary && normalization.summary.selectedVariant,
        targetProfileUsed: targetProfileResolution.targetProfileUsed,
        warningCount: warningCount
      });
    }
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
    setWarning('');
    renderOutput();
  }

  tokensInput.value = '';
  hideInspector();
  if (targetSelect) {
    targetSelect.value = targetSelect.value || 'css';
  }
  syncSelectedTargetsWithPrimaryTarget();
  if (multiExportToggle) {
    multiExportToggle.checked = false;
  }
  updateMultiExportVisibility();
  updateTargetProfileField();
  updateActionState('', targetSelect && targetSelect.value ? targetSelect.value : 'css');

  tokensInput.addEventListener('input', renderOutput);
  if (targetSelect) {
    targetSelect.addEventListener('change', function () {
      preferredPreviewTarget = targetSelect.value;
      if (!multiExportToggle || !multiExportToggle.checked) {
        syncSelectedTargetsWithPrimaryTarget();
      }
      updateTargetProfileField();
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
  variantSelect.addEventListener('change', renderOutput);
  if (targetProfileSelect) {
    targetProfileSelect.addEventListener('change', renderOutput);
  }
  fileInput.addEventListener('change', handleFileUpload);
  copyButton.addEventListener('click', copyOutput);
  downloadButton.addEventListener('click', downloadOutput);
  exampleButton.addEventListener('click', loadExample);
  clearButton.addEventListener('click', clearAll);

  loadVisibleVersion();
  renderOutput();
}());

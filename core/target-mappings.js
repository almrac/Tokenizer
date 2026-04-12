const SUPPORTED_GROUPS = ['colors', 'spacing', 'typography', 'radius', 'shadows'];
const IONIC_NATIVE_COLOR_ROLES = [
  'primary',
  'secondary',
  'tertiary',
  'success',
  'warning',
  'danger',
  'light',
  'medium',
  'dark',
];
const BOOTSTRAP_SEMANTIC_COLOR_ROLES = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
];
const BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS = {
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
  'base-bg': '$body-bg',
};
const BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS = {
  sm: '$box-shadow-sm',
  md: '$box-shadow',
  default: '$box-shadow',
  base: '$box-shadow',
};
const BOOTSTRAP_SAFE_TYPOGRAPHY_TOKENS = {
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
  '5xl': true,
};

function normalizeTokenName(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildIonicNativeColorMappings() {
  const mapping = {};

  for (let i = 0; i < IONIC_NATIVE_COLOR_ROLES.length; i += 1) {
    const role = IONIC_NATIVE_COLOR_ROLES[i];
    mapping['colors.' + role] = '--ion-color-' + role;
  }

  return mapping;
}

const TARGET_MAPPING_TEMPLATES = {
  css: {
    target: 'css',
    strategy: 'custom-prefix-fallback',
    exportPolicy: {
      nativeFirst: false,
      probableMappings: false,
      extendedFallback: 'default',
      warnAndOmit: 'last-resort',
    },
    nativeMappings: {},
    probableMappings: {},
    groupRules: {
      colors: 'css.custom-properties.colors',
      spacing: 'css.custom-properties.spacing',
      typography: 'css.custom-properties.typography',
      radius: 'css.custom-properties.radius',
      shadows: 'css.custom-properties.shadows',
    },
    groupFallbacks: {
      colors: 'custom-prefix',
      spacing: 'custom-prefix',
      typography: 'custom-prefix',
      radius: 'custom-prefix',
      shadows: 'custom-prefix',
    },
  },
  ionic: {
    target: 'ionic',
    strategy: 'native-first',
    exportPolicy: {
      nativeFirst: true,
      probableMappings: false,
      extendedFallback: 'default',
      warnAndOmit: 'last-resort',
    },
    nativeMappings: Object.assign(
      buildIonicNativeColorMappings(),
      {
        'typography.fontFamily.base': '--ion-font-family',
      }
    ),
    probableMappings: {},
    groupRules: {
      colors: 'ionic.css-variables.colors',
      spacing: 'css.custom-properties.spacing',
      typography: 'native-when-known-else-custom',
      radius: 'css.custom-properties.radius',
      shadows: 'css.custom-properties.shadows',
    },
    groupFallbacks: {
      spacing: 'custom-prefix',
      typography: 'custom-prefix',
      radius: 'custom-prefix',
      shadows: 'custom-prefix',
    },
  },
  bootstrap: {
    target: 'bootstrap',
    strategy: 'native-first-with-extended-fallback',
    exportPolicy: {
      nativeFirst: true,
      probableMappings: true,
      extendedFallback: 'explicit',
      warnAndOmit: 'last-resort',
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
      spacing: '$spacers',
    },
    probableMappings: {
      'colors.baseColor': '$body-color',
      'colors.bodyColor': '$body-color',
      'colors.baseBorderColor': '$border-color',
      'colors.borderColor': '$border-color',
      'colors.surface': '$body-bg',
      'colors.baseBg': '$body-bg',
      'colors.bodyBg': '$body-bg',
    },
    groupRules: {
      colors: 'bootstrap.scss.colors',
      spacing: 'bootstrap.scss.spacers-map',
      typography: 'bootstrap.scss.typography',
      radius: 'bootstrap.scss.radius',
      shadows: 'bootstrap.scss.shadows',
    },
    groupFallbacks: {
      colors: 'extended-sass-variable',
      spacing: 'scoped-map',
      typography: 'native-and-scss-maps-then-extended-sass-variable',
      radius: 'native-then-extended-sass-variable',
      shadows: 'native-then-extended-sass-variable',
    },
  },
  tailwind: {
    target: 'tailwind',
    strategy: 'native-first',
    exportPolicy: {
      nativeFirst: true,
      probableMappings: false,
      extendedFallback: 'rare',
      warnAndOmit: 'last-resort',
    },
    nativeMappings: {
      colors: 'theme.extend.colors',
      spacing: 'theme.extend.spacing',
      typography: {
        fontFamily: 'theme.extend.fontFamily',
        fontSize: 'theme.extend.fontSize',
        fontWeight: 'theme.extend.fontWeight',
        lineHeight: 'theme.extend.lineHeight',
        letterSpacing: 'theme.extend.letterSpacing',
      },
      radius: 'theme.extend.borderRadius',
      shadows: 'theme.extend.boxShadow',
    },
    probableMappings: {},
    groupRules: {
      colors: 'tailwind.theme.extend.colors',
      spacing: 'tailwind.theme.extend.spacing',
      typography: 'tailwind.theme.extend.typography',
      radius: 'tailwind.theme.extend.borderRadius',
      shadows: 'tailwind.theme.extend.boxShadow',
    },
    groupFallbacks: {
      colors: 'theme.extend.colors',
      spacing: 'theme.extend.spacing',
      typography: 'theme.extend.typography',
      radius: 'theme.extend.borderRadius',
      shadows: 'theme.extend.boxShadow',
    },
  },
};
const BOOTSTRAP_V4_TEMPLATE = {
  target: TARGET_MAPPING_TEMPLATES.bootstrap.target,
  strategy: TARGET_MAPPING_TEMPLATES.bootstrap.strategy,
  exportPolicy: Object.assign({}, TARGET_MAPPING_TEMPLATES.bootstrap.exportPolicy),
  nativeMappings: Object.assign({}, TARGET_MAPPING_TEMPLATES.bootstrap.nativeMappings),
  probableMappings: Object.assign({}, TARGET_MAPPING_TEMPLATES.bootstrap.probableMappings),
  groupRules: Object.assign({}, TARGET_MAPPING_TEMPLATES.bootstrap.groupRules),
  groupFallbacks: Object.assign({}, TARGET_MAPPING_TEMPLATES.bootstrap.groupFallbacks),
};

delete BOOTSTRAP_V4_TEMPLATE.nativeMappings['radius.lg'];

const TARGET_PROFILE_TEMPLATES = {
  bootstrap: {
    'v5.3': TARGET_MAPPING_TEMPLATES.bootstrap,
    v4: BOOTSTRAP_V4_TEMPLATE,
  },
};

const TARGET_PROFILE_ALIASES = {
  bootstrap: {
    default: 'v5.3',
  },
};

function supportsTargetProfiles(target) {
  return !!TARGET_PROFILE_TEMPLATES[target];
}

function getSupportedTargetProfiles(target) {
  if (!supportsTargetProfiles(target)) {
    return [];
  }

  return Object.keys(TARGET_PROFILE_TEMPLATES[target]);
}

function resolveTargetProfileAlias(target, requestedProfile) {
  const aliases = TARGET_PROFILE_ALIASES[target] || {};

  if (Object.prototype.hasOwnProperty.call(aliases, requestedProfile)) {
    return aliases[requestedProfile];
  }

  return requestedProfile;
}

function resolveTargetProfile(target, requestedProfile) {
  const requested = typeof requestedProfile === 'string' ? requestedProfile.trim() : '';
  const defaultProfile = getSupportedTargetProfiles(target)[0] || null;

  if (!supportsTargetProfiles(target)) {
    return {
      targetProfileUsed: null,
      error: requested ? 'El target "' + target + '" no soporta perfiles de target.' : null,
    };
  }

  if (!requested) {
    return {
      targetProfileUsed: defaultProfile,
      error: null,
    };
  }

  const resolvedProfile = resolveTargetProfileAlias(target, requested);

  if (Object.prototype.hasOwnProperty.call(TARGET_PROFILE_TEMPLATES[target], resolvedProfile)) {
    return {
      targetProfileUsed: resolvedProfile,
      error: null,
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
      '.',
  };
}

function getTargetTemplate(target, targetProfile) {
  if (supportsTargetProfiles(target)) {
    const resolved = resolveTargetProfile(target, targetProfile);
    if (resolved.targetProfileUsed) {
      return TARGET_PROFILE_TEMPLATES[target][resolved.targetProfileUsed];
    }
  }

  return TARGET_MAPPING_TEMPLATES[target] || TARGET_MAPPING_TEMPLATES.css;
}

function getNativeMapping(target, tokenPath, targetProfile) {
  const template = getTargetTemplate(target, targetProfile);

  if (!template || !template.nativeMappings) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(template.nativeMappings, tokenPath)) {
    return template.nativeMappings[tokenPath];
  }

  return null;
}

function getTargetGroupSupportMap() {
  const support = {};
  const targetNames = Object.keys(TARGET_MAPPING_TEMPLATES);

  for (let i = 0; i < targetNames.length; i += 1) {
    const targetName = targetNames[i];
    const template = TARGET_MAPPING_TEMPLATES[targetName];
    const rules = template && template.groupRules ? template.groupRules : {};
    const byGroup = {};

    for (let j = 0; j < SUPPORTED_GROUPS.length; j += 1) {
      const groupName = SUPPORTED_GROUPS[j];
      byGroup[groupName] = !!rules[groupName];
    }

    support[targetName] = byGroup;
  }

  return support;
}

function resolveIonicNativeColorRole(tokenName) {
  const normalized = normalizeTokenName(tokenName);

  if (IONIC_NATIVE_COLOR_ROLES.indexOf(normalized) !== -1) {
    return normalized;
  }

  return null;
}

function resolveBootstrapSemanticColorRole(tokenName) {
  const normalized = normalizeTokenName(tokenName);

  for (let i = 0; i < BOOTSTRAP_SEMANTIC_COLOR_ROLES.length; i += 1) {
    const role = BOOTSTRAP_SEMANTIC_COLOR_ROLES[i];

    if (normalized === role) {
      return role;
    }

    if (
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
  const normalized = normalizeTokenName(tokenName);

  if (Object.prototype.hasOwnProperty.call(BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS, normalized)) {
    return BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS[normalized];
  }

  return null;
}

function resolveBootstrapShadowGlobalVariable(tokenName) {
  const normalized = normalizeTokenName(tokenName);

  if (Object.prototype.hasOwnProperty.call(BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS, normalized)) {
    return BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS[normalized];
  }

  return null;
}

function isBootstrapTypographyTokenMappable(tokenName) {
  const normalized = normalizeTokenName(tokenName);

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

  return !!BOOTSTRAP_SAFE_TYPOGRAPHY_TOKENS[normalized];
}

function resolveBootstrapRadiusVariable(tokenName) {
  const normalized = normalizeTokenName(tokenName);

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

module.exports = {
  BOOTSTRAP_SEMANTIC_COLOR_ROLES: BOOTSTRAP_SEMANTIC_COLOR_ROLES,
  BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS: BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS,
  BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS: BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS,
  BOOTSTRAP_SAFE_TYPOGRAPHY_TOKENS: BOOTSTRAP_SAFE_TYPOGRAPHY_TOKENS,
  IONIC_NATIVE_COLOR_ROLES: IONIC_NATIVE_COLOR_ROLES,
  TARGET_MAPPING_TEMPLATES: TARGET_MAPPING_TEMPLATES,
  TARGET_PROFILE_TEMPLATES: TARGET_PROFILE_TEMPLATES,
  getNativeMapping: getNativeMapping,
  getSupportedTargetProfiles: getSupportedTargetProfiles,
  getTargetGroupSupportMap: getTargetGroupSupportMap,
  getTargetTemplate: getTargetTemplate,
  isBootstrapTypographyTokenMappable: isBootstrapTypographyTokenMappable,
  normalizeTokenName: normalizeTokenName,
  resolveTargetProfile: resolveTargetProfile,
  resolveBootstrapProbableGlobalColorVariable: resolveBootstrapProbableGlobalColorVariable,
  resolveBootstrapRadiusVariable: resolveBootstrapRadiusVariable,
  resolveBootstrapShadowGlobalVariable: resolveBootstrapShadowGlobalVariable,
  resolveBootstrapSemanticColorRole: resolveBootstrapSemanticColorRole,
  resolveIonicNativeColorRole: resolveIonicNativeColorRole,
  supportsTargetProfiles: supportsTargetProfiles,
};

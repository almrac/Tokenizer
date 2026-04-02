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
    nativeMappings: {},
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
    nativeMappings: Object.assign(
      buildIonicNativeColorMappings(),
      {
        'typography.fontFamily.base': '--ion-font-family',
      }
    ),
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
    strategy: 'native-first',
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
    groupRules: {
      colors: 'bootstrap.scss.colors',
      spacing: 'bootstrap.scss.spacers-map',
      typography: 'bootstrap.scss.typography',
      radius: 'bootstrap.scss.radius',
      shadows: 'bootstrap.scss.shadows',
    },
    groupFallbacks: {
      colors: 'ignore-non-standard',
      spacing: 'scoped-map',
      typography: 'scoped-map-or-custom',
      radius: 'scoped-variables',
      shadows: 'scoped-variables',
    },
  },
  tailwind: {
    target: 'tailwind',
    strategy: 'native-first',
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

function getTargetTemplate(target) {
  return TARGET_MAPPING_TEMPLATES[target] || TARGET_MAPPING_TEMPLATES.css;
}

function getNativeMapping(target, tokenPath) {
  const template = getTargetTemplate(target);

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

module.exports = {
  BOOTSTRAP_SEMANTIC_COLOR_ROLES: BOOTSTRAP_SEMANTIC_COLOR_ROLES,
  BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS: BOOTSTRAP_PROBABLE_GLOBAL_COLOR_TARGETS,
  BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS: BOOTSTRAP_SAFE_SHADOW_GLOBAL_TARGETS,
  IONIC_NATIVE_COLOR_ROLES: IONIC_NATIVE_COLOR_ROLES,
  TARGET_MAPPING_TEMPLATES: TARGET_MAPPING_TEMPLATES,
  getNativeMapping: getNativeMapping,
  getTargetGroupSupportMap: getTargetGroupSupportMap,
  getTargetTemplate: getTargetTemplate,
  normalizeTokenName: normalizeTokenName,
  resolveBootstrapProbableGlobalColorVariable: resolveBootstrapProbableGlobalColorVariable,
  resolveBootstrapShadowGlobalVariable: resolveBootstrapShadowGlobalVariable,
  resolveBootstrapSemanticColorRole: resolveBootstrapSemanticColorRole,
  resolveIonicNativeColorRole: resolveIonicNativeColorRole,
};

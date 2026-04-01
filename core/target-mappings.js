const SUPPORTED_GROUPS = ['colors', 'spacing', 'typography', 'radius', 'shadows'];

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
    nativeMappings: {
      'colors.primary': '--ion-color-primary',
      'colors.secondary': '--ion-color-secondary',
      'typography.fontFamily.base': '--ion-font-family',
    },
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
      'typography.fontFamily.base': '$font-family-base',
      'radius.md': '$border-radius',
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

module.exports = {
  TARGET_MAPPING_TEMPLATES: TARGET_MAPPING_TEMPLATES,
  getNativeMapping: getNativeMapping,
  getTargetGroupSupportMap: getTargetGroupSupportMap,
  getTargetTemplate: getTargetTemplate,
};

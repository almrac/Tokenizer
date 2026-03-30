// Shared naming and formatting helpers used by all pure generators.

function normalizeCssPrefix(prefix) {
  if (!prefix) {
    return '--';
  }

  const trimmed = String(prefix).trim();

  if (!trimmed) {
    return '--';
  }

  return '--' + trimmed.replace(/^-+/, '') + '-';
}

function buildCssVariableName(prefix, group, tokenName) {
  return prefix + group + '-' + tokenName;
}

function getTokenGroups(tokens) {
  const safeTokens = tokens && typeof tokens === 'object' ? tokens : {};
  const colors = safeTokens.colors && typeof safeTokens.colors === 'object' ? safeTokens.colors : {};
  const spacing = safeTokens.spacing && typeof safeTokens.spacing === 'object' ? safeTokens.spacing : {};

  return {
    colors: colors,
    spacing: spacing,
  };
}

function buildRootBlock(lines) {
  if (lines.length === 0) {
    return ':root {\n}\n';
  }

  return ':root {\n' + lines.join('\n') + '\n}\n';
}

module.exports = {
  buildCssVariableName: buildCssVariableName,
  buildRootBlock: buildRootBlock,
  getTokenGroups: getTokenGroups,
  normalizeCssPrefix: normalizeCssPrefix,
};

/*
Usage examples:
  node index.js --target css
  node index.js --target css --prefix tk
  node index.js --target ionic --input ./tokens.json --output ./dist
  node index.js --target bootstrap --input ./tokens.json
  node index.js --target tailwind --output ./dist
  node index.js --target css,tailwind --output ./dist
  node index.js --target css --variant=dark
  node index.js --target bootstrap --target-profile=default
*/

const fs = require('fs');
const path = require('path');
const process = require('process');

const generateCss = require('../core/css');
const generateIonic = require('../core/ionic');
const generateBootstrap = require('../core/bootstrap');
const generateTailwind = require('../core/tailwind');
const { normalizeTokenInput, validateTokenInput } = require('../core/validation');
const { resolveTargetProfile, supportsTargetProfiles } = require('../core/target-mappings');
const { cleanOutputDir, ensureDirExists, writeFile } = require('../utils/file');

const SUPPORTED_OPTIONS = {
  target: true,
  prefix: true,
  input: true,
  output: true,
  variant: true,
  'target-profile': true,
};

const SUPPORTED_TARGETS = {
  css: {
    fileName: 'tokens.css',
    generator: generateCss,
  },
  ionic: {
    fileName: 'variables.scss',
    generator: generateIonic,
  },
  bootstrap: {
    fileName: 'bootstrap-overrides.scss',
    generator: generateBootstrap,
  },
  tailwind: {
    fileName: 'tailwind.tokens.js',
    generator: generateTailwind,
  },
};

// Parse `--key value` and `--key=value` pairs from process.argv.
function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg || arg.indexOf('--') !== 0) {
      continue;
    }

    if (arg.indexOf('=') !== -1) {
      const parts = arg.slice(2).split('=');
      const key = parts.shift();

      if (!SUPPORTED_OPTIONS[key]) {
        continue;
      }

      args[key] = parts.join('=');
      continue;
    }

    const key = arg.slice(2);

    if (!SUPPORTED_OPTIONS[key]) {
      continue;
    }

    const next = argv[i + 1];

    if (key === 'prefix' && next) {
      const nextKey = next.indexOf('--') === 0 ? next.slice(2) : '';

      if (!SUPPORTED_OPTIONS[nextKey]) {
        args[key] = next;
        i += 1;
        continue;
      }
    }

    if (key !== 'prefix' && next && next.indexOf('--') !== 0) {
      args[key] = next;
      i += 1;
      continue;
    }

    args[key] = '';
  }

  return args;
}

function exitWithError(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}

function readTokens(inputPath) {
  if (!fs.existsSync(inputPath)) {
    exitWithError('Input file not found: ' + inputPath);
  }

  try {
    return JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (error) {
    exitWithError('Invalid JSON in input file: ' + inputPath);
  }
}

function validateOptionValue(name, value) {
  if (value === '') {
    exitWithError('Missing value for --' + name + '.');
  }
}

function parseTargetList(targetArg) {
  const raw = String(targetArg || '').split(',');
  const targets = [];

  for (let i = 0; i < raw.length; i += 1) {
    const name = raw[i].trim();

    if (!name) {
      continue;
    }

    if (!SUPPORTED_TARGETS[name]) {
      exitWithError('Invalid --target "' + name + '". Supported targets: css, ionic, bootstrap, tailwind.');
    }

    if (targets.indexOf(name) === -1) {
      targets.push(name);
    }
  }

  if (targets.length === 0) {
    exitWithError('Missing required --target. Supported targets: css, ionic, bootstrap, tailwind.');
  }

  return targets;
}

function resolveRequestedTargetProfile(targetList, requestedProfile) {
  const requested = typeof requestedProfile === 'string' ? requestedProfile.trim() : '';
  const target = targetList.length === 1 ? targetList[0] : null;

  if (!requested) {
    return {
      targetProfileUsed: target && supportsTargetProfiles(target) ? 'default' : null,
    };
  }

  if (targetList.length !== 1) {
    exitWithError('El parámetro --target-profile solo está disponible cuando se usa un único target.');
  }

  if (!supportsTargetProfiles(target)) {
    exitWithError('El target "' + target + '" no soporta perfiles de target.');
  }

  const resolution = resolveTargetProfile(target, requested);

  if (resolution.error) {
    exitWithError(resolution.error);
  }

  return resolution;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetList = parseTargetList(args.target);
  const isMultiTarget = targetList.length > 1;

  validateOptionValue('input', args.input);
  validateOptionValue('output', args.output);
  validateOptionValue('prefix', args.prefix);
  validateOptionValue('variant', args.variant);
  validateOptionValue('target-profile', args['target-profile']);

  const inputPath = path.resolve(args.input || './tokens.json');
  const outputDir = path.resolve(args.output || './dist');
  const targetProfileResolution = resolveRequestedTargetProfile(targetList, args['target-profile']);
  const rawTokens = readTokens(inputPath);
  const normalization = normalizeTokenInput(rawTokens, {
    explicitVariant: args.variant,
  });
  const tokens = normalization.normalized;
  const summary = normalization.summary || {};
  summary.targetProfileUsed = targetProfileResolution.targetProfileUsed;
  ensureDirExists(outputDir);

  if (normalization.errors.length > 0) {
    exitWithError(normalization.errors.join(' '));
  }

  for (let i = 0; i < normalization.info.length; i += 1) {
    process.stderr.write('Info: ' + normalization.info[i] + '\n');
  }

  if (summary.omissions && summary.omissions.length > 0) {
    for (let i = 0; i < summary.omissions.length; i += 1) {
      const omission = summary.omissions[i];
      process.stderr.write('Omisión: Se omitió ' + omission.path + ' por ' + omission.reason + '.\n');
    }
  }

  if (summary.rootUsed) {
    process.stderr.write('Info: Root used: ' + summary.rootUsed + '\n');
  }
  if (summary.sourcePattern) {
    process.stderr.write('Info: Source pattern: ' + summary.sourcePattern + '\n');
  }
  if (summary.selectedVariant) {
    if (summary.variantSelectionMode === 'explicit') {
      process.stderr.write('Info: explicit variant selected: "' + summary.selectedVariant + '"\n');
    } else {
      process.stderr.write('Info: Selected variant: ' + summary.selectedVariant + '\n');
    }
  }
  if (summary.targetProfileUsed) {
    process.stderr.write('Info: Target profile used: ' + summary.targetProfileUsed + '\n');
  }
  if (summary.detectedGroups && summary.detectedGroups.length > 0) {
    process.stderr.write('Info: Supported groups detected: ' + summary.detectedGroups.join(', ') + '\n');
  }
  if (summary.normalizationNotes && summary.normalizationNotes.length > 0) {
    process.stderr.write('Info: Normalization applied: ' + summary.normalizationNotes.length + ' ajuste(s)\n');
  }

  let totalWarnings = 0;
  let ignoredReported = false;
  for (let i = 0; i < targetList.length; i += 1) {
    const target = targetList[i];
    const selectedTarget = SUPPORTED_TARGETS[target];
    const validation = validateTokenInput(tokens, target);

    if (validation.errors.length > 0) {
      exitWithError(validation.errors.join(' '));
    }

    for (let j = 0; j < validation.warnings.length; j += 1) {
      totalWarnings += 1;
      if (isMultiTarget) {
        process.stderr.write('Warning [' + target + ']: ' + validation.warnings[j] + '\n');
      } else {
        process.stderr.write('Warning: ' + validation.warnings[j] + '\n');
      }
    }

    if (validation.omissions && validation.omissions.length > 0) {
      for (let j = 0; j < validation.omissions.length; j += 1) {
        const omission = validation.omissions[j];
        if (isMultiTarget) {
          process.stderr.write(
            'Omisión [' + target + ']: Se omitió ' + omission.path + ' por ' + omission.reason + '.\n'
          );
        } else {
          process.stderr.write('Omisión: Se omitió ' + omission.path + ' por ' + omission.reason + '.\n');
        }
      }
    }

    if (!ignoredReported && validation.unsupportedGroups.length > 0) {
      process.stderr.write('Info: Ignored groups: ' + validation.unsupportedGroups.join(', ') + '\n');
      ignoredReported = true;
    }

    const content = selectedTarget.generator(tokens, {
      prefix: args.prefix,
      targetProfile: target === 'bootstrap' ? targetProfileResolution.targetProfileUsed : null,
    });
    const outputPath = path.join(outputDir, selectedTarget.fileName);

    if (cleanOutputDir(outputDir, selectedTarget.fileName)) {
      process.stdout.write('Overwriting existing file: ' + outputPath + '\n');
    }
    writeFile(outputPath, content);
    process.stdout.write('Generated ' + outputPath + '\n');
  }

  if (totalWarnings > 0) {
    process.stderr.write('Info: Warnings emitted: ' + totalWarnings + '\n');
  }
}

module.exports = {
  main: main,
};

if (require.main === module) {
  main();
}

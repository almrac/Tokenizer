/*
Usage examples:
  node index.js --target css
  node index.js --target css --prefix nb
  node index.js --target ionic --input ./tokens.json --output ./dist
  node index.js --target bootstrap --input ./tokens.json
  node index.js --target tailwind --output ./dist
*/

const fs = require('fs');
const path = require('path');
const process = require('process');

const generateCss = require('../core/css');
const generateIonic = require('../core/ionic');
const generateBootstrap = require('../core/bootstrap');
const generateTailwind = require('../core/tailwind');
const { cleanOutputDir, ensureDirExists, writeFile } = require('../utils/file');

const SUPPORTED_OPTIONS = {
  target: true,
  prefix: true,
  input: true,
  output: true,
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

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = args.target;

  if (!target) {
    exitWithError('Missing required --target. Supported targets: css, ionic, bootstrap, tailwind.');
  }

  if (!SUPPORTED_TARGETS[target]) {
    exitWithError('Invalid --target "' + target + '". Supported targets: css, ionic, bootstrap, tailwind.');
  }

  validateOptionValue('input', args.input);
  validateOptionValue('output', args.output);
  validateOptionValue('prefix', args.prefix);

  const inputPath = path.resolve(args.input || './tokens.json');
  const outputDir = path.resolve(args.output || './dist');
  const selectedTarget = SUPPORTED_TARGETS[target];
  const tokens = readTokens(inputPath);
  const content = selectedTarget.generator(tokens, {
    prefix: args.prefix,
  });
  const outputPath = path.join(outputDir, selectedTarget.fileName);

  ensureDirExists(outputDir);
  if (cleanOutputDir(outputDir, selectedTarget.fileName)) {
    process.stdout.write('Overwriting existing file: ' + outputPath + '\n');
  }
  writeFile(outputPath, content);

  process.stdout.write('Generated ' + outputPath + '\n');
}

module.exports = {
  main: main,
};

if (require.main === module) {
  main();
}

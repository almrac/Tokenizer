#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const fixturesDir = path.join(rootDir, 'fixtures', 'cases');
const updateMode = process.argv.includes('--update');
const outputFiles = {
  css: 'tokens.css',
  ionic: 'variables.scss',
  bootstrap: 'bootstrap-overrides.scss',
  tailwind: 'tailwind.tokens.js',
};

function fail(message) {
  process.stderr.write(message + '\n');
  process.exit(1);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function listFixtureDirs() {
  return fs
    .readdirSync(fixturesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(fixturesDir, entry.name))
    .sort();
}

function loadFixture(dirPath) {
  const meta = readJson(path.join(dirPath, 'fixture.json'));
  const inputPath = path.join(dirPath, 'input.json');
  const expectedDir = path.join(dirPath, 'expected');

  return {
    name: path.basename(dirPath),
    dirPath,
    inputPath,
    expectedDir,
    meta,
  };
}

function buildCliArgs(fixture, outputDir) {
  const args = ['index.js', '--target', fixture.meta.targets.join(','), '--input', fixture.inputPath, '--output', outputDir];
  const extraArgs = fixture.meta.args || {};
  const keys = Object.keys(extraArgs).sort();

  for (let i = 0; i < keys.length; i += 1) {
    args.push('--' + keys[i] + '=' + String(extraArgs[keys[i]]));
  }

  return args;
}

function runFixture(fixture) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tokenizer-fixture-'));
  const result = spawnSync('node', buildCliArgs(fixture, tempDir), {
    cwd: rootDir,
    encoding: 'utf8',
  });
  const outputs = {};

  for (let i = 0; i < fixture.meta.targets.length; i += 1) {
    const target = fixture.meta.targets[i];
    const fileName = outputFiles[target];
    const outputPath = path.join(tempDir, fileName);

    if (fs.existsSync(outputPath)) {
      outputs[fileName] = readText(outputPath);
    }
  }

  fs.rmSync(tempDir, { recursive: true, force: true });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    outputs,
  };
}

function normalizeSnapshot(text) {
  return String(text || '').replace(/\r\n/g, '\n');
}

function compareText(actual, expected, label, failures) {
  if (normalizeSnapshot(actual) !== normalizeSnapshot(expected)) {
    failures.push(label);
  }
}

function updateFixtureSnapshots(fixture, result) {
  const expectedDir = fixture.expectedDir;
  fs.mkdirSync(expectedDir, { recursive: true });

  if (fixture.meta.expect === 'error') {
    writeText(path.join(expectedDir, 'stderr.txt'), normalizeSnapshot(result.stderr));
    return;
  }

  writeText(path.join(expectedDir, 'stderr.txt'), normalizeSnapshot(result.stderr));
  for (let i = 0; i < fixture.meta.targets.length; i += 1) {
    const fileName = outputFiles[fixture.meta.targets[i]];
    writeText(path.join(expectedDir, fileName), normalizeSnapshot(result.outputs[fileName] || ''));
  }
}

function verifyFixture(fixture, result) {
  const failures = [];
  const expectError = fixture.meta.expect === 'error';
  const stderrPath = path.join(fixture.expectedDir, 'stderr.txt');

  if (expectError) {
    if (result.status === 0) {
      failures.push('expected non-zero exit');
    }
    if (!fs.existsSync(stderrPath)) {
      failures.push('missing expected/stderr.txt');
      return failures;
    }
    compareText(result.stderr, readText(stderrPath), 'stderr mismatch', failures);
    return failures;
  }

  if (result.status !== 0) {
    failures.push('expected zero exit, got ' + result.status);
    return failures;
  }

  if (!fs.existsSync(stderrPath)) {
    failures.push('missing expected/stderr.txt');
  } else {
    compareText(result.stderr, readText(stderrPath), 'stderr mismatch', failures);
  }

  for (let i = 0; i < fixture.meta.targets.length; i += 1) {
    const fileName = outputFiles[fixture.meta.targets[i]];
    const expectedPath = path.join(fixture.expectedDir, fileName);

    if (!fs.existsSync(expectedPath)) {
      failures.push('missing expected/' + fileName);
      continue;
    }

    compareText(result.outputs[fileName] || '', readText(expectedPath), fileName + ' mismatch', failures);
  }

  return failures;
}

function main() {
  if (!fs.existsSync(fixturesDir)) {
    fail('No fixture directory found at ' + fixturesDir);
  }

  const fixtureDirs = listFixtureDirs();
  const fixtures = fixtureDirs.map(loadFixture);
  const problems = [];

  for (let i = 0; i < fixtures.length; i += 1) {
    const fixture = fixtures[i];
    const result = runFixture(fixture);

    if (updateMode) {
      updateFixtureSnapshots(fixture, result);
      process.stdout.write('updated ' + fixture.name + '\n');
      continue;
    }

    const failures = verifyFixture(fixture, result);

    if (failures.length > 0) {
      problems.push({
        name: fixture.name,
        failures,
      });
      continue;
    }

    process.stdout.write('ok ' + fixture.name + '\n');
  }

  if (updateMode) {
    process.stdout.write('fixture snapshots updated\n');
    return;
  }

  if (problems.length > 0) {
    for (let i = 0; i < problems.length; i += 1) {
      process.stderr.write('FAIL ' + problems[i].name + ': ' + problems[i].failures.join(', ') + '\n');
    }
    process.exit(1);
  }

  process.stdout.write('all fixtures verified\n');
}

main();

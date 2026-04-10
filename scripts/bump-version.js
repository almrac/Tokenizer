#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const versionFile = path.join(rootDir, 'VERSION');
const webVersionFile = path.join(rootDir, 'docs', 'version.json');
const changelogFile = path.join(rootDir, 'CHANGELOG.md');

function fail(message) {
  process.stderr.write('Error: ' + message + '\n');
  process.exit(1);
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    fail('No se pudo leer ' + filePath);
  }
}

function writeText(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    fail('No se pudo escribir ' + filePath);
  }
}

function main() {
  const nextVersion = process.argv[2];
  const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

  if (!nextVersion) {
    fail('Uso: node scripts/bump-version.js <version>. Ejemplo: node scripts/bump-version.js 0.7.1');
  }

  if (!versionPattern.test(nextVersion)) {
    fail('Formato de versión inválido: "' + nextVersion + '". Usa formato semver simple (ej: 0.7.1).');
  }

  writeText(versionFile, nextVersion + '\n');
  writeText(webVersionFile, JSON.stringify({ version: nextVersion }, null, 2) + '\n');

  const changelogText = readText(changelogFile);
  const changelogHasVersion = new RegExp('^## \\[v' + nextVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\] - ', 'm')
    .test(changelogText);

  process.stdout.write('Version bump completed:\n');
  process.stdout.write('- VERSION -> ' + nextVersion + '\n');
  process.stdout.write('- docs/version.json -> v' + nextVersion + '\n');
  if (changelogHasVersion) {
    process.stdout.write('- CHANGELOG.md -> ya contiene v' + nextVersion + '\n');
  } else {
    process.stdout.write('- CHANGELOG.md -> actualización manual pendiente para v' + nextVersion + '\n');
  }
}

main();

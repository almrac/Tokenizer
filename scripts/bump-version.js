#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const versionFile = path.join(rootDir, 'VERSION');
const webIndexFile = path.join(rootDir, 'docs', 'index.html');
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

  const indexHtml = readText(webIndexFile);
  const versionLabelPattern = /(<span class="version-label"[^>]*>)([^<]+)(<\/span>)/;

  if (!versionLabelPattern.test(indexHtml)) {
    fail('No se encontró la etiqueta visible de versión en docs/index.html');
  }

  const nextIndexHtml = indexHtml.replace(versionLabelPattern, '$1v' + nextVersion + '$3');
  writeText(webIndexFile, nextIndexHtml);

  const changelogText = readText(changelogFile);
  const changelogHasVersion = new RegExp('^## \\[v' + nextVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\] - ', 'm')
    .test(changelogText);

  process.stdout.write('Version bump completed:\n');
  process.stdout.write('- VERSION -> ' + nextVersion + '\n');
  process.stdout.write('- docs/index.html -> v' + nextVersion + '\n');
  if (changelogHasVersion) {
    process.stdout.write('- CHANGELOG.md -> ya contiene v' + nextVersion + '\n');
  } else {
    process.stdout.write('- CHANGELOG.md -> actualización manual pendiente para v' + nextVersion + '\n');
  }
}

main();

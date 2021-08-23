/**
 * @fileoverview
 * Creates npm package files for a given component and AMP version.
 */

import {getSemver} from './utils.mjs';
import {log} from '../common/logging.mjs';
import {stat, writeFile} from 'fs/promises';
import {valid} from 'semver';

const [extension, ampVersion, extensionVersion] = process.argv.slice(2);

/**
 * Determines whether to skip
 * @return {Promise<boolean>}
 */
async function shouldSkip() {
  try {
    await stat(`extensions/${extension}/${extensionVersion}`);
    return false;
  } catch {
    log(`${extension} ${extensionVersion} : skipping, does not exist`);
    return true;
  }
}

/**
 * Write package.json
 * @return {Promise<void>}
 */
async function writePackageJson() {
  const version = getSemver(extensionVersion, ampVersion);
  if (!valid(version) || ampVersion.length != 13) {
    log(
      'Invalid semver version',
      version,
      'or AMP version',
      ampVersion,
      'or extension version',
      extensionVersion
    );
    process.exitCode = 1;
    return;
  }

  const json = {
    name: `@ampproject/${extension}`,
    version,
    description: `AMP HTML ${extension} Component`,
    author: 'The AMP HTML Authors',
    license: 'Apache-2.0',
    main: './dist/component-preact.js',
    module: './dist/component-preact.module.js',
    exports: {
      '.': './preact',
      './preact': {
        import: './dist/component-preact.module.js',
        require: './dist/component-preact.js',
      },
      './react': {
        import: './dist/component-react.module.js',
        require: './dist/component-react.js',
      },
    },
    files: ['dist/*', 'react.js'],
    repository: {
      type: 'git',
      url: 'https://github.com/ampproject/amphtml.git',
      directory: `extensions/${extension}/${extensionVersion}`,
    },
    homepage: `https://github.com/ampproject/amphtml/tree/main/extensions/${extension}/${extensionVersion}`,
    peerDependencies: {
      preact: '^10.2.1',
      react: '^17.0.0',
    },
  };

  try {
    await writeFile(
      `extensions/${extension}/${extensionVersion}/package.json`,
      JSON.stringify(json, null, 2)
    );
    log(
      extension,
      extensionVersion,
      ': created package.json for',
      json.version
    );
  } catch (e) {
    log(e);
    process.exitCode = 1;
    return;
  }
}

/**
 * Write react.js
 * @return {Promise<void>}
 */
async function writeReactJs() {
  const content = "module.exports = require('./dist/component-react');";
  try {
    await writeFile(
      `extensions/${extension}/${extensionVersion}/react.js`,
      content
    );
    log(extension, extensionVersion, ': created react.js');
  } catch (e) {
    log(e);
    process.exitCode = 1;
    return;
  }
}

/**
 * Main
 * @return {Promise<void>}
 */
async function main() {
  if (await shouldSkip()) {
    return;
  }
  writePackageJson();
  writeReactJs();
}

main();

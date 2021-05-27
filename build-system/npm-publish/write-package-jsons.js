/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview
 * Creates package.json files for a given component and AMP version to be
 * published on npm.
 */

const [extension, ampVersion] = process.argv.slice(2);
const {log} = require('../common/logging');
const {stat, writeFile} = require('fs/promises');
const {valid} = require('semver');

async function writePackageJson(extensionVersion) {
  try {
    await stat(`extensions/${extension}/${extensionVersion}`);
  } catch {
    log(`${extension} ${extensionVersion} : skipping, does not exist`);
    return;
  }

  const extensionVersionArr = extensionVersion.split('.', 2);
  const major = extensionVersionArr[0];
  const minor = ampVersion.slice(0, 10);
  const patch = Number(ampVersion.slice(-3)); // npm trims leading zeroes in patch number, so mimic this in package.json
  const version = `${major}.${minor}.${patch}`;
  if (
    !valid(version) ||
    ampVersion.length != 13 ||
    extensionVersionArr[1] !== '0'
  ) {
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
    main: 'dist/component.js',
    module: 'dist/component.mjs',
    exports: {
      '.': './preact',
      './preact': {
        import: 'dist/component-preact.mjs',
        require: 'dist/component-preact.js',
      },
      './react': {
        import: 'dist/component-react.mjs',
        require: 'dist/component-react.js',
      },
    },
    files: ['dist/*'],
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

writePackageJson('1.0');
writePackageJson('2.0');

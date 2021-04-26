/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const path = require('path');
const {
  insertExtensionBundlesConfig,
} = require('./insert-extension-bundles-config');
const {cyan, green, red, yellow} = require('kleur/colors');
const {execOrThrow} = require('../../common/exec');
const {log} = require('../../common/logging');

/**
 * Convert dash-case-name to PascalCaseName.
 * @param {string} name
 * @return {string}
 */
function dashToPascalCase(name) {
  return name.replace(/(?:-|^)([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Replaces from a map of keys/values.
 * @param {string} inputText
 * @param {Object<string, string>} replacements
 * @return {function(string): string}
 */
const replace = (inputText, replacements) =>
  Object.keys(replacements).reduce(
    (text, key) => text.replace(new RegExp(key, 'g'), replacements[key]),
    inputText
  );

/**
 * Generate a sequence of all files in a directory recursively.
 * @param {string} dir
 * @yields {string}
 */
async function* walkDir(dir) {
  for (const f of await fs.readdir(dir)) {
    const dirPath = path.join(dir, f);

    if ((await fs.stat(dirPath)).isDirectory()) {
      yield* walkDir(dirPath);
    } else {
      yield path.join(dir, f);
    }
  }
}

const getTemplateDir = (template) => path.join(__dirname, 'template', template);

/**
 * @param {string} templateDir
 * @param {Object<string, string>} replacements
 * @param {string=} destinationDir
 * @return {Array<string>}
 */
async function writeFromTemplateDir(
  templateDir,
  replacements,
  destinationDir = '.'
) {
  const destinationPath = (templatePath) =>
    path.join(
      destinationDir,
      replace(templatePath.substr(templateDir.length + 1), replacements)
    );

  const written = [];
  for await (const templatePath of walkDir(templateDir)) {
    const destination = destinationPath(templatePath);

    await fs.mkdirp(path.dirname(destination));

    // Skip if the destination file already exists
    let fileHandle;
    try {
      fileHandle = await fs.open(destination, 'wx');
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
      if (!argv.overwrite) {
        log(yellow('WARNING:'), 'Skipping existing file', cyan(destination));
        continue;
      }
      log(yellow('WARNING:'), 'Overwriting existing file', cyan(destination));
    }

    const template = await fs.readFile(templatePath, 'utf8');
    await fs.write(fileHandle, replace(template, replacements));
    await fs.close(fileHandle);

    log(green('SUCCESS:'), 'Created file', cyan(destination));

    written.push(destination);
  }
  return written;
}

/**
 * @param {Array<string>} templateDirs
 * @param {string=} destinationDir
 * @param {{
 *   version: (string|undefined),
 *   bento: (boolean|undefined),
 *   name: (string|undefined),
 * }} options
 * @return {Promise<{
 *   name: string,
 *   version: string,
 *   options: ({hasCss: boolean}|undefined)
 * }|void>}
 */
async function makeExtensionFromTemplates(
  templateDirs,
  destinationDir = '.',
  options = argv
) {
  const version = options.version || options.bento ? '1.0' : '0.1';
  const name = (options.name || '').replace(/^amp-/, '');
  if (!name) {
    log(red('ERROR:'), 'Must specify component name with', cyan('--name'));
    return;
  }

  const replacements = {
    '__current_year__': `${new Date().getFullYear()}`,
    '__component_version__': version,
    '__component_version_snakecase__': version.replace(/\./g, '_'),
    '__component_name_hyphenated__': name,
    '__component_name_hyphenated_capitalized__': name.toUpperCase(),
    '__component_name_pascalcase__': dashToPascalCase(name),
    // eslint-disable-next-line local/no-forbidden-terms
    // This allows generated code to contain "DO NOT SUBMIT", which will cause
    // PRs to fail CI if example code isn't removed from the PR. We can't
    // actually write that out, here or in templates, without CI failing.
    // eslint-disable-next-line local/no-forbidden-terms
    '__do_not_submit__': 'DO NOT SUBMIT',
  };

  const writtenFiles = (
    await Promise.all(
      templateDirs.map((templateDirs) =>
        writeFromTemplateDir(templateDirs, replacements, destinationDir)
      )
    )
  ).flat();

  const formattable = writtenFiles
    // Don't format .html because AMP boilerplate would expand into multiple lines.
    .filter((filename) => !filename.endsWith('.html'));

  if (formattable.length > 0) {
    log('Formatting...');

    execOrThrow(
      `npx prettier --ignore-unknown --write ${formattable.join(' ')}`,
      'Could not format files'
    );
  }

  log(`
========================================
${green('FINISHED:')} Boilerplate for your new ${cyan(
    `amp-${name}`
  )} component has been created in ${cyan(`amphtml/extensions/amp-${name}/`)}`);

  const unitTestFile = writtenFiles.find(
    (filename) => filename.indexOf('test/test-') > -1
  );
  if (unitTestFile) {
    log(`
You can run tests on your new component with the following command:
    ${cyan(`amp unit --files=${unitTestFile}`)}

If the component was generated successfully, the example test should pass.`);
  }

  const storybookFile = writtenFiles.find(
    (filename) => filename.indexOf('/storybook/') > -1
  );
  if (storybookFile) {
    log(`
You may also view the component during development in storybook:
    ${cyan(`amp storybook`)}`);
  }

  // Return the resulting extension bundle config.
  return {
    name: `amp-${name}`,
    version,
    options: {hasCss: true},
  };
}

/**
 * @return {Promise<void>}
 */
async function makeExtension() {
  const bundleConfig = await (argv.bento
    ? makeExtensionFromTemplates([
        getTemplateDir('shared'),
        getTemplateDir('bento'),
      ])
    : makeExtensionFromTemplates([
        getTemplateDir('shared'),
        getTemplateDir('classic'),
      ]));
  if (!bundleConfig) {
    log(yellow('WARNING:'), 'Could not write extension files.');
    return;
  }
  insertExtensionBundlesConfig(bundleConfig);
}

module.exports = {
  insertExtensionBundlesConfig,
  makeExtension,
  makeExtensionFromTemplates,
  writeFromTemplateDir,
};

makeExtension.description = 'Create an extension skeleton';
makeExtension.flags = {
  name: 'The name of the extension. Preferably prefixed with `amp-*`',
  bento: 'Generate a Bento component',
  version: 'Sets the version number (default: 0.1; or 1.0 with --bento)',
  overwrite: 'Overwrites existing files at the destination, if present. Otherwise skips them.',
};

/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs-extra');
const path = require('path');
const {clean} = require('./clean');
const {doBuild} = require('./build');
const {doDist} = require('./dist');
const {green} = require('kleur/colors');
const {log} = require('../common/logging');

/**
 * @param {string} dest
 * @return {Promise<string[]>}
 */
async function walk(dest) {
  const filelist = [];
  const files = await fs.readdir(dest);

  for (let i = 0; i < files.length; i++) {
    const file = `${dest}/${files[i]}`;

    fs.statSync(file).isDirectory()
      ? Array.prototype.push.apply(filelist, await walk(file))
      : filelist.push(file);
  }

  return filelist;
}

/**
 * @param {string} src
 * @param {string} dest
 * @return {Promise<void>}
 */
async function copyAndReplaceUrls(src, dest) {
  await fs.copy(src, dest, {overwrite: true});
  // Recursively gets all the files within the directory and its children.
  const files = await walk(dest);
  const promises = files
    .filter((fileName) => path.extname(fileName) == '.html')
    .map((file) => replaceUrls(file));
  await Promise.all(promises);
}

/**
 * @return {Promise<void>}
 */
async function firebase() {
  if (!argv.nobuild) {
    await clean();
    if (argv.compiled) {
      await doDist({fortesting: argv.fortesting});
    } else {
      await doBuild({fortesting: argv.fortesting});
    }
  }
  await fs.mkdirp('firebase');
  if (argv.file) {
    log(green(`Processing file: ${argv.file}.`));
    log(green('Writing file to firebase.index.html.'));
    await fs.copyFile(/*src*/ argv.file, 'firebase/index.html');
    await replaceUrls('firebase/index.html');
  } else {
    log(green('Copying test/manual and examples folders.'));
    await Promise.all([
      copyAndReplaceUrls('test/manual', 'firebase/manual'),
      copyAndReplaceUrls('examples', 'firebase/examples'),
    ]);
  }
  log(green('Copying local amp files from dist folder.'));
  await Promise.all([
    fs.copy('dist', 'firebase/dist', {overwrite: true}),
    fs.copy('dist.3p/current', 'firebase/dist.3p/current', {overwrite: true}),
  ]);

  await Promise.all([
    fs.copyFile('firebase/dist/ww.max.js', 'firebase/dist/ww.js'),
  ]);
}

/**
 * @param {string} filePath
 * @return {Promise<void>}
 */
async function replaceUrls(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  let result = data.replace(
    /https:\/\/cdn\.ampproject\.org\/v0\.js/g,
    '/dist/amp.js'
  );
  if (argv.compiled) {
    result = result.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
      '/dist/v0/$1.js'
    );
  } else {
    result = result.replace(
      /https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g,
      '/dist/v0/$1.max.js'
    );
  }
  await fs.writeFile(filePath, result, 'utf8');
}

module.exports = {
  firebase,
};

firebase.description = 'Generates firebase folder for deployment';
firebase.flags = {
  'file': '  File to deploy to firebase as index.html',
  'compiled': '  Deploy from minified files',
  'nobuild': '  Skips the gulp build|dist step.',
  'fortesting':
    '  Expects an env var AMP_TESTING_HOST and writes this to AMP_CONFIG',
};

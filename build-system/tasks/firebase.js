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
const colors = require('ansi-colors');
const fs = require('fs-extra');
const log = require('fancy-log');
const path = require('path');
const {build} = require('./build');
const {dist} = require('./dist');


async function walk(dest) {
  const filelist = [];
  const files = await fs.readdir(dest);

  for (let i = 0; i < files.length; i++) {
    const file = `${dest}/${files[i]}`;

    fs.statSync(file).isDirectory() ?
      Array.prototype.push.apply(filelist, await walk(file)) :
      filelist.push(file);
  }

  return filelist;
}

async function copyAndReplaceUrls(src, dest) {
  await fs.copy(src, dest, {overwrite: true});
  // Recursively gets all the files within the directory and its children.
  const files = await walk(dest);
  const promises = files.filter(fileName => path.extname(fileName) == '.html')
      .map(file => replaceUrls(file));
  await Promise.all(promises);
}

async function modifyThirdPartyUrl() {
  const filePath = 'firebase/dist/amp.js';
  const data = await fs.readFile('firebase/dist/amp.js', 'utf8');
  const result = data.replace(
      'self.AMP_CONFIG={',
      'self.AMP_CONFIG={"thirdPartyUrl":location.origin,');
  await fs.writeFile(filePath, result, 'utf8');
}

async function firebase() {
  if (!argv.nobuild) {
    if (argv.min) {
      await dist();
    } else {
      await build();
    }
  }
  await fs.mkdirp('firebase');
  if (argv.file) {
    log(colors.green(`Processing file: ${argv.file}.`));
    log(colors.green('Writing file to firebase.index.html.'));
    await fs.copyFile(/*src*/ argv.file, 'firebase/index.html',
        {overwrite: true});
    await replaceUrls('firebase/index.html');
  } else {
    await Promise.all([
      copyAndReplaceUrls('test/manual', 'firebase/manual'),
      copyAndReplaceUrls('examples', 'firebase/examples'),
    ]);
  }
  log(colors.green('Copying local amp files from dist folder.'));
  await Promise.all([
    fs.copy('dist', 'firebase/dist', {overwrite: true}),
    fs.copy('dist.3p/current', 'firebase/dist.3p/current', {overwrite: true}),
  ]);
  await Promise.all([
    modifyThirdPartyUrl(),
    fs.copyFile('firebase/dist/ww.max.js', 'firebase/dist/ww.js',
        {overwrite: true}),
  ]);
}

async function replaceUrls(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  let result = data.replace(/https:\/\/cdn\.ampproject\.org\/v0\.js/g, '/dist/amp.js');
  if (argv.min) {
    result = result.replace(/https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g, '/dist/v0/$1.js');
  } else {
    result = result.replace(/https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g, '/dist/v0/$1.max.js');
  }
  await fs.writeFile(filePath, result, 'utf8');
}

module.exports = {
  firebase,
};

firebase.description = 'Generates firebase folder for deployment';
firebase.flags = {
  'file': 'File to deploy to firebase as index.html',
  'min': 'Source from minified files',
  'nobuild': 'Skips the gulp build|dist step.',
};

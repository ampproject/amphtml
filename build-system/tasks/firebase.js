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
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const path = require('path');

async function copyAndReplaceUrls(src, dest) {
  await fs.copy(src, dest, {overwrite: true});
  const files = await fs.readdir(dest);
  const promises = files.filter(fileName => path.extname(fileName) == '.html')
      .map(file => replaceUrls(dest + '/' + file));
  await Promise.all(promises);
}

async function generateFirebaseFolder() {
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
  await fs.copy('dist', 'firebase/dist', {overwrite: true});
  await fs.copyFile('firebase/dist/ww.max.js', 'firebase/dist/ww.js',
      {overwrite: true});
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

gulp.task(
    'firebase',
    'Generates firebase folder for deployment',
    generateFirebaseFolder,
    {
      options: {
        'file': 'File to deploy to firebase as index.html',
        'min': 'Source from minified files',
      },
    });

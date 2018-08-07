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
const gulp = require('gulp-help')(require('gulp'));
const path = require('path');


function generateFirebaseFolder() {
  fs.mkdirpSync('firebase');
  if (argv.file) {
    process.stdout.write(`Processing file: ${argv.file}\n`);
    process.stdout.write('Writing file to firebase.index.html\n');
    fs.copyFileSync(/*src*/ argv.file, 'firebase/index.html',
        {overwrite: true});
    replaceUrls('firebase/index.html');

  } else {
    fs.copySync('test/manual', 'firebase/manual', {overwrite: true});
    fs.copySync('examples', 'firebase/examples', {overwrite: true});
    const examples = fs.readdirSync('firebase/examples');
    const manualTests = fs.readdirSync('firebase/manual');
    examples.filter(fileName => path.extname(fileName) == '.html')
        .forEach(file => replaceUrls('firebase/examples/' + file));
    manualTests.filter(fileName => path.extname(fileName) == '.html')
        .forEach(file => replaceUrls('firebase/manual/' + file));
  }
  process.stdout.write('Copying local amp files from dist folder\n');
  fs.copySync('dist', 'firebase/dist', {overwrite: true});
}

function replaceUrls(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      process.stdout.write(err);
    }
    let result = data.replace(/https:\/\/cdn\.ampproject\.org\/v0\.js/g, '/dist/amp.js');
    result = result.replace(/https:\/\/cdn\.ampproject\.org\/v0\/(.+?).js/g, '/dist/v0/$1.max.js');

    fs.writeFileSync(filePath, result, 'utf8', err => {
      if (err) {
        process.stdout.write(err);
      }
    });
  });

}

gulp.task(
    'firebase',
    'Generates firebase folder for deployment',
    generateFirebaseFolder,
    {
      options: {
        'file': 'File to deploy to firebase as index.html',
      },
    });

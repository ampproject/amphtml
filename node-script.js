/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

// Run script using node --experimental-modules --es-module-specifier-resolution=node ./node-script.js
// node version v14.15.1
// package.json must contain top level "type": "module" for dynamic module import

const dir = '/Users/artezan/amphtml/extensions/amp-story-auto-ads/0.1/_locales/';
// 1. loop thru directory
fs.readdirSync(dir).forEach(async (file) => {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    const jsonName = file.replace('.js', '.json');
    // 2. import module (strings)
    const obj = await import(dir + file);

    // 3. JSON.stringify()
    const jsonStr = JSON.stringify(obj);

    // 4. write new file .json with result from 3).
    fs.writeFile(dir + jsonName, jsonStr, (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
    });
  }
});

// 1.1 For each file;

// const filePath =
//   '/Users/artezan/amphtml/extensions/amp-story/1.0/_locales/en.js';
// fs.readFile(filePath, 'utf8', async (err, data) => {
//   // 2. import module (strings)
//   const obj = await import(filePath);
//   // console.log(JSON.stringify(obj));
//   // 3. JSON.stringify()
//   // 4. write new file .json with result from 3).
//   const jsonName = filePath.replace('.js', '.json');
//   const json = JSON.stringify(obj);
//   fs.writeFile(jsonName, json, (err, data) => {
//     if (err) {
//       console.log(err);
//     }
//   });
// });

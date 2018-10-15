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

const fs = require('fs');
const Mustache = require('mustache');

const mustacheData = {
  appJs: fs.readFileSync('./dist/app.js', 'utf8').toString(),
  appCss: fs.readFileSync('./app.css', 'utf8').toString()
}

const indexHtml = Mustache.render(fs.readFileSync('./template.html', 'utf8'), mustacheData);
fs.writeFileSync('./dist/index.html', indexHtml);

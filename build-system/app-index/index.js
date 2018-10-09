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
'use strict';


const BBPromise = require('bluebird');
const fs = BBPromise.promisifyAll(require('fs'));


// TODO(alanorozco): Use JSX once we're ready.
const templateFile = 'build-system/app-index/template.html';


function renderFileLink(base, location) {
  return `<li><a href="${base}/${location}">${location}</a></li>`;
}


function renderIndex(req, res) {
  Promise.all([fs.readdirAsync('./examples/'), fs.readFileAsync(templateFile)])
      .then(result => {
        const files = result[0];
        const template = result[1].toString();

        res.end(template.replace('<!-- examples -->',
            files.map(file => renderFileLink('/examples', file)).join('')));
      });
}

module.exports = renderIndex;

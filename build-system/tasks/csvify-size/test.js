/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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


var test = require('ava');
var m = require('./');


test('sync - parse size.txt', t => {
  t.plan(2);
  var sizeFiles = [
    `  max    |    min    |    gzip   |    brotli    | file
        --    |    ---    |    ---    |    ---       |  ---
    12.04  kB |   5.5  kB |   3.2  kB |     1.12 kB  |  v0.js / amp.js
    100.46 kB |  60.11 kB |  23.22 kB |     10.11 kB |  current-min/f.js / current/integration.js
    `,
    `  max    |    size   |   file
        --    |    ---    |    ---
    13 B |   12  B |  v0.js / amp.js
    120.46 kB |  70.11 kB |  current-min/f.js
    `
  ];
  var table1 = m.parseSizeFile(sizeFiles[0]);
  t.deepEqual(table1, [
    {name:'"v0.js"', size:'"5500.000"'},
    {name:'"f.js"', size:'"60110.000"'},
  ]);
  var table2 = m.parseSizeFile(sizeFiles[1]);
  t.deepEqual(table2, [
    {name:'"v0.js"', size:'"12.000"'},
    {name:'"f.js"', size:'"70110.000"'},
  ]);
});

test('sync - parse table typedef', t => {
  t.plan(1);
  var dateTimes = ['"0"', '"1"', '"2"'];
  var tables = [
    [
      {name:'"v0.js"', size:'"5.5"', dateTime: '"0"'},
    ],
    [
      {name:'"v0.js"', size:'"8.5"', dateTime: '"1"'},
      {name:'"f.js"', size:'"70.11"', dateTime: '"1"'},
    ],
    [
      {name:'"v0.js"', size:'"8.53"', dateTime: '"2"'},
      {name:'"f.js"', size:'"71.11"', dateTime: '"2"'},
    ],
  ];
  var csv = m.mergeTables(dateTimes, tables);
  t.deepEqual(csv, [
    ['"0"', '""', '"5.5"'],
    ['"1"', '"70.11"', '"8.5"'],
    ['"2"', '"71.11"', '"8.53"'],
  ]);
});

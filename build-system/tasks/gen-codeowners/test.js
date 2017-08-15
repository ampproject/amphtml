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

var test = require('ava');
var m = require('./');

test('sync - build out correct CODEOWNERS', t => {
  const owners = {
    '*': [
      'username1',
      '@username2',
      {'ampproject/group': ['*.protoascii']}
    ],
    ads: ['username3', '@username1'],
    'some/deeply/nested/dir': ['username5', {'ampproject/group2': ['some.js']}],
  };
  t.plan(1);
  const result = m.buildCodeownersFile(owners);
  const expected = `* @username1, @username2
*/*.protoascii @ampproject/group
ads/* @username3, @username1
some/deeply/nested/dir/* @username5
some/deeply/nested/dir/some.js @ampproject/group2
`;
  t.is(expected, result);
});

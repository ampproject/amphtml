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
'use strict';


var BBPromise = require('bluebird');
var fs = BBPromise.promisifyAll(require('fs'));
var m = require('./');
var test = require('ava');

var targetFile = 'target-file.js';

test('sync - prepends global config', t => {
  t.plan(1);
  var res = m.prependConfig('{"hello":"world"}', 'var x = 1 + 1;');
  t.is(res, 'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"});' +
      '/*AMP_CONFIG*/var x = 1 + 1;');
});

test('sync - valueOrDefault', t => {
  t.plan(2);
  var res = m.valueOrDefault(true, 'hello');
  t.is(res, 'hello');
  res = m.valueOrDefault('world', 'hello');
  t.is(res, 'world');
});

test('sync - sanityCheck', t => {
  t.plan(3);
  var badStr = 'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
      '/*AMP_CONFIG*/' +
      'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
      '/*AMP_CONFIG*/' +
      'var x = 1 + 1;';
  var badStr2 = 'var x = 1 + 1;';
  var goodStr = 'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
      '/*AMP_CONFIG*/' +
      'var x = 1 + 1;';
  t.false(m.sanityCheck(badStr));
  t.true(m.sanityCheck(goodStr));
  t.false(m.sanityCheck(badStr2));
});

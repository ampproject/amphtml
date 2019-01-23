
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

const test = require('ava');
const fs = require('fs');
const util = require('util');
const {transform} = require('./index.js');

const readFile = util.promisify(fs.readFile);
const fixtureContent = async name => {
  return await readFile(require.resolve(`./fixtures/${name}`), {
    encoding: 'utf-8'
  });
}

test('it should change this to self in a ternary condition with outputs window.global:this', async t => {
  const name = 'ternary-with-globals'
  const input = await(fixtureContent(`${name}/input.js`));
  const output = await(fixtureContent(`${name}/output.js`));
  transform({
    contents: input
  }, null, (err, file) => {
    const result = file.contents.toString('utf-8');
    t.is(result, output);
  });
});

test('it should change if `this` is inside an arrow function', async t => {
  const name = 'this-in-function'
  const input = await(fixtureContent(`${name}/input.js`));
  const output = await(fixtureContent(`${name}/output.js`));
  transform({
    contents: input
  }, null, (err, file) => {
    const result = file.contents.toString('utf-8');
    t.is(result, output);
  });
});

test('it should not change `this` of a nested scope', async t => {
  const name = 'nested-scopes'
  const input = await(fixtureContent(`${name}/input.js`));
  const output = await(fixtureContent(`${name}/output.js`));
  transform({
    contents: input
  }, null, (err, file) => {
    const result = file.contents.toString('utf-8');
    t.is(result, output);
  });
});

test('it should not change if `this` is inside a function', async t => {
  const name = 'this-in-arrow-function'
  const input = await(fixtureContent(`${name}/input.js`));
  const output = await(fixtureContent(`${name}/output.js`));
  transform({
    contents: input
  }, null, (err, file) => {
    const result = file.contents.toString('utf-8');
    t.is(result, output);
  });
});

test('it should not change ternary conditions with outputs !== window.global:this', async t => {
  const name = 'ternary-without-globals'
  const input = await(fixtureContent(`${name}/input.js`));
  const output = await(fixtureContent(`${name}/output.js`));
  transform({
    contents: input
  }, null, (err, file) => {
    const result = file.contents.toString('utf-8');
    t.is(result, output);
  });
});


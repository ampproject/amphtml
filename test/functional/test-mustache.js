/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/* global require: false */
const mustache = require('../../third_party/mustache/mustache');

describe('Mustache', () => {

  let savedSanitizer;

  beforeEach(() => {
    savedSanitizer = mustache.sanitizeUnescaped;
    mustache.setUnescapedSanitizier(function(value) {
      return value.toUpperCase();
    });
  });

  afterEach(() => {
    mustache.setUnescapedSanitizier(savedSanitizer);
  });

  it('should escape html', () => {
    expect(mustache.render('{{value}}', {value: '<b>abc</b>'})).to.equal(
        '&lt;b&gt;abc&lt;&#x2F;b&gt;');
  });

  it('should transform unescaped html', () => {
    expect(mustache.render('{{{value}}}', {value: '<b>abc</b>'})).to.equal(
        '<B>ABC</B>');
  });

  it('should only expand own properties', () => {
    const parent = {value: 'bc'};
    const child = Object.create(parent);
    const container = {parent, child};
    expect(mustache.render('a{{value}}', parent)).to.equal('abc');
    expect(mustache.render('a{{value}}', child)).to.equal('a');
    expect(mustache.render('a{{parent.value}}', container)).to.equal('abc');
    expect(mustache.render('a{{child.value}}', container)).to.equal('a');
  });

  it('should NOT allow calls to builtin functions', () => {
    // Calls on x.pop in classical Mustache would lead to builtin call and
    // mutate on the 't' object. Here we will not allow it. We explicitly
    // prohibit such calls.
    const obj = {
      't': {
        '0': '0',
        '1': '1',
        'length': 2,
        'x': [],
      },
    };
    expect(mustache.render(
        '{{#t}}{{x.pop}}X{{x.pop}}{{/t}}' +
        '{{#t}}{{0}}Y{{1}}{{/t}}',
        obj)).to.equal('X0Y1');
  });

  it('should NOT allow delimiter substituion', () => {
    expect(mustache.render(
        '{{value}}' +
        '{{=<% %>=}}' +
        '<% value %>',
        {value: 'abc'})).to.equal('abc<% value %>');
  });
});

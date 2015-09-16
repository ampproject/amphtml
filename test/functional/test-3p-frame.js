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

import {dashToCamelCase_, addDataAndJsonAttributes_} from '../../src/3p-frame';

describe('3p-frame', () => {
  it('should transform dashes to camel case.', () => {
    expect(dashToCamelCase_('foo')).to.equal('foo');
    expect(dashToCamelCase_('foo-bar')).to.equal('fooBar');
    expect(dashToCamelCase_('foo-bar-baz')).to.equal('fooBarBaz');
    expect(dashToCamelCase_('-foo')).to.equal('Foo');
  });

  it('add attributes', () => {
    var div = document.createElement('div');
    div.setAttribute('data-foo', 'foo');
    div.setAttribute('data-bar', 'bar');
    div.setAttribute('foo', 'nope');
    var obj = {};
    addDataAndJsonAttributes_(div, obj)
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar'
    });

    div.setAttribute('json', '{"abc": [1,2,3]}');

    obj = {};
    addDataAndJsonAttributes_(div, obj)
    expect(obj).to.deep.equal({
      'foo': 'foo',
      'bar': 'bar',
      'abc': [1, 2, 3]
    });
  });
});

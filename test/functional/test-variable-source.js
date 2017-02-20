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

import {VariableSource} from '../../src/service/variable-source';

describe('VariableSource', () => {
  let varSource;
  beforeEach(() => {
    varSource = new VariableSource();
  });

  it('Works without any variables', () => {
    expect(varSource.getExpr()).to.be.ok;
    expect(varSource.get('')).to.be.undefined;
  });

  it('Works with sync variables', () => {
    varSource.set('Foo', () => 'bar');
    expect(varSource.getExpr()).to.be.ok;
    expect(varSource.get('Foo')['sync']()).to.equal('bar');
    expect(varSource.get('foo')).to.be.undefined;
    expect(varSource.get('AFoo')).to.be.undefined;
  });

  it('Works with async variables', () => {
    varSource.setAsync('Foo', () => Promise.resolve('bar'));
    expect(varSource.getExpr()).to.be.ok;

    return varSource.get('Foo')['async']().then(value => {
      expect(value).to.equal('bar');
    });
  });

  it('Works with both sync and async variables', () => {
    varSource.setBoth('Foo', () => 'bar', () => Promise.resolve('bar'));
    expect(varSource.getExpr()).to.be.ok;

    expect(varSource.get('Foo')['sync']()).to.equal('bar');
    return varSource.get('Foo')['async']().then(value => {
      expect(value).to.equal('bar');
    });
  });

  it('Works with multiple variables', () => {
    varSource.setBoth('Foo', () => 'bar', () => Promise.resolve('bar'));
    varSource.set('Baz', () => 'Foo');
    expect(varSource.getExpr()).to.be.ok;

    expect(varSource.get('Foo')['sync']()).to.equal('bar');
    expect(varSource.get('Baz')['sync']()).to.equal('Foo');
    return varSource.get('Foo')['async']().then(value => {
      expect(value).to.equal('bar');
    });
  });

  it('Works with sync variable that is set multiple times', () => {
    varSource.set('Foo', () => 'bar').set('Foo', () => 'baz');
    expect(varSource.getExpr()).to.be.ok;
    expect(varSource.get('Foo')['sync']()).to.equal('baz');
  });

  it('Works with async variable that is set multiple times', () => {
    varSource.setAsync('Foo', () => Promise.resolve('bar'))
        .setAsync('Foo', () => Promise.resolve('baz'));
    return varSource.get('Foo')['async']().then(value => {
      expect(value).to.equal('baz');
    });
  });
});

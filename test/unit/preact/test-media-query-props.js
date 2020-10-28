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

import {MediaQueryProps} from '../../../src/preact/media-query-props';
import {waitFor} from '../../../testing/test-helper';

describes.realWin('MediaQueryProps', {frameStyle: {width: '300px'}}, (env) => {
  let win;
  let resolver;
  let callback;

  beforeEach(() => {
    win = env.win;
    callback = env.sandbox.spy();
    resolver = new MediaQueryProps(win, callback);
    expect(env.win.innerWidth).to.equal(300);
  });

  it('should fail before resolutions start', () => {
    expect(() => resolver.resolve('one')).to.throw();
  });

  it('should resolve an empty string', () => {
    resolver.start();
    expect(resolver.resolve('')).to.equal('');
  });

  it('should resolve a simple value', () => {
    resolver.start();
    expect(resolver.resolve('a')).to.equal('a');
    expect(resolver.resolve('A')).to.equal('A');
    expect(resolver.resolve('on')).to.equal('on');
    expect(resolver.resolve('1')).to.equal('1');
    expect(resolver.resolve('12')).to.equal('12');
    expect(resolver.resolve('1.2')).to.equal('1.2');
    expect(resolver.resolve('.12')).to.equal('.12');
  });

  it('should resolve a media expression', () => {
    resolver.start();
    expect(resolver.resolve('(min-width: 301px) a, b')).to.equal('b');
    expect(resolver.resolve('(min-width: 299px) a, b')).to.equal('a');
  });

  it('should resolve a first matching expression', () => {
    resolver.start();
    expect(
      resolver.resolve(
        '(min-width: 301px) a, (min-width: 299px) b, (min-width: 200px) c, d'
      )
    ).to.equal('b');
  });

  it('should notify when the query has changed', () => {
    resolver.start();
    const expr = '(min-width: 301px) a, b';
    expect(resolver.resolve(expr)).to.equal('b');
    resolver.complete();
    env.iframe.style.width = '310px';
    waitFor(() => callback.callCount > 0, 'callback is called');
    expect(env.win.innerWidth).to.equal(310);
    resolver.start();
    expect(resolver.resolve(expr)).to.equal('a');
  });

  it('should unlisten the old queries', () => {
    const query1 = {matches: true, onchange: null};
    const query2 = {matches: true, onchange: null};
    const stub = env.sandbox.stub(win, 'matchMedia').callsFake((q) => {
      switch (q) {
        case '(q1)':
          return query1;
        case '(q2)':
          return query2;
      }
    });

    // First pass.
    resolver.start();
    resolver.resolve('(q1) a, b');
    resolver.resolve('(q2) a, b');
    resolver.complete();
    expect(query1.onchange).to.equal(callback);
    expect(query2.onchange).to.equal(callback);

    // Second pass.
    resolver.start();
    resolver.resolve('(q2) a, b');
    resolver.complete();
    expect(query1.onchange).to.be.null;
    expect(query2.onchange).to.equal(callback);

    // Called only twice. Second pass are used from cache.
    expect(stub).to.be.calledTwice;

    // Unlisten all.
    resolver.dispose();
    expect(query1.onchange).to.be.null;
    expect(query2.onchange).to.be.null;
  });
});

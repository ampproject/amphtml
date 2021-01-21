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

import {MediaQueryProps} from '../../../src/utils/media-query-props';
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

  describe('resolveListQuery', () => {
    it('should fail before resolutions start', () => {
      expect(() => resolver.resolveListQuery('one')).to.throw();
    });

    it('should resolve an empty string', () => {
      resolver.start();
      expect(resolver.resolveListQuery('')).to.equal('');
      expect(resolver.resolveListQuery(' ')).to.equal('');
    });

    it('should resolve a simple value', () => {
      resolver.start();
      expect(resolver.resolveListQuery('a')).to.equal('a');
      expect(resolver.resolveListQuery('A')).to.equal('A');
      expect(resolver.resolveListQuery('on')).to.equal('on');
      expect(resolver.resolveListQuery('1')).to.equal('1');
      expect(resolver.resolveListQuery('12')).to.equal('12');
      expect(resolver.resolveListQuery('1.2')).to.equal('1.2');
      expect(resolver.resolveListQuery('.12')).to.equal('.12');
    });

    it('should resolve a media expression', () => {
      resolver.start();
      expect(resolver.resolveListQuery('(min-width: 301px) a, b')).to.equal(
        'b'
      );
      expect(resolver.resolveListQuery('(min-width: 299px) a, b')).to.equal(
        'a'
      );
    });

    it('should allow % expressions', () => {
      resolver.start();
      expect(resolver.resolveListQuery('1%')).to.equal('1%');
      expect(resolver.resolveListQuery('(min-width: 301px) 1%, 2%')).to.equal(
        '2%'
      );
    });

    it('should resolve a first matching expression', () => {
      resolver.start();
      expect(
        resolver.resolveListQuery(
          '(min-width: 301px) a, (min-width: 299px) b, (min-width: 200px) c, d'
        )
      ).to.equal('b');
    });

    it('should notify when the query has changed', () => {
      resolver.start();
      const expr = '(min-width: 301px) a, b';
      expect(resolver.resolveListQuery(expr)).to.equal('b');
      resolver.complete();
      env.iframe.style.width = '310px';
      waitFor(() => callback.callCount > 0, 'callback is called');
      expect(env.win.innerWidth).to.equal(310);
      resolver.start();
      expect(resolver.resolveListQuery(expr)).to.equal('a');
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
      resolver.resolveListQuery('(q1) a, b');
      resolver.resolveListQuery('(q2) a, b');
      resolver.complete();
      expect(query1.onchange).to.equal(callback);
      expect(query2.onchange).to.equal(callback);

      // Second pass.
      resolver.start();
      resolver.resolveListQuery('(q2) a, b');
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

    it('should unlisten the old queries with old API', () => {
      const query1 = {
        matches: true,
        onchange_: null,
        addListener(cb) {
          this.onchange_ = cb;
        },
        removeListener(cb) {
          if (this.onchange_ === cb) {
            this.onchange_ = null;
          }
        },
      };
      const query2 = {
        matches: true,
        onchange_: null,
        addListener(cb) {
          this.onchange_ = cb;
        },
        removeListener(cb) {
          if (this.onchange_ === cb) {
            this.onchange_ = null;
          }
        },
      };
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
      resolver.resolveListQuery('(q1) a, b');
      resolver.resolveListQuery('(q2) a, b');
      resolver.complete();
      expect(query1.onchange_).to.equal(callback);
      expect(query2.onchange_).to.equal(callback);

      // Second pass.
      resolver.start();
      resolver.resolveListQuery('(q2) a, b');
      resolver.complete();
      expect(query1.onchange_).to.be.null;
      expect(query2.onchange_).to.equal(callback);

      // Called only twice. Second pass are used from cache.
      expect(stub).to.be.calledTwice;

      // Unlisten all.
      resolver.dispose();
      expect(query1.onchange_).to.be.null;
      expect(query2.onchange_).to.be.null;
    });
  });

  describe('resolveMatchQuery', () => {
    it('should fail before resolutions start', () => {
      expect(() => resolver.resolveMatchQuery('one')).to.throw();
    });

    it('should resolve an empty string', () => {
      resolver.start();
      expect(resolver.resolveMatchQuery('')).to.be.true;
      expect(resolver.resolveMatchQuery(' ')).to.be.true;
    });

    it('should resolve a simple media query', () => {
      resolver.start();
      expect(resolver.resolveMatchQuery('(min-width: 299px)')).to.be.true;
      expect(resolver.resolveMatchQuery('(min-width: 301px)')).to.be.false;
    });

    it('should resolve an AND media query', () => {
      resolver.start();
      expect(
        resolver.resolveMatchQuery('(min-width: 299px) AND (max-width: 301px)')
      ).to.be.true;
      expect(
        resolver.resolveMatchQuery('(min-width: 299px) AND (max-width: 299px)')
      ).to.be.false;
    });

    it('should resolve an OR media query', () => {
      resolver.start();
      expect(
        resolver.resolveMatchQuery('(min-width: 299px), (max-width: 301px)')
      ).to.be.true;
      expect(
        resolver.resolveMatchQuery('(min-width: 299px), (max-width: 299px)')
      ).to.be.true;
    });
  });
});

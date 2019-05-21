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

import {
  VariableSource,
  getTimingDataAsync,
} from '../../src/service/variable-source';

import {createElementWithAttributes} from '../../src/dom';

describes.fakeWin(
  'VariableSource',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  env => {
    let varSource;
    beforeEach(() => {
      varSource = new VariableSource(env.ampdoc);
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

      return varSource
        .get('Foo')
        ['async']()
        .then(value => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with both sync and async variables', () => {
      varSource.setBoth('Foo', () => 'bar', () => Promise.resolve('bar'));
      expect(varSource.getExpr()).to.be.ok;

      expect(varSource.get('Foo')['sync']()).to.equal('bar');
      return varSource
        .get('Foo')
        ['async']()
        .then(value => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with multiple variables', () => {
      varSource.setBoth('Foo', () => 'bar', () => Promise.resolve('bar'));
      varSource.set('Baz', () => 'Foo');
      expect(varSource.getExpr()).to.be.ok;

      expect(varSource.get('Foo')['sync']()).to.equal('bar');
      expect(varSource.get('Baz')['sync']()).to.equal('Foo');
      return varSource
        .get('Foo')
        ['async']()
        .then(value => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with sync variable that is set multiple times', () => {
      varSource.set('Foo', () => 'bar').set('Foo', () => 'baz');
      expect(varSource.getExpr()).to.be.ok;
      expect(varSource.get('Foo')['sync']()).to.equal('baz');
    });

    it('Works with async variable that is set multiple times', () => {
      varSource
        .setAsync('Foo', () => Promise.resolve('bar'))
        .setAsync('Foo', () => Promise.resolve('baz'));
      return varSource
        .get('Foo')
        ['async']()
        .then(value => {
          expect(value).to.equal('baz');
        });
    });

    it('Does not cache a built Expr', () => {
      varSource.set('ONE', () => 'foo');
      const firstExpr = varSource.getExpr();
      varSource.set('TWO', () => 'bar');
      expect(firstExpr).not.to.equal(varSource.getExpr());
    });

    describes.realWin(
      'Whitelist of variable substitutions',
      {
        amp: {
          ampdoc: 'single',
        },
      },
      env => {
        let variableSource;
        beforeEach(() => {
          env.win.document.head.appendChild(
            createElementWithAttributes(env.win.document, 'meta', {
              name: 'amp-allowed-url-macros',
              content: 'ABC,ABCD,CANONICAL',
            })
          );
          variableSource = new VariableSource(env.ampdoc);
        });

        it('Works with whitelisted variables', () => {
          variableSource.setAsync('ABCD', () => Promise.resolve('abcd'));
          expect(variableSource.getExpr()).to.be.ok;
          expect(variableSource.getExpr().toString()).to.contain('ABCD');

          return variableSource
            .get('ABCD')
            ['async']()
            .then(value => {
              expect(value).to.equal('abcd');
            });
        });

        it('Should not work with unwhitelisted variables', () => {
          variableSource.setAsync('RANDOM', () => Promise.resolve('0.1234'));
          expect(variableSource.getExpr()).to.be.ok;
          expect(variableSource.getExpr().toString()).not.to.contain('RANDOM');

          return variableSource
            .get('RANDOM')
            ['async']()
            .then(value => {
              expect(value).to.equal('0.1234');
            });
        });
      }
    );

    it('Should not work with empty variable whitelist', () => {
      env.win.document.head.appendChild(
        createElementWithAttributes(env.win.document, 'meta', {
          name: 'amp-allowed-url-macros',
          content: '',
        })
      );
      const variableSource = new VariableSource(env.ampdoc);

      variableSource.setAsync('RANDOM', () => Promise.resolve('0.1234'));
      expect(variableSource.getExpr()).to.be.ok;
      expect(variableSource.getExpr().toString()).not.to.contain('RANDOM');

      return variableSource
        .get('RANDOM')
        ['async']()
        .then(value => {
          expect(value).to.equal('0.1234');
        });
    });

    describes.fakeWin('getTimingData', {}, env => {
      let win;

      beforeEach(() => {
        win = env.win;
        win.performance = {
          timing: {
            navigationStart: 1,
            loadEventStart: 0,
          },
        };
      });

      it('should wait for load event', () => {
        win.readyState = 'other';
        const p = getTimingDataAsync(win, 'navigationStart', 'loadEventStart');
        expect(win.eventListeners.count('load')).to.equal(1);
        win.performance.timing.loadEventStart = 12;
        win.eventListeners.fire({type: 'load'});
        return p.then(value => {
          expect(value).to.equal(11);
        });
      });
    });
  }
);

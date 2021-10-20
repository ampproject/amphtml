const dedent = require('dedent');
const test = require('ava');
const {generateBentoRuntime} = require('../bento');

test('generateBentoRuntime', (t) => {
  t.is(
    generateBentoRuntime({
      '#foo': ['bar', 'baz'],
      '#baz/bar': ['car'],
    }),
    dedent(`
      import {dict} from '#core/types/object';
      import {install as installCustomElements} from '#polyfills/custom-elements.js';

      import {
      bar as _foo_bar,
      baz as _foo_baz,
      } from '#foo';

      import {
      car as _baz_bar_car,
      } from '#baz/bar';

      installCustomElements(self);

      const bento = self.BENTO || [];

      bento['#foo'] = dict({
      'bar': _foo_bar,
      'baz': _foo_baz,
      });

      bento['#baz/bar'] = dict({
      'car': _baz_bar_car,
      });

      bento.push = (fn) => {
        fn();
      };

      self.BENTO = bento;

      for (const fn of bento) {
        bento.push(fn);
      }
    `)
  );
});

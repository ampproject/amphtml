const dedent = require('dedent');
const test = require('ava');
const {
  generateBentoRuntimeEntrypoint,
  generateIntermediatePackage,
} = require('../bento');

test('generateBentoRuntimeEntrypoint', (t) => {
  t.is(
    generateBentoRuntimeEntrypoint({
      '#foo': ['bar', 'baz'],
      '#baz/bar': ['car'],
    }),
    dedent(`
      import {dict} from '#core/types/object';
      import {isEsm} from '#core/mode';
      import {install as installCustomElements} from '#polyfills/custom-elements';

      import {bar, baz} from '#foo';
      import {car} from '#baz/bar';

      if (!isEsm()) {
        installCustomElements(self, class {});
      }

      const bento = self.BENTO || [];

      bento['_'] = dict({
      // #foo
      'bar': bar,
      'baz': baz,
      // #baz/bar
      'car': car,
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

test('generateIntermediatePackage', (t) => {
  t.is(
    generateIntermediatePackage({x: ['foo', 'bar'], y: ['baz']}),
    dedent(`
      const _ = (name) => self.BENTO['_'][name];
      // x
      export const foo = /*#__PURE__*/ _('foo');
      export const bar = /*#__PURE__*/ _('bar');
      // y
      export const baz = /*#__PURE__*/ _('baz');
    `)
  );
});

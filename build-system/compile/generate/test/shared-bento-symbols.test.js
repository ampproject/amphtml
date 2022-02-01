const dedent = require('dedent');
const test = require('ava');
const {getExportedSymbols} = require('../shared-bento-symbols');

test('getExportedSymbols', (t) => {
  t.deepEqual(
    getExportedSymbols(
      dedent(`
        export const foo = 'foo';
        export function bar() {}
        export class Baz {}
        export {qux} from './qux';
      `)
    ),
    ['foo', 'bar', 'Baz', 'qux']
  );
});

test('getExportedSymbols fails with export *', (t) => {
  t.throws(() => getExportedSymbols("export * from './qux';"), {
    message: /export */,
  });
});

test('getExportedSymbols fails with export default', (t) => {
  t.throws(() => getExportedSymbols("export default 'foo';"), {
    message: /export default/,
  });
});

test('getExportedSymbols fails with export from default', (t) => {
  t.throws(() => getExportedSymbols("export foo from 'foo';"), {
    message: /export from a default import/,
  });
});

test('getExportedSymbols fails with exported namespace', (t) => {
  t.throws(() => getExportedSymbols("export * as foo from 'foo';"), {
    message: /export a namespace/,
  });
});

test('getExportedSymbols fails with exported x as y', (t) => {
  t.throws(() => getExportedSymbols("export {x as y} from 'x';"), {
    message: /should match local name/,
  });
});

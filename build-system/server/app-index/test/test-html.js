const test = require('ava');
const {html, joinFragments} = require('../html');

test('joinFragments joins simple fragments', (t) => {
  t.is(joinFragments(['a', 'b', 'c']), 'abc');
});

test('joinFragments joins mapped fragments', (t) => {
  t.is(
    joinFragments([1, 2, 3], (a) => a + 1),
    '234'
  );
});

test('tagged literal passes through simple string', (t) => {
  t.is(html`foo`, 'foo');
});

test('tagged literal concatenates interpolated args', (t) => {
  // eslint-disable-next-line local/html-template
  const interpolated = html`quesadilla ${'de'} chicharrón ${'con'} queso`;
  t.is(interpolated, 'quesadilla de chicharrón con queso');
});

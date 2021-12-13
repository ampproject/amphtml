'use strict';

const m = require('.');
const test = require('ava');

test('sync - valueOrDefault', (t) => {
  t.plan(2);
  let res = m.valueOrDefault(true, 'hello');
  t.is(res, 'hello');
  res = m.valueOrDefault('world', 'hello');
  t.is(res, 'world');
});

test('sync - sanityCheck', (t) => {
  t.plan(3);
  const badStr =
    'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
    '/*AMP_CONFIG*/' +
    'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
    '/*AMP_CONFIG*/' +
    'var x = 1 + 1;';
  const badStr2 = 'var x = 1 + 1;';
  const goodStr =
    'self.AMP_CONFIG||(self.AMP_CONFIG={"hello":"world"})' +
    '/*AMP_CONFIG*/' +
    'var x = 1 + 1;';
  t.false(m.numConfigs(badStr) == 1);
  t.true(m.numConfigs(goodStr) == 1);
  t.false(m.numConfigs(badStr2) == 1);
});

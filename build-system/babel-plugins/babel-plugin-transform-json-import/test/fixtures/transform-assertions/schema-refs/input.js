import validateRefs from './refs.schema.json' assert {type: 'json-schema'};

console./*OK*/ log(
  validateRefs({
    foo: 'foo',
    bar: 'foo',
  })
);
console./*OK*/ log(
  validateRefs({
    foo: 'https://foo.com',
    bar: 'https://bar.org',
  })
);

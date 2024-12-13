import validateOneOf from './one-of.schema.json' assert {type: 'json-schema'};

console./*OK*/ log(validateOneOf('invalid'));
console./*OK*/ log(validateOneOf(0));
console./*OK*/ log(validateOneOf(1));
console./*OK*/ log(validateOneOf(true));

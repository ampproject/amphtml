import validateFormat from './format.schema.json' assert {type: 'json-schema'};

console./*OK*/ log(validateFormat('invalid'));
console./*OK*/ log(validateFormat('https://example.com'));

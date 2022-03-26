import validateFormatDate from './format-date.schema.json' assert {type: 'json-schema'};

console./*OK*/ log(validateFormatDate('invalid'));
console./*OK*/ log(validateFormatDate('https://example.com'));

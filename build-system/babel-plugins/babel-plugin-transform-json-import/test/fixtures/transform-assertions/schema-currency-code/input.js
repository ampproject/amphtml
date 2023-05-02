import validateCurrencyCode from './currency-code.schema.json' assert {type: 'json-schema'};

console./*OK*/ log(validateCurrencyCode('MXN'));
console./*OK*/ log(validateCurrencyCode('INVALID'));

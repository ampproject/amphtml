import validate from './my-schema.schema.json';

console./*OK*/ log(validate(100));
console./*OK*/ log(validate(false));
console./*OK*/ log(validate('bar'));
console./*OK*/ log(validate());

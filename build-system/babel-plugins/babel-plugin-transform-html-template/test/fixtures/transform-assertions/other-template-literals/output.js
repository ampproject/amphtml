console.log(`template literal`);
const stringReplacement = 'yo';
console.log(`template (${stringReplacement}) literal`);
const numericReplacement = 1;
console.log(`template (${numericReplacement}) literal`);

function test(string) {
  return string;
}

console.log(test`string`);

const map = {
  LOWERCASE: str => str.toLowerCase(),
  UPPERCASE: str => str.toUpperCase(),
  TRIM: str => str.trim(),
  CONCAT: (a, b) => a + b,
  CAT_THREE: (a, b, c) => a + b + c,
  JSON: JSON.stringify,
  NAME: 'AMP'
};
  
function evaluateStringRecursively_ (string) {
  const stack = [];
  let index = 0;

  const evaluate = string => {
    let builder = '';
    const results = [];

    while (index < string.length) {
      if (string[index] === '(') {
        stack.push(builder.trim());
        builder = '';
        results.push(evaluate(string, ++index, stack));
      }

      else if (string[index] === ',') {
        if (builder.length) {
          results.push(builder.trim());
        }
        builder = '';
        index++;
      }

      else if (string[index] === ')') {
        const lookupName = stack.pop();
        const args = [...results, builder.trim()];
        index++;

        if (map.hasOwnProperty(lookupName)) {

          if (typeof map[lookupName] === 'function') {
            return map[lookupName].apply(null, args);
          } 

          return map[lookupName];
        }

        return '';
      }

      else {
        builder += string[index];
        index++;
      }

    return results.join('');
  };

  return evaluate(string);
}

// const string = 'fake(aaa)';
// const result = evaluateStringRecursively_(string);
// console.log(result);

// module.exports = { evaluateStringRecursively_ };
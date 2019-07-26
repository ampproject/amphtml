const generate = require('@babel/generator').default;
const t = require('@babel/types');

const ast = {
  type: 'Program',
  body: [t.expressionStatement(t.stringLiteral('hello'))],
}

const {code} = generate(ast);
console.log(code);

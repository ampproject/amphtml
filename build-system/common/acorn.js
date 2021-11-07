/**
 * @fileoverview Helpers to parse Javascript source using acorn, which is way
 * faster for analysis than Babel or JsCodeshift.
 */
const acorn = require('acorn');
const acornJsx = require('acorn-jsx');

let jsxParser;

/**
 * @return {typeof acorn}
 */
function getJsxParser() {
  if (!jsxParser) {
    jsxParser = acorn.Parser.extend(acornJsx());
  }
  return jsxParser;
}

/**
 * @param {string} source
 * @return {import('acorn').Token[]}
 */
function tokenize(source) {
  const tokens = [];
  const tokenizer = getJsxParser().tokenizer(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  });
  let token;
  do {
    token = tokenizer.getToken();
    tokens.push(token);
  } while (token.type !== acorn.tokTypes.eof);
  return tokens;
}

module.exports = {tokenize};

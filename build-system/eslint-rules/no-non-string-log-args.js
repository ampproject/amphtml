/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * @typedef {{
 *   name: string.
 *   variadle: boolean,
 *   startPos: number
 * }}
 */
let LogMethodMetadataDef;


/**
 * @type {!Array<LogMethodMetadataDef>}
 */
const transformableMethods = [
  {name: 'assert', variadic: false, startPos: 1},
  {name: 'assertString', variadic: false, startPos: 1},
  {name: 'assertNumber', variadic: false, startPos: 1},
  {name: 'assertBoolean', variadic: false, startPos: 1},
  {name: 'assertEnumValue', variadic: false, startPos: 2},
  {name: 'assertElement', variadic: false, startPos: 1},
  {name: 'createExpectedError', variadic: true, startPos: 0},
  {name: 'fine', variadic: true, startPos: 1},
  {name: 'info', variadic: true, startPos: 1},
  {name: 'warn', variadic: true, startPos: 1},
  {name: 'error', variadic: true, startPos: 1},
  {name: 'expectedError', variadic: true, startPos: 1},
  {name: 'createError', variadic: true, startPos: 0},
];

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isMessageString(node) {
  if (node.type === 'Literal') {
    return typeof node.value === 'string';
  }
  // Allow for string concatenation operations.
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return isMessageString(node.left) && isMessageString(node.right);
  }
  return false;
}

/**
 * @param {string} name
 * @return {!LogMethodMetadataDef}
 */
function getMetadata(name) {
  return transformableMethods.find(cur => cur.name === name);
}

const selector = transformableMethods.map(method => {
  return `CallExpression[callee.property.name=${method.name}]`;
}).join(',');


module.exports = function(context) {
  return {
    [selector]: function(node) {
      // Don't evaluate or transform log.js
      if (context.getFileName() === 'src/log.js') {
        return;
      }
      // Make sure that callee is a CallExpression as well.
      // dev().assert() // enforce rule
      // dev.assert() // ignore
      const callee = node.callee;
      const calleeObject = callee.object;
      if (!calleeObject ||
          calleeObject.type !== 'CallExpression') {
        return;
      }

      // Make sure that the CallExpression is one of dev() or user().
      if(!['dev', 'user'].includes(calleeObject.callee.name)) {
        return;
      }

      const methodInvokedName = callee.property.name;
      // Find the position of the argumen we care about.
      const metadata = getMetadata(methodInvokedName);

      // If there's no metadata, this is most likely a test file running
      // private methods on log.
      if (!metadata) {
        return;
      }

      const argToEval = node.arguments[metadata.startPos];

      if (!argToEval) {
        return;
      }

      let errMsg = [
        `Must use a literal string for argument[${metadata.startPos}]`,
        `on ${metadata.name} call.`
      ].join(' ');

      if (metadata.variadic) {
        errMsg += '\n\tIf you want to pass data to the string, use `%s` ';
        errMsg += 'placeholders and pass additional arguments';
      }

      if (!isMessageString(argToEval)) {
        context.report({
          node: argToEval,
          message: errMsg,
          fix: function(fixer) {
            if (!metadata.variadic) {
              return;
            }
            let tokens = context.getTokens(argToEval);
            let hasStringInArg = tokens.some(x => x.type === 'String');
            // If it doesn't have any string then it's unfixable and needs
            // to be manually refactored to have a message.
            if (!hasStringInArg) {
              return;
            }
            let argFixer = new ArgFixer(tokens).parse();
            return fixer.replaceText(argToEval, argFixer.toString());
          }
        });
      }
    },
  };
};

class ArgFixer {
  constructor(tokens) {
    this.tokens = tokens;
    this.cursor = 0;
    this.sanitizedStr = '';
    this.refs = [];
  }

  getSanitizedArg() {
    return this.sanitizedStr;
  }

  getRefsAsArgumentsString() {
    ', ' + this.refs.join(',');
  }

  parse() {
    while (this.cursor < this.tokens.length) {
      this.chomp();
    }
    return this;
  }

  next() {
    this.cursor++;
  }

  cur(val = 0) {
    return this.tokens[this.cursor + val];
  }

  chomp() {
    if (this.isLiteralString()) {
      this.chompString();
    } else if (this.isTemplateStart()) {
      this.chompTemplateValueTilEnd();
    } else if (this.isRefStart()) {
      this.chompRefTilPunctuatorOrEnd();
    } else {
      this.next();
    }
  }

  chompString() {
    this.sanitizedStr += this.cur().value.slice(1, -1);
    this.next();
  }

  chompVarReference() {
    this.refs.push(this.cur().value);
    this.sanitizedStr += '%s';
    this.next();
  }

  chompRefTilPunctuatorOrEnd() {
    let refValue = '';
    while (this.cur() &&
        !(this.cur().type === "Punctuator" && this.cur().value === '+')) {
      refValue += this.cur().value;
      this.next();
    }
    this.startNewRef();
    this.addToCurRef(refValue);

  }

  chompTemplateValueTilEnd() {
    let templateValue = '';
    let inTemplateEval = false;

    while (!this.isTemplateEnd()) {
      for (let i = 0; i < this.cur().value.length; i++) {

        // If we're at the beginning of a Token and the first char is
        // one of these then this is either a closing tick of a template
        // or a closing of an interpolation segment.
        if (i === 0 &&
            (this.cur().value[i] === '}' || this.cur().value[i] === '`')) {
          inTemplateEval = false;
          continue;
        }

        // The start of an interpolation segment. It meanswe need to start
        // collecting a new ref.
        if (this.cur().value[i] === '$' && this.cur().value[i + 1] === '{') {
          inTemplateEval = true;
          this.startNewRef();
          break;
        }

        if (!inTemplateEval) {
          this.sanitizedStr += this.cur().value[i];
        } else {
          this.addToCurRef(this.cur().value[i]);
        }
      }
      this.next()
    }
  }


  isTemplateStart() {
    return this.cur().type === 'Template' && this.cur().value.startsWith('`');
  }

  isTemplateEnd() {
    return this.cur().type === 'Template' && this.cur().value.endsWith('`');
  }

  isLiteralString() {
    return this.cur().type === 'String';
  }

  isRefStart() {
    //const next = this.cur(1);
    return (this.cur().type === 'Identifier'||
            (this.cur().type === 'Keyword' && this.cur().value === 'this')) &&
      (this.cursor === 0 || (this.cur(-1).type === 'Punctuator' && this.cur(-1).value === '+'));
  }

  startNewRef() {
    this.sanitizedStr += '%s';
    this.refs.push('');
  }

  addToCurRef(ref) {
    this.refs[this.refs.length - 1] += ref;
  }
}

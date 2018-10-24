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

function collectMessage(node, acc) {
  if (node.type === 'Literal') {
    acc.push(node);
    return acc;
  }
  // Allow for string concatenation operations.
  if (node.type === 'BinaryExpression' && node.operator === '+') {
    return isMessageString(node.left) && isMessageString(node.right);
  }
  return acc;
}


module.exports = function(context) {
  return {
    [selector]: function(node) {
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
            const text = context.getSourceCode().text;
            const callExpr = text.slice(node.start, node.end);
            // matches the string inside the parens dev().someMethod(...);
            const argsMatcher = new RegExp(
              `${calleeObject.callee.name}\\(\\)\\.`+
              `${metadata.name}\\(((?:.|\n)*)\\)`);
            const logMethodCall = callExpr.match(argsMatcher);
            // ArgParser retrieves the raw string arguments into the
            // method call.
            const parser = new ArgsParser(logMethodCall[1]).parse();
            const arg = parser.args[metadata.startPos];
            if (/'|"|`/.test(arg)) {
              try {
              const [fixedArg, refs] = fixerHelper(arg);
              parser.args[metadata.startPos] = fixedArg;
              fixer.replaceText(node, `${calleeObject.callee.name}.${metadata.name}(${parser.toString()})`);
              } catch (e) {
                console.error('error', e.stack);
              }
            }
          }
        });
      }
    },
  };
};

function fixerHelper(arg) {
  // Capture all template strings inside the current argument.
  // The extra '' + and + '' for prefix and suffix makes it easier for us to
  // match reference concatenations without having to worry about boundaries.
  let noTemplateArg = '\'\' + ' + arg.replace(/`(.*?)`/g, function(full, outerGrp1, startPos) {
    // Escape all single quoutes inside template literal since we will transform
    // this into a normal string concat.
    outerGrp1 = outerGrp1.replace(/'/, '\\\'')
    return '\'' + outerGrp1.replace(/\$\{(.*?)\}/g, function(full, grp1, startPos) {
      const  suffix = startPos + full.length == grp1.length ? '' : ' + \'';
      return `\' + ${grp1}${suffix}`;
     }) + '\'';
  }) + '+ \'\'';
  const references = [];
  // Replace all reference concat ops with '%s' strings.
  // We try and match + symbol + patterns and replace them with %s and then
  // accumulate then in references to be added as variadic arguments when possible.
  const sanitizedStr = noTemplateArg.replace(/(\+)(?!(?:\s*'))(?:.)*?\1/g, function(full, grp1, startPos) {
    references.push(full.slice(1, full.length - 1).trim());
    return '+ \'%s\' +';
  });
  const evol = eval;
  return [evol(sanitizedStr), references];
}


function ArgsParser(expr) {
  this.expr = expr;
  this.curPos = 0;
  this.args = [];
  this.curArg = 0;
  this.isInStr = false;
}

ArgsParser.prototype.getCur = function() {
  return this.expr[this.curPos];
}

ArgsParser.prototype.parse = function() {
  while (this.curPos < this.expr.length) {
    this.chomp();
    this.curPos++;
  }
  this.args = this.args.map(x => x.replace(/\n/g, ''));
  return this;
};

ArgsParser.prototype.chomp = function() {
  if (!this.isInStr && this.getCur() === ',') {
    this.curArg++;
  } else if (!this.isInStr && this.getCur() === '\'') {
    this.isInStr = true;
  } else if (this.isInStr && this.getCur() === '\'') {
    this.isInStr = false;
  }

  if (!this.args[this.curArg]) {
    this.args[this.curArg] = '';
  }
  if (!this.isInStr && this.getCur() === ',') {
    return;
  }
  this.args[this.curArg] += this.getCur();
};

ArgsParser.prototype.toString = function() {
  return + this.args.map(x => `"${x}"`).join(',');
};

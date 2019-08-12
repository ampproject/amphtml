/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

module.exports = function({template, types: t}) {
  function uniqInString(str) {
    let uniq = '';
    while (str.includes(uniq)) {
      uniq = Math.random();
    }
    return uniq;
  }

  function stringifyValue(path) {
    const arg = path.get('arguments.0');
    const sourceText = arg.toString();
    const uniq = uniqInString(sourceText);

    const quasis = [];
    const expressions = [];
    try {
      const proxy = new Proxy(
        {},
        {
          has(target, prop) {
            return !(prop in global);
          },
          get(target, prop) {
            if (prop === Symbol.unscopables) {
              return;
            }
            if (prop === 'includeJsonLiteral') {
              return s => s;
            }
            expressions.push(t.identifier(prop));
            return uniq;
          },
        }
      );
      const obj = new Function('proxy', `with (proxy) return ${sourceText}`)(
        proxy
      );
      const json = JSON.stringify(obj);
      const escaped = String(uniq).replace('.', '\\.');
      const regex = new RegExp(`((?:(?!${escaped}).)*)(${escaped}|$)`, 'g');
      json.replace(regex, function(_, cooked, uniq) {
        if (cooked || uniq) {
          const raw = cooked.replace(/\${|\\/g, '\\$&');
          quasis.push(t.templateElement({cooked, raw}));
        }
        return '';
      });
    } catch (e) {
      const ref = arg || path;
      throw ref.buildCodeFrameError(
        'failed to parse JSON value. Is this a statically computable value?'
      );
    }

    return t.templateLiteral(quasis, expressions);
  }

  const handlers = Object.assign(Object.create(null), {
    jsonConfiguration(path) {
      path.replaceWith(template.expression.ast`
        JSON.parse(${stringifyValue(path)})
      `);
    },

    includeJsonLiteral(path) {
      path.replaceWith(path.node.arguments[0]);
    },

    jsonLiteral(path) {
      path.replaceWith(stringifyValue(path));
    },
  });

  return {
    name: 'transform-json-configuration',

    visitor: {
      CallExpression(path) {
        const handler = handlers[path.node.callee.name];
        if (handler) {
          handler(path);
        }
      },
    },
  };
};

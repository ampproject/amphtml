/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
 * @param {*} babel
 */
module.exports = function (babel) {
  const {types: t, template} = babel;

  function maybeTransformAssertEnumValue(path) {
    const callee = path.get('callee');
    const object = callee.get('object');
    const property = callee.get('property');
    if (
      !callee.isMemberExpression() ||
      !object.isCallExpression() ||
      !property.isIdentifier({name: 'assertEnumValue'})
    ) {
      return false;
    }
    const objectCallee = object.get('callee');
    const assertFnName = `${objectCallee.node.name}Assert`;
    const [enumId, subject, enumNameNode] = path.node.arguments;
    if (assertFnName === 'devAssert') {
      path.replaceWith(t.cloneNode(subject));
      return true;
    }
    const {specifiers} = path.scope.getBinding(objectCallee.node.name).path
      .parent;
    let specifier = specifiers.find(
      ({imported}) =>
        imported.type === 'Identifier' && imported.name === assertFnName
    );
    if (!specifier) {
      specifier = t.importSpecifier(
        t.identifier(assertFnName),
        t.identifier(assertFnName)
      );
      specifiers.push(specifier);
    }
    const enumName = enumNameNode?.value || enumNameNode?.name || 'enum';
    path.replaceWith(
      template.expression`
        (
          ${t.identifier(specifier.local.name)}(
            isEnumValue(${t.cloneNode(enumId)}, ${t.cloneNode(subject)}),
            ${t.stringLiteral(`Unknown ${enumName} value: "`)} +
              ${t.cloneNode(subject)} + '"'
          ),
          ${t.cloneNode(subject)}
        )
      `()
    );
    return true;
  }

  return {
    name: 'transform-inline-isenumvalue',
    visitor: {
      CallExpression(path) {
        // Replace x().assertEnumValue() calls with xAssert(isEnumValue(), ...).
        // The replacement is handled on a subsequent pass.
        if (maybeTransformAssertEnumValue(path)) {
          return;
        }

        // isEnumValue()
        const callee = path.get('callee');
        if (!callee.isIdentifier({name: 'isEnumValue'})) {
          return;
        }
        const enumArg = path.get('arguments.0');
        const {confident, value} = enumArg.evaluate();
        if (!confident) {
          // throw path.buildCodeFrameError('Cannot evaluate. Is it imported?');
          return;
        }
        const enumValueLengthDelta = Object.keys(value).reduce(
          (delta, key) =>
            delta + String(key).length - String(value[key]).length,
          0
        );
        if (enumValueLengthDelta < 0) {
          return;
        }
        const serializedEnumValues = JSON.stringify(Object.values(value));
        const subject = path.node.arguments[1];
        const expression = template.expression`
          ${serializedEnumValues}.indexOf(${t.cloneNode(subject)}) > -1
        `();
        path.replaceWith(expression);
      },
    },
  };
};

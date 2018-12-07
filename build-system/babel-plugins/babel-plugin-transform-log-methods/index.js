let ctr = 0;

function convertFromBase10ToBase16(str){
    const num = parseInt(str, 10);
    return num.toString(16);
}
/**
 * @type {!Array<LogMethodMetadataDef>}
 */
const transformableMethods = [
  {name: "assert", variadic: true, startPos: 1},
  {name: "assertString", variadic: false, startPos: 1},
  {name: "assertNumber", variadic: false, startPos: 1},
  {name: "assertBoolean", variadic: false, startPos: 1},
  {name: "assertEnumValue", variadic: false, startPos: 2},
  {name: "assertElement", variadic: false, startPos: 1},
  {name: "fine", variadic: true, startPos: 1 },
  {name: "info", variadic: true, startPos: 1 },
  {name: "warn", variadic: true, startPos: 1 },
  {name: 'createExpectedError', variadic: true, startPos: 0},
  {name: 'error', variadic: true, startPos: 1},
  {name: 'expectedError', variadic: true, startPos: 1},
  {name: 'createError', variadic: true, startPos: 0},
];

function isTransformableMethod(t, node, methods) {
  if (!node || !t.isIdentifier(node)) {
    return false;
  }
  return methods.some(names => {
    const name = names.name;
    return t.isIdentifier(node, { name: name });
  });
}

/**
 * @param {string} name
 * @return {!LogMethodMetadataDef}
 */
function getMetadata(name) {
  return transformableMethods.find(cur => cur.name === name);
}

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isBinaryConcat(node) {
  return node.type === "BinaryExpression" && node.operator === "+";
}

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isLiteralString(node) {
  return node.type === "StringLiteral";
}

/**
 * @param {!Node} node
 * @return {boolean}
 */
function isMessageString(node) {
  if (node.type === "Literal") {
    return isLiteralString(node);
  }
  // Allow for string concatenation operations.
  if (isBinaryConcat(node)) {
    return isMessageString(node.left) && isMessageString(node.right);
  }
  return false;
}

module.exports = function(babel) {
  const {types: t} = babel;
  return {
    visitor: {
      CallExpression(path, state) {
        const {node} = path;
        const {callee} = node;
        const {parenthesized} = node.extra || {};

        // Test to see if it looks like a method().call()
        const isMemberAndCallExpression =
          t.isMemberExpression(callee) && t.isCallExpression(callee.object);
        if (!isMemberAndCallExpression) {
          return;
        }

        // this is dev() or user() call expression
        const logCallee = callee.object.callee;
        const { property } = callee;
        const isTransformableDevCall =
          t.isIdentifier(logCallee, { name: "dev" }) &&
          isTransformableMethod(t, property, transformableMethods);
        const isTransformableUserCall =
          t.isIdentifier(logCallee, { name: "user" }) &&
          isTransformableMethod(t, property, transformableMethods);
        if (!(isTransformableDevCall || isTransformableUserCall)) {
          return;
        }

        const metadata = getMetadata(property.name);

        // This is the message argument that we want to extract and replace.
        const messageArg = path.node.arguments[metadata.startPos];

        // If there is actually no message argument then bail out on the whole
        // transformation.
        if (!messageArg) {
          return;
        }

        // Other arguments are template expressions in template literals.
        const otherArgs = [];

        // Construct a String Literal from the argument. This is because
        // There could be other Nodes like Template Literals, Binary Expressions,
        // Method calls etc.
        const message = buildMessage(messageArg, otherArgs);

        const newArgs = path.node.arguments.slice(0, metadata.startPos);
        const interpolateArgs = path.node.arguments.slice(metadata.startPos + 1);
        const newCall = t.memberExpression(
          t.callExpression(t.identifier(logCallee.name), []),
          t.identifier("getLogUrl")
        );
        console.log('ctr', ctr)
        const hex = convertFromBase10ToBase16(ctr++);
        console.log('hex', hex);
        const getLogUrlArgs = [t.stringLiteral(hex), t.arrayExpression([...interpolateArgs, ...otherArgs])];
        newArgs[metadata.startPos] = t.callExpression(newCall, getLogUrlArgs);

        path.node.arguments.length = 0;
        path.node.arguments.push.apply(path.node.arguments, newArgs);
      }
    }
  };
};

/**
 * @param {!Node} node
 * @param {!Array<!Node>} otherNodes
 */
function buildMessage(node, otherNodes) {
  if (isLiteralString(node)) {
    return node.value;
  }

  if (isBinaryConcat(node)) {
    return buildMessage(node.left, otherNodes) + buildMessage(node.right, otherNodes);
  }

  if (node.type === "TemplateLiteral") {
    let quasied = "";
    let i = 0;
    for (; i < node.quasis.length - 1; i++) {
      quasied += node.quasis[i].value.cooked;
      quasied += buildMessage(node.expressions[i], otherNodes);
    }
    quasied += node.quasis[i].value.cooked;
    return quasied;
  }

  otherNodes.push(node);
  return "%";
}

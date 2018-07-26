function isRemovableMethod(t, node, names) {
  if (!node || node.type !== 'Identifier') {
    return false;
  }
  return names.some(x => {
    return  t.isIdentifier(node, {name: x });
  })
}

const removableDevAsserts = [
  'assert',
  'fine',
  'assertElement',
  'assertString',
  'assertNumber',
  'assertBoolean',
];

const removableUserAsserts = ['fine'];


export default function (babel) {
  const { types: t } = babel;
  return {
    visitor: {
      CallExpression(path) {
        //console.log(path.node.callee)
        const isRemovableDevCall = t.isMemberExpression(path.node.callee) &&
              t.isCallExpression(path.node.callee.object) &&
              t.isIdentifier(path.node.callee.object.callee, {name: 'dev'}) &&
              isRemovableMethod(t, path.node.callee.property,
                  removableDevAsserts);

        const isRemovableUserCall = t.isMemberExpression(path.node.callee) &&
              t.isCallExpression(path.node.callee.object) &&
              t.isIdentifier(path.node.callee.object.callee, {name: 'user'}) &&
              isRemovableMethod(t, path.node.callee.property,
                  removableUserAsserts);

        if (!(isRemovableDevCall || isRemovableUserCall)) {
          return;
        }

        // We assume the return is always the resolved expression value.
        // This might not be the case like in assertEnum which we currently
        // don't remove.
        const args = path.node.arguments[0];
        if (args) {
          path.replaceWith(args);
        } else {
          // This is to resolve right hand side usage of expression where
          // no argument is passed in.
          path.replaceWith(t.identifier('undefined'));
        }
      }
    }
  }
}

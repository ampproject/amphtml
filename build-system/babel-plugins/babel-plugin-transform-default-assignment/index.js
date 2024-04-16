/**
 * Injects alias identifiers for values with default assignments.
 * Closure can't correctly type-narrow the defaulted value to exclude `undefined`,
 * but it can figure out the aliased value correctly.
 *
 * @example
 * In:
 * ```
 * function foo(foo = 1, { bar = 2 }) {
 *   foo;
 *   bar;
 * }
 * ```
 *
 * Out:
 * ```
 * function foo(foo = 1, { bar = 2 }) {
 *   let _foo = foo;
 *   let _bar = bar;
 *   _foo;
 *   _bar;
 * }
 * ```
 */

module.exports = function ({types: t}) {
  return {
    visitor: {
      AssignmentPattern(path) {
        const left = path.get('left');
        if (!left.isIdentifier()) {
          throw left.buildCodeFrameError(
            [
              'Can only fix default assignment type of identifiers.',
              'Please replace with a parameter, and destructure in the function body.',
            ].join('\n\t')
          );
        }

        const root = path.find(
          ({parentPath}) => parentPath.isStatement() || parentPath.isFunction()
        );
        if (!root.parentPath.isFunction()) {
          // only transform param destructures
          return;
        }

        const {scope} = path;
        const {name} = left.node;
        const newName = scope.generateUid(name);

        const {referencePaths} = scope.getBinding(name);
        const ancestry = path.getAncestry().slice().reverse();
        for (const ref of referencePaths) {
          const refAncestry = ref.getAncestry().slice().reverse();

          const min = Math.min(ancestry.length, refAncestry.length);
          for (let i = 0; i < min; i++) {
            const a = ancestry[i];
            const r = refAncestry[i];
            if (a.container !== r.container) {
              break;
            }
            if (a === root) {
              throw ref.buildCodeFrameError(
                'default assignment of default assignment'
              );
            }
          }
        }

        scope.rename(name, newName);
        scope.removeBinding(newName);
        left.node.name = name;

        scope.push({
          id: t.identifier(newName),
          init: t.identifier(name),
          kind: 'let',
        });
      },
    },
  };
};

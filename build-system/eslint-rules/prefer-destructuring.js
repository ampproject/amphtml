'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },

  /**
   * @param {EslintContext} context
   * @return {{
   *   VariableDeclarator: {Function(node: CompilerNode): void},
   *   'BlockStatement, Program': {Function (node: CompilerNode): void},
   * }}
   */
  create(context) {
    /**
     * @param {CompilerNode} node
     * @param {boolean=} renamable
     * @return {boolean}
     */
    function shouldBeDestructure(node, renamable = false) {
      const {id, init} = node;

      if (
        !init ||
        id.type !== 'Identifier' ||
        init.type !== 'MemberExpression'
      ) {
        return false;
      }

      const {name} = id;
      const {computed, object, property} = init;
      if (
        computed ||
        object.type === 'Super' ||
        context.getCommentsBefore(property).length > 0 ||
        property.type !== 'Identifier'
      ) {
        return false;
      }

      return renamable || property.name === name;
    }

    /**
     * @param {CompilerNode} node
     * @return {boolean}
     */
    function shouldBeIdempotent(node) {
      while (node.type === 'MemberExpression') {
        node = node.object;
      }

      return node.type === 'Identifier' || node.type === 'ThisExpression';
    }

    /**
     *
     * @param {Map<K, V>} map
     * @param {K} key
     * @param {CompilerNode} node
     * @param {*} declaration
     * @return {string[]}
     */
    function setStruct(map, key, node, declaration) {
      if (map.has(key)) {
        const struct = map.get(key);
        struct.nodes.add(node);
        struct.declarations.add(declaration);
        return map.get(key).names;
      } else {
        const struct = {
          names: new Set(),
          nodes: new Set(),
          declarations: new Set(),
          node,
        };
        map.set(key, struct);
        return struct.names;
      }
    }

    /**
     * @param {Map[]} maps
     */
    function processMaps(maps) {
      for (let i = 0; i < maps.length; i++) {
        const map = maps[i];
        map.forEach(processVariables);
        map.clear();
      }
    }

    /**
     * @param {*} struct
     * @param {*} base
     */
    function processVariables(struct, base) {
      const {declarations, names, node, nodes} = struct;

      if (nodes.size === 0) {
        return;
      }

      context.report({
        node,
        message: 'Combine repeated declarators into a destructure',
        fix(fixer) {
          const fixes = [];
          const ids = [];

          names.forEach((name) => ids.push(name));
          const replacement = `{${ids.join(', ')}} = ${base}`;
          fixes.push(fixer.replaceText(node, replacement));

          declarations.forEach((declaration) => {
            const {declarations} = declaration;
            const all = declarations.every((decl) => nodes.has(decl));
            if (!all) {
              return;
            }

            fixes.push(fixer.remove(declaration));
            declarations.forEach((decl) => nodes.delete(decl));
          });

          nodes.forEach((node) => {
            fixes.push(fixer.remove(node));
          });
          return fixes;
        },
      });
    }

    return {
      /**
       * @param {CompilerNode} node
       */
      VariableDeclarator(node) {
        if (!shouldBeDestructure(node)) {
          return;
        }

        const {init} = node;
        if (context.getCommentsInside(node).length > 0) {
          return;
        }

        context.report({
          node,
          message: 'Use object destructuring',
          fix(fixer) {
            const sourceCode = context.getSourceCode();
            const {object, property} = init;
            const {name} = property;
            const base = sourceCode.getText(object);
            return fixer.replaceText(node, `{${name}} = ${base}`);
          },
        });
      },

      /**
       * @param {CompilerNode} node
       */
      'BlockStatement, Program': function (node) {
        const {body} = node;
        const sourceCode = context.getSourceCode();
        const letMap = new Map();
        const constMap = new Map();

        for (let i = 0; i < body.length; i++) {
          const node = body[i];
          if (node.type !== 'VariableDeclaration') {
            processMaps([letMap, constMap]);
            continue;
          }

          const {declarations, kind} = node;
          const variables = kind === 'let' ? letMap : constMap;

          for (let j = 0; j < declarations.length; j++) {
            const decl = declarations[j];
            const {id, init} = decl;

            if (!init || context.getCommentsInside(decl).length > 0) {
              continue;
            }

            if (!shouldBeIdempotent(init)) {
              continue;
            }

            if (id.type === 'Identifier') {
              // Allow renaming here
              if (!shouldBeDestructure(decl, true)) {
                continue;
              }

              const base = sourceCode.getText(init.object);
              const names = setStruct(variables, base, decl, node);

              // Do we need to rename?
              if (shouldBeDestructure(decl)) {
                names.add(id.name);
              } else {
                names.add(`${init.property.name}: ${id.name}`);
              }

              continue;
            }

            if (id.type === 'ObjectPattern') {
              const base = sourceCode.getText(init);
              const names = setStruct(variables, base, decl, node);
              const {properties} = id;
              for (let k = 0; k < properties.length; k++) {
                const prop = properties[k];
                names.add(sourceCode.getText(prop));
                if (!prop.key) {
                  // rest element
                  processMaps([letMap, constMap]);
                  break;
                }
              }
            }
          }
        }

        processMaps([letMap, constMap]);
      },
    };
  },
};

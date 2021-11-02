'use strict';
const fs = require('fs');
const {dirname, join, relative} = require('path');
const enums = JSON.parse(fs.readFileSync('./enums.json', 'utf8'));
const aliases = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'))
  .compilerOptions.paths;
const snakeCase = require('lodash.snakecase');

/* eslint-disable */

/**
 * Enforces naming rules for enums.
 *
 * @return {!Object}
 */
module.exports = function (context) {
  /**
   * @param {!Node} node
   * @return {boolean}
   */
  function hasEnumAnnotation(node) {
    const commentLines = context.getCommentsBefore(node);
    if (!commentLines) {
      return false;
    }

    return commentLines.some(function (comment) {
      return comment.type == 'Block' && /@enum/.test(comment.value);
    });
  }

  /**
   * @param {!Node} node
   */
  function check(node) {
    if (node.declarations.length > 1) {
      context.report({
        node,
        message: 'Too many variables defined in declaration',
      });
      return;
    }

    const decl = node.declarations[0];
    if (!checkInit(decl.init, decl)) {
      return;
    }
    checkId(decl.id);
  }

  function getFilename(filename) {
    const rel = relative(process.cwd(), filename);
    return rel.startsWith('.') ? rel : `./${rel}`;
  }

  /**
   * @param {string} name
   * @return {string}
   */
  function screamingSnakeCase(name) {
    return snakeCase(name).toUpperCase();
  }

  /**
   * @param {!Node|undefined} node
   */
  function checkId(node) {
    if (node.type !== 'Identifier') {
      context.report({
        node,
        message: 'Must be assigned to simple identifier',
      });
      return;
    }

    if (!/^[A-Z0-9_]+_ENUM$/.test(node.name)) {
      const filename = getFilename(context.getFilename());
      const importPath = filename.startsWith('.') ? filename : `./${filename}`;
      const e = (enums[importPath] ||= {});

      let newName = screamingSnakeCase(node.name);
      if (!newName.endsWith('_ENUM')) {
        newName += '_ENUM';
      }
      e[node.name] = newName;

      context.report({
        node,
        message: 'Must use all caps with trailing "_ENUM"',

        fix(fixer) {
          const variable = context.getScope().set.get(node.name);
          return variable.references.map((ref) => {
            return fixer.replaceText(ref.identifier, newName);
          });
        },
      });
      return;
    }
  }

  /**
   * @param {!Node|undefined} node
   * @param {!Node} reportNode
   * @param {boolean}
   */
  function checkInit(node, reportNode) {
    if (node?.type !== 'ObjectExpression') {
      context.report({
        node: node || reportNode,
        message: 'Not initialized to a static object expression',
      });
      return false;
    }

    return true;
  }

  function getRenames(source) {
    if (source.startsWith('.')) {
      source = getFilename(
        join(dirname(context.getFilename()), source)
      );
    } else if (source.startsWith('#')) {
      const bare = source.indexOf('/') === -1;
      if (bare) {
        source = aliases[source];
      } else {
        const wild = source.slice(0, source.indexOf('/') + 1) + '*';
        source =
          aliases[wild][0].slice(0, -1) + source.slice(source.indexOf('/') + 1);
      }
    }

    return (
      enums[source] ||
      enums[`${source}/index`] ||
      enums[`${source}.js`] ||
      enums[`${source}/index.js`]
    );
  }
  const imported = [];

  return {
    'Program:exit': function (node) {
      fs.writeFileSync('enums.json', JSON.stringify(enums, null, 2));
      const sourceCode = context.getSourceCode();
      const renames = getRenames(getFilename(context.getFilename()));
      for (const old in renames) {
        imported.push({
          local: old,
          imported: renames[old],
        });
      }

      const text = sourceCode
        .getText()
        .replace(/(.*?)(\/\/.*)|(.*?)(\/\*[^]*?\*\/)|(.+)/g, function(all, line, lineComment, block, blockComment, text) {
          if (lineComment) return ' '.repeat(line.length) + lineComment;
          if (blockComment) return ' '.repeat(block.length) + blockComment;
          return " ".repeat(text.length);
        });
      for (const imp of imported) {
        const regex = new RegExp(`\\b${imp.local}\\b`, 'g');
        for (const match of text.matchAll(regex)) {
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(match.index),
              end: sourceCode.getLocFromIndex(match.index + imp.local.length),
            },
            message: `latent enum ${imp.local} should be ${imp.imported}`,

            fix(fixer) {
              return fixer.replaceTextRange([match.index, match.index + imp.local.length], imp.imported)
            }
          });
        }
      }
      imported.length = 0;
    },

    VariableDeclaration(node) {
      if (!hasEnumAnnotation(node)) {
        return;
      }

      check(node);
    },

    ExportNamedDeclaration(node) {
      if (!hasEnumAnnotation(node)) {
        return;
      }
      if (!node.declaration) {
        return context.report({
          node,
          message: 'Exported enum does not define enum',
        });
      }

      check(node.declaration);
    },

    ImportDeclaration(node) {
      const renames = getRenames(node.source.value);
      if (!renames) return;

      for (const imp of node.specifiers) {
        if (imp.type !== 'ImportSpecifier') {
          continue;
        }
        const rename = renames[imp.imported.name];
        if (!rename) {
          if (imp.imported.name.endsWith('_ENUM')) {
            const inverted = Object.fromEntries(Object.entries(renames).map(e => e.reverse()));
            const old = inverted[imp.imported.name];
            imported.push({
              local: inverted[imp.imported.name],
              imported: imp.imported.name,
            });
          }
          continue;
        }
        imported.push({
          local: imp.local.name,
          imported: rename,
        });

        context.report({
          node: imp,
          message: 'rename',

          fix(fixer) {
            let fixes = [fixer.replaceText(imp, rename)];
            const variable = context.getScope().set.get(imp.local.name);
            for (const ref of variable.references) {
              fixes.push(fixer.replaceText(ref.identifier, rename));
            }
            return fixes;
          },
        });
      }
    },
  };
};

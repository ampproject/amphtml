// @ts-nocheck

/**
 * Takes a .jss.js file and transforms the `useStyles` export to remove side effects
 * and directly return the classes map. Also includes special key 'CSS' in the classes
 * object with the entire CSS string.
 *
 * @example
 * In:
 * ```
 * import {createUseStyles} from 'react-jss'
 *
 * const jss = { button: { fontSize: 12 }}
 * export const useStyles = createUseStyles(jss);
 *
 * import {useStyles} from './imported.jss';
 * useStyles().button;
 * ```
 *
 * Out:
 * ```
 * const jss = { button: { fontSize: 12 }}
 * const _classes = {button: 'button-1'}
 * export const useStyles = () => _classes;
 * export const CSS = '.button-1 { font-size: 12px }'
 * export const $button = 'button-1';
 *
 * import {useStyles} from './imported.jss';
 * import {$button as _$button} from './imported.jss';
 * _$button
 * ```
 */

const hash = require('./create-hash');
const {addNamed} = require('@babel/helper-module-imports');
const {create} = require('jss');
const {default: preset} = require('jss-preset-default');
const {join, relative} = require('path');
const {transformCssSync} = require('../../tasks/css/jsify-css-sync');

module.exports = function ({template, types: t}) {
  /**
   * @param {string} filename
   * @return {boolean}
   */
  function isJssFile(filename) {
    return filename.endsWith('.jss.js');
  }

  /**
   * @param {string} name
   * @return {string}
   */
  function classnameId(name) {
    return `\$${name}`;
  }

  /**
   * @param {Path} reference
   * @param {string} importedName
   * @return {?Path}
   */
  function findImportDeclaration(reference, importedName) {
    if (!reference.isIdentifier()) {
      return null;
    }

    const binding = reference.scope.getBinding(reference.node.name);
    if (!binding || binding.kind !== 'module') {
      return null;
    }

    const {path} = binding;
    const {parentPath} = path;

    if (
      !parentPath.isImportDeclaration() ||
      !path.isImportSpecifier() ||
      !t.isIdentifier(path.node.imported, {name: importedName})
    ) {
      return null;
    }

    return parentPath;
  }

  /**
   * Replacess MemberExpressions.
   * @example
   * In:
   * ```
   *   import {useStyles} from 'foo';
   *   const a = useStyles();
   *   a.b;
   *   useStyles().c;
   * ```
   * Out:
   * ```
   *   import {useStyles} from 'foo';
   *   import {$b as _$b} from 'foo';
   *   import {$c as _$c} from 'foo';
   *   $_b;
   *   $_c;
   * ```
   * @param {Path} importDeclaration
   * @param {Path} memberExpression
   * @return {boolean}
   */
  function replaceMemberExpression(importDeclaration, memberExpression) {
    if (!memberExpression.isMemberExpression({computed: false})) {
      return false;
    }
    const {property} = memberExpression.node;
    if (!t.isIdentifier(property)) {
      return false;
    }

    const localId = getImportIdentifier(importDeclaration, property.name);
    memberExpression.replaceWith(t.cloneNode(localId));

    return true;
  }

  /**
   * Replaces VariableDeclarations that use ObjectPatterns (destructuring).
   * @example
   * In:
   * ```
   *   import {useStyles} from 'foo';
   *   const {a, ...rest} = useStyles();
   * ```
   * Out:
   * ```
   *   import {useStyles} from 'foo';
   *   import {$a as _$a} from 'foo';
   *   const {a: _unused, ...rest} = useStyles();
   *   const a = $_a;
   * ```
   * @param {Path} importDeclaration
   * @param {Path} variableDeclarator
   * @return {boolean}
   */
  function replaceObjectPattern(importDeclaration, variableDeclarator) {
    if (
      !variableDeclarator.isVariableDeclarator() ||
      !t.isObjectPattern(variableDeclarator.node.id)
    ) {
      return false;
    }
    const {properties} = variableDeclarator.node.id;
    const replacedPropertyCount = properties.reduce((count, property) => {
      const {computed, key, value} = property;
      if (computed || !t.isIdentifier(value) || !t.isIdentifier(key)) {
        return count;
      }
      const importId = getImportIdentifier(importDeclaration, key.name);
      const declaration = variableDeclarator.parentPath;
      declaration.insertAfter(
        template.statement.ast(
          `${declaration.node.kind} ${value.name} = ${importId.name}`
        )
      );
      // Unused props are required to allow ...rest:
      // const {a: _unused, ...rest} = useStyles();
      // const a = _$a;
      property.value = variableDeclarator.scope.generateUidIdentifier('unused');
      return count + 1;
    }, 0);
    if (properties.length === replacedPropertyCount) {
      variableDeclarator.remove();
    }
    return true;
  }

  /**
   * Replaces VariableDeclarators by following their references.
   * @example
   * In:
   * ```
   *   import {useStyles} from 'foo';
   *   const a = useStyles();
   *   a.b;
   * ```
   * Out:
   * ```
   *   import {useStyles} from 'foo';
   *   import {$b as _$b} from 'foo';
   *   $_b;
   * ```
   * @param {Path} importDeclaration
   * @param {Path} variableDeclarator
   * @return {boolean}
   */
  function replaceVariableDeclaratorRefs(
    importDeclaration,
    variableDeclarator
  ) {
    if (
      !variableDeclarator.isVariableDeclarator() ||
      !t.isIdentifier(variableDeclarator.node.id)
    ) {
      return false;
    }
    const {referencePaths} =
      variableDeclarator.scope.bindings[variableDeclarator.node.id.name];
    const replacedReferenceCount = referencePaths.reduce(
      (count, identifier) =>
        replaceExpression(importDeclaration, identifier) ? count + 1 : count,
      0
    );
    if (referencePaths.length === replacedReferenceCount) {
      variableDeclarator.remove();
    }
    return true;
  }

  /**
   * @param {Path} importDeclaration
   * @param {Path} callExpressionOrIdentifier
   * @return {boolean}
   */
  function replaceExpression(importDeclaration, callExpressionOrIdentifier) {
    const {parentPath} = callExpressionOrIdentifier;
    return (
      replaceMemberExpression(importDeclaration, parentPath) ||
      replaceObjectPattern(importDeclaration, parentPath) ||
      replaceVariableDeclaratorRefs(importDeclaration, parentPath)
    );
  }

  /**
   * @param {Path} importDeclaration
   * @param {string} name
   * @return {string}
   */
  function getImportIdentifier(importDeclaration, name) {
    return addNamed(
      importDeclaration,
      classnameId(name),
      importDeclaration.node.source.value
    );
  }

  const seen = new Map();
  /**
   * @param {string} JSS
   * @param {string} filename
   * @return {{
   *   visitor: {
   *     Program: {Function(path: string, state: *): void},
   *     CallExpression: {Function(path: string, state: *): void},
   *     ImportDeclaration: {Function(path: string, state: *): void},
   *   }
   * }}
   */
  function compileJss(JSS, filename) {
    const relativeFilepath = relative(join(__dirname, '../../..'), filename);
    const filehash = hash.createHash(relativeFilepath);
    const jss = create({
      ...preset(),
      createGenerateId: () => {
        return (rule) => {
          const dashCaseKey = rule.key.replace(
            /([A-Z])/g,
            (c) => `-${c.toLowerCase()}`
          );
          const className = `${dashCaseKey}-${filehash}`;
          if (seen.has(className)) {
            throw new Error(
              `Classnames must be unique across all files. Found a duplicate: ${className}`
            );
          }
          seen.set(className, filename);
          return className;
        };
      },
    });
    return jss.createStyleSheet(JSS);
  }

  return {
    visitor: {
      Program(_path, state) {
        const {filename} = state.file.opts;
        seen.forEach((file, key) => {
          if (file === filename) {
            seen.delete(key);
          }
        });
      },

      CallExpression(path, state) {
        const callee = path.get('callee');

        // Replace users that import JSS.
        const importDeclaration = findImportDeclaration(callee, 'useStyles');
        if (importDeclaration) {
          replaceExpression(importDeclaration, path);
          return;
        }

        // Replace JSS exporter
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        if (!callee.isIdentifier({name: 'createUseStyles'})) {
          return;
        }

        const {confident, value: JSS} = path.get('arguments.0').evaluate();
        if (!confident) {
          throw path.buildCodeFrameError(
            `First argument to createUseStyles must be statically evaluatable.`
          );
        }
        const sheet = compileJss(JSS, filename);
        if ('CSS' in sheet.classes) {
          throw path.buildCodeFrameError(
            'Cannot have class named CSS in your JSS object.'
          );
        }

        // This codepath is used when generating CSS files for npm distribution, separate from
        // AMP-mode compilation.
        if (this.opts.css) {
          this.opts.css = transformCssSync(sheet.toString()).css;
          return;
        }

        // Create the classes var.
        // This is required for compatibility when a useStyles() result is
        // passed around.
        const id = path.scope.generateUidIdentifier('classes');
        const init = t.valueToNode(sheet.classes);
        path.scope.push({id, init});
        path.scope.bindings[id.name].path.parentPath.addComment(
          'leading',
          '* @enum {string}'
        );

        // Replace useStyles with a getter for the new `classes` var.
        path.replaceWith(template.expression.ast`(() => ${t.cloneNode(id)})`);

        // Export each classname.
        const exportDeclaration = path.findParent(
          (p) => p.type === 'ExportNamedDeclaration'
        );
        for (const key in sheet.classes) {
          const id = t.identifier(classnameId(key));
          const init = t.valueToNode(sheet.classes[key]);
          exportDeclaration.insertBefore(
            template.statement.ast`export const ${id} = ${init}`
          );
        }

        // Export a variable named CSS with the compiled CSS.
        const {css} = transformCssSync(sheet.toString());
        const cssStr = t.stringLiteral(css);
        const cssExport = template.ast`export const CSS = ${cssStr}`;
        exportDeclaration.insertAfter(cssExport);
      },

      // Remove the import for react-jss
      ImportDeclaration(path, state) {
        const {filename} = state.file.opts;
        if (!isJssFile(filename)) {
          return;
        }

        if (path.node.source.value === 'react-jss') {
          path.remove();
        }
      },
    },
  };
};

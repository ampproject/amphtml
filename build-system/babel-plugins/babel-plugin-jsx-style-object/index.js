/**
 * @fileoverview
 * Converts Object Expression syntax in `style={{foo: 'bar'}}` to a concatenated
 * string expression.
 *
 * This only transforms a file if it imports the `baseModule` for JSX below,
 * which lacks runtime support for converting the Object into a string.
 * This transform takes that responsibility instead.
 */

const {addNamed} = require('@babel/helper-module-imports');

const baseModule = 'core/dom/jsx';
const helperModule = '#core/dom/jsx/style-property-string';
const helperFnName = 'jsxStylePropertyString';

// All values from here, converted to dash-case:
// https://github.com/facebook/react/blob/a7c5726/packages/react-dom/src/shared/CSSProperty.js
const nonDimensional = new Set([
  'animation-iteration-count',
  'aspect-ratio',
  'border-image-outset',
  'border-image-slice',
  'border-image-width',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'flex',
  'flex-grow',
  'flex-positive',
  'flex-shrink',
  'flex-negative',
  'flex-order',
  'grid-area',
  'grid-row',
  'grid-row-end',
  'grid-row-span',
  'grid-row-start',
  'grid-column',
  'grid-column-end',
  'grid-column-span',
  'grid-column-start',
  'font-weight',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'tab-size',
  'widows',
  'z-index',
  'zoom',

  // SVG-related properties
  'fill-opacity',
  'flood-opacity',
  'stop-opacity',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
]);

module.exports = function (babel) {
  const {types: t} = babel;

  const dashCase = (camelCase) =>
    camelCase.replace(/[A-Z]/g, '-$&').toLowerCase();

  let hasBaseModule = false;

  /**
   * @param {babel.NodePath<babel.types.ObjectProperty>} path
   * @return {?babel.Node}
   */
  function transformProp(path) {
    // @ts-ignore
    const name = path.node.key.name || path.node.key.value;
    const cssName = dashCase(name);
    const isDimensional = !nonDimensional.has(cssName);
    const value = path.get('value');
    const evaluated = value.evaluate();

    // If we can evaluate the value, return a composed string.
    if (evaluated.confident) {
      const {value} = evaluated;
      if (value == null || value === '') {
        return null;
      }
      const withUnit =
        isDimensional && typeof value === 'number' ? `${value}px` : value;
      return t.stringLiteral(`${cssName}:${withUnit};`);
    }

    // Otherwise call the helper function to evaluate nullish and dimensional values.
    const helperFn = addNamed(path, helperFnName, helperModule);
    const args = [t.stringLiteral(cssName), value.node];
    if (isDimensional) {
      args.push(t.booleanLiteral(true));
    }
    return t.callExpression(helperFn, args);
  }

  /**
   * @param {(babel.Node|null)[]} props
   * @return {?babel.Node}
   */
  function mergeBinaryConcat(props) {
    let expr = null;
    while (props.length) {
      const part = props.shift();
      if (part) {
        if (!expr) {
          expr = part;
        } else {
          expr = t.binaryExpression('+', expr, part);
        }
      }
    }
    return expr;
  }

  /** @param {babel.NodePath} path */
  function replaceExpression(path) {
    if (path.isLogicalExpression()) {
      if (
        path.node.operator === '&&' ||
        path.node.operator === '||' ||
        path.node.operator === '??'
      ) {
        replaceExpression(path.get('right'));
      }
      return;
    }
    if (path.isConditionalExpression()) {
      replaceExpression(path.get('consequent'));
      replaceExpression(path.get('alternate'));
      return;
    }
    if (!path.isObjectExpression()) {
      return;
    }
    path = /** @type {babel.NodePath<babel.types.ObjectExpression>} */ (path);
    // @ts-ignore - expects NodePath|NodePath[] but it's always NodePath[]
    const props = path.get('properties').map((prop) => {
      if (prop.isSpreadElement()) {
        throw prop.buildCodeFrameError(
          'You should not use spread properties in style object expressions.'
        );
      }
      if (prop.node.computed) {
        throw prop
          .get('key')
          .buildCodeFrameError(
            'You should not use computed props in style object expressions. Instead, use multiple properties directly. They can be "null" when unwanted.'
          );
      }
      return transformProp(prop);
    });
    const merged = mergeBinaryConcat(props);
    path.replaceWith(merged || t.stringLiteral(''));
  }

  return {
    name: 'jsx-style-object',
    visitor: {
      Program: {
        enter(path) {
          hasBaseModule = false;
          path.traverse({
            ImportDeclaration(path) {
              if (path.node.source.value.endsWith(baseModule)) {
                hasBaseModule = true;
                path.stop();
              }
            },
          });
        },
      },
      JSXAttribute(path) {
        if (!hasBaseModule) {
          return;
        }
        if (!t.isJSXIdentifier(path.node.name, {name: 'style'})) {
          return;
        }
        const expression = path.get('value.expression');
        replaceExpression(expression);
      },
    },
  };
};

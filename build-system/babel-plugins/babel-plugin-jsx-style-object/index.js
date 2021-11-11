/**
 * @fileoverview
 * Converts Object Expression syntax in `style={{foo: 'bar'}}` to a concatenated
 * string expression.
 *
 * This only transforms a file if it imports the `baseModule` for JSX below,
 * which lacks runtime support for converting the Object into a string.
 * This transform takes that responsibility instead.
 */

const baseModule = 'core/dom/jsx';
const helperModule = 'core/dom/jsx-style-property-string';
const helperFn = 'jsxStylePropertyString';

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
  let hasHelperModule = false;
  let programPath = null;

  /**
   * @param {babel.NodePath<import('@babel/types').ObjectProperty>} path
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
    if (!hasHelperModule && programPath) {
      hasHelperModule = true;
      programPath.unshiftContainer(
        'body',
        t.importDeclaration(
          [t.importSpecifier(t.identifier(helperFn), t.identifier(helperFn))],
          t.stringLiteral(helperModule)
        )
      );
    }
    const args = [t.stringLiteral(cssName), value.node];
    if (isDimensional) {
      args.push(t.booleanLiteral(true));
    }
    return t.callExpression(t.identifier(helperFn), args);
  }

  /**
   * @param {(babel.Node|null)[]} props
   * @return {?babel.Node}
   */
  function mergeTransformedIntoExpr(props) {
    let expr = null;
    let prev = null;
    while (props.length) {
      const part = props.shift();
      if (!part) {
        continue;
      }
      // Collapse adjacent strings.
      if (t.isStringLiteral(prev) && t.isStringLiteral(part)) {
        // @ts-ignore
        prev.value += part.value;
      } else {
        if (!expr) {
          expr = part;
        } else {
          expr = t.binaryExpression('+', expr, part);
        }
        prev = part;
      }
    }
    return expr;
  }

  return {
    name: 'jsx-style-object',
    visitor: {
      Program: {
        enter(path) {
          programPath = path;
          hasBaseModule = false;
          hasHelperModule = false;
          path.traverse({
            ImportDeclaration(path) {
              if (path.node.source.value.endsWith(helperModule)) {
                hasHelperModule = true;
              } else if (path.node.source.value.endsWith(baseModule)) {
                hasBaseModule = true;
              }
              if (hasHelperModule && hasBaseModule) {
                path.stop();
              } else {
                path.skip();
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
        const objectExpression = path.get('value.expression');
        if (!objectExpression.isObjectExpression()) {
          return;
        }
        const props = objectExpression.node.properties.map((_, i) => {
          const prop = objectExpression.get(`properties.${i}`);
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
        const merged = mergeTransformedIntoExpr(props);
        if (merged) {
          objectExpression.replaceWith(merged);
        }
      },
    },
  };
};

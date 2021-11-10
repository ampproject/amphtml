'use strict';

// Enforces preferred property accesses in Preact
// and preferred DOM attributes inside JSX.
//
// Good
// function foo({'class': className}) {}
// const {'class': className} = props;
//
// <div tabIndex="0" />
// <path stroke-linecap />
//
// Bad
// function foo({'className': className}) {}
// function foo({className}) {}
// const {'className': className'} = props;
// const {className} = props;
//
// <div tabindex="0" />
// <path strokeLinecap />

const propNameFn = 'propName';
const propNameFnModule = '#preact/utils';

const DOM_ATTRIBUTES = {
  className: 'class',
  // TODO(wg-bento): Revert tabIndex with tabindex
  tabindex: 'tabIndex',
};

/**
 * This list derives all hyphenated attributes from
 * https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute
 */
const SVG_ATTRIBUTES = {
  accentHeight: 'accent-height',
  alignmentBaseline: 'alignment-baseline',
  arabicForm: 'arabic-form',
  baselineShift: 'baseline-shift',
  capHeight: 'cap-height',
  clipPath: 'clip-path',
  clipRule: 'clip-rule',
  colorInterpolation: 'color-interpolation',
  colorInterpolationFilters: 'color-interpolation-filters',
  colorProfile: 'color-profile',
  colorRendering: 'color-rendering',
  dominantBaseline: 'dominant-baseline',
  enableBackground: 'enable-background',
  fillOpacity: 'fill-opacity',
  fillRule: 'fill-rule',
  floodColor: 'flood-color',
  floodOpacity: 'flood-opacity',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontSizeAdjust: 'font-size-adjust',
  fontStretch: 'font-stretch',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  glyphName: 'glyph-name',
  glyphOrientationHorizontal: 'glyph-orientation-horizontal',
  glyphOrientationVertical: 'glyph-orientation-vertical',
  horizAdvX: 'horiz-adv-x',
  horizOriginX: 'horiz-origin-x',
  imageRendering: 'image-rendering',
  letterSpacing: 'letter-spacing',
  lightingColor: 'lighting-color',
  markerEnd: 'marker-end',
  markerMid: 'marker-mid',
  markerStart: 'marker-start',
  overlinePosition: 'overline-position',
  overlineThickness: 'overline-thickness',
  paintOrder: 'paint-order',
  panose1: 'panose-1',
  pointerEvents: 'pointer-events',
  renderingIntent: 'rendering-intent',
  shapeRendering: 'shape-rendering',
  stopColor: 'stop-color',
  stopOpacity: 'stop-opacity',
  strikethroughPosition: 'strikethrough-position',
  strikethroughThickness: 'strikethrough-thickness',
  strokeDasharray: 'stroke-dasharray',
  strokeDashoffset: 'stroke-dashoffset',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  strokeMiterlimit: 'stroke-miterlimit',
  strokeOpacity: 'stroke-opacity',
  strokeWidth: 'stroke-width',
  textAnchor: 'text-anchor',
  textDecoration: 'text-decoration',
  textRendering: 'text-rendering',
  transformOrigin: 'transform-origin',
  underlinePosition: 'underline-position',
  underlineThickness: 'underline-thickness',
  unicodeBidi: 'unicode-bidi',
  unicodeRange: 'unicode-range',
  unitsPerEm: 'units-per-em',
  vAlphabetic: 'v-alphabetic',
  vHanging: 'v-hanging',
  vIdeographic: 'v-ideographic',
  vMathematical: 'v-mathematical',
  vectorEffect: 'vector-effect',
  vertAdvY: 'vert-adv-y',
  vertOriginX: 'vert-origin-x',
  vertOriginY: 'vert-origin-y',
  wordSpacing: 'word-spacing',
  writingMode: 'writing-mode',
  xHeight: 'x-height',
};

module.exports = {
  meta: {
    fixable: 'code',
  },
  create(context) {
    const attributes = {...DOM_ATTRIBUTES, ...SVG_ATTRIBUTES};
    const preactNames = new Set(Object.values(attributes));

    let lastImportDecl = null;
    let addedImportDecl = false;
    let program = null;

    const importDecl = `import {${propNameFn}} from '${propNameFnModule}';\n`;

    /** @param {*} node */
    function checkProps(node) {
      if (!node.properties) {
        return;
      }
      node.properties.forEach((prop) => {
        if (!prop.key) {
          return;
        }
        if (prop.computed) {
          return;
        }
        const property = prop.key.name || prop.key.value;

        let preferred = attributes[property];
        let message = `Prefer \`${preferred}\` property access to \`${property}\`.`;

        if (preactNames.has(property)) {
          preferred = property;
          message = `Preact-style prop names \`${preferred}\` should be wrapped with \`${propNameFn}()\``;
        }

        if (preferred) {
          context.report({
            node: prop,
            message,
            fix: function* (fixer) {
              if (!addedImportDecl) {
                addedImportDecl = true;
                if (lastImportDecl) {
                  yield fixer.insertTextAfter(lastImportDecl, importDecl);
                } else {
                  yield fixer.insertTextBefore(program.body[0], importDecl);
                }
              }
              const computed = `[${propNameFn}('${preferred}')]`;
              if (!prop.key.value) {
                yield fixer.insertTextBefore(prop, `${computed}: `);
              } else {
                yield fixer.replaceText(prop.key, computed);
              }
            },
          });
        }
      });
    }

    return {
      Program(node) {
        program = node;
        lastImportDecl = null;
        addedImportDecl = false;
      },

      ImportDeclaration(node) {
        lastImportDecl = node;
      },

      ImportSpecifier(node) {
        if (node.local.name === propNameFn) {
          addedImportDecl = true;
        }
      },

      'CallExpression[callee.name="propName"]': function (node) {
        if (
          node.arguments.length !== 1 ||
          node.arguments[0].type !== 'Literal' ||
          typeof node.arguments[0].value !== 'string'
        ) {
          context.report({
            node,
            message: `${node.callee.name} can only have a single string attribute.`,
          });
          return;
        }
        const name = node.arguments[0].value;
        if (attributes[name]) {
          context.report({
            node,
            message: `${node.callee.name} requires Preact-style name \`${attributes[name]}\`.`,
            fix(fixer) {
              return fixer.replaceText(
                node.arguments[0],
                `'${attributes[name]}'`
              );
            },
          });
        }
        if (!preactNames.has(name)) {
          context.report({
            node,
            message: `${node.callee.name} is not required.`,
            fix(fixer) {
              const replacement = `'${name}'`;
              if (node.parent.type === 'Property') {
                // Remove brackets around ['computed'] prop keys
                return fixer.replaceTextRange(
                  [node.parent.key.start - 1, node.parent.key.end + 1],
                  replacement
                );
              }
              return fixer.replaceText(node, replacement);
            },
          });
        }
      },

      FunctionDeclaration(node) {
        node.params.forEach(checkProps);
      },

      VariableDeclarator(node) {
        if (!node.init || node.init.name !== 'props' || !node.id) {
          return;
        }
        checkProps(node.id);
      },

      JSXAttribute(node) {
        const alternative = attributes[node.name.name];
        if (!alternative) {
          return;
        }
        context.report({
          node,
          message: `Prefer \`${alternative}\` to \`${node.name.name}\` when using JSX.`,

          fix(fixer) {
            return fixer.replaceText(node.name, alternative);
          },
        });
      },
    };
  },
};

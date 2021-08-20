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

const DOM_ATTRIBUTES = {
  className: 'class',
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
    /** @param {*} node */
    function checkProps(node) {
      if (!node.properties) {
        return;
      }
      node.properties.forEach((prop) => {
        if (!prop.key) {
          return;
        }
        const property = prop.value.name || prop.value.left.name;
        const preferred = DOM_ATTRIBUTES[property] || SVG_ATTRIBUTES[property];
        if (!preferred || prop.key.value === preferred) {
          return;
        }

        context.report({
          node,
          message: `Prefer \`${preferred}\` to \`${property}\` when using JSX.`,

          fix(fixer) {
            if (!prop.key.value) {
              return fixer.insertTextBefore(prop, `'${preferred}': `);
            }
            if (prop.key.value !== preferred) {
              return fixer.replaceText(prop.key, `'${preferred}'`);
            }
          },
        });
      });
    }
    return {
      FunctionDeclaration(node) {
        node.params.forEach(checkProps);
      },

      VariableDeclarator(node) {
        if (!node.init || node.init?.name !== 'props' || !node.id) {
          return;
        }
        checkProps(node.id);
      },

      JSXAttribute(node) {
        const alternative =
          DOM_ATTRIBUTES[node.name.name] || SVG_ATTRIBUTES[node.name.name];
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

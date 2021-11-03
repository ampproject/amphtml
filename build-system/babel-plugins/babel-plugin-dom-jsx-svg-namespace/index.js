/**
 * @fileoverview
 * SVG Elements must be especially created with createElementNS.
 *
 * This transforms JSX elements with SVG namespaces so that they include an
 * '__svg' magic prop in order to create the DOM nodes correctly.
 *
 * This prop is consumed by core/dom/jsx. We ignore files that do not import
 * this module.
 */

const svgTags = new Set([
  'animate',
  'circle',
  'clipPath',
  'defs',
  'desc',
  'ellipse',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'filter',
  'g',
  'image',
  'line',
  'linearGradient',
  'marker',
  'mask',
  'metadata',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'radialGradient',
  'rect',
  'stop',
  'svg',
  'switch',
  'symbol',
  'text',
  'textPath',
  'tspan',
  'use',
  'view',
]);

module.exports = function (babel) {
  const {types: t} = babel;

  let isCoreDomJsx = false;
  return {
    name: 'dom-jsx-svg-namespace',
    visitor: {
      Program: {
        enter(path) {
          isCoreDomJsx = false;
          path.traverse({
            ImportDeclaration(path) {
              if (path.node.source.value.endsWith('/core/dom/jsx')) {
                isCoreDomJsx = true;
                path.stop();
              }
            },
          });
        },
      },
      JSXOpeningElement(path) {
        if (!isCoreDomJsx) {
          return;
        }
        const {name} = path.node.name;
        if (name === 'foreignObject') {
          throw path.buildCodeFrameError(
            '<foreignObject> is not supported. See src/core/dom/jsx.js'
          );
        }
        if (svgTags.has(name)) {
          path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier('__svg')));
        }
      },
    },
  };
};

/**
 * Output helper for babel-plugin-jsx-style-object.
 * You should not use this directly.
 * @param {string} property
 * @param {*} value
 * @param {string=} opt_isDimensional
 * @return {string}
 */
export function jsxStylePropertyString(property, value, opt_isDimensional) {
  if (value == null || value === '') {
    return '';
  }
  const withUnit =
    opt_isDimensional && typeof value === 'number' ? `${value}px` : value;
  return `${property}:${withUnit};`;
}

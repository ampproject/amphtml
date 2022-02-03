/**
 * Output helper for babel-plugin-jsx-style-object.
 * You should not use this directly.
 */
export function jsxStylePropertyString(
  property: string,
  value: any,
  opt_isDimensional: boolean | undefined
) {
  if (value == null || value === '') {
    return '';
  }
  const withUnit =
    opt_isDimensional && typeof value === 'number' ? `${value}px` : value;
  return `${property}:${withUnit};`;
}

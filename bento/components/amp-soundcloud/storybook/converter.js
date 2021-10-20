/**
 * Converts RGBA into HEX format
 * @param {string} rgba Input string RGBA(r, g, b, a) format
 * @return {string} Hexadecimal color
 */
export const rgba2hex = (rgba) => {
  const rgb = rgba
    .replace(/\s/g, '')
    .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i);
  const hex = rgb
    ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
      (rgb[2] | (1 << 8)).toString(16).slice(1) +
      (rgb[3] | (1 << 8)).toString(16).slice(1)
    : rgba;

  return hex;
};

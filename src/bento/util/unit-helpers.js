/**
 * @param {Window} win
 * @param {string} css
 */
export function adoptStyles(win, css) {
  const style = win.document.createElement('style');
  style.textContent = css;
  win.document.head.appendChild(style);
}

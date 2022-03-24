/**
 * @param {Window} win
 * @param {string} css
 */
export function adoptStyles(win, css) {
  const style = win.document.createElement('style');
  style.textContent = `<style>${css}</style>`;
  win.document.head.appendChild(style);
}

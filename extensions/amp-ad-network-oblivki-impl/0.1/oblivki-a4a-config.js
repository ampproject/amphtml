/** @const @private {string} */
const OBLIVKI_SRC_PREFIX_ = 'https://oblivki.biz/amp/';

/** @const @private {string} */
const OBLIVKI_SRC_A4A_PREFIX_ = 'https://oblivki.biz/amp/a4a/';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
export function oblivkiIsA4AEnabled(win, element, useRemoteHtml) {
  let src;
  return (
    !useRemoteHtml &&
    !!(src = element.getAttribute('src')) &&
    !!element.getAttribute('data-use-a4a') &&
    (src.startsWith(OBLIVKI_SRC_PREFIX_) ||
      src.startsWith(OBLIVKI_SRC_A4A_PREFIX_))
  );
}

/** @const @private {string} */
const SRC_PREFIX_ = 'https://smart-ads.biz/_amp';

/** @const @private {string} */
const SRC_A4A_PREFIX_ = 'https://smart-ads.biz/_a4a';

/**
 * @param {!Window} win
 * @param {!Element} element
 * @param {boolean} useRemoteHtml
 * @return {boolean}
 */
export function smartAdsIsA4AEnabled(win, element, useRemoteHtml) {
  const src = element.getAttribute('src');
  return (
    !useRemoteHtml &&
    !!src &&
    !!element.getAttribute('data-use-a4a') &&
    (src.startsWith(SRC_PREFIX_) || src.startsWith(SRC_A4A_PREFIX_))
  );
}

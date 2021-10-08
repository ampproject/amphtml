import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';

import {whenContentIniLoadMeasure} from '../ini-load';

/**
 * Registers ini-load listener that will fire custom 'amp-ini-load' event
 * on window (accessible if creative is friendly to ad tag) and postMessage to
 * window parent.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function registerIniLoadListener(ampdoc) {
  const {win} = ampdoc;
  const root = ampdoc.getRootNode();
  whenContentIniLoadMeasure(
    ampdoc,
    win,
    Services.viewportForDoc(ampdoc).getLayoutRect(
      root.documentElement || root.body || root
    )
  ).then(() => {
    win.dispatchEvent(
      createCustomEvent(win, 'amp-ini-load', /* detail */ null, {bubbles: true})
    );
    if (win.parent) {
      win.parent./*OK*/ postMessage('amp-ini-load', '*');
    }
  });
}

/**
 * Function to get the amp4ads-identifier from the meta tag on the document
 * @param {!Window} win
 * @return {?string}
 */
export function getA4AId(win) {
  const a4aIdMetaTag = win.document.head.querySelector(
    'meta[name="amp4ads-id"]'
  );

  if (a4aIdMetaTag) {
    return a4aIdMetaTag.getAttribute('content');
  }

  return null;
}

/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to serialize all (open) Shadow DOM.
 *
 * Note: Percy does not support rendering Shadow DOM yet: https://github.com/percy/cli/issues/280.
 */

/**
 * Serializes all open shadow roots on the page.
 * @param {*} doc document to operate on.
 */
function serializeShadow(doc) {
  doc.documentElement.innerHTML = doc.documentElement.getInnerHTML({
    includeShadowRoots: true,
  });
}

serializeShadow(document);

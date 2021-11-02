/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to remove all <noscript> tags, from the main document and iframes.
 * This makes for cleaner diffs and prevents "double-execution" of AMP scripts
 * when enableJavaScript=false.
 */

/**
 * Removes <noscript> elements from doc and its iframes.
 * @param {Document} doc document to operate on recursively.
 */
function removeNoscript(doc) {
  doc.querySelectorAll('noscript').forEach((node) => node./*OK*/ remove());

  doc.body.querySelectorAll('iframe').forEach((iframe) => {
    if (iframe.contentDocument) {
      removeNoscript(iframe.contentDocument);
    }
  });
}

removeNoscript(document);

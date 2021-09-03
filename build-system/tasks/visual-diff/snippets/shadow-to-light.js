/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to convert all Shadow DOM to Light DOM. This is because Percy does
 * not support rendering Shadow DOM yet: https://github.com/percy/cli/issues/280.
 */

/**
 * Converts all Shadow Roots to Light DOM.
 * @param {*} doc document to operate on.
 */
function shadowToLight(doc) {
  const html = doc.documentElement.getInnerHTML({
    includeShadowRoots: true,
  });
  doc.documentElement./*OK*/ innerHTML = html;
  doc.querySelectorAll('template[shadowroot]').forEach((template) => {
    template.parentNode?.appendChild(template.content);
  });
}

shadowToLight(document);

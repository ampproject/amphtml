'use strict';

function fillIframeSrcdoc(page) {
  return page.$$eval('amp-ad > iframe, iframe.inabox-test', (els) =>
    Promise.all(
      els.map(
        (el) =>
          new Promise((resolve) => {
            el.srcdoc = el.contentDocument.documentElement.innerHTML;
            el.addEventListener('load', resolve);
          })
      )
    )
  );
}

module.exports = {
  fillIframeSrcdoc,
};

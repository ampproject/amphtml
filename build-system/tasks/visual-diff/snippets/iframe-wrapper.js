// This file is executed via Puppeteer's page.evaluate on a document to wrap it
// with an <iframe>, so that we can perform viewport-constrained visual diff
// tests.

// The texts __WIDTH__ and __HEIGHT__ will be replaced at execution time with
// the viewport's size from the visual test's config.

const pageContents = document.documentElement.outerHTML;

const metaCharset = document.querySelector('head meta[charset]')
    || document.createElement('meta');
if (!metaCharset.hasAttribute('charset')) {
  metaCharset.setAttribute('charset', 'utf-8');
}

while (document.head.firstChild) {
  document.head.removeChild(document.head.firstChild);
}
document.head.appendChild(metaCharset);

while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}

const iframe = document.createElement('iframe');
iframe.width = __WIDTH__;
iframe.height = __HEIGHT__;
iframe.srcdoc = pageContents;
document.body.appendChild(iframe);

document.body.style.margin = '0';
iframe.style.border = '0';

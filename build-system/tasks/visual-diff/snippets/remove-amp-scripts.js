// This file is executed via Puppeteer's page.evaluate on a document to remove
// all <script> tags that import AMP pages. This makes for cleaner diffs and
// prevents "double-execution" of AMP scripts when enableJavaScript=true.

document.head.querySelectorAll("script[src]")
    .forEach(node => node./*OK*/remove());

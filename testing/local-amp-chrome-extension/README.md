# Chrome extension for loading public websites with a local AMP.

Install this extension to test existing public AMP docs against the current version in your development tree.

-   Please turn this extension off when you aren't currently working on AMP.
-   Should be used as an unpacked extension.
    -   Open chrome://extensions/
    -   Select "Load unpacked extension".
-   Only works with HTTP host pages.

For the basic use case of just proxying all amp js files, you can just run amp locally (via `amp`), and hit:
http://localhost:8000/proxy/s/url-of-website-you-wish-to-test

For example:
http://localhost:8000/proxy/s/www.washingtonpost.com/graphics/2018/food/amp-stories/voraciously-30-minute-spaghetti-and-meatballs/

Note that this only works with pages that have been successfully cached by Google, i.e. indexed and valid.

## Basic Usage

What this extension does already is to intercept network requests to `https://cdn.ampproject.org/*` and redirect them to localhost. This is done in [background.js](./background.js).

# Locally rewriting production websites

One useful thing this extension can do is to add code that modifies another production website on your local browser. This is a good way to QA extensions in development in real life use cases. To do this, you write a [content-script](https://developer.chrome.com/extensions/content_scripts) and register it in [manifest.json](./manifest.json) like so:

```json
  "content_scripts": [
    {
      "matches": ["https://website-you-intend-to-test.com/*"],
      "all_frames": true,
      "js": ["content-script.js"]
    }
  ],
```

Matches is a regex for all the websites that you want this script to run on.

The following example adds the new `<amp-lightbox-gallery>` component to a website, and uses the lightbox attribute on all carousels and images. To add an extension, just create a script element and append it to the head:

```js
var lightboxScript = document.createElement('script');
lightboxScript.type = 'text/javascript';
lightboxScript.src =
  'https://cdn.ampproject.org/v0/amp-lightbox-gallery-0.1.js';
lightboxScript.setAttribute('custom-element', 'amp-lightbox-gallery');
document.head.appendChild(lightboxScript);
```

To modify their code, just write normal javascript for DOM mutations:

```js
document.querySelectorAll('amp-img').forEach((ampImg) => {
  ampImg.removeAttribute('on');
  ampImg.setAttribute('lightbox', '');
});

document.querySelectorAll('amp-carousel').forEach((carousel) => {
  carousel.setAttribute('lightbox', '');
});
```

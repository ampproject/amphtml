import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

const TYPE = 'reddit';

class AmpReddit extends AMP.BaseElement {
  /**
   * @param {boolean=} onLayout
   * @override
   */
  preconnectCallback(onLayout) {
    const preconnect = Services.preconnectFor(this.win);
    const ampdoc = this.getAmpDoc();
    // Required urls and scripts are different for comments and posts.
    if (this.element.getAttribute('data-embedtype') === 'comment') {
      // The domain for static comment permalinks.
      preconnect.url(ampdoc, 'https://www.redditmedia.com', onLayout);
      // The domain for JS and CSS used in rendering embeds.
      preconnect.url(ampdoc, 'https://www.redditstatic.com', onLayout);
      preconnect.preload(
        ampdoc,
        'https://www.redditstatic.com/comment-embed.js',
        'script'
      );
    } else {
      // Posts don't use the static domain.
      preconnect.url(ampdoc, 'https://www.reddit.com', onLayout);
      // Posts defer to the embedly API.
      preconnect.url(ampdoc, 'https://cdn.embedly.com', onLayout);
      preconnect.preload(
        ampdoc,
        'https://embed.redditmedia.com/widgets/platform.js',
        'script'
      );
    }

    preloadBootstrap(this.win, TYPE, ampdoc, preconnect);
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    userAssert(
      this.element.getAttribute('data-src'),
      'The data-src attribute is required for <amp-reddit> %s',
      this.element
    );
    userAssert(
      this.element.getAttribute('data-embedtype'),
      'The data-embedtype attribute is required for <amp-reddit> %s',
      this.element
    );

    const iframe = getIframe(this.win, this.element, TYPE, null, {
      allowFullscreen: true,
    });
    iframe.title = this.element.title || 'Reddit';
    applyFillContent(iframe);
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        this.forceChangeHeight(data['height']);
      },
      /* opt_is3P */ true
    );
    this.element.appendChild(iframe);
    return this.loadPromise(iframe);
  }
}

AMP.extension('amp-reddit', '0.1', (AMP) => {
  AMP.registerElement('amp-reddit', AmpReddit);
});

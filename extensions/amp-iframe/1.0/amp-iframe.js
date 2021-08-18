

import {BaseElement} from './base-element';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';
import {dict} from '#core/types/object';
import {measureIntersection} from '#core/dom/layout/intersection';

/** @const {string} */
const TAG = 'amp-iframe';

class AmpIframe extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-iframe'),
      'expected global "bento" or specific "bento-iframe" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  init() {
    return dict({
      'onLoadCallback': () => {
        const hasPlaceholder = Boolean(this.getPlaceholder());
        if (hasPlaceholder) {
          this.togglePlaceholder(false);
          return;
        }
        // TODO(dmanek): Extract this to a common function & share
        // between 0.1 and 1.0 versions.
        measureIntersection(this.element).then((intersectionEntry) => {
          const {top} = intersectionEntry.boundingClientRect;
          const viewportHeight = intersectionEntry.rootBounds.height;
          const minTop = Math.min(600, viewportHeight * 0.75);
          userAssert(
            top >= minTop,
            '<amp-iframe> elements must be positioned outside the first 75% ' +
              'of the viewport or 600px from the top (whichever is smaller): %s ' +
              ' Current position %s. Min: %s' +
              "Positioning rules don't apply for iframes that use `placeholder`." +
              'See https://github.com/ampproject/amphtml/blob/main/extensions/' +
              'amp-iframe/amp-iframe.md#iframe-with-placeholder for details.',
            this.element,
            top,
            minTop
          );
        });
      },
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpIframe);
});

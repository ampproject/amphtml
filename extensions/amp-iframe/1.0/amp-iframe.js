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

  /**
   * Callback for onload event of iframe. Checks if the component has a placeholder
   * element and hides it if it does. Also checks the position of the iframe on the
   * document.
   */
  handleOnLoad_() {
    if (this.getPlaceholder()) {
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
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions.
   * @param {number} height
   * @param {number} width
   * @private
   */
  updateSize_(height, width) {
    if (!height && !width) {
      this.user().error(
        TAG,
        'Ignoring embed-size request because width and height value is invalid',
        this.element
      );
    }

    if (height < 100) {
      this.user().error(
        TAG,
        'Ignoring embed-size request because the resize height is less ' +
          'than 100px. If you are using amp-iframe to display ads, consider ' +
          'using amp-ad instead.',
        this.element
      );
      return;
    }

    this.attemptChangeSize(height, width).catch((e) => {
      if (this.getOverflowElement?.()) {
        console./* OK */ warn(
          '[overflow] element not found. Provide one to enable resizing to full contents.',
          this.element
        );
      }
      throw e;
    });
  }

  /** @override */
  init() {
    return dict({
      'onLoad': () => {
        this.handleOnLoad_();
      },
      'requestResize': (height, width) => {
        this.updateSize_(height, width);
      },
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpIframe);
});

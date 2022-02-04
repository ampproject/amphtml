import {isLayoutSizeDefined} from '#core/dom/layout';
import {closestAncestorElementBySelector} from '#core/dom/query';
import {setImportantStyles} from '#core/dom/style';

import {isExperimentOn} from '#experiments';

import {userAssert} from '#utils/log';

import {exponentialFalloff} from './amp-inline-gallery-pagination';

export class AmpInlineGalleryCaptions extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'amp-inline-gallery-captions') ||
        'expected "amp-inline-gallery-captions" experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  layoutCallback() {
    const {height} = this./*OK*/ getLayoutBox();
    const parentGallery = closestAncestorElementBySelector(
      this.element,
      'amp-inline-gallery'
    );

    setImportantStyles(parentGallery, {
      '--i-amphtml-caption-height': `${height}px`,
    });
  }

  /**
   * @param {number} unusedTotal
   * @param {number} index
   * @param {number} offset
   * @param {!Array<!Element>} slides
   */
  updateProgress(unusedTotal, index, offset, slides) {
    this.mutateElement(() => {
      this.updateCaptionOpacities_(slides, index, offset);
    });
  }

  /**
   * Updates the opacities of the captions, based on their distance from the
   * current slide.
   * @param {!Array<!Element>} slides
   * @param {number} index
   * @param {number} offset
   */
  updateCaptionOpacities_(slides, index, offset) {
    slides.forEach((slide, i) => {
      const indexDistance = Math.abs(index + offset - i);
      // Want to fall off to zero at the mid way point, the next/prev slide
      // will start fading in at the same time.
      const falloffDistance = Math.min(2 * indexDistance, 1);
      const opacity = exponentialFalloff(falloffDistance, 3);
      setImportantStyles(slide, {
        '--caption-opacity': opacity,
        // Need to prevent pointer events on all other slide's captions so
        // that the user can select the caption text, click on links, etc.
        'pointer-events': opacity == 0 ? 'none' : 'all',
      });
    });
  }
}

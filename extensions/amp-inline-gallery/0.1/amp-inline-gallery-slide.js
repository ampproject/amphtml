import {Layout_Enum} from '#core/dom/layout';
import {htmlFor} from '#core/dom/static-template';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {userAssert} from '#utils/log';

export class AmpInlineGallerySlide extends AMP.BaseElement {
  /**
   * @return {!Element}
   * @private
   */
  createDom_() {
    userAssert(
      isExperimentOn(this.win, 'amp-inline-gallery-captions') ||
        'expected "amp-inline-gallery-captions" experiment to be enabled'
    );
    const html = htmlFor(this.element);
    const content = html`
      <figure class="i-amphtml-inline-gallery-slide-container">
        <div class="i-amphtml-inline-gallery-slide-content-slot"></div>
        <figcaption class="i-amphtml-inline-gallery-slide-caption">
          <amp-truncate-text layout="fill">
            <span class="i-amphtml-inline-gallery-slide-caption-slot"></span>
            <button
              class="i-amphtml-inline-gallery-slide-see-more"
              slot="collapsed"
            >
              See more
            </button>
            <div
              class="i-amphtml-inline-gallery-slide-persistent-slot"
              slot="persistent"
            ></div>
          </amp-truncate-text>
        </figcaption>
      </figure>
    `;
    const expand = content.querySelector('[slot="collapsed"]');
    expand.addEventListener('click', (e) => {
      this.openLightbox();
      e.stopPropagation();
    });

    return content;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /**
   *
   */
  openLightbox() {
    Services.extensionsFor(this.win)
      .installExtensionForDoc(this.getAmpDoc(), 'amp-lightbox-gallery')
      .then(() => {
        const el = document.querySelector('amp-lightbox-gallery');
        return el.getImpl();
      })
      .then((impl) => {
        impl.open(this.element, true);
      });
  }

  /** @override */
  isLayoutSupported() {
    return Layout_Enum.FLEX_ITEM;
  }

  /** @override */
  buildCallback() {
    const dom = this.createDom_();
    const captionSlot = dom.querySelector(
      '.i-amphtml-inline-gallery-slide-caption-slot'
    );
    const contentSlot = dom.querySelector(
      '.i-amphtml-inline-gallery-slide-content-slot'
    );
    const attributionSlot = dom.querySelector(
      '.i-amphtml-inline-gallery-slide-persistent-slot'
    );

    this.element.childNodes.forEach((node) => {
      const slot = node.getAttribute?.('slot');
      if (slot === 'caption') {
        captionSlot.appendChild(node);
      } else if (slot === 'attribution') {
        attributionSlot.appendChild(node);
      } else if (slot == null) {
        contentSlot.appendChild(node);
      }
    });

    this.element.appendChild(dom);
  }
}

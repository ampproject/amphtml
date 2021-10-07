import {Layout} from '#core/dom/layout';
import {Services} from '#service';
import {htmlFor} from '#core/dom/static-template';
import {isExperimentOn} from '#experiments';
import {toArray} from '#core/types/array';
import {userAssert} from '../../../src/log';

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
    return Layout.FLEX_ITEM;
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
    const childNodesArray = toArray(this.element.childNodes);

    childNodesArray
      .filter((n) => {
        return n.hasAttribute && n.getAttribute('slot') === 'caption';
      })
      .forEach((node) => captionSlot.appendChild(node));
    childNodesArray
      .filter((n) => {
        return !n.hasAttribute || !n.hasAttribute('slot');
      })
      .forEach((node) => contentSlot.appendChild(node));
    childNodesArray
      .filter((n) => {
        return n.hasAttribute && n.getAttribute('slot') === 'attribution';
      })
      .forEach((node) => attributionSlot.appendChild(node));

    this.element.appendChild(dom);
  }
}

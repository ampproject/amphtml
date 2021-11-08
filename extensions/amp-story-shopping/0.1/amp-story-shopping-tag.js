import * as Preact from '#core/dom/jsx';
import {Layout} from '#core/dom/layout';
import {Services} from '#service';
import {Action} from '../../amp-story/1.0/amp-story-store-service';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';
import {createShadowRootWithStyle} from '../../amp-story/1.0/utils';
import {CSS as shoppingTagCSS} from '../../../build/amp-story-shopping-tag-0.1.css';

/** @const {Array<Object>} fontFaces with urls from https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&amp;display=swap */
const fontsToLoad = [
  {
    family: 'Poppins',
    weight: '400',
    style: 'normal',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2')",
  },
  {
    family: 'Poppins',
    weight: '700',
    style: 'normal',
    src: "url(https://fonts.gstatic.com/s/poppins/v9/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2')",
  },
];

const ProductTag = ({tagData}) => (
  <div class="amp-story-shopping-tag-inner">
    <span class="amp-story-shopping-tag-dot"></span>
    <span class="amp-story-shopping-tag-pill">
      <span class="amp-story-shopping-tag-pill-image"></span>
      <span class="amp-story-shopping-tag-pill-text">{tagData.price}</span>
    </span>
  </div>
);

export class AmpStoryShoppingTag extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.renderedTag_ = null;
    this.storeService_ = null;
    this.id_ = this.element.dataset.tagId;
    this.shoppingAttachmentImpl_ = null;
  }

  /** @override */
  buildCallback() {
    this.loadFonts_();
    super.buildCallback();
    this.element.setAttribute('role', 'button');
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;
        storeService.subscribe(StateProperty.SHOPPING_STATE, (data) =>
          this.renderTag_(data)
        );
      }),
      // Get page's shopping attachment impl.
      this.element
        .closest('amp-story-page')
        .querySelector('amp-story-shopping-attachment')
        .getImpl()
        .then((impl) => (this.shoppingAttachmentImpl_ = impl)),
    ]);
  }

  layoutCallback() {
    this.element.addEventListener('click', () => this.onProductTagClick_());
  }

  renderTag_(data) {
    if (this.renderedTag_ || !data[this.id_]) {
      return;
    }
    this.renderedTag_ = <ProductTag tagData={data[this.id_]} />;
    createShadowRootWithStyle(this.element, this.renderedTag_, shoppingTagCSS);
  }

  onProductTagClick_() {
    this.setActiveProductData_();
    this.shoppingAttachmentImpl_.open(true);
  }

  setActiveProductData_() {
    const data = this.storeService_.get(StateProperty.SHOPPING_STATE);
    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, {
      'activeProduct': data[this.id_],
    });
  }

  /** @private */
  loadFonts_() {
    if (this.win.document.fonts && FontFace) {
      fontsToLoad.forEach(({family, src, weight, style}) =>
        new FontFace(family, src, {weight, style})
          .load()
          .then((font) => this.win.document.fonts.add(font))
      );
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.CONTAINER;
  }
}

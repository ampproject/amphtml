import {Layout, applyFillContent} from '#core/dom/layout';
import {Services} from '#service';
import {
  StateProperty,
  Action,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryPageAttachment} from 'extensions/amp-story/1.0/amp-story-page-attachment';
import * as Preact from '#core/dom/jsx';

const PdpTemplate = ({productData, children}) => {
  return (
    <div>
      <div class="amp-story-shopping-attachment-outer">
        <div class="medium-12px">{productData.brand}</div>
        <div class="flex-between">
          <div class="bold-20px">{productData['product-title']}</div>
          <div class="medium-16px">${productData.price}</div>
        </div>
        <div class="regular-12px">4.7 (240 reviews)</div>
        <a href={productData.url}>
          <div class="buy-now-cta">Buy Now</div>
        </a>
      </div>
      <div class="carousel-wrapper">
        <amp-img
          alt="A view of the sea"
          src={productData.img}
          width="492"
          height="612"
          layout="responsive"
        ></amp-img>
        {/* <amp-carousel
        width="450"
        height="300"
        layout="responsive"
        type="slides"
        role="region"
        aria-label="Basic carousel"
      >
        <amp-img
          src="/examples/visual-tests/amp-story/img/shopping/mini-speaker-hero-1.png"
          width="450"
          height="300"
        ></amp-img>
        <amp-img
          src="/examples/visual-tests/amp-story/img/shopping/mini-speaker-hero-2.png"
          width="450"
          height="300"
        ></amp-img>
      </amp-carousel> */}
      </div>
      <div class="details">
        <span class="amp-story-shopping-attachment-header-2">Details</span>
      </div>
      {children}
      <div class="spacer"></div>
    </div>
  );
};

const PlpTemplate = ({products, cb}) => {
  return (
    <div class="amp-story-shopping-attachment-outer">
      <div class="amp-story-shopping-attachment-header-2">
        Also in this story
      </div>
      <div class="amp-story-shopping-attachment-cards">
        {products.map((productData) => (
          <div
            class="amp-story-shopping-attachment-card"
            role="button"
            onClick={() => cb(productData.name)}
          >
            <img
              class="amp-story-shopping-attachment-card-image"
              src={productData.img}
            ></img>
            <div class="brand">{productData.brand}</div>
            <div class="name">{productData['product-title']}</div>
            <div class="medium-12px">${productData.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export class AmpStoryShoppingAttachment extends AmpStoryPageAttachment {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    this.storeService_ = null;

    this.shoppingTags_ = this.element
      .closest('amp-story-page')
      .querySelectorAll('amp-story-shopping-tag');
  }

  /** @override */
  buildCallback() {
    super.buildCallback();
    this.templateWrapper_ = this.contentEl.appendChild(<div></div>);
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => (this.storeService_ = storeService)
    );
  }

  /** @override */
  open(shouldAnimate) {
    const data = this.storeService_.get(StateProperty.SHOPPING_STATE);

    const productsOnPage = Array.from(this.shoppingTags_)
      .map((tag) => {
        return data[tag.dataset.tagId];
      })
      .filter((product) => product !== data.activeProduct);

    const plpTemplate = (
      <PlpTemplate
        products={productsOnPage}
        cb={(name) => this.onPlpItemClick_(name)}
      />
    );

    if (data.activeProduct || this.shoppingTags_.length === 1) {
      this.templateWrapper_.replaceChildren(
        <PdpTemplate
          productData={
            data.activeProduct ||
            data[this.shoppingTags_[0].getAttribute('data-tag-id')]
          }
        >
          {plpTemplate}
        </PdpTemplate>
      );
    } else {
      this.templateWrapper_.replaceChildren(plpTemplate);
    }

    this.element.querySelector(
      '.i-amphtml-story-draggable-drawer-container'
    ).scrollTop = 0;

    super.open(shouldAnimate);
  }

  onPlpItemClick_(productID) {
    const data = this.storeService_.get(StateProperty.SHOPPING_STATE);
    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, {
      'activeProduct': data[productID],
    });
    this.open(true);
  }

  /** @override */
  close_() {
    this.clearActiveProduct_();
    super.close_();
  }

  clearActiveProduct_() {
    this.storeService_.dispatch(Action.ADD_SHOPPING_STATE, {
      'activeProduct': null,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }
}

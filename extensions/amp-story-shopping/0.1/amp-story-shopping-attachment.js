import {Layout, applyFillContent} from '#core/dom/layout';
import {Services} from '#service';
import {
  StateProperty,
  Action,
} from '../../amp-story/1.0/amp-story-store-service';
import {AmpStoryPageAttachment} from 'extensions/amp-story/1.0/amp-story-page-attachment';
import * as Preact from '#core/dom/jsx';

const TAG = 'amp-story-shopping-attachment';

const PdpTemplate = ({productData, children}) => {
  return (
    <div>
      <div>PDP template</div>
      <div>{productData.name}</div>
      <div>${productData.price}</div>
      <br />
      {children}
    </div>
  );
};

const PlpTemplate = ({products, cb}) => {
  return (
    <div class="amp-story-shopping-attachment-outer">
      <div class="amp-story-shopping-attachment-header">Also in this story</div>
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
            <div class="name">{productData.name}</div>
            <div class="price">${productData.price}</div>
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
    // this.templateWrapper_.innerHTML = '';

    const productsOnPage = Array.from(this.shoppingTags_).map((tag) => {
      return data[tag.dataset.tagId];
    });
    // .filter((product) => product !== data.activeProduct);

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
            data[this.shoppingTags_[0].getAttribute('product-tag-id')]
          }
        >
          {plpTemplate}
        </PdpTemplate>,
        this.templateWrapper_.childNodes
      );
    } else {
      this.templateWrapper_.replaceChildren(
        plpTemplate,
        this.templateWrapper_.childNodes
      );
    }

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

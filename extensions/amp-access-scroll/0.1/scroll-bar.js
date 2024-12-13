import {ScrollComponent} from './scroll-component';
import {buildUrl, connectHostname} from './scroll-url';

/**
 * UI for Scroll users.
 *
 * Presents a fixed bar at the bottom of the screen with Scroll content.
 */
export class ScrollBar extends ScrollComponent {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   * @param {!../../amp-access/0.1/amp-access-source.AccessSource} accessSource
   */
  constructor(doc, accessSource) {
    super(doc);

    /** @protected */
    this.accessSource_ = accessSource;

    this.render_();
  }

  /** @private */
  render_() {
    this.mutate(() => {
      if (!this.frame_) {
        this.makeIframe_();
        this.setWindow_(this.frame_.contentWindow);
      }
      this.renderHorizontalLayout();
    });
  }

  /**
   * @protected
   * */
  makeIframe_() {
    this.frame_ = /** @type {!HTMLIFrameElement} */ (
      this.el('iframe', {
        'scrolling': 'no',
        'frameborder': '0',
        'allowtransparency': 'true',
        'title': 'Twitter Blue bar',
        'width': '100%',
        'height': '100%',
        'sandbox':
          'allow-scripts allow-same-origin ' +
          'allow-top-navigation allow-popups ' +
          'allow-popups-to-escape-sandbox',
      })
    );

    this.root_ = this.el(
      'div',
      {
        'class': 'amp-access-scroll-bar',
      },
      [this.frame_]
    );

    this.mount();

    // Set iframe to scrollbar URL.
    buildUrl(
      this.accessSource_,
      connectHostname(this.accessSource_.getAdapterConfig()) +
        '/html/amp/scrolltab'
    ).then((scrollbarUrl) => {
      this.frame_.setAttribute('src', scrollbarUrl);
    });
  }

  /**
   * @param {!JsonObject} action
   */
  update(action) {
    const changed = this.updateHorizontalLayout(action);

    if (changed) {
      this.render_();
    }
  }
}

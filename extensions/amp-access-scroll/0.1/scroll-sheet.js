import {toggle} from '#core/dom/style';
import {hasOwn} from '#core/types/object';

import {ScrollComponent} from './scroll-component';

/** Provides iframe for the Scroll Audio Player. */
export class Sheet extends ScrollComponent {
  /**
   *  Creates an instance of Audio.
   *
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} doc
   */
  constructor(doc) {
    super(doc);

    /** @private {string} */
    this.DEFAULT_TITLE_ = 'Scroll Feature';

    /** @private {!Sheet.State} */
    this.state_ = {
      url: '',
      open: false,
      title: this.DEFAULT_TITLE_,
    };
  }
  /**
   * @param {!JsonObject} action
   */
  update(action) {
    let changed = false;

    switch (action['_scramp']) {
      case 'au':
        changed = this.updateHorizontalLayout(action);
        ['open', 'url', 'title'].forEach((key) => {
          if (hasOwn(action, key) && action[key] !== this.state_[key]) {
            this.state_[key] = action[key];
            changed = true;
          }
        });
        break;
      case 'st':
        ['revealed'].forEach((key) => {
          if (hasOwn(action, key) && action[key] !== this.state_[key]) {
            this.state_[key] = action[key];
            changed = true;
          }
        });
        break;
    }

    if (changed) {
      this.render_(this.state_);
    }
  }

  /**
   * @param {!Sheet.State} state
   * @private
   */
  render_(state) {
    this.mutate(() => {
      if (!this.frame_) {
        this.makeIframe_();
        this.setWindow_(this.frame_.contentWindow);
      }

      if (this.frame_.src !== state.url) {
        this.frame_.setAttribute('src', state.url);
      }
      this.renderHorizontalLayout();
      this.frame_.setAttribute('title', state.title);
      toggle(this.frame_, state.open);
    });
  }

  /**
   * @private
   * */
  makeIframe_() {
    this.frame_ = /** @type {!HTMLIFrameElement} */ (
      this.el('iframe', {
        'class': 'amp-access-scroll-sheet',
        'scrolling': 'no',
        'frameborder': '0',
        'allowtransparency': 'true',
        'title': this.DEFAULT_TITLE_,
        'sandbox':
          'allow-scripts allow-same-origin ' +
          'allow-top-navigation allow-popups ' +
          'allow-popups-to-escape-sandbox',
      })
    );
    this.root_ = this.frame_;
    this.mount();
  }
}

/**
 * @typedef {{
 *    open: boolean,
 *    url: string,
 *    title: string
 * }}
 */
Sheet.State;

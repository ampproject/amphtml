import {isLayoutSizeDefined} from '#core/dom/layout';

import {cssText} from '../../../build/amp-story-player.css';
import {AmpStoryPlayer} from '../../../src/amp-story-player/amp-story-player-impl';

class AmpStoryPlayerWrapper extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.player_ = new AmpStoryPlayer(this.win, element);
  }

  /** @override */
  buildCallback() {
    this.player_.buildPlayer();
  }

  /** @override */
  layoutCallback() {
    this.player_.layoutPlayer();
    return Promise.resolve();
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension('amp-story-player', '0.1', (AMP) => {
  AMP.registerElement('amp-story-player', AmpStoryPlayerWrapper, cssText);
});

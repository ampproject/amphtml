import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-audio-sticker-0.1.css';
import {
  Action,
  StateProperty,
} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-audio-sticker';

export class AmpStoryAudioSticker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;
  }

  /** @override */
  buildCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.storeService_ = storeService;

        this.element.addEventListener('click', (event) => {
          if (this.storeService_.get(StateProperty.MUTED_STATE)) {
            this.storeService_.dispatch(Action.TOGGLE_MUTED, false);
            event.stopPropagation();
          }
        });
      }
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpStoryAudioSticker, CSS);
});

import * as Preact from '#core/dom/jsx';
import {Layout_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {CSS} from '../../../build/amp-story-audio-sticker-0.1.css';
import {Action} from '../../amp-story/1.0/amp-story-store-service';

const TAG = 'amp-story-audio-sticker';

export class AmpStoryAudioSticker extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    this.element.parentNode.appendChild(
      <div class="i-amphtml-amp-story-audio-sticker-component">
        <div class="i-amphtml-amp-story-audio-sticker-tap-hint">
          <span>tap to unmute</span>
        </div>
        <div
          class={
            this.element.getAttribute('size') === 'small'
              ? 'i-amphtml-amp-story-audio-sticker-container small'
              : 'i-amphtml-amp-story-audio-sticker-container large'
          }
        >
          {this.element}
        </div>
      </div>
    );
  }

  /** @override */
  layoutCallback() {
    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        this.element.addEventListener('click', () =>
          storeService.dispatch(Action.TOGGLE_MUTED, false)
        );
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

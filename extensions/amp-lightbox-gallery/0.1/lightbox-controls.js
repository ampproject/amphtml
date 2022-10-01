import {htmlFor} from '#core/dom/static-template';
import {toArray} from '#core/types/array';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {devAssert} from '#utils/log';

/**
 * @enum {string}
 */
export const LightboxControlsAction = {
  CLOSE: 'close',
  GALLERY: 'gallery',
  SLIDES: 'slides',
  PREV: 'prev',
  NEXT: 'next',
};

/**
 * Manages lightbox controls.
 */
export class LightboxControls {
  /**
   * @param {!Window} win
   * @param {!Document} doc
   * @param {function(function(), function())} measureMutateElement
   * @return {!LightboxControls} A LightboxCaption instance.
   */
  static build(win, doc, measureMutateElement) {
    // TODO(aghassemi): i18n and customization. See https://git.io/v6JWu
    const el = htmlFor(doc)`
      <div class="i-amphtml-lbg-controls">
        <div class="i-amphtml-lbg-top-bar">
          <div role="button"
              class="i-amphtml-lbg-button "
              data-action="close"
              aria-label="Close">
          </div>
          <div role="button"
              class="i-amphtml-lbg-button"
              data-action="gallery"
              aria-label="Gallery">
          </div>
          <div role="button"
              class="i-amphtml-lbg-button"
              data-action="slides"
              aria-label="Content">
          </div>
        </div>
        <div role="button"
            class="i-amphtml-lbg-button"
            data-action="prev"
            aria-label="Content">
        </div>
        <div role="button"
            class="i-amphtml-lbg-button"
            data-action="next"
            aria-label="Content">
        </div>
      </div>`;

    const input = Services.inputFor(win);
    if (!input.isMouseDetected()) {
      el.querySelector('[data-action="prev"]').classList.add(
        'i-amphtml-screen-reader'
      );
      el.querySelector('[data-action="next"]').classList.add(
        'i-amphtml-screen-reader'
      );
    }

    const actionStrings = Object.values(LightboxControlsAction);
    devAssert(
      toArray(el.querySelectorAll('[data-action]'))
        .map((div) => div.getAttribute('data-action'))
        .every((action) => actionStrings.includes(action)),
      'Action for a button does not map to enum.'
    );

    return new LightboxControls(win, el, measureMutateElement);
  }

  /**
   * @param {!Window} win
   * @param {!Element} element
   * @param {function(function(), function())} measureMutateElement
   */
  constructor(win, element, measureMutateElement) {
    /** @private @const */
    this.win_ = win;

    /** @private @const */
    this.element_ = element;

    /** @protected @const */
    this.measureMutateElement_ = measureMutateElement;

    this.element_.addEventListener('click', (event) => {
      this.handleClick_(event);
    });
  }

  /**
   * @return {!Element} The controls container.
   */
  getElement() {
    return this.element_;
  }

  /**
   * @param {!Event} event
   * @private
   */
  handleClick_(event) {
    const action = event.target.getAttribute('data-action');

    if (!action) {
      return;
    }

    this.element_.dispatchEvent(
      createCustomEvent(this.win_, 'action', {
        'action': action,
      })
    );
    event.stopPropagation();
    event.preventDefault();
  }
}

import {Keys_Enum} from '#core/constants/key-codes';
import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';

import {StateProperty} from 'extensions/amp-story/1.0/amp-story-store-service';

import {
  AmpStoryInteractive,
  InteractiveType,
  MID_SELECTION_CLASS,
  POST_SELECTION_CLASS,
} from './amp-story-interactive-abstract';

import {CSS} from '../../../build/amp-story-interactive-slider-0.1.css';

/**
 * Generates the template for the slider.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildSliderTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-slider-container">
      <div class="i-amphtml-story-interactive-prompt-container"></div>
      <div class="i-amphtml-story-interactive-slider-input-container">
        <div class="i-amphtml-story-interactive-slider-input-size">
          <input
            class="i-amphtml-story-interactive-slider-input"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value="0"
          />
          <div class="i-amphtml-story-interactive-slider-bubble-wrapper">
            <div class="i-amphtml-story-interactive-slider-bubble"></div>
          </div>
          <div class="i-amphtml-story-interactive-slider-average-indicator">
            <span></span><span></span><span></span>
          </div>
          <div class="i-amphtml-story-interactive-slider-average-text">
            Average answer
          </div>
        </div>
      </div>
    </div>
  `;
};

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

/**
 * @const @enum {number}
 */
const SliderType = {
  PERCENTAGE: 'percentage',
  EMOJI: 'emoji',
};

const HINT_ANIMATION_DURATION_MS = 1500;
const HINT_ANIMATION_DELAY_MS = 500;

export class AmpStoryInteractiveSlider extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.SLIDER, [0, 1]);
    /** @private {?Element} bubble containing the current selection of the user while dragging */
    this.bubbleEl_ = null;
    /** @private {?Element} tracks user input */
    this.inputEl_ = null;
    /** @private {!SliderType}  */
    this.sliderType_ = SliderType.PERCENTAGE;
    /** @private {?number} Reference to timeout so we can cancel it if needed. */
    this.landingAnimationDelayTimeout_ = null;
    /**  @private {?number} Reference to requestAnimationFrame so we can cancel it if needed.*/
    this.currentRAF_ = null;
  }

  /** @override */
  displayOptionsData(responseData) {
    const average = this.calculateWeightedAverage_(responseData);
    setImportantStyles(this.rootEl_, {'--average': average + '%'});
  }

  /**
   * @private
   * @param {!Array<!InteractiveOptionType>} responseData
   * @return {number}
   */
  calculateWeightedAverage_(responseData) {
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < responseData.length; i++) {
      numerator += responseData[i].index * responseData[i].count;
      denominator += responseData[i].count;
    }
    if (denominator == 0) {
      return 0;
    }
    return numerator / denominator;
  }

  /** @override*/
  updateComponentWithData(data) {
    this.optionsData_ = this.orderData_(data);
    this.optionsData_.forEach((response) => {
      if (response.selected) {
        this.hasUserSelection_ = true;
        this.mutateElement(() => {
          this.inputEl_.value = response.index;
          this.onDrag_();
          this.onRelease_();
          this.updateToPostSelectionState_(null);
        });
      }
    });
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildSliderTemplate(this.element);
    this.bubbleEl_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-slider-bubble'
    );
    this.inputEl_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-slider-input'
    );

    if (this.options_.length > 0) {
      this.sliderType_ = SliderType.EMOJI;
      const emojiWrapper = this.win.document.createElement('span');
      emojiWrapper.textContent = this.options_[0].text;
      this.bubbleEl_.appendChild(emojiWrapper);
    }
    this.rootEl_.setAttribute('type', this.sliderType_);
    this.attachPrompt_(this.rootEl_);
    return this.rootEl_;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  initializeListeners_() {
    super.initializeListeners_();

    this.inputEl_.addEventListener('input', () => {
      cancelAnimationFrame(this.currentRAF_);
      this.onDrag_();
    });

    // Release events.
    ['mouseup', 'touchend'].forEach((action) => {
      this.inputEl_.addEventListener(action, () => {
        this.onRelease_();
      });
    });
    this.inputEl_.addEventListener(
      'keydown',
      (event) => {
        const rtlDelta = this.storeService_.get(StateProperty.RTL_STATE)
          ? -1
          : 1;
        if (event.key === Keys_Enum.ENTER || event.key === Keys_Enum.SPACE) {
          this.onRelease_();
        } else if (event.key === Keys_Enum.LEFT_ARROW) {
          this.shift_(-rtlDelta);
          event.preventDefault();
        } else if (event.key === Keys_Enum.RIGHT_ARROW) {
          this.shift_(rtlDelta);
          event.preventDefault();
        }
      },
      true
    );
    // Drag events.
    this.inputEl_.addEventListener(
      'touchmove',
      (event) => event.stopPropagation(),
      true
    );

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_ID,
      (currPageId) => {
        const isPostState =
          this.rootEl_.classList.contains(POST_SELECTION_CLASS);
        if (isPostState) {
          // If it's already been interacted with, do not animate.
          return;
        }

        if (currPageId != this.getPageEl().getAttribute('id')) {
          // Resets animation when navigating away.
          cancelAnimationFrame(this.currentRAF_);
          clearTimeout(this.landingAnimationDelayTimeout_);
          this.inputEl_.value = 0;
          this.onDrag_();
          this.rootEl_.classList.remove(MID_SELECTION_CLASS);
          return;
        }
        let startTime;
        const animateFrame = (currTime) => {
          // Set current startTime if not defined.
          const hasData = this.rootEl_.classList.contains(
            'i-amphtml-story-interactive-has-data'
          );
          if (hasData) {
            // If it's already been interacted with, do not animate.
            return;
          }
          if (!startTime) {
            startTime = currTime;
          }
          const elapsed = currTime - startTime;
          if (HINT_ANIMATION_DURATION_MS < elapsed) {
            this.rootEl_.classList.remove(MID_SELECTION_CLASS);
            return;
          }
          // Value between 0 and 1;
          const timePercentage = elapsed / HINT_ANIMATION_DURATION_MS;
          const val =
            timePercentage < 0.5
              ? easeInOutCubic(timePercentage * 2) * 30
              : easeInOutCubic(2 - timePercentage * 2) * 30;
          this.inputEl_.value = val;
          this.onDrag_();
          this.currentRAF_ = requestAnimationFrame(animateFrame);
        };
        this.landingAnimationDelayTimeout_ = setTimeout(
          () => requestAnimationFrame(animateFrame),
          HINT_ANIMATION_DELAY_MS
        );
      },
      true
    );
  }

  /**
   * @private
   */
  onDrag_() {
    const {value} = this.inputEl_;
    if (this.sliderType_ == SliderType.PERCENTAGE) {
      this.bubbleEl_.textContent = Math.round(value) + '%';
    }
    this.rootEl_.classList.add(MID_SELECTION_CLASS);
    setImportantStyles(this.rootEl_, {'--fraction': value / 100});
  }

  /**
   * Move the slider by a given amount.
   * @param {number} delta
   */
  shift_(delta) {
    const value = parseFloat(this.inputEl_.value);
    this.inputEl_.value = value + delta;
    this.onDrag_();
  }

  /**
   * @private
   */
  onRelease_() {
    if (this.hasUserSelection_) {
      return;
    }
    this.updateToPostSelectionState_();
    this.inputEl_.setAttribute('disabled', '');
    this.rootEl_.classList.remove(MID_SELECTION_CLASS);
    this.handleOptionSelection_(Math.round(this.inputEl_.value));
  }

  /**@override */
  getNumberOfOptions() {
    return 101;
  }
}

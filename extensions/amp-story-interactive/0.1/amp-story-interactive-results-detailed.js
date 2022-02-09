import {htmlFor} from '#core/dom/static-template';
import {setImportantStyles} from '#core/dom/style';

import {InteractiveType} from './amp-story-interactive-abstract';
import {
  AmpStoryInteractiveResults,
  decideStrategy,
} from './amp-story-interactive-results';

import {CSS} from '../../../build/amp-story-interactive-results-detailed-0.1.css';

/**
 * @typedef {{
 *    element: !Element,
 *    answered: boolean
 * }} ResultElementType
 */

/**
 * Generates the template for the detailed results component.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsDetailedTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-detailed">
        <div class="i-amphtml-story-interactive-results-image"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

export class AmpStoryInteractiveResultsDetailed extends AmpStoryInteractiveResults {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {!Map<string, ResultElementType>} */
    this.resultEls_ = {};

    /** @private {?Element} */
    this.resultsContainer_ = null;

    /** @private {boolean} */
    this.usePercentage_ = false;
  }

  /** @override */
  buildCallback() {
    return super.buildCallback(CSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsDetailedTemplate(this.element);
    this.buildTop();
    this.resultsContainer_ = this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-detailed'
    );
    this.usePercentage_ = decideStrategy(this.options_) === 'percentage';
    return this.rootEl_;
  }

  /** @override */
  onInteractiveReactStateUpdate(interactiveState) {
    const components = Object.values(interactiveState);
    let updateLayout = false;

    components.forEach((e) => {
      if (
        (this.usePercentage_ && e.type === InteractiveType.QUIZ) ||
        (!this.usePercentage_ && e.type === InteractiveType.POLL)
      ) {
        if (!this.resultEls_[e.interactiveId]) {
          updateLayout = true;
          this.createResultEl_(e);
        }
        this.updateAnsweredResult_(e);
      }
    });

    if (updateLayout) {
      this.positionResultEls_();
    }

    super.onInteractiveReactStateUpdate(interactiveState);
  }

  /**
   * Create and store an element that will show the results
   * for an interactive component.
   *
   * @param {!./amp-story-interactive-results.InteractiveStateEntryType} e
   * @private
   */
  createResultEl_(e) {
    const element = document.createElement('div');
    element.classList.add('i-amphtml-story-interactive-results-result');
    this.resultsContainer_.appendChild(element);
    this.resultEls_[e.interactiveId] = {
      element,
      answered: false,
    };
  }

  /**
   * Sets the background image or text content for an answered result.
   *
   * @param {!./amp-story-interactive-results.InteractiveStateEntryType} e
   * @private
   */
  updateAnsweredResult_(e) {
    if (!e.option || this.resultEls_[e.interactiveId].answered) {
      return;
    }

    if (e.option.image) {
      setImportantStyles(this.resultEls_[e.interactiveId].element, {
        'background-image': 'url(' + e.option.image + ')',
      });
    } else {
      this.resultEls_[e.interactiveId].element.textContent = e.option.text;
    }
    this.resultEls_[e.interactiveId].answered = true;
  }

  /**
   * Sets (or resets) the positioning and sizing of each result.
   *
   * @private
   */
  positionResultEls_() {
    for (const id in this.resultEls_) {
      setImportantStyles(this.resultEls_[id].element, {
        'height': '5em',
        'width': '5em',
      });
    }
  }
}

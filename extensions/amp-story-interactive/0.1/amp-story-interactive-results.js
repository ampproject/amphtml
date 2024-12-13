import {htmlFor} from '#core/dom/static-template';
import {computedStyle, setStyle} from '#core/dom/style';

import {dev} from '#utils/log';

import {
  AmpStoryInteractive,
  InteractiveType,
} from './amp-story-interactive-abstract';

import {CSS} from '../../../build/amp-story-interactive-results-0.1.css';
import {StateProperty} from '../../amp-story/1.0/amp-story-store-service';

/**
 * @typedef {{
 *    category: ?string,
 *    percentage: ?number,
 * }}
 */
export let InteractiveResultsDef;

/**
 * @typedef {{
 *    option: ?./amp-story-interactive-abstract.OptionConfigType,
 *    interactiveId: string
 * }}
 */
export let InteractiveStateEntryType;

/**
 * Generates the template for the results component.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-container">
      <div class="i-amphtml-story-interactive-results-image-border">
        <div class="i-amphtml-story-interactive-results-image"></div>
      </div>
      <div class="i-amphtml-story-interactive-results-prompt"></div>
      <div class="i-amphtml-story-interactive-results-title"></div>
      <div class="i-amphtml-story-interactive-results-description"></div>
    </div>
  `;
};

/**
 * Generates the template for the top bar of the results component.
 *
 * @param {!Element} element
 * @return {!Element}
 */
const buildResultsTopTemplate = (element) => {
  const html = htmlFor(element);
  return html`
    <div class="i-amphtml-story-interactive-results-top">
      <div class="i-amphtml-story-interactive-results-top-score">SCORE:</div>
      <div class="i-amphtml-story-interactive-results-top-value">
        <span class="i-amphtml-story-interactive-results-top-value-number"
          >100</span
        ><span>%</span>
      </div>
    </div>
  `;
};

const HAS_IMAGE_CLASS = 'i-amphtml-story-interactive-has-image';
const HAS_SCORE_CLASS = 'i-amphtml-story-interactive-has-score';

/**
 * Processes the state and returns the condensed results.
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options needed to ensure the first options take precedence on ties
 * @return {InteractiveResultsDef} the results
 */
const processResults = (interactiveState, options) => {
  const processStrategy =
    decideStrategy(options) === 'category'
      ? processResultsCategory
      : processResultsPercentage;
  return processStrategy(interactiveState, options);
};

/**
 * Processes the state and returns the condensed results for a category strategy
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export const processResultsCategory = (interactiveState, options) => {
  const result = {category: null, percentage: null};

  // Add all categories in order to the map with value 0
  const categories = {};
  options.forEach((option) => {
    if (option.resultscategory) {
      categories[option.resultscategory] = 0;
    }
  });

  // Vote for category for each answered poll
  Object.values(interactiveState).forEach((e) => {
    if (e.type == InteractiveType.POLL) {
      if (
        e.option &&
        e.option.resultscategory &&
        categories[e.option.resultscategory] != null
      ) {
        categories[e.option.resultscategory] += 1;
      }
    }
  });

  // Returns category with most votes, first ones take precedence in ties
  result.category = Object.keys(categories).reduce((a, b) =>
    categories[a] >= categories[b] ? a : b
  );
  return result;
};

/**
 * Processes the state and returns the condensed results for a percentage strategy
 * @param {!Map<string, {option: ?./amp-story-interactive-abstract.OptionConfigType, interactiveId: string}>} interactiveState
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {InteractiveResultsDef} the results
 * @package
 */
export const processResultsPercentage = (interactiveState, options) => {
  const result = {category: null, percentage: null};

  // Count quizzes and correct quizzes
  let quizCount = 0;
  let quizCorrect = 0;
  Object.values(interactiveState).forEach((e) => {
    if (e.type == InteractiveType.QUIZ) {
      quizCount += 1;
      if (e.option && e.option.correct != null) {
        quizCorrect += 1;
      }
    }
  });

  // Percentage = (correct / total) but avoid divide by 0 error
  result.percentage = quizCount == 0 ? 0 : 100 * (quizCorrect / quizCount);

  // Get closest threshold that is lower than percentage, or lowest one if percentage is too low
  let minThresholdDiff = -100;
  options.forEach((option) => {
    // ThresholdDiff is positive if it's lower than percentage (desired)
    const currThresholdDiff =
      result.percentage - parseFloat(option.resultsthreshold);
    if (
      // Curr meets the requirement and (is better or min doesnt meet)
      (currThresholdDiff >= 0 &&
        (minThresholdDiff > currThresholdDiff || minThresholdDiff < 0)) ||
      // Curr doesnt meet the requirement, but min also doesnt and curr is better than min
      (currThresholdDiff < 0 &&
        minThresholdDiff < 0 &&
        currThresholdDiff > minThresholdDiff)
    ) {
      result.category = option.resultscategory;
      minThresholdDiff = currThresholdDiff;
    }
  });
  return result;
};

/**
 * Decides what strategy to use.
 * If there are thresholds specified, it uses percentage; otherwise it uses category.
 * @param {?Array<!./amp-story-interactive-abstract.OptionConfigType>} options the attributes on the component
 * @return {string} the strategy
 * @package
 */
export const decideStrategy = (options) => {
  return options.some((o) => {
    return o.resultsthreshold != undefined;
  })
    ? 'percentage'
    : 'category';
};

export class AmpStoryInteractiveResults extends AmpStoryInteractive {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element, InteractiveType.RESULTS, [2, 4]);
  }

  /** @override */
  buildCallback(additionalCSS = '') {
    return super.buildCallback(CSS + additionalCSS);
  }

  /** @override */
  buildComponent() {
    this.rootEl_ = buildResultsTemplate(this.element);
    this.buildTop();
    return this.rootEl_;
  }

  /**
   * Inserts the HTML for the top bar into the rest of the results component.
   *
   * @protected
   */
  buildTop() {
    this.rootEl_.prepend(buildResultsTopTemplate(this.element));
  }

  /** @override */
  layoutCallback() {
    if (this.element.hasAttribute('prompt-text')) {
      this.rootEl_.querySelector(
        '.i-amphtml-story-interactive-results-prompt'
      ).textContent = this.element.getAttribute('prompt-text');
    }
    this.storeService_.subscribe(
      StateProperty.INTERACTIVE_REACT_STATE,
      (data) => this.onInteractiveReactStateUpdate(data),
      true
    );
  }

  /**
   * Receives state updates and fills up DOM with the result
   * @param {!Map<string, InteractiveStateEntryType>} interactiveState
   * @protected
   */
  onInteractiveReactStateUpdate(interactiveState) {
    const results = processResults(interactiveState, this.options_);
    this.rootEl_.classList.toggle(HAS_SCORE_CLASS, results.percentage != null);
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-top-value-number'
    ).textContent = (results.percentage || 0).toFixed(0);
    this.options_.forEach((e) => {
      if (e.resultscategory === results.category) {
        this.mutateElement(() => {
          this.updateCategory_(e);
          this.updateToPostSelectionState_(null);
        });
      }
    });
  }

  /**
   * Updates the element with the correct category
   * @param {./amp-story-interactive-abstract.OptionConfigType} categorySelected
   * @private
   */
  updateCategory_(categorySelected) {
    this.rootEl_.classList.toggle(
      HAS_IMAGE_CLASS,
      categorySelected.image != null
    );
    if (categorySelected.image) {
      setStyle(
        this.rootEl_.querySelector(
          '.i-amphtml-story-interactive-results-image'
        ),
        'background',
        'url(' + categorySelected.image + ')'
      );
    }
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-title'
    ).textContent = categorySelected.resultscategory;
    this.rootEl_.querySelector(
      '.i-amphtml-story-interactive-results-description'
    ).textContent = categorySelected.text || '';
    this.rootEl_.classList.toggle(
      'i-amphtml-story-interactive-results-top-transparent',
      this.scoreBackgroundIsTransparent_()
    );
  }

  /** @override */
  handleTap_(unusedEvent) {
    // Disallow click handler since there are no options.
  }

  /** @override */
  displayOptionsData(unusedOptionsData) {
    // TODO(mszylkowski): Show percentages of categories if endpoint.
  }

  /** @override */
  updateStoryStoreState_(unusedOption) {
    // Prevent from updating the state.
  }

  /**
   * Check score background has a color with alpha 0, used to adjust layout
   * @return {boolean}
   * @private
   **/
  scoreBackgroundIsTransparent_() {
    const bgColor = computedStyle(
      this.win,
      dev().assertElement(
        this.rootEl_.querySelector('.i-amphtml-story-interactive-results-top')
      )
    )['background'];
    // Check the background starts with rgba and doesn't contain other colors (no gradients)
    if (bgColor.startsWith('rgba') && bgColor.lastIndexOf('rgb') == 0) {
      // If single rgba color, return alpha == 0
      return parseFloat(bgColor.split(', ')[3].split(')')[0]) == 0;
    }
    return false;
  }
}

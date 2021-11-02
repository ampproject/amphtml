import * as Preact from '#core/dom/jsx';
import {Action, getStoreService} from './amp-story-store-service';
import {LoadingSpinner} from './loading-spinner';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {localize} from './amp-story-localization-service';
import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';

/**
 * @enum {string}
 */
const FormResponseAttribute = {
  SUBMITTING: 'submitting',
  SUCCESS: 'submit-success',
  ERROR: 'submit-error',
};

/**
 * @enum {string}
 */
const AttributeElementSelector = {
  SUBMITTING: `[${escapeCssSelectorIdent(FormResponseAttribute.SUBMITTING)}]`,
  SUCCESS: `[${escapeCssSelectorIdent(FormResponseAttribute.SUCCESS)}]`,
  ERROR: `[${escapeCssSelectorIdent(FormResponseAttribute.ERROR)}]`,
};

/**
 * Adds AMP form actions to the action allow list.
 * @param {!Window} win
 */
export function allowlistFormActions(win) {
  const storeService = getStoreService(win);
  storeService.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
    {tagOrTarget: 'FORM', method: 'clear'},
    {tagOrTarget: 'FORM', method: 'submit'},
  ]);
}

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     added.
 * @private
 */
export function setupResponseAttributeElements(formEl) {
  const submittingEl = scopedQuerySelector(
    formEl,
    AttributeElementSelector.SUBMITTING
  );
  const successEl = scopedQuerySelector(
    formEl,
    AttributeElementSelector.SUCCESS
  );
  const errorEl = scopedQuerySelector(formEl, AttributeElementSelector.ERROR);

  // Create and append fallback form attribute elements, if necessary.
  if (!submittingEl) {
    formEl.appendChild(createFormSubmittingEl_());
  }
  if (!successEl) {
    formEl.appendChild(createFormResultEl_(formEl, true));
  }
  if (!errorEl) {
    formEl.appendChild(createFormResultEl_(formEl, false));
  }
}

/**
 * @param {!Element} formEl The form to which the attribute elements belong.
 * @return {!Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function getResponseAttributeElements(formEl) {
  const selector =
    `${AttributeElementSelector.SUBMITTING},` +
    `${AttributeElementSelector.SUCCESS},` +
    `${AttributeElementSelector.ERROR}`;
  return Array.from(scopedQuerySelectorAll(formEl, selector));
}

/**
 * Create an element that is used to display the in-progress state of a form
 * submission attempt.
 * @return {!Element}
 * @private
 */
function createFormSubmittingEl_() {
  const loadingSpinner = new LoadingSpinner();
  const submittingEl = createResponseAttributeEl_(
    FormResponseAttribute.SUBMITTING,
    loadingSpinner.build()
  );
  loadingSpinner.toggle(true /* isActive */);
  return submittingEl;
}

/**
 * Create an element that is used to display the result of a form submission
 * attempt.
 * @param {!Element} formEl
 * @param {boolean} isSuccess Whether the form submission was successful.
 * @return {!Element}
 * @private
 */
function createFormResultEl_(formEl, isSuccess) {
  return createResponseAttributeEl_(
    isSuccess ? FormResponseAttribute.SUCCESS : FormResponseAttribute.ERROR,
    [
      <div clas="i-amphtml-story-page-attachment-form-submission-status-icon"></div>,
      <div>
        {localize(
          formEl,
          isSuccess
            ? LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_SUCCESS
            : LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_ERROR
        )}
      </div>,
    ]
  );
}

/**
 * Create an element that is used to display the form status corresponding to
 * the given response attribute.
 * @param {!FormResponseAttribute} responseAttribute
 * @param {Array<Element>|?Element=} child
 * @return {!Element}
 * @private
 */
function createResponseAttributeEl_(responseAttribute, child) {
  return (
    <div>
      <div
        class="i-amphtml-story-page-attachment-form-submission-status"
        {...{[responseAttribute]: true}}
      >
        {child}
      </div>
    </div>
  );
}

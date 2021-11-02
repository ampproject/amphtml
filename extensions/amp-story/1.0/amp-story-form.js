import {ACTION_ENUM, getStoreService} from './amp-story-store-service';
import {LoadingSpinner} from './loading-spinner';
import {LOCALIZED_STRING_ID_ENUM} from '#service/localization/strings';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {localize} from './amp-story-localization-service';
import {htmlFor} from '#core/dom/static-template';
import {scopedQuerySelector, scopedQuerySelectorAll} from '#core/dom/query';

/**
 * @enum {string}
 */
const FORM_RESPONSE_ATTRIBUTE_ENUM = {
  SUBMITTING: 'submitting',
  SUCCESS: 'submit-success',
  ERROR: 'submit-error',
};

/**
 * @enum {string}
 */
const ATTRIBUTE_ELEMENT_SELECTOR_ENUM = {
  SUBMITTING: `[${escapeCssSelectorIdent(
    FORM_RESPONSE_ATTRIBUTE_ENUM.SUBMITTING
  )}]`,
  SUCCESS: `[${escapeCssSelectorIdent(FORM_RESPONSE_ATTRIBUTE_ENUM.SUCCESS)}]`,
  ERROR: `[${escapeCssSelectorIdent(FORM_RESPONSE_ATTRIBUTE_ENUM.ERROR)}]`,
};

/**
 * Adds AMP form actions to the action allow list.
 * @param {!Window} win
 */
export function allowlistFormActions(win) {
  const storeService = getStoreService(win);
  storeService.dispatch(ACTION_ENUM.ADD_TO_ACTIONS_ALLOWLIST, [
    {tagOrTarget: 'FORM', method: 'clear'},
    {tagOrTarget: 'FORM', method: 'submit'},
  ]);
}

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Window} win
 * @param {!Element} formEl The form to which the attribute elements will be
 *     added.
 * @private
 */
export function setupResponseAttributeElements(win, formEl) {
  let submittingEl = scopedQuerySelector(
    formEl,
    ATTRIBUTE_ELEMENT_SELECTOR_ENUM.SUBMITTING
  );
  let successEl = scopedQuerySelector(
    formEl,
    ATTRIBUTE_ELEMENT_SELECTOR_ENUM.SUCCESS
  );
  let errorEl = scopedQuerySelector(
    formEl,
    ATTRIBUTE_ELEMENT_SELECTOR_ENUM.ERROR
  );

  // Create and append fallback form attribute elements, if necessary.
  if (!submittingEl) {
    submittingEl = createFormSubmittingEl_(win, formEl);
    formEl.appendChild(submittingEl);
  }
  if (!successEl) {
    successEl = createFormResultEl_(win, formEl, true);
    formEl.appendChild(successEl);
  }
  if (!errorEl) {
    errorEl = createFormResultEl_(win, formEl, false);
    formEl.appendChild(errorEl);
  }
}

/**
 * @param {!Element} formEl The form to which the attribute elements belong.
 * @return {!Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function getResponseAttributeElements(formEl) {
  const selector = `
    ${ATTRIBUTE_ELEMENT_SELECTOR_ENUM.SUBMITTING},
    ${ATTRIBUTE_ELEMENT_SELECTOR_ENUM.SUCCESS},
    ${ATTRIBUTE_ELEMENT_SELECTOR_ENUM.ERROR}`;
  return Array.from(scopedQuerySelectorAll(formEl, selector));
}

/**
 * Create an element that is used to display the in-progress state of a form
 * submission attempt.
 * @param {!Window} win
 * @param {!Element} formEl The form to which the `submitting` element will be
 *     added.
 * @return {!Element}
 * @private
 */
function createFormSubmittingEl_(win, formEl) {
  const submittingEl = createResponseAttributeEl_(
    formEl,
    FORM_RESPONSE_ATTRIBUTE_ENUM.SUBMITTING
  );
  const loadingSpinner = new LoadingSpinner(win.document);
  submittingEl.firstElementChild.appendChild(loadingSpinner.build());
  loadingSpinner.toggle(true /* isActive */);
  return submittingEl;
}

/**
 * Create an element that is used to display the result of a form submission
 * attempt.
 * @param {!Window} win
 * @param {!Element} formEl The form to which the result element will be added.
 * @param {boolean} isSuccess Whether the form submission was successful.
 * @return {!Element}
 * @private
 */
function createFormResultEl_(win, formEl, isSuccess) {
  const resultEl = createResponseAttributeEl_(
    formEl,
    isSuccess
      ? FORM_RESPONSE_ATTRIBUTE_ENUM.SUCCESS
      : FORM_RESPONSE_ATTRIBUTE_ENUM.ERROR
  );

  const iconEl = win.document.createElement('div');
  iconEl.classList.add(
    'i-amphtml-story-page-attachment-form-submission-status-icon'
  );
  resultEl.firstElementChild.appendChild(iconEl);

  const textEl = win.document.createElement('div');
  textEl.textContent = localize(
    win.document,
    isSuccess
      ? LOCALIZED_STRING_ID_ENUM.AMP_STORY_FORM_SUBMIT_SUCCESS
      : LOCALIZED_STRING_ID_ENUM.AMP_STORY_FORM_SUBMIT_ERROR
  );
  resultEl.firstElementChild.appendChild(textEl);

  return resultEl;
}

/**
 * Create an element that is used to display the form status corresponding to
 * the given response attribute.
 * @param {!Element} formEl The form to which the `submitting` element will be
 *     added.
 * @param {!FormResponseAttribute} responseAttribute
 * @return {!Element}
 * @private
 */
function createResponseAttributeEl_(formEl, responseAttribute) {
  const statusEl = htmlFor(formEl)`
    <div><div class="i-amphtml-story-page-attachment-form-submission-status"></div></div>`;
  statusEl.setAttribute(responseAttribute, '');
  return statusEl;
}

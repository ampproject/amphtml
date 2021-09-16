import {Action, getStoreService} from './amp-story-store-service';
import {LoadingSpinner} from './loading-spinner';
import {LocalizedStringId} from '#service/localization/strings';
import {devAssert} from '../../../src/log';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {getLocalizationService} from './amp-story-localization-service';
import {htmlFor} from '#core/dom/static-template';

/**
 * @enum {string}
 */
const FormResponseAttribute = {
  SUBMITTING: 'submitting',
  SUCCESS: 'submit-success',
  ERROR: 'submit-error',
};

/**
 * Adds AMP form actions to the action allow list.
 * @param {!AmpElement} ampEl The AMP element to which the form belongs.
 */
export function allowlistFormActions(ampEl) {
  const storeService = getStoreService(ampEl.win);
  storeService.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
    {tagOrTarget: 'FORM', method: 'clear'},
    {tagOrTarget: 'FORM', method: 'submit'},
  ]);
}

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!AmpElement} ampEl The AMP element to which the form belongs.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     added.
 * @private
 */
export function addMissingResponseAttributeElements(ampEl, formEl) {
  let submittingEl = formEl.querySelector(
    `[${escapeCssSelectorIdent(FormResponseAttribute.SUBMITTING)}]`
  );
  if (!submittingEl) {
    submittingEl = createFormSubmittingEl_(ampEl, formEl);
    formEl.appendChild(submittingEl);
  }
  new ampEl.win.ResizeObserver(() => {
    // Scroll the `submitting` element into view when it is displayed. The
    // scroll seems to require a small timeout in order to consistently work.
    setTimeout(() => {
      submittingEl./*OK*/ scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 25);
  }).observe(submittingEl);

  const successEl = formEl.querySelector(
    `[${escapeCssSelectorIdent(FormResponseAttribute.SUCCESS)}]`
  );
  if (!successEl) {
    formEl.appendChild(createFormResultEl_(ampEl, formEl, true));
  }

  const errorEl = formEl.querySelector(
    `[${escapeCssSelectorIdent(FormResponseAttribute.ERROR)}]`
  );
  if (!errorEl) {
    formEl.appendChild(createFormResultEl_(ampEl, formEl, false));
  }
}

/**
 * Create an element that is used to display the in-progress state of a form
 * submission attempt.
 * @param {!AmpElement} ampEl The AMP element to which the form belongs.
 * @param {!Element} formEl The form to which the `submitting` element will be
 *     added.
 * @return {!Element}
 * @private
 */
function createFormSubmittingEl_(ampEl, formEl) {
  const submittingEl = createResponseAttributeEl_(
    formEl,
    FormResponseAttribute.SUBMITTING
  );
  const loadingSpinner = new LoadingSpinner(ampEl.win.document);
  submittingEl.firstElementChild.appendChild(loadingSpinner.build());
  loadingSpinner.toggle(true /* isActive */);
  return submittingEl;
}

/**
 * Create an element that is used to display the result of a form submission
 * attempt.
 * @param {!AmpElement} ampEl The AMP element to which the form belongs.
 * @param {!Element} formEl The form to which the result element will be added.
 * @param {boolean} isSuccess Whether the form submission was successful.
 * @return {!Element}
 * @private
 */
function createFormResultEl_(ampEl, formEl, isSuccess) {
  const resultEl = createResponseAttributeEl_(
    formEl,
    isSuccess ? FormResponseAttribute.SUCCESS : FormResponseAttribute.ERROR
  );

  const iconEl = ampEl.win.document.createElement('div');
  iconEl.classList.add(
    'i-amphtml-story-page-attachment-form-submission-status-icon'
  );
  resultEl.firstElementChild.appendChild(iconEl);

  const textEl = ampEl.win.document.createElement('div');
  const localizationService = getLocalizationService(devAssert(ampEl.element));
  textEl.textContent = localizationService.getLocalizedString(
    isSuccess
      ? LocalizedStringId.AMP_STORY_FORM_SUBMIT_SUCCESS
      : LocalizedStringId.AMP_STORY_FORM_SUBMIT_ERROR
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

import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {localizeTemplate} from 'extensions/amp-story/1.0/amp-story-localization-service';

import {Action} from '../../amp-story/1.0/amp-story-store-service';
import {
  renderLoadingSpinner,
  toggleLoadingSpinner,
} from '../../amp-story/1.0/loading-spinner';

/**
 * Adds AMP form actions to the action allow list.
 * @param {!Window} win
 */
export function allowlistFormActions(win) {
  const storeService = Services.storyStoreService(win);
  storeService.dispatch(Action.ADD_TO_ACTIONS_ALLOWLIST, [
    {tagOrTarget: 'FORM', method: 'clear'},
    {tagOrTarget: 'FORM', method: 'submit'},
  ]);
}

/**
 * @typedef {!Element|Array<!Element>|string}
 */
let FormElementChildrenDef;

/**
 * @const {{[key: string]: (function(Element):!FormElementChildrenDef|function():!FormElementChildrenDef)}}
 */
const createStatusChildrenByAttribute = {
  'submitting': () => toggleLoadingSpinner(renderLoadingSpinner(), true),

  'submit-success': () =>
    createFormResultChildren(
      LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_SUCCESS
    ),
  'submit-error': () =>
    createFormResultChildren(
      LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_ERROR
    ),
};

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     selected or added.
 * @param {!Element} storyEl
 * @return {Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function setupResponseAttributeElements(formEl, storyEl) {
  const elements = Object.keys(createStatusChildrenByAttribute).map((attr) => {
    const selected = formEl.querySelector(`[${escapeCssSelectorIdent(attr)}]`);
    if (selected) {
      return selected;
    }
    const created = (
      <div>
        <div class="i-amphtml-story-page-attachment-form-submission-status">
          {createStatusChildrenByAttribute[attr]()}
        </div>
      </div>
    );
    created.setAttribute(attr, '');
    return formEl.appendChild(created);
  });
  localizeTemplate(formEl, storyEl);
  return elements;
}

/**
 * @param {!LocalizedStringId_Enum} localizedStringId
 * @return {!FormElementChildrenDef}
 * @private
 */
function createFormResultChildren(localizedStringId) {
  return [
    <div class="i-amphtml-story-page-attachment-form-submission-status-icon"></div>,
    <div i-amphtml-i18n-text-content={localizedStringId}></div>,
  ];
}

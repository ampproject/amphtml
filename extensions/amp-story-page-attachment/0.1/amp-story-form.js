import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

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
 * @const {Object<string, (function(Element):!FormElementChildrenDef|function():!FormElementChildrenDef)>}
 */
const createStatusChildrenByAttribute = {
  'submitting': () => toggleLoadingSpinner(renderLoadingSpinner(), true),

  'submit-success': (localizationService) =>
    createFormResultChildren(
      localizationService.getLocalizedString(
        LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_SUCCESS
      )
    ),

  'submit-error': (localizationService) =>
    createFormResultChildren(
      localizationService.getLocalizedString(
        LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_ERROR
      )
    ),
};

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     selected or added.
 * @param {!../../../src/service/localization.LocalizationService} localizationService
 * @return {Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function setupResponseAttributeElements(formEl, localizationService) {
  return Object.keys(createStatusChildrenByAttribute).map((attr) => {
    const selected = formEl.querySelector(`[${escapeCssSelectorIdent(attr)}]`);
    if (selected) {
      return selected;
    }
    const created = (
      <div>
        <div class="i-amphtml-story-page-attachment-form-submission-status">
          {createStatusChildrenByAttribute[attr](localizationService)}
        </div>
      </div>
    );
    created.setAttribute(attr, '');
    return formEl.appendChild(created);
  });
}

/**
 * @param {!FormElementChildrenDef} label
 * @return {!FormElementChildrenDef}
 * @private
 */
function createFormResultChildren(label) {
  return [
    <div class="i-amphtml-story-page-attachment-form-submission-status-icon"></div>,
    <div>{label}</div>,
  ];
}

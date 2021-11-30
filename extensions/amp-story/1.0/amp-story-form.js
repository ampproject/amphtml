import * as Preact from '#core/dom/jsx';
import {Action, getStoreService} from './amp-story-store-service';
import {renderLoadingSpinner, toggleLoadingSpinner} from './loading-spinner';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {localize} from './amp-story-localization-service';

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
 * @typedef {!Element|Array<!Element>|string}
 */
let FormElementChildrenDef;

/**
 * @const {Object<string, (function(Element):!FormElementChildrenDef|function():!FormElementChildrenDef)>}
 */
const createStatusChildrenByAttribute = {
  'submitting': () => toggleLoadingSpinner(renderLoadingSpinner(), true),

  'submit-success': (formEl) =>
    createFormResultChildren(
      localize(formEl, LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_SUCCESS)
    ),

  'submit-error': (formEl) =>
    createFormResultChildren(
      localize(formEl, LocalizedStringId_Enum.AMP_STORY_FORM_SUBMIT_ERROR)
    ),
};

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     selected or added.
 * @return {Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function setupResponseAttributeElements(formEl) {
  return Object.keys(createStatusChildrenByAttribute).map((attr) => {
    const selected = formEl.querySelector(`[${escapeCssSelectorIdent(attr)}]`);
    if (selected) {
      return selected;
    }
    const created = (
      <div>
        <div class="i-amphtml-story-page-attachment-form-submission-status">
          {createStatusChildrenByAttribute[attr](formEl)}
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

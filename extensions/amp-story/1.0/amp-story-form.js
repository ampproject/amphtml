import * as Preact from '#core/dom/jsx';
import {Action, getStoreService} from './amp-story-store-service';
import {LoadingSpinner} from './loading-spinner';
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
 * @typedef {!Element|Array<!Element>}
 */
let FormElementChildrenDef;

/**
 * @const {Object<string, (function(Element):!FormElementChildrenDef|function():!FormElementChildrenDef)>}
 */
const createStatusChildrenByAttribute = {
  'submitting': () => {
    const loadingSpinner = new LoadingSpinner();
    const element = loadingSpinner.build();
    loadingSpinner.toggle(true /* isActive */);
    return element;
  },

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
 * @param {Element} parent
 * @param {string} attr
 * @return {?Element}
 */
function selectByAttr(parent, attr) {
  return parent.querySelector(`[${escapeCssSelectorIdent(attr)}]`);
}

/**
 * Add a default form attribute element for each absent response attribute.
 * @param {!Element} formEl The form to which the attribute elements will be
 *     added.
 * @private
 */
export function setupResponseAttributeElements(formEl) {
  for (const attribute in createStatusChildrenByAttribute) {
    const el = selectByAttr(formEl, attribute);
    if (!el) {
      const children = createStatusChildrenByAttribute[attribute](formEl);
      const element = (
        <div {...{[attribute]: true}}>
          <div class="i-amphtml-story-page-attachment-form-submission-status">
            {children}
          </div>
        </div>
      );
      formEl.appendChild(element);
    }
  }
}

/**
 * @param {!Element} formEl The form to which the attribute elements belong.
 * @return {!Array<!Element>} The list of response attribute elements that
 *     belong to the given form.
 * @private
 */
export function getResponseAttributeElements(formEl) {
  return Object.keys(createStatusChildrenByAttribute).map((attr) =>
    selectByAttr(formEl, attr)
  );
}

/**
 * @param {string|Node} label
 * @return {!Element}
 * @private
 */
function createFormResultChildren(label) {
  return [
    <div class="i-amphtml-story-page-attachment-form-submission-status-icon"></div>,
    <div>{label}</div>,
  ];
}

import {AmpEvents_Enum} from '#core/constants/amp-events';
import {isDisabled, isFieldDefault, isFieldEmpty} from '#core/dom/form';
import {map} from '#core/types/object';

import {createCustomEvent} from '#utils/event-helper';
import {dev} from '#utils/log';

import {createFormDataWrapper} from '../../../src/form-data-wrapper';

export const DIRTINESS_INDICATOR_CLASS = 'amp-form-dirty';

/** @private {!{[key: string]: boolean}} */
const SUPPORTED_TAG_NAMES = {
  'INPUT': true,
  'SELECT': true,
  'TEXTAREA': true,
};

export class FormDirtiness {
  /**
   * @param {!HTMLFormElement} form
   * @param {!Window} win
   */
  constructor(form, win) {
    /** @private @const {!HTMLFormElement} */
    this.form_ = form;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {number} */
    this.dirtyFieldCount_ = 0;

    /** @private {!{[key: string]: boolean}} */
    this.isFieldNameDirty_ = map();

    /** @private {?FormData} */
    this.submittedFormData_ = null;

    /** @private {boolean} */
    this.isSubmitting_ = false;

    /** @private {boolean} */
    this.wasDirty_ = false;

    this.installEventHandlers_();

    // New forms are usually clean. However, if `amp-bind` mutates a form field
    // before the `amp-form` is initialized, the `amp-form` will miss the
    // `FORM_VALUE_CHANGE` event dispatched.
    this.determineInitialDirtiness_();
  }

  /**
   * Processes dirtiness state when a form is being submitted. This puts the
   * form in a "submitting" state, and temporarily clears the dirtiness state.
   */
  onSubmitting() {
    this.isSubmitting_ = true;
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * Processes dirtiness state when the form submission fails. This clears the
   * "submitting" state and reverts the form's dirtiness state.
   */
  onSubmitError() {
    this.isSubmitting_ = false;
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * Processes dirtiness state when the form submission succeeds. This clears
   * the "submitting" state and the form's overall dirtiness.
   */
  onSubmitSuccess() {
    this.isSubmitting_ = false;
    this.submittedFormData_ = this.takeFormDataSnapshot_();
    this.clearDirtyFields_();
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * @return {!FormData}
   * @private
   */
  takeFormDataSnapshot_() {
    return createFormDataWrapper(this.win_, this.form_).getFormData();
  }

  /**
   * Adds or removes the `amp-form-dirty` class and dispatches a
   * `FORM_DIRTINESS_CHANGE` event that reflects the current dirtiness state,
   * when the form dirtiness state changes. Does nothing otherwise.
   * @private
   */
  updateClassAndDispatchEventIfDirtyStateChanged_() {
    const isDirty = this.dirtyFieldCount_ > 0 && !this.isSubmitting_;

    if (isDirty !== this.wasDirty_) {
      this.form_.classList.toggle(DIRTINESS_INDICATOR_CLASS, isDirty);

      const formDirtinessChangeEvent = createCustomEvent(
        this.win_,
        AmpEvents_Enum.FORM_DIRTINESS_CHANGE,
        {'isDirty': isDirty},
        {bubbles: true}
      );
      this.form_.dispatchEvent(formDirtinessChangeEvent);
    }

    this.wasDirty_ = isDirty;
  }

  /**
   * @private
   */
  installEventHandlers_() {
    this.form_.addEventListener('input', this.onInput_.bind(this));
    this.form_.addEventListener('reset', this.onReset_.bind(this));

    // `amp-bind` dispatches the custom event `FORM_VALUE_CHANGE` when it
    // mutates the value of a form field (e.g. textarea, input, etc)
    this.form_.addEventListener(
      AmpEvents_Enum.FORM_VALUE_CHANGE,
      this.onInput_.bind(this)
    );
  }

  /** @private */
  determineInitialDirtiness_() {
    for (let i = 0; i < this.form_.elements.length; ++i) {
      this.checkDirtinessAfterUserInteraction_(this.form_.elements[i]);
    }
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * Listens to form field value changes, determines the field's dirtiness, and
   * updates the form's overall dirtiness.
   * @param {!Event} event
   * @private
   */
  onInput_(event) {
    const field = dev().assertElement(event.target);
    this.checkDirtinessAfterUserInteraction_(field);
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * Listens to the form reset event, and clears the overall dirtiness.
   * @param {!Event} unusedEvent
   * @private
   */
  onReset_(unusedEvent) {
    this.clearDirtyFields_();
    this.updateClassAndDispatchEventIfDirtyStateChanged_();
  }

  /**
   * Determine the given field's dirtiness.
   * @param {!Element} field
   * @private
   */
  checkDirtinessAfterUserInteraction_(field) {
    if (shouldSkipDirtinessCheck(field)) {
      return;
    }

    if (
      isFieldEmpty(field) ||
      isFieldDefault(field) ||
      this.isFieldSameAsLastSubmission_(field)
    ) {
      this.removeDirtyField_(field.name);
    } else {
      this.addDirtyField_(field.name);
    }
  }

  /**
   * Returns true if the form field's current value matches its most recent
   * submitted value.
   * @param {!Element} field
   * @return {boolean}
   * @private
   */
  isFieldSameAsLastSubmission_(field) {
    if (!this.submittedFormData_) {
      return false;
    }
    const {name, value} = field;
    return this.submittedFormData_.get(name) === value;
  }

  /**
   * Mark the field as dirty and increase the overall dirty field count, if the
   * field is previously clean.
   * @param {string} fieldName
   * @private
   */
  addDirtyField_(fieldName) {
    if (!this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = true;
      ++this.dirtyFieldCount_;
    }
  }

  /**
   * Mark the field as clean and decrease the overall dirty field count, if the
   * field is previously dirty.
   * @param {string} fieldName
   * @private
   */
  removeDirtyField_(fieldName) {
    if (this.isFieldNameDirty_[fieldName]) {
      this.isFieldNameDirty_[fieldName] = false;
      --this.dirtyFieldCount_;
    }
  }

  /**
   * Clears the dirty field name map and counter.
   * @private
   */
  clearDirtyFields_() {
    this.isFieldNameDirty_ = map();
    this.dirtyFieldCount_ = 0;
  }
}

/**
 * Returns true if the form should be subject to dirtiness check. Unsupported
 * elements, disabled elements, hidden elements, or elements without the `name`
 * attribute are skipped.
 * @param {!Element} field
 * @return {boolean}
 */
function shouldSkipDirtinessCheck(field) {
  const {hidden, name, tagName} = field;

  if (!SUPPORTED_TAG_NAMES[tagName]) {
    return true;
  }

  return !name || hidden || isDisabled(field);
}

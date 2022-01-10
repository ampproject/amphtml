/**
 * Attributes
 *
 * Components implementing the AsyncInput,
 * are expected to assert these attributes
 * at the appropriate time.
 *
 * @enum {string}
 */
export const AsyncInputAttributes_Enum = {
  /**
   * data-name
   *
   * Required attribute that must be asserted by every async-input
   * Element. This is used by AMP form to add the key
   * for the form submission request
   */
  NAME: 'name',
};

/**
 * Classes
 *
 * Components implementing the AsyncInput,
 * are expected to add the following classes
 * at the appropriate time.
 *
 * @enum {string}
 */
export const AsyncInputClasses_Enum = {
  /**
   * i-amphtml-async-input
   *
   * Required base class that must be added to the async-input
   * element on buildCallback or layoutCallback.
   * This will be used by other amp components to find
   * and use async-input elements.
   */
  ASYNC_INPUT: 'i-amphtml-async-input',
  /**
   * i-async-require-action
   *
   * Class that is added when the async call should be treated
   * as a required action for the form. These calls will be
   * executed before the presubmit calls of all async inputs.
   */
  ASYNC_REQUIRED_ACTION: 'i-async-require-action',
};

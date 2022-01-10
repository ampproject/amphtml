/**
 * Interface for all AMP Async Input Elements.
 * enforces the overridable function, getValue().
 * Async Input should be implemented
 * by components like AMP form, to async request
 * a value from a component, and then be used for
 * some other action. For examples, this can be used
 * by reCAPTCHA to request tokens for the form.
 *
 * NOTE: Elements that implemented AsyncInput must
 * Also add and follow the other exported constants.
 * See amp-recaptcha-input as an example.
 */
export interface AsyncInput {
  // Called to get the asynchronous value of an AsyncInput field.
  getValue: () => Promise<string>;
}

export * from './async-input.js';

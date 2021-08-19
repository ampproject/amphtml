import {Observable} from '#core/data-structures/observable';

/**
 * @typedef {{
 *   form: !HTMLFormElement,
 *   actionXhrMutator: function(string)
 * }}
 */
export let FormSubmitEventDef;

export class FormSubmitService {
  /**
   * Global service used to register callbacks we wish to execute when an
   * amp-form is submitted.
   */
  constructor() {
    this.observable_ = new Observable();
  }

  /**
   * Used to register callbacks.
   * @param {function(!FormSubmitEventDef)} cb
   * @return {!UnlistenDef}
   */
  beforeSubmit(cb) {
    return this.observable_.add(cb);
  }

  /**
   * Fired when form is submitted.
   * @param {!FormSubmitEventDef} event
   */
  fire(event) {
    this.observable_.fire(event);
  }
}

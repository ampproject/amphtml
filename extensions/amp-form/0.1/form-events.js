/** @enum {string} */
export const FormEvents = {
  INVALID: 'invalid',
  SERVICE_INIT: 'amp:form-service:initialize', // Dispatched by the window when AmpFormService initializes.
  SUBMIT_ERROR: 'submit-error',
  SUBMIT_SUCCESS: 'submit-success',
  SUBMIT: 'submit',
  VALID: 'valid',
  VERIFY_ERROR: 'verify-error',
  VERIFY: 'verify',
};

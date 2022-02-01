/**
 * Common AMP events.
 * @enum {string}
 */
export const AmpEvents_Enum = {
  DOM_UPDATE: 'amp:dom-update',
  FORM_DIRTINESS_CHANGE: 'amp:form-dirtiness-change',
  FORM_VALUE_CHANGE: 'amp:form-value-change',
  VISIBILITY_CHANGE: 'amp:visibilitychange', // https://github.com/ampproject/amphtml/blob/main/ads/README.md#page-visibility
  // The following codes are only used for testing.
  // TODO(choumx): Move these to a separate enum so they can be DCE'd.
  ATTACHED: 'amp:attached',
  STUBBED: 'amp:stubbed',
  LOAD_START: 'amp:load-start',
  LOAD_END: 'amp:load-end',
  ERROR: 'amp:error',
  SIZE_CHANGED: 'amp:size-changed',
  UNLOAD: 'amp:unload',
};

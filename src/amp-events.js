/**
* Enum used to specify custom Amp Events
*
* @constant {!Object<string, string>}
*/
export const AmpEvents = {
  VISIBILITY_CHANGE: 'amp:visibilitychange',
  BIND: {
    INITIALIZE: 'amp:bind:initialize',
    RESCAN_TEMPLATE: 'amp:bind:rescan-template',
    SET_STATE: 'amp:bind:setState',
  },
  TEMPLATE_RENDERED: 'amp:template-rendered',
  DOM_UPDATE: 'amp:dom-update',
  BUILT: 'amp:built',
  ATTACHED: 'amp:attached',
  STUBBED: 'amp:stubbed',
  LOAD: {
    START: 'amp:load:start',
    END: 'amp:load:end',
  },
  ERROR: 'amp:error',
};

/*
* Enum used to specify custom Amp Events
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
// 'amp:visibilitychange'
// 'amp:bind:setState'
// 'amp:template-rendered'
// 'amp:bind:initialize'
// 'amp:bind:rescan-template'
// 'amp:dom-update'
// 'amp:built'
// 'amp:attached'
// 'amp:stubbed'
// 'amp:load:start'
// 'amp:load:end'
// 'amp:error'

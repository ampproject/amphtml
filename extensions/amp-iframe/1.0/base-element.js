import {PreactBaseElement} from '#preact/base-element';

import {BentoIframe} from './component';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoIframe;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'src'},
  'srcdoc': {attr: 'srcdoc'},
  'sandbox': {attr: 'sandbox'},
  'allowFullScreen': {attr: 'allowfullscreen'},
  'allowPaymentRequest': {attr: 'allowpaymentrequest'},
  'referrerPolicy': {attr: 'referrerpolicy'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

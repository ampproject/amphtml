import {Iframe} from './component';
import {PreactBaseElement} from '#preact/base-element';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Iframe;

/** @override */
BaseElement['props'] = {
  'src': {attr: 'src'},
  'srcdoc': {attr: 'srcdoc'},
  'sandbox': {attr: 'sandbox'},
  'allowFullScreen': {attr: 'allowfullscreen'},
  'allowPaymentRequest': {attr: 'allowpaymentrequest'},
  'allowTransparency': {attr: 'allowtransparency'},
  'referrerPolicy': {attr: 'referrerpolicy'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

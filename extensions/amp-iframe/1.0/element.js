export {BentoIframe as Component} from './component';

export const props = {
  'src': {attr: 'src'},
  'srcdoc': {attr: 'srcdoc'},
  'sandbox': {attr: 'sandbox'},
  'allowFullScreen': {attr: 'allowfullscreen'},
  'allowPaymentRequest': {attr: 'allowpaymentrequest'},
  'referrerPolicy': {attr: 'referrerpolicy'},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

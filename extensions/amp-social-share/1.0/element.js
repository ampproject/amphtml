import {CSS as COMPONENT_CSS} from './component.jss';
export {BentoSocialShare as Component} from './component';

export const layoutSizeDefined = true;

export const delegatesFocus = true;

export const props = {
  'children': {passthroughNonEmpty: true},
  'height': {attr: 'height'},
  'tabIndex': {attr: 'tabindex'},
  'type': {attr: 'type'},
  'width': {attr: 'width'},
};

export const staticProps = {
  'color': 'currentColor',
  'background': 'inherit',
};

export const usesShadowDom = true;

export const shadowCss = COMPONENT_CSS;

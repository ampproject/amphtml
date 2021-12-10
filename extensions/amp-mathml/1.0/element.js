import {CSS as COMPONENT_CSS} from './component.jss';
export {BentoMathml as Component} from './component';

export const props = {
  'inline': {attr: 'inline', type: 'boolean', default: false},
  'formula': {attr: 'data-formula'},
  'title': {attr: 'title'},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

export const shadowCss = COMPONENT_CSS;

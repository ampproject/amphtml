import {CSS} from './component.jss';
export {BentoFitText as Component} from './component';

export const props = {
  'children': {passthrough: true},
  'minFontSize': {attr: 'min-font-size', type: 'number', media: true},
  'maxFontSize': {attr: 'max-font-size', type: 'number', media: true},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

export const shadowCss = CSS;

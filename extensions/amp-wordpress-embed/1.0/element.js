export {BentoWordPressEmbed as Component} from './component';

export const props = {
  url: {attr: 'data-url', default: ''},
  title: {attr: 'title'},
};

export const layoutSizeDefined = true;

export const usesShadowDom = true;

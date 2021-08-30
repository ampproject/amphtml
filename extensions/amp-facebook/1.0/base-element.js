import {Facebook} from './component';
import {PreactBaseElement} from '#preact/base-element';
import {dashToUnderline} from '#core/types/string';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = Facebook;

/** @override */
BaseElement['props'] = {
  // common attributes
  'title': {attr: 'title'}, // Needed for Preact component
  'href': {attr: 'data-href'},
  'locale': {
    attr: 'data-locale',
    default: dashToUnderline(window.navigator.language),
  },
  // amp-facebook
  'allowFullScreen': {attr: 'data-allowfullscreen'},
  'embedAs': {attr: 'data-embed-as'},
  'includeCommentParent': {
    attr: 'data-include-comment-parent',
    type: 'boolean',
    default: false,
  },
  'showText': {attr: 'data-show-text'},
  // -comments
  'numPosts': {attr: 'data-numposts'},
  'orderBy': {attr: 'data-order-by'},
  // -comments & -like
  'colorscheme': {attr: 'data-colorscheme'},
  // -like
  'action': {attr: 'data-action'},
  'kdSite': {attr: 'data-kd_site'},
  'layout': {attr: 'data-layout'},
  'refLabel': {attr: 'data-ref'},
  'share': {attr: 'data-share'},
  'size': {attr: 'data-size'},
  // -page
  'hideCover': {attr: 'data-hide-cover'},
  'hideCta': {attr: 'data-hide-cta'},
  'showFacepile': {attr: 'data-show-facepile'},
  'smallHeader': {attr: 'data-small-header'},
  'tabs': {attr: 'data-tabs'},
};

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

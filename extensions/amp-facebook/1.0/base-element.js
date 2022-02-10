import {userAssert} from '#core/assert';
import {dashToUnderline} from '#core/types/string';

import {PreactBaseElement} from '#preact/base-element';

import {BentoFacebook} from './component';

/** @const {string} */
export const TAG = 'bento-facebook';
export const COMMENTS_TAG = 'bento-facebook-comments';
export const LIKE_TAG = 'bento-facebook-like';
export const PAGE_TAG = 'bento-facebook-page';

export class BaseElement extends PreactBaseElement {}

/** @override */
BaseElement['Component'] = BentoFacebook;

/** @override */
BaseElement['loadable'] = true;

/** @override */
BaseElement['props'] = {
  // common attributes
  'title': {attr: 'title'}, // Needed for Preact component
  'href': {attr: 'data-href'},
  'locale': {
    attr: 'data-locale',
    default: dashToUnderline(window.navigator.language),
  },
  // TODO(wg-components): Current behavior defaults to loading="auto".
  // Refactor to make loading="lazy" as the default.
  'loading': {attr: 'data-loading'},
  // amp-facebook
  'allowFullScreen': {attr: 'data-allowfullscreen'},
  'embedAs': {attrs: ['data-embed-as'], parseAttrs: parseEmbed},
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

/**
 * Checks for valid data-embed-as attribute when given.
 * @param {!Element} element
 * @return {string}
 */
function parseEmbed(element) {
  const embedAs = element.getAttribute('data-embed-as');
  userAssert(
    !embedAs ||
      ['post', 'video', 'comments', 'like', 'page'].indexOf(embedAs) !== -1,
    'Attribute data-embed-as for <amp-facebook> value is wrong, should be' +
      ' "post", "video", "comments", "like", or "page", but was: %s',
    embedAs
  );
  return embedAs;
}

/** @override */
BaseElement['layoutSizeDefined'] = true;

/** @override */
BaseElement['usesShadowDom'] = true;

export class CommentsBaseElement extends BaseElement {}
CommentsBaseElement['staticProps'] = {'embedAs': 'comments'};

export class LikeBaseElement extends BaseElement {}
LikeBaseElement['staticProps'] = {'embedAs': 'like'};

export class PageBaseElement extends BaseElement {}
PageBaseElement['staticProps'] = {'embedAs': 'page'};

import {userAssert} from '#core/assert';
import {dashToUnderline} from '#core/types/string';
import {BentoFacebook} from './component';

export const Component = BentoFacebook;

export const loadable = true;

export const props = {
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

export const layoutSizeDefined = true;

export const usesShadowDom = true;

/**
 * Checks for valid data-embed-as attribute when given.
 * @param {!Element} element
 * @return {string}
 */
function parseEmbed(element) {
  const embedAs = element.getAttribute('data-embed-as');
  userAssert(
    !embedAs ||
      ['post', 'video', 'comment', 'comments', 'like', 'page'].indexOf(
        embedAs
      ) !== -1,
    'Attribute data-embed-as for <amp-facebook> value is wrong, should be' +
      ' "post", "video", "comment", "comments", "like", or "page", but was: %s',
    embedAs
  );
  return embedAs;
}

export const commentsStaticProps = {'embedAs': 'comments'};

export const likeStaticProps = {'embedAs': 'like'};

export const pageStaticProps = {'embedAs': 'page'};

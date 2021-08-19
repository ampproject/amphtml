import {BaseElement} from './base-element';
import {createLoaderLogo} from '../0.1/facebook-loader';
import {dashToUnderline} from '#core/types/string';
import {dict} from '#core/types/object';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-facebook';
const COMMENTS_TAG = 'amp-facebook-comments';
const LIKE_TAG = 'amp-facebook-like';
const PAGE_TAG = 'amp-facebook-page';
const TYPE = 'facebook';

class AmpFacebook extends BaseElement {
  /** @override @nocollapse */
  static createLoaderLogoCallback(element) {
    return createLoaderLogo(element);
  }

  /** @override @nocollapse */
  static getPreconnects(element) {
    const ampdoc = element.getAmpDoc();
    const {win} = ampdoc;
    const locale = element.hasAttribute('data-locale')
      ? element.getAttribute('data-locale')
      : dashToUnderline(window.navigator.language);
    return [
      // Base URL for 3p bootstrap iframes
      getBootstrapBaseUrl(win, ampdoc),
      // Script URL for iframe
      getBootstrapUrl(TYPE),
      'https://facebook.com',
      // This domain serves the actual tweets as JSONP.
      'https://connect.facebook.net/' + locale + '/sdk.js',
    ];
  }

  /** @override */
  init() {
    return dict({
      'onReady': () => this.togglePlaceholder(false),
      'requestResize': (height) => this.attemptChangeHeight(height),
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-facebook'),
      'expected global "bento" or specific "bento-facebook" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

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

/** @override */
AmpFacebook['props'] = {
  ...BaseElement['props'],
  'embedAs': {
    attrs: ['data-embed-as'],
    parseAttrs: parseEmbed,
  },
};

class AmpFacebookComments extends AmpFacebook {}

/** @override */
AmpFacebookComments['staticProps'] = {'embedAs': 'comments'};

class AmpFacebookLike extends AmpFacebook {}

/** @override */
AmpFacebookLike['staticProps'] = {'embedAs': 'like'};

class AmpFacebookPage extends AmpFacebook {}

/** @override */
AmpFacebookPage['staticProps'] = {'embedAs': 'page'};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebook);
  AMP.registerElement(COMMENTS_TAG, AmpFacebookComments);
  AMP.registerElement(LIKE_TAG, AmpFacebookLike);
  AMP.registerElement(PAGE_TAG, AmpFacebookPage);
});

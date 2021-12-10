import {createLoaderLogo} from '../0.1/facebook-loader';
import {dashToUnderline} from '#core/types/string';
import {dict} from '#core/types/object';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

import {
  Component,
  commentsStaticProps,
  layoutSizeDefined,
  likeStaticProps,
  loadable,
  pageStaticProps,
  props,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';

/** @const {string} */
const TAG = 'amp-facebook';
const COMMENTS_TAG = 'amp-facebook-comments';
const LIKE_TAG = 'amp-facebook-like';
const PAGE_TAG = 'amp-facebook-page';
const TYPE = 'facebook';

class AmpFacebook extends AmpPreactBaseElement {
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

/** @override */
AmpFacebook['Component'] = Component;

/** @override */
AmpFacebook['loadable'] = loadable;

/** @override */
AmpFacebook['props'] = props;

/** @override */
AmpFacebook['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpFacebook['usesShadowDom'] = usesShadowDom;

class AmpFacebookComments extends AmpFacebook {}

/** @override */
AmpFacebookComments['staticProps'] = commentsStaticProps;

class AmpFacebookLike extends AmpFacebook {}

/** @override */
AmpFacebookLike['staticProps'] = likeStaticProps;

class AmpFacebookPage extends AmpFacebook {}

/** @override */
AmpFacebookPage['staticProps'] = pageStaticProps;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebook);
  AMP.registerElement(COMMENTS_TAG, AmpFacebookComments);
  AMP.registerElement(LIKE_TAG, AmpFacebookLike);
  AMP.registerElement(PAGE_TAG, AmpFacebookPage);
});

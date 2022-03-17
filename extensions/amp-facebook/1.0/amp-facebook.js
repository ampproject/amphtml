import {
  BaseElement,
  CommentsBaseElement,
  LikeBaseElement,
  PageBaseElement,
} from '#bento/components/bento-facebook/1.0/base-element';

import {dashToUnderline} from '#core/types/string';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {createLoaderLogo} from '../0.1/facebook-loader';

/** @const {string} */
const TAG = 'amp-facebook';
const COMMENTS_TAG = 'amp-facebook-comments';
const LIKE_TAG = 'amp-facebook-like';
const PAGE_TAG = 'amp-facebook-page';
const TYPE = 'facebook';

class AmpFacebookBase extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override  */
  static createLoaderLogoCallback(element) {
    return createLoaderLogo(element);
  }

  /** @override  */
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
    return {
      'requestResize': (height) => this.attemptChangeHeight(height),
    };
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

class AmpFacebook extends AmpFacebookBase {}

class AmpFacebookComments extends setSuperClass(
  CommentsBaseElement,
  AmpFacebookBase
) {}

class AmpFacebookLike extends setSuperClass(LikeBaseElement, AmpFacebookBase) {}

class AmpFacebookPage extends setSuperClass(PageBaseElement, AmpFacebookBase) {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebook);
  AMP.registerElement(COMMENTS_TAG, AmpFacebookComments);
  AMP.registerElement(LIKE_TAG, AmpFacebookLike);
  AMP.registerElement(PAGE_TAG, AmpFacebookPage);
});

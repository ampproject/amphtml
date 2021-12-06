import {
  BaseElement,
  CommentsBaseElement,
  LikeBaseElement,
  PageBaseElement,
} from './base-element';
import {createLoaderLogo} from '../0.1/facebook-loader';
import {dashToUnderline} from '#core/types/string';
import {dict} from '#core/types/object';
import {getBootstrapBaseUrl, getBootstrapUrl} from '../../../src/3p-frame';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-facebook';
const COMMENTS_TAG = 'amp-facebook-comments';
const LIKE_TAG = 'amp-facebook-like';
const PAGE_TAG = 'amp-facebook-page';
const TYPE = 'facebook';

/**
 * Mixin to implement base amp functionality for all facebook components
 * @param {*} clazz1
 * @return {*} mixin
 */
function AmpFacebookMixin(clazz1) {
  return class extends clazz1 {
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
  };
}

class AmpFacebook extends AmpFacebookMixin(BaseElement) {}

class AmpFacebookComments extends AmpFacebookMixin(CommentsBaseElement) {}

class AmpFacebookLike extends AmpFacebookMixin(LikeBaseElement) {}

class AmpFacebookPage extends AmpFacebookMixin(PageBaseElement) {}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpFacebook);
  AMP.registerElement(COMMENTS_TAG, AmpFacebookComments);
  AMP.registerElement(LIKE_TAG, AmpFacebookLike);
  AMP.registerElement(PAGE_TAG, AmpFacebookPage);
});

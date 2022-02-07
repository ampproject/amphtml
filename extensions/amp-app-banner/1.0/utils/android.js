import {WindowInterface} from '#core/window/interface';

import {logger} from '#preact/logger';
import {DocumentInfo} from '#preact/utils/docInfo';
import {DocumentScopeBase} from '#preact/utils/documentScopeBase';
import {platformUtils} from '#preact/utils/platform';
import {UrlUtils} from '#preact/utils/url';
import {xhrUtils} from '#preact/utils/xhr';

import {openWindowDialog} from '../../../../src/open-window-dialog';

const OPEN_LINK_TIMEOUT = 1500;

export class AndroidAppInfo extends DocumentScopeBase {
  static forDoc = DocumentScopeBase.forDoc;

  /**
   * @return {{openOrInstall: function(): void, promise: Promise<void>}|null}
   */
  getAndroidAppInfo() {
    // We want to fallback to browser builtin mechanism when possible.
    const canShowBuiltinBanner =
      platformUtils.isAndroid() && platformUtils.isChrome();

    if (canShowBuiltinBanner) {
      logger.info(
        'BENTO-APP-BANNER',
        'Not rendering bento-app-banner:',
        'Browser supports builtin banners.'
      );
      return null;
    }

    const manifestLink = self.document.head.querySelector(
      'link[rel=manifest],link[rel=origin-manifest]'
    );

    const missingDataSources = !manifestLink;
    if (missingDataSources) {
      return null;
    }

    const manifestHref = manifestLink.getAttribute('href');

    UrlUtils.forDoc(this.ownerDocument).assertHttpsUrl(
      manifestHref,
      'manifest href'
    );

    const promise = xhrUtils
      .fetchJson(manifestHref)
      .then((m) => this.parseManifest_(m));
    return {
      promise,
      openOrInstall: () => {
        return promise.then((manifest) => {
          if (!manifest) {
            return;
          }
          const {installAppUrl, openInAppUrl} = manifest;
          setTimeout(() => {
            WindowInterface.getTop(window).location.assign(installAppUrl);
          }, OPEN_LINK_TIMEOUT);
          openWindowDialog(window, openInAppUrl, '_top');
        });
      },
    };
  }

  /**
   * @private
   * @param {object} manifestJson
   * @return {{installAppUrl: string, openInAppUrl: string}|null}
   */
  parseManifest_(manifestJson) {
    const apps = manifestJson['related_applications'];
    if (!apps) {
      logger.error(
        'BENTO-APP-BANNER',
        'Invalid manifest:',
        'related_applications is missing from manifest.json file'
      );
      return null;
    }

    const playApp = apps.find((a) => a['platform'] === 'play');
    if (!playApp) {
      logger.error(
        'BENTO-APP-BANNER',
        'Invalid manifest:',
        'Could not find a platform=play app in manifest'
      );
      return null;
    }

    const installAppUrl = `https://play.google.com/store/apps/details?id=${playApp['id']}`;
    const openInAppUrl = this.getAndroidIntentForUrl_(playApp['id']);
    return {installAppUrl, openInAppUrl};
  }

  /**
   * @private
   * @param {string} appId
   * @return {string}
   */
  getAndroidIntentForUrl_(appId) {
    const docInfo = DocumentInfo.forDoc(this.ownerDocument);
    const parsedCanonicalUrl = UrlUtils.forDoc(this.ownerDocument).parse(
      docInfo.canonicalUrl
    );
    const cleanProtocol = parsedCanonicalUrl.protocol.replace(':', '');
    const {host, pathname} = parsedCanonicalUrl;

    return `android-app://${appId}/${cleanProtocol}/${host}${pathname}`;
  }
}

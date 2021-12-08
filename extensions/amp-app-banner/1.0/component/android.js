import {docInfoService} from '#preact/services/document';
import {platformService} from '#preact/services/platform';
import {timerService} from '#preact/services/timer';
import {urlService} from '#preact/services/url';
import {viewerService} from '#preact/services/viewer';
import {xhrService} from '#preact/services/xhr';

import {user} from '#utils/log';

import {openWindowDialog} from '../../../../src/open-window-dialog';

const OPEN_LINK_TIMEOUT = 1500;

/**
 * @return {{openOrInstall: function(): void, promise: Promise<Response>}|null}
 */
export function getAndroidAppInfo() {
  const win = self.window;
  // We want to fallback to browser builtin mechanism when possible.
  const isChromeAndroid =
    platformService.isAndroid() && platformService.isChrome();
  const isProxyOrigin = urlService.isProxyOrigin(win.location);
  const canShowBuiltinBanner =
    !isProxyOrigin && !viewerService.isEmbedded() && isChromeAndroid;

  if (canShowBuiltinBanner) {
    user().info(
      'BENTO-APP-BANNER',
      'Browser supports builtin banners. Not rendering amp-app-banner.'
    );
    return null;
  }

  const manifestLink = win.document.head.querySelector(
    'link[rel=manifest],link[rel=origin-manifest]'
  );

  const missingDataSources = !manifestLink;
  if (missingDataSources) {
    return null;
  }

  const manifestHref = manifestLink.getAttribute('href');

  urlService.assertHttpsUrl(manifestHref, undefined, 'manifest href');

  const promise = xhrService.fetchJson(manifestHref).then(parseManifest);
  return {
    promise,
    openOrInstall: () => {
      return promise.then((manifest) => {
        if (!manifest) {
          return;
        }
        const {installAppUrl, openInAppUrl} = manifest;
        timerService.delay(() => {
          window.top.location.assign(installAppUrl);
        }, OPEN_LINK_TIMEOUT);
        openWindowDialog(window, openInAppUrl, '_top');
      });
    },
  };
}

/**
 * @param {object} manifestJson
 * @return {{installAppUrl: string, openInAppUrl: string}|null}
 */
function parseManifest(manifestJson) {
  const apps = manifestJson['related_applications'];
  if (!apps) {
    user().warn(
      'BENTO-APP-BANNER',
      'related_applications is missing from manifest.json file: %s'
    );
    return null;
  }

  const playApp = apps.find((a) => a['platform'] === 'play');
  if (!playApp) {
    user().warn(
      'BENTO-APP-BANNER',
      'Could not find a platform=play app in manifest: %s'
    );
    return null;
  }

  const installAppUrl = `https://play.google.com/store/apps/details?id=${playApp['id']}`;
  const openInAppUrl = getAndroidIntentForUrl(playApp['id']);
  return {installAppUrl, openInAppUrl};
}

/**
 * @param {string} appId
 * @return {string}
 */
function getAndroidIntentForUrl(appId) {
  const {canonicalUrl} = docInfoService;
  const parsedUrl = urlService.parse(canonicalUrl);
  const cleanProtocol = parsedUrl.protocol.replace(':', '');
  const {host, pathname} = parsedUrl;

  return `android-app://${appId}/${cleanProtocol}/${host}${pathname}`;
}

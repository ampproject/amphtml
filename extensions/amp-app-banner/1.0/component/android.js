import { user } from "#utils/log";
import { openWindowDialog } from "../../../../src/open-window-dialog";
import { docInfoService } from "../services/document";
import { platformService } from "../services/platform";
import { timerService } from "../services/timer";
import { urlService } from "../services/url";
import { viewerService } from "../services/viewer";
import { xhrService } from "../services/xhr";

const OPEN_LINK_TIMEOUT = 1500;

export function getAndroidAppInfo() {
  const win = window;
  // We want to fallback to browser builtin mechanism when possible.
  const isChromeAndroid = platformService.isAndroid() && platformService.isChrome();
  const isProxyOrigin = urlService.isProxyOrigin(win.location);
  const canShowBuiltinBanner = !isProxyOrigin && !viewerService.isEmbedded() && isChromeAndroid;

  if (canShowBuiltinBanner) {
    user().info(
      'bento-app-banner',
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

  urlService.assertHttpsUrl(manifestHref, null, 'manifest href');

  const promise = xhrService.fetchJson(manifestHref).then(parseManifest);
  return {
    promise,
    openOrInstall: () => {
      promise.then((manifest) => {
        if (!manifest) return;
        const { openInAppUrl, installAppUrl } = manifest;
        timerService.delay(() => {
          window.top.location.assign(installAppUrl);
        }, OPEN_LINK_TIMEOUT);
        openWindowDialog(window, openInAppUrl, '_top');
      });
    }
  }
}

function parseManifest(manifestJson) {
  const apps = manifestJson['related_applications'];
  if (!apps) {
    user().warn(
      'bento-app-banner',
      'related_applications is missing from manifest.json file: %s',
    );
    return null;
  }

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    if (app['platform'] === 'play') {
      const installAppUrl = `https://play.google.com/store/apps/details?id=${app['id']}`;
      const openInAppUrl = getAndroidIntentForUrl(app['id']);
      return { installAppUrl, openInAppUrl };
    }
  }

  user().warn(
    'bento-app-banner',
    'Could not find a platform=play app in manifest: %s',
  );
  return null;
}

function getAndroidIntentForUrl(appId) {
  const canonicalUrl = docInfoService.canonicalUrl;
  const parsedUrl = urlService.parse(canonicalUrl);
  const cleanProtocol = parsedUrl.protocol.replace(':', '');
  const {host, pathname} = parsedUrl;

  return `android-app://${appId}/${cleanProtocol}/${host}${pathname}`;
}

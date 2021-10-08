import {installImg} from '#builtins/amp-img/amp-img';
import {installLayout} from '#builtins/amp-layout/amp-layout';
import {installPixel} from '#builtins/amp-pixel/amp-pixel';

import {installInaboxResourcesServiceForDoc} from '#inabox/inabox-resources';

import {devAssert} from '#utils/log';

import {installActionServiceForDoc} from './action-impl';
import {installBatchedXhrService} from './batched-xhr-impl';
import {installCidService} from './cid-impl';
import {installCryptoService} from './crypto-impl';
import {installDocumentInfoServiceForDoc} from './document-info-impl';
import {installHiddenObserverForDoc} from './hidden-observer-impl';
import {installHistoryServiceForDoc} from './history-impl';
import {installLoadingIndicatorForDoc} from './loading-indicator';
import {installMutatorServiceForDoc} from './mutator-impl';
import {installGlobalNavigationHandlerForDoc} from './navigation';
import {installOwnersServiceForDoc} from './owners-impl';
import {installPlatformService} from './platform-impl';
import {installResourcesServiceForDoc} from './resources-impl';
import {installStandardActionsForDoc} from './standard-actions-impl';
import {installStorageServiceForDoc} from './storage-impl';
import {installTemplatesServiceForDoc} from './template-impl';
import {installTimerService} from './timer-impl';
import {installUrlForDoc} from './url-impl';
import {installUrlReplacementsServiceForDoc} from './url-replacements-impl';
import {installViewerServiceForDoc} from './viewer-impl';
import {installViewportServiceForDoc} from './viewport/viewport-impl';
import {installVsyncService} from './vsync-impl';
import {installXhrService} from './xhr-impl';

import {installGlobalSubmitListenerForDoc} from '../document-submit';
import {installInputService} from '../input';
import {installPreconnectService} from '../preconnect';
import {
  adoptServiceFactoryForEmbedDoc,
  adoptServiceForEmbedDoc,
} from '../service-helpers';

/**
 * Install builtins.
 * @param {!Window} win
 * @restricted
 */
export function installBuiltinElements(win) {
  installImg(win);
  installPixel(win);
  installLayout(win);
}

/**
 * Install runtime-level services.
 * @param {!Window} global Global scope to adopt.
 * @restricted
 */
export function installRuntimeServices(global) {
  installCryptoService(global);
  installBatchedXhrService(global);
  installPlatformService(global);
  installTimerService(global);
  installVsyncService(global);
  installXhrService(global);
  installInputService(global);
  installPreconnectService(global);
}

/**
 * Install ampdoc-level services.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @restricted
 */
export function installAmpdocServices(ampdoc) {
  devAssert(!ampdoc.getParent());
  installAmpdocServicesInternal(ampdoc, /* isEmbedded */ false);
}

/**
 * Install ampdoc-level services for an embedded doc.
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @restricted
 */
export function installAmpdocServicesForEmbed(ampdoc) {
  devAssert(!!ampdoc.getParent());
  installAmpdocServicesInternal(ampdoc, /* isEmbedded */ true);
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {boolean} isEmbedded
 */
function installAmpdocServicesInternal(ampdoc, isEmbedded) {
  // This function is constructed to DCE embedded-vs-non-embedded path when
  // a constant value passed in the `isEmbedded` arg.

  // When making changes to this method:
  // 1. Order is important!
  // 2. Consider to install same services to amp-inabox.js
  installUrlForDoc(ampdoc);
  isEmbedded
    ? adoptServiceFactoryForEmbedDoc(ampdoc, 'templates')
    : installTemplatesServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'documentInfo')
    : installDocumentInfoServiceForDoc(ampdoc);
  // those services are installed in amp-inabox.js
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'cid')
    : installCidService(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'viewer')
    : installViewerServiceForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'viewport')
    : installViewportServiceForDoc(ampdoc);
  installHiddenObserverForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'history')
    : installHistoryServiceForDoc(ampdoc);

  isEmbedded
    ? installInaboxResourcesServiceForDoc(ampdoc)
    : installResourcesServiceForDoc(ampdoc);
  installOwnersServiceForDoc(ampdoc);
  installMutatorServiceForDoc(ampdoc);

  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'url-replace')
    : installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  isEmbedded
    ? adoptServiceForEmbedDoc(ampdoc, 'storage')
    : installStorageServiceForDoc(ampdoc);
  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
  if (!isEmbedded) {
    // Embeds do not show loading indicators, since the whole embed is
    // usually behind a parent loading indicator.
    installLoadingIndicatorForDoc(ampdoc);
  }
}

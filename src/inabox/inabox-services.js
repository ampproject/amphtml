import {installActionServiceForDoc} from '#service/action-impl';
import {installDocumentInfoServiceForDoc} from '#service/document-info-impl';
import {installHiddenObserverForDoc} from '#service/hidden-observer-impl';
import {installHistoryServiceForDoc} from '#service/history-impl';
import {installGlobalNavigationHandlerForDoc} from '#service/navigation';
import {installOwnersServiceForDoc} from '#service/owners-impl';
import {installStandardActionsForDoc} from '#service/standard-actions-impl';
import {installTemplatesServiceForDoc} from '#service/template-impl';
import {installUrlForDoc} from '#service/url-impl';
import {installUrlReplacementsServiceForDoc} from '#service/url-replacements-impl';

import {installInaboxCidService} from './inabox-cid';
import {installIframeMessagingClient} from './inabox-iframe-messaging-client';
import {installInaboxMutatorServiceForDoc} from './inabox-mutator';
import {installInaboxResourcesServiceForDoc} from './inabox-resources';
import {installInaboxViewerServiceForDoc} from './inabox-viewer';
import {installInaboxViewportService} from './inabox-viewport';

import {installGlobalSubmitListenerForDoc} from '../document-submit';
import {rejectServicePromiseForDoc} from '../service-helpers';

/**
 * Install ampdoc-level services.
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installAmpdocServicesForInabox(ampdoc) {
  // Order is important!
  installIframeMessagingClient(ampdoc.win); // this is an inabox-only service
  installUrlForDoc(ampdoc);
  installTemplatesServiceForDoc(ampdoc);
  installDocumentInfoServiceForDoc(ampdoc);
  installInaboxCidService(ampdoc);
  installInaboxViewerServiceForDoc(ampdoc);
  installInaboxViewportService(ampdoc);
  installHiddenObserverForDoc(ampdoc);
  installHistoryServiceForDoc(ampdoc);
  installInaboxResourcesServiceForDoc(ampdoc);
  installOwnersServiceForDoc(ampdoc);
  installInaboxMutatorServiceForDoc(ampdoc);
  installUrlReplacementsServiceForDoc(ampdoc);
  installActionServiceForDoc(ampdoc);
  installStandardActionsForDoc(ampdoc);
  // For security, Storage is not installed in inabox.
  unsupportedService(ampdoc, 'storage');
  installGlobalNavigationHandlerForDoc(ampdoc);
  installGlobalSubmitListenerForDoc(ampdoc);
}

/**
 * @param {!../service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string} name
 */
function unsupportedService(ampdoc, name) {
  rejectServicePromiseForDoc(
    ampdoc,
    name,
    new Error('Un-supported service: ' + name)
  );
}

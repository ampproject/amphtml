import {registerServiceBuilderForDoc} from '../../service';
import {LINK_REWRITE_SERVICE_NAME as serviceName} from './constants';
import LinkRewriteService from './link-rewrite-service.js';


/**
 * Register the link rewrite service.
 * @param {*} ampdoc
 */
export function installGlobalLinkRewriterServiceForDoc(ampdoc) {
  registerServiceBuilderForDoc(
      ampdoc,
      LINK_REWRITE_SERVICE_NAME,
      LinkRewriteService,
      true
  );
}

export const LINK_REWRITE_SERVICE_NAME = serviceName;

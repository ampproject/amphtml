import {escapeCssSelectorIdent} from '#core/dom/css-selectors';
import {parseJson} from '#core/types/object/json';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev, devAssert} from '#utils/log';

import {AccessClientAdapter} from './amp-access-client';

import {fetchDocument} from '../../../src/document-fetcher';
import {isProxyOrigin, removeFragment} from '../../../src/url';

/** @const {string} */
const TAG = 'amp-access-server';

/**
 * This class implements server-side authorization protocol. In this approach
 * only immediately visible sections are downloaded. For authorization, the
 * CDN calls the authorization endpoint directly and returns back to the
 * authorization response and the authorized content fragments, which are
 * merged into the document.
 *
 * The approximate diagram looks like this:
 *
 *        Initial GET
 *            ||
 *            ||   [Limited document: fragments requiring
 *            ||      authorization are exlcuded]
 *            ||
 *            \/
 *    Authorize request to CDN
 *            ||
 *            ||   [Authorization response]
 *            ||   [Authorized fragments]
 *            ||
 *            \/
 *    Merge authorized fragments
 *            ||
 *            ||
 *            \/
 *    Apply authorization response
 *
 * @implements {./amp-access-source.AccessTypeAdapterDef}
 */
export class AccessServerAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {!./amp-access-source.AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {!./amp-access-source.AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @private @const */
    this.clientAdapter_ = new AccessClientAdapter(ampdoc, configJson, context);

    /** @const @protected {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(ampdoc.win);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    /** @private @const {?string} */
    this.serverState_ = ampdoc.getMetaByName('i-amphtml-access-state');

    const isInExperiment = isExperimentOn(ampdoc.win, 'amp-access-server');

    /** @private @const {boolean} */
    this.isProxyOrigin_ = isProxyOrigin(ampdoc.win.location) || isInExperiment;

    const serviceUrlOverride = isInExperiment
      ? ampdoc.getParam('serverAccessService')
      : null;

    /** @private @const {string} */
    this.serviceUrl_ =
      serviceUrlOverride || removeFragment(ampdoc.win.location.href);
  }

  /** @override */
  getConfig() {
    return {
      'client': this.clientAdapter_.getConfig(),
      'proxy': this.isProxyOrigin_,
      'serverState': this.serverState_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    dev().fine(
      TAG,
      'Start authorization with ',
      this.isProxyOrigin_ ? 'proxy' : 'non-proxy',
      this.serverState_,
      this.clientAdapter_.getAuthorizationUrl()
    );
    if (!this.isProxyOrigin_ || !this.serverState_) {
      dev().fine(TAG, 'Proceed via client protocol');
      return this.clientAdapter_.authorize();
    }

    dev().fine(TAG, 'Proceed via server protocol');

    const varsPromise = this.context_.collectUrlVars(
      this.clientAdapter_.getAuthorizationUrl(),
      /* useAuthData */ false
    );
    return varsPromise
      .then((vars) => {
        const requestVars = {};
        for (const k in vars) {
          if (vars[k] != null) {
            requestVars[k] = String(vars[k]);
          }
        }
        const request = {
          'url': removeFragment(this.ampdoc.win.location.href),
          'state': this.serverState_,
          'vars': requestVars,
        };
        dev().fine(TAG, 'Authorization request: ', this.serviceUrl_, request);
        // Note that `application/x-www-form-urlencoded` is used to avoid
        // CORS preflight request.
        return this.timer_.timeoutPromise(
          this.clientAdapter_.getAuthorizationTimeout(),
          fetchDocument(this.ampdoc.win, this.serviceUrl_, {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })
        );
      })
      .then((responseDoc) => {
        dev().fine(TAG, 'Authorization response: ', responseDoc);
        const accessDataString = devAssert(
          responseDoc.querySelector('script[id="amp-access-data"]'),
          'No authorization data available'
        ).textContent;
        const accessData = parseJson(accessDataString);
        dev().fine(TAG, '- access data: ', accessData);

        return this.replaceSections_(responseDoc).then(() => {
          return accessData;
        });
      });
  }

  /** @override */
  isPingbackEnabled() {
    return this.clientAdapter_.isPingbackEnabled();
  }

  /** @override */
  pingback() {
    return this.clientAdapter_.pingback();
  }

  /** @override */
  postAction() {
    // Nothing to do.
  }

  /**
   * @param {!Document} doc
   * @return {!Promise}
   */
  replaceSections_(doc) {
    const sections = doc.querySelectorAll('[i-amphtml-access-id]');
    dev().fine(TAG, '- access sections: ', sections);
    return this.vsync_.mutatePromise(() => {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionId = section.getAttribute('i-amphtml-access-id');
        const target = this.ampdoc
          .getRootNode()
          .querySelector(
            `[i-amphtml-access-id="${escapeCssSelectorIdent(sectionId)}"]`
          );
        if (!target) {
          dev().warn(TAG, 'Section not found: ', sectionId);
          continue;
        }
        target.parentElement.replaceChild(
          this.ampdoc.win.document.importNode(section, /* deep */ true),
          target
        );
      }
    });
  }
}

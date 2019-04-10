/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ActionTrust} from '../../../src/action-constants';
import {Services} from '../../../src/services';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {isExperimentOn} from '../../../src/experiments';
import {tryParseJson} from '../../../src/json';


/** @const {string} */
const TAG = 'amp-viewer-assistance';

/** @const {string} */
const GSI_TOKEN_PROVIDER = 'actions-on-google-gsi';

/** @const {!Array<string>} */
const ACTION_STATUS_WHITELIST = [
  'ACTIVE_ACTION_STATUS',
  'FAILED_ACTION_STATUS',
  'COMPLETED_ACTION_STATUS',
];

export class AmpViewerAssistance {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    const assistanceElement = ampdoc.getElementById('amp-viewer-assistance');

    /** @private {boolean} */
    this.enabled_ = !!assistanceElement;
    if (!this.enabled_) {
      return;
    }

    /** @const @private */
    this.ampdoc_ = ampdoc;

    /** @const @private {!Element} */
    this.assistanceElement_ = dev().assertElement(assistanceElement);

    /** @const @private {JsonObject|null|undefined} */
    this.configJson_ = tryParseJson(this.assistanceElement_.textContent, e => {
      throw user().createError(
          'Failed to parse "amp-viewer-assistance" JSON: ' + e);
    });

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private @const {!../../../src/service/action-impl.ActionService} */
    this.action_ = Services.actionServiceForDoc(this.assistanceElement_);

    /** @private @const {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);
  }

  /**
   * @param {!../../../src/service/action-impl.ActionInvocation} invocation
   * @return {?Promise}
   * @private
   */
  actionHandler_(invocation) {
    const {method, args} = invocation;
    if (method == 'updateActionState') {
      // "updateActionState" requires a low-trust event.
      if (invocation.satisfiesTrust(ActionTrust.LOW)
          && this.isValidActionStatusArgs_(args)) {
        this.transformUpdateActionStateArgs_(args).then(args => {
          return this.viewer_./*OK*/sendMessageAwaitResponse(
              method, args);
        }).catch(err => {
          user().error(TAG, err.toString());
        });
      }
    } else if (method == 'signIn') {
      // "signIn" requires a high-trust event.
      if (invocation.satisfiesTrust(ActionTrust.HIGH)) {
        this.requestSignIn_();
      }
    }
    return null;
  }

  /**
   * @private
   * @restricted
   * @return {!AmpViewerAssistance|Promise<!AmpViewerAssistance>}
   */
  start_() {
    if (!this.enabled_) {
      user().error(TAG, 'Could not find #amp-viewer-assistance element.');
      return this;
    }
    return this.viewer_.isTrustedViewer().then(isTrustedViewer => {
      if (!isTrustedViewer &&
         !isExperimentOn(this.ampdoc_.win, 'amp-viewer-assistance-untrusted')) {
        this.enabled_ = false;
        user().error(TAG,
            'amp-viewer-assistance is currently only supported on trusted'
            + ' viewers.');
        return this;
      }
      this.action_.installActionHandler(
          this.assistanceElement_, this.actionHandler_.bind(this));

      this.getIdTokenPromise();

      this.viewer_./*OK*/sendMessage('viewerAssistanceConfig',dict({
        'config': this.configJson_,
      }));
      return this;
    });
  }

  /**
   * @return {!Promise<undefined>}
   */
  getIdTokenPromise() {
    return this.viewer_./*OK*/sendMessageAwaitResponse('getAccessTokenPassive',
        dict({
          // For now there's only 1 provider option, so we just hard code it
          'providers': [GSI_TOKEN_PROVIDER],
        }))
        .then(token => {
          this.setIdTokenStatus_(Boolean(!!token));
          return token;
        }).catch(() => {
          this.setIdTokenStatus_(/*available=*/false);
        });
  }

  /**
   * @private
   */
  requestSignIn_() {
    this.viewer_./*OK*/sendMessageAwaitResponse('requestSignIn', dict({
      'providers': [GSI_TOKEN_PROVIDER],
    })).then(token => {
      user().info(TAG, 'Token: ' + token);
      if (token) {
        this.setIdTokenStatus_(/*available=*/true);
        this.action_.trigger(
            this.assistanceElement_, 'signedIn', null, ActionTrust.HIGH);
      } else {
        this.setIdTokenStatus_(/*available=*/false);
      }
    });
  }


  /**
   * Checks the 'actionStatus' field of the updateActionState arguments against
   * a whitelist.
   * @private
   * @param {?Object} args
   * @return {boolean}
   */
  isValidActionStatusArgs_(args) {
    if (!args) {
      return false;
    }
    const update = args['update'];
    const error = args['error'];
    const actionStatus = update && update['actionStatus'];

    if (error) {
      return true;
    } else if (update) {
      if (!actionStatus || !ACTION_STATUS_WHITELIST.includes(actionStatus)) {
        user().error(TAG, '"updateActionState" action "update" parameter' +
            ' must contain a valid "actionStatus" field.');
        return false;
      }
      return true;
    } else {
      user().error(TAG, '"updateActionState" action must have an' +
          ' "update" or "error" parameter.');
      return false;
    }
  }

  /**
   * Transforms an error response object into a suitable updateActionState
   * payload to send to the viewer.
   * @private
   * @param {?Object} args
   * @return {!Promise<!Object>}
   */
  transformUpdateActionStateArgs_(args) {
    if (args['update']) {
      return Promise.resolve(args);
    }
    // Must transform 'error' Response object
    const response = args['error'];
    return response.text().then(errorMessage => {
      return {
        update: {
          actionStatus: 'FAILED_ACTION_STATUS',
          code: response.status,
          message: errorMessage,
        },
      };
    });
  }

  /**
   * Toggles the CSS classes related to the status of the identity token.
   * @private
   * @param {boolean} available
   */
  setIdTokenStatus_(available) {
    this.toggleTopClass_(
        'amp-viewer-assistance-identity-available', available);
  }

  /**
   * Gets the root element of the AMP doc.
   * @return {!Element}
   * @private
   */
  getRootElement_() {
    const root = this.ampdoc_.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /**
   * Toggles a class on the root element of the AMP doc.
   * @param {string} className
   * @param {boolean} on
   * @private
   */
  toggleTopClass_(className, on) {
    this.vsync_.mutate(() => {
      this.getRootElement_().classList.toggle(className, on);
    });
  }
}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('amp-viewer-assistance', function(ampdoc) {
    return new AmpViewerAssistance(ampdoc).start_();
  });
});

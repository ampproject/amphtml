/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../build/amp-consent-0.1.css';
import {ConsentPolicyManager} from './consent-policy-manager';
import {ConsentStateManager} from './consent-state-manager';
import {Layout} from '../../../src/layout';
import {isExperimentOn} from '../../../src/experiments';

const CONSENT_STATE_MANAGER = 'consentStateManager';
const CONSENT_POLICY_MANGER = 'consentPolicyManager';
const AMP_CONSENT_EXPERIMENT = 'amp-consent';


export class AmpConsent extends AMP.BaseElement {
  constructor(element) {
    super(element);

    this.ampdoc = null;

    this.checkConsentHref_ = null;

    this.consentStateManager_ = null;
  }

  buildCallback() {
    if (!isExperimentOn(this.ampdoc.win, AMP_CONSENT_EXPERIMENT)) {
      return;
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** On user action, update consent, update UI */
  onUserAction(unusedUserAction) {

  }

  /** Display consent manger UI */
  onDisplayConsentManagerUI() {

  }
}

AMP.extension('amp-consent', '0.1', AMP => {
  AMP.registerElement('amp-consent', AmpConsent, CSS);
  AMP.registerServiceForDoc(CONSENT_STATE_MANAGER, ConsentStateManager);
  AMP.registerServiceForDoc(CONSENT_POLICY_MANGER, ConsentPolicyManager);
});

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

import {
  CONSENT_ITEM_STATE,
  getStoredConsentInfo,
} from '../consent-info';
import {dict} from '../../../../src/utils/object';


describes.fakeWin('ConsentConfig', {}, () => {
  describe('getStoredConsentInfo', () => {
    it('construct consentInfo from undefined', () => {
      expect(getStoredConsentInfo(undefined)).to.deep.equal(dict({
        'consentState': CONSENT_ITEM_STATE.UNKNOWN,
        'consentString': undefined,
        'isDirty': undefined,
      }));
    });

    it('construct consentInfo from legacy value', () => {
      expect(getStoredConsentInfo(true)).to.deep.equal(dict({
        'consentState': CONSENT_ITEM_STATE.ACCEPTED,
        'consentString': undefined,
        'isDirty': undefined,
      }));
      expect(getStoredConsentInfo(false)).to.deep.equal(dict({
        'consentState': CONSENT_ITEM_STATE.REJECTED,
        'consentString': undefined,
        'isDirty': undefined,
      }));
    });

    it('throw error with invalid value', () => {
      expect(() => getStoredConsentInfo({})).to.throw(
          'Invalid stored consent value');
    });
  });
});

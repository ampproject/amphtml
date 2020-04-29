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
  CONSENT_TYPE,
  composeStoreValue,
  constructConsentInfo,
  getConsentMetadata,
  getStoredConsentInfo,
  isConsentInfoStoredValueSame,
  recalculateConsentStateValue,
} from '../consent-info';
import {dict} from '../../../../src/utils/object';

describes.fakeWin('ConsentInfo', {}, () => {
  describe('getStoredConsentInfo', () => {
    it('construct consentInfo from undefined', () => {
      expect(getStoredConsentInfo(undefined)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.UNKNOWN,
          'consentString': undefined,
          'consentType': undefined,
          'isDirty': undefined,
        })
      );
    });

    it('construct consentInfo from legacy value', () => {
      expect(getStoredConsentInfo(true)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.ACCEPTED,
          'consentString': undefined,
          'consentType': undefined,
          'isDirty': undefined,
        })
      );
      expect(getStoredConsentInfo(false)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': undefined,
          'consentType': undefined,
          'isDirty': undefined,
        })
      );
    });

    it('construct consentInfo from stored value', () => {
      expect(
        getStoredConsentInfo({
          's': 1,
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.ACCEPTED,
          'consentString': undefined,
          'consentType': undefined,
          'isDirty': undefined,
        })
      );
      expect(
        getStoredConsentInfo({
          's': 0,
          'r': 'test',
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': 'test',
          'consentType': undefined,
          'isDirty': undefined,
        })
      );
      expect(
        getStoredConsentInfo({
          's': 0,
          'r': 'test',
          'ct': 2,
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': 'test',
          'consentType': CONSENT_TYPE.TCF_V2,
          'isDirty': undefined,
        })
      );
      expect(
        getStoredConsentInfo({
          's': -1,
          'r': 'test',
          'ct': 2,
          'd': 1,
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.UNKNOWN,
          'consentString': 'test',
          'consentType': CONSENT_TYPE.TCF_V2,
          'isDirty': true,
        })
      );
    });

    it('throw error with invalid value', () => {
      expect(() => getStoredConsentInfo('invalid')).to.throw(
        'Invalid stored consent value'
      );
    });
  });

  it('composeStoreValue/getStoredConsentInfo', () => {
    let consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED);
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test');
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      'test',
      CONSENT_TYPE.US_PRIVACY_STRING
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      'test',
      CONSENT_TYPE.US_PRIVACY_STRING,
      true
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );
  });

  describe('composeStoreValue', () => {
    let consentInfo;
    beforeEach(() => {
      consentInfo = {
        'consentState': CONSENT_ITEM_STATE.UNKNOWN,
      };
    });

    it('new format', () => {
      expect(composeStoreValue(consentInfo)).to.be.null;
      consentInfo['consentState'] = CONSENT_ITEM_STATE.ACCEPTED;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 1,
      });
    });

    it('add field only when defined', () => {
      consentInfo['consentState'] = CONSENT_ITEM_STATE.REJECTED;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
      });
      consentInfo['idDirty'] = false;
      consentInfo['consentString'] = 'test';
      consentInfo['consentType'] = CONSENT_TYPE.TCF_V1;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'ct': 1,
      });
      consentInfo['isDirty'] = true;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'ct': 1,
        'd': 1,
      });
    });
  });

  describe('getConsentMetadata', () => {
    it('converts metadata to an object', () => {
      expect(getConsentMetadata('abc123', 'tcf-v2')).to.deep.equal({
        'consentString': 'abc123',
        'consentType': 2,
      });
    });

    it('converts other fields to undefined based on consent string', () => {
      expect(getConsentMetadata(undefined, 'tcf-v2')).to.deep.equal({});
    });
  });

  it('recalculateConsentStateValue', () => {
    // Always respect reject/accept

    let newState, previousState;
    newState = CONSENT_ITEM_STATE.ACCEPTED;
    previousState = CONSENT_ITEM_STATE.REJECTED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      newState
    );

    // UNKNOWN will clear stored REJECTED/ACCEPTED
    newState = CONSENT_ITEM_STATE.UNKNOWN;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      CONSENT_ITEM_STATE.UNKNOWN
    );

    //DISMISS/NOT_REQUIRED cannot override reject/accept
    newState = CONSENT_ITEM_STATE.DISMISSED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );
    newState = CONSENT_ITEM_STATE.NOT_REQUIRED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );

    // DISMISS cannot override NOT_REQUIRED
    previousState = CONSENT_ITEM_STATE.NOT_REQUIRED;
    newState = CONSENT_ITEM_STATE.DISMISSED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );

    // DISMISS is converted to UNKNOWN
    expect(
      recalculateConsentStateValue(
        CONSENT_ITEM_STATE.DISMISSED,
        CONSENT_ITEM_STATE.UNKNOWN
      )
    ).to.equal(CONSENT_ITEM_STATE.UNKNOWN);
  });

  it('isConsentInfoStoredValueSame', () => {
    expect(isConsentInfoStoredValueSame(null, null)).to.be.true;
    expect(isConsentInfoStoredValueSame({}, null)).to.be.false;

    // consentInfo equals when stored value is same
    const infoA = {
      'consentState': CONSENT_ITEM_STATE.UNKNOWN,
    };
    const infoB = {
      'consentState': CONSENT_ITEM_STATE.NOT_REQUIRED,
    };
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    infoA['consentString'] = '';
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    infoB['isDirty'] = false;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    // consentInfo not equal
    infoA['consentState'] = CONSENT_ITEM_STATE.ACCEPTED;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoB['consentState'] = CONSENT_ITEM_STATE.ACCEPTED;
    infoB['consentString'] = 'test';
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoA['consentString'] = 'test';
    infoB['consentType'] = 1;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoA['consentType'] = 1;
    infoB['isDirty'] = true;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;
  });
});

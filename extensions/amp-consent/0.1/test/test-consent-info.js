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
  METADATA_STORAGE_KEY,
  composeMetadataStoreValue,
  composeStoreValue,
  constructConsentInfo,
  constructMetadata,
  convertStorageMetadata,
  getStoredConsentInfo,
  isConsentInfoStoredValueSame,
  recalculateConsentStateValue,
} from '../consent-info';
import {CONSENT_STRING_TYPE} from '../../../../src/consent-state';
import {dict} from '../../../../src/utils/object';

describes.fakeWin('ConsentInfo', {}, () => {
  describe('getStoredConsentInfo', () => {
    it('construct consentInfo from undefined', () => {
      expect(getStoredConsentInfo(undefined)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.UNKNOWN,
          'consentString': undefined,
          'consentMetadata': undefined,
          'isDirty': undefined,
        })
      );
    });

    it('construct consentInfo from legacy value', () => {
      expect(getStoredConsentInfo(true)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.ACCEPTED,
          'consentString': undefined,
          'consentMetadata': undefined,
          'isDirty': undefined,
        })
      );
      expect(getStoredConsentInfo(false)).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': undefined,
          'consentMetadata': undefined,
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
          'consentMetadata': constructMetadata(),
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
          'consentMetadata': constructMetadata(),
          'isDirty': undefined,
        })
      );
      expect(
        getStoredConsentInfo({
          's': 0,
          'r': 'test',
          'm': {},
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': 'test',
          'isDirty': undefined,
          'consentMetadata': constructMetadata(),
        })
      );
      expect(
        getStoredConsentInfo({
          's': 0,
          'r': 'test',
          'm': {
            [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
              CONSENT_STRING_TYPE.TCF_V2,
            [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
            [METADATA_STORAGE_KEY.GDPR_APPLIES]: false,
          },
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.REJECTED,
          'consentString': 'test',
          'isDirty': undefined,
          'consentMetadata': constructMetadata(
            CONSENT_STRING_TYPE.TCF_V2,
            '1~1.35.41.101',
            false
          ),
        })
      );
      expect(
        getStoredConsentInfo({
          's': -1,
          'r': 'test',
          'm': {
            [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
              CONSENT_STRING_TYPE.TCF_V2,
            [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
          },
          'd': 1,
        })
      ).to.deep.equal(
        dict({
          'consentState': CONSENT_ITEM_STATE.UNKNOWN,
          'consentString': 'test',
          'isDirty': true,
          'consentMetadata': constructMetadata(
            CONSENT_STRING_TYPE.TCF_V2,
            '1~1.35.41.101'
          ),
        })
      );
    });

    it('construct ConsentMetadataDef from stored value', () => {
      expect(convertStorageMetadata()).to.deep.equals({
        'consentStringType': undefined,
        'additionalConsent': undefined,
        'gdprApplies': undefined,
      });
      expect(
        convertStorageMetadata({
          [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
            CONSENT_STRING_TYPE.US_PRIVACY_STRING,
        })
      ).to.deep.equal(
        dict({
          'consentStringType': CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          'additionalConsent': undefined,
          'gdprApplies': undefined,
        })
      );
      expect(
        convertStorageMetadata({
          undefined,
          [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
        })
      ).to.deep.equal(
        dict({
          'consentStringType': undefined,
          'additionalConsent': '1~1.35.41.101',
          'gdprApplies': undefined,
        })
      );
      expect(
        convertStorageMetadata({
          [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
            CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
        })
      ).to.deep.equal(
        dict({
          'consentStringType': CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          'additionalConsent': '1~1.35.41.101',
          'gdprApplies': undefined,
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
    let consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      undefined,
      constructMetadata()
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      'test',
      constructMetadata()
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      'test',
      constructMetadata()
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      CONSENT_ITEM_STATE.ACCEPTED,
      'test',
      constructMetadata(CONSENT_STRING_TYPE.TCF_V2, '1~1.35.41.101', true),
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
      consentInfo['isDirty'] = false;
      consentInfo['consentString'] = 'test';
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
      });
      consentInfo['isDirty'] = true;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'd': 1,
      });
      consentInfo['consentMetadata'] = constructMetadata(
        CONSENT_STRING_TYPE.TCF_V1,
        '1~1.35.41.101',
        false
      );
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'd': 1,
        'm': {
          [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
            CONSENT_STRING_TYPE.TCF_V1,
          [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
          [METADATA_STORAGE_KEY.GDPR_APPLIES]: false,
        },
      });
    });

    it('add field only when defined for metadata', () => {
      expect(
        composeMetadataStoreValue(
          constructMetadata(CONSENT_STRING_TYPE.US_PRIVACY_STRING)
        )
      ).to.deep.equal({
        [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
          CONSENT_STRING_TYPE.US_PRIVACY_STRING,
      });
      expect(
        composeMetadataStoreValue(constructMetadata(undefined, '1~1.35.41.101'))
      ).to.deep.equal({
        [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
      });
      expect(
        composeMetadataStoreValue(
          constructMetadata(undefined, undefined, false)
        )
      ).to.deep.equal({
        [METADATA_STORAGE_KEY.GDPR_APPLIES]: false,
      });
      expect(
        composeMetadataStoreValue(
          constructMetadata(
            CONSENT_STRING_TYPE.US_PRIVACY_STRING,
            '1~1.35.41.101',
            true
          )
        )
      ).to.deep.equal({
        [METADATA_STORAGE_KEY.CONSENT_STRING_TYPE]:
          CONSENT_STRING_TYPE.US_PRIVACY_STRING,
        [METADATA_STORAGE_KEY.ADDITIONAL_CONSENT]: '1~1.35.41.101',
        [METADATA_STORAGE_KEY.GDPR_APPLIES]: true,
      });
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
    infoB['consentMetadata'] = constructMetadata();
    infoA['consentMetadata'] = constructMetadata(
      CONSENT_STRING_TYPE.US_PRIVACY_STRING
    );
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoB['consentMetadata'] = constructMetadata(
      CONSENT_STRING_TYPE.US_PRIVACY_STRING
    );
    infoB['isDirty'] = true;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoA['isDirty'] = true;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;
  });

  describe('metadata', () => {
    it('constructMetadata', () => {
      expect(constructMetadata()).to.deep.equal({
        'consentStringType': undefined,
        'additionalConsent': undefined,
        'gdprApplies': undefined,
      });
      expect(
        constructMetadata(CONSENT_STRING_TYPE.US_PRIVACY_STRING)
      ).to.deep.equal({
        'consentStringType': CONSENT_STRING_TYPE.US_PRIVACY_STRING,
        'additionalConsent': undefined,
        'gdprApplies': undefined,
      });
      expect(constructMetadata(undefined, '1~1.35.41.101')).to.deep.equal({
        'consentStringType': undefined,
        'additionalConsent': '1~1.35.41.101',
        'gdprApplies': undefined,
      });
      expect(constructMetadata(undefined, undefined, true)).to.deep.equal({
        'consentStringType': undefined,
        'additionalConsent': undefined,
        'gdprApplies': true,
      });
      expect(
        constructMetadata(
          CONSENT_STRING_TYPE.US_PRIVACY_STRING,
          '1~1.35.41.101',
          true
        )
      ).to.deep.equal({
        'consentStringType': CONSENT_STRING_TYPE.US_PRIVACY_STRING,
        'additionalConsent': '1~1.35.41.101',
        'gdprApplies': true,
      });
    });
  });
});

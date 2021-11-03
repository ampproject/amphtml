import {
  ConsentItemState_Enum,
  MetadataStorageKey_Enum,
  PurposeConsentState_Enum,
  composeMetadataStoreValue,
  composeStoreValue,
  constructConsentInfo,
  constructMetadata,
  convertStorageMetadata,
  getStoredConsentInfo,
  isConsentInfoStoredValueSame,
  recalculateConsentStateValue,
} from '../consent-info';
import {ConsentStringType_Enum} from '#core/constants/consent-state';
import {dict} from '#core/types/object';

describes.fakeWin('ConsentInfo', {}, () => {
  describe('getStoredConsentInfo', () => {
    it('construct consentInfo from undefined', () => {
      expect(getStoredConsentInfo(undefined)).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.UNKNOWN,
          'consentString': undefined,
          'consentMetadata': undefined,
          'purposeConsents': undefined,
          'isDirty': undefined,
        })
      );
    });

    it('construct consentInfo from legacy value', () => {
      expect(getStoredConsentInfo(true)).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.ACCEPTED,
          'consentString': undefined,
          'consentMetadata': undefined,
          'purposeConsents': undefined,
          'isDirty': undefined,
        })
      );
      expect(getStoredConsentInfo(false)).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.REJECTED,
          'consentString': undefined,
          'consentMetadata': undefined,
          'purposeConsents': undefined,
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
          'consentState': ConsentItemState_Enum.ACCEPTED,
          'consentString': undefined,
          'consentMetadata': constructMetadata(),
          'purposeConsents': undefined,
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
          'consentState': ConsentItemState_Enum.REJECTED,
          'consentString': 'test',
          'consentMetadata': constructMetadata(),
          'purposeConsents': undefined,
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
          'consentState': ConsentItemState_Enum.REJECTED,
          'consentString': 'test',
          'isDirty': undefined,
          'purposeConsents': undefined,
          'consentMetadata': constructMetadata(),
        })
      );
      expect(
        getStoredConsentInfo({
          's': 0,
          'r': 'test',
          'm': {
            [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
              ConsentStringType_Enum.TCF_V2,
            [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
            [MetadataStorageKey_Enum.GDPR_APPLIES]: false,
          },
        })
      ).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.REJECTED,
          'consentString': 'test',
          'isDirty': undefined,
          'purposeConsents': undefined,
          'consentMetadata': constructMetadata(
            ConsentStringType_Enum.TCF_V2,
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
            [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
              ConsentStringType_Enum.TCF_V2,
            [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
          },
          'd': 1,
        })
      ).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.UNKNOWN,
          'consentString': 'test',
          'isDirty': true,
          'purposeConsents': undefined,
          'consentMetadata': constructMetadata(
            ConsentStringType_Enum.TCF_V2,
            '1~1.35.41.101'
          ),
        })
      );
      expect(
        getStoredConsentInfo({
          's': -1,
          'r': 'test',
          'pc': {
            'abc': 1,
            'xyz': 2,
          },
          'd': 1,
        })
      ).to.deep.equal(
        dict({
          'consentState': ConsentItemState_Enum.UNKNOWN,
          'consentString': 'test',
          'isDirty': true,
          'purposeConsents': {
            'abc': PurposeConsentState_Enum.ACCEPTED,
            'xyz': PurposeConsentState_Enum.REJECTED,
          },
          'consentMetadata': constructMetadata(),
        })
      );
    });

    it('construct ConsentMetadataDef from stored value', () => {
      expect(convertStorageMetadata()).to.deep.equals({
        'consentStringType': undefined,
        'additionalConsent': undefined,
        'gdprApplies': undefined,
        'purposeOne': undefined,
      });
      expect(
        convertStorageMetadata({
          [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
            ConsentStringType_Enum.US_PRIVACY_STRING,
        })
      ).to.deep.equal(
        dict({
          'consentStringType': ConsentStringType_Enum.US_PRIVACY_STRING,
          'additionalConsent': undefined,
          'gdprApplies': undefined,
          'purposeOne': undefined,
        })
      );
      expect(
        convertStorageMetadata({
          undefined,
          [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
        })
      ).to.deep.equal(
        dict({
          'consentStringType': undefined,
          'additionalConsent': '1~1.35.41.101',
          'gdprApplies': undefined,
          'purposeOne': undefined,
        })
      );
      expect(
        convertStorageMetadata({
          [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
            ConsentStringType_Enum.US_PRIVACY_STRING,
          [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
          [MetadataStorageKey_Enum.PURPOSE_ONE]: true,
        })
      ).to.deep.equal(
        dict({
          'consentStringType': ConsentStringType_Enum.US_PRIVACY_STRING,
          'additionalConsent': '1~1.35.41.101',
          'gdprApplies': undefined,
          'purposeOne': true,
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
      ConsentItemState_Enum.ACCEPTED,
      undefined,
      constructMetadata()
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      ConsentItemState_Enum.ACCEPTED,
      'test',
      constructMetadata()
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      ConsentItemState_Enum.ACCEPTED,
      'test',
      constructMetadata(),
      {'abc': PurposeConsentState_Enum.ACCEPTED}
    );
    expect(getStoredConsentInfo(composeStoreValue(consentInfo))).to.deep.equal(
      consentInfo
    );

    consentInfo = constructConsentInfo(
      ConsentItemState_Enum.ACCEPTED,
      'test',
      constructMetadata(ConsentStringType_Enum.TCF_V2, '1~1.35.41.101', true),
      {'abc': PurposeConsentState_Enum.ACCEPTED},
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
        'consentState': ConsentItemState_Enum.UNKNOWN,
      };
    });

    it('new format', () => {
      expect(composeStoreValue(consentInfo)).to.be.null;
      consentInfo['consentState'] = ConsentItemState_Enum.ACCEPTED;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 1,
      });
    });

    it('add field only when defined', () => {
      consentInfo['consentState'] = ConsentItemState_Enum.REJECTED;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
      });
      consentInfo['isDirty'] = false;
      consentInfo['consentString'] = 'test';
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
      });
      consentInfo['purposeConsents'] = {
        'zyx': PurposeConsentState_Enum.REJECTED,
      };
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'pc': {'zyx': 2},
      });
      delete consentInfo['purposeConsents'];
      consentInfo['isDirty'] = true;
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'd': 1,
      });
      consentInfo['consentMetadata'] = constructMetadata(
        ConsentStringType_Enum.TCF_V1,
        '1~1.35.41.101',
        false
      );
      expect(composeStoreValue(consentInfo)).to.deep.equal({
        's': 0,
        'r': 'test',
        'd': 1,
        'm': {
          [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
            ConsentStringType_Enum.TCF_V1,
          [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
          [MetadataStorageKey_Enum.GDPR_APPLIES]: false,
        },
      });
    });

    it('add field only when defined for metadata', () => {
      expect(
        composeMetadataStoreValue(
          constructMetadata(ConsentStringType_Enum.US_PRIVACY_STRING)
        )
      ).to.deep.equal({
        [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
          ConsentStringType_Enum.US_PRIVACY_STRING,
      });
      expect(
        composeMetadataStoreValue(constructMetadata(undefined, '1~1.35.41.101'))
      ).to.deep.equal({
        [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
      });
      expect(
        composeMetadataStoreValue(
          constructMetadata(undefined, undefined, false)
        )
      ).to.deep.equal({
        [MetadataStorageKey_Enum.GDPR_APPLIES]: false,
      });
      expect(
        composeMetadataStoreValue(
          constructMetadata(
            ConsentStringType_Enum.US_PRIVACY_STRING,
            '1~1.35.41.101',
            true
          )
        )
      ).to.deep.equal({
        [MetadataStorageKey_Enum.CONSENT_STRING_TYPE]:
          ConsentStringType_Enum.US_PRIVACY_STRING,
        [MetadataStorageKey_Enum.ADDITIONAL_CONSENT]: '1~1.35.41.101',
        [MetadataStorageKey_Enum.GDPR_APPLIES]: true,
      });
    });
  });

  it('recalculateConsentStateValue', () => {
    // Always respect reject/accept

    let newState, previousState;
    newState = ConsentItemState_Enum.ACCEPTED;
    previousState = ConsentItemState_Enum.REJECTED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      newState
    );

    // UNKNOWN will clear stored REJECTED/ACCEPTED
    newState = ConsentItemState_Enum.UNKNOWN;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      ConsentItemState_Enum.UNKNOWN
    );

    //DISMISS/NOT_REQUIRED cannot override reject/accept
    newState = ConsentItemState_Enum.DISMISSED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );
    newState = ConsentItemState_Enum.NOT_REQUIRED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );

    // DISMISS cannot override NOT_REQUIRED
    previousState = ConsentItemState_Enum.NOT_REQUIRED;
    newState = ConsentItemState_Enum.DISMISSED;
    expect(recalculateConsentStateValue(newState, previousState)).to.equal(
      previousState
    );

    // DISMISS is converted to UNKNOWN
    expect(
      recalculateConsentStateValue(
        ConsentItemState_Enum.DISMISSED,
        ConsentItemState_Enum.UNKNOWN
      )
    ).to.equal(ConsentItemState_Enum.UNKNOWN);
  });

  it('isConsentInfoStoredValueSame', () => {
    expect(isConsentInfoStoredValueSame(null, null)).to.be.true;
    expect(isConsentInfoStoredValueSame({}, null)).to.be.false;

    // consentInfo equals when stored value is same
    const infoA = {
      'consentState': ConsentItemState_Enum.UNKNOWN,
    };
    const infoB = {
      'consentState': ConsentItemState_Enum.NOT_REQUIRED,
    };
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    infoA['consentString'] = '';
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    infoB['isDirty'] = false;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.true;

    // consentInfo not equal
    infoA['consentState'] = ConsentItemState_Enum.ACCEPTED;
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoB['consentState'] = ConsentItemState_Enum.ACCEPTED;
    infoB['consentString'] = 'test';
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoA['consentString'] = 'test';
    infoB['consentMetadata'] = constructMetadata();
    infoA['consentMetadata'] = constructMetadata(
      ConsentStringType_Enum.US_PRIVACY_STRING
    );
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoB['consentMetadata'] = constructMetadata(
      ConsentStringType_Enum.US_PRIVACY_STRING
    );

    infoB['purposeConsents'] = {'abc': PurposeConsentState_Enum.ACCEPTED};
    infoA['purposeConsents'] = {'xyz': PurposeConsentState_Enum.ACCEPTED};
    expect(isConsentInfoStoredValueSame(infoA, infoB)).to.be.false;

    infoB['purposeConsents'] = {'xyz': PurposeConsentState_Enum.ACCEPTED};
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
        'purposeOne': undefined,
      });
      expect(
        constructMetadata(ConsentStringType_Enum.US_PRIVACY_STRING)
      ).to.deep.equal({
        'consentStringType': ConsentStringType_Enum.US_PRIVACY_STRING,
        'additionalConsent': undefined,
        'gdprApplies': undefined,
        'purposeOne': undefined,
      });
      expect(constructMetadata(undefined, '1~1.35.41.101')).to.deep.equal({
        'consentStringType': undefined,
        'additionalConsent': '1~1.35.41.101',
        'gdprApplies': undefined,
        'purposeOne': undefined,
      });
      expect(
        constructMetadata(undefined, undefined, true, false)
      ).to.deep.equal({
        'consentStringType': undefined,
        'additionalConsent': undefined,
        'gdprApplies': true,
        'purposeOne': false,
      });
      expect(
        constructMetadata(
          ConsentStringType_Enum.US_PRIVACY_STRING,
          '1~1.35.41.101',
          true,
          true
        )
      ).to.deep.equal({
        'consentStringType': ConsentStringType_Enum.US_PRIVACY_STRING,
        'additionalConsent': '1~1.35.41.101',
        'gdprApplies': true,
        'purposeOne': true,
      });
    });
  });
});

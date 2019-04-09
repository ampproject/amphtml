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

import {Entitlement, GrantReason} from '../entitlement';


describes.realWin('EntitlementClass', {}, () => {
  const service = 'sample-service';
  const source = 'sample-source';
  const granted = true;
  const grantReason = GrantReason.SUBSCRIBER;
  const dataObject = {
    metering: {
      left: 1,
      total: 10,
      resetTime: 30,
      durationUnit: 'days',
      token: 'token',
    },
  };
  it('should give json representation of the object', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, granted,
      grantReason, dataObject});
    expect(entitlement.json()).to.deep.equal({
      service,
      source,
      granted,
      grantReason,
      data: dataObject,
    });
  });

  it('should not return the decrypted key in the json', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, granted,
      grantReason, dataObject, 'decryptedDocumentKey'});
    expect(entitlement.json().decryptedDocumentKey).to.be.undefined;
  });

  it('should be able to parse itself from json', () => {
    const json = {
      service,
      source,
      granted,
      grantReason,
      data: dataObject,
    };
    const entitlement = Entitlement.parseFromJson(json);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.granted).to.be.equal(granted);
    expect(entitlement.grantReason).to.be.equal(grantReason);
    expect(entitlement.raw).to.be.equal(JSON.stringify(json));
    expect(entitlement.data).to.be.equal(dataObject);
  });

  it('should be able to parse raw from json', () => {
    const json = {
      service,
      source,
      granted,
      grantReason,
      data: dataObject,
    };
    const rawValue = 'rawValue';
    const entitlement = Entitlement.parseFromJson(json, rawValue);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.granted).to.be.equal(granted);
    expect(entitlement.grantReason).to.be.equal(grantReason);
    expect(entitlement.raw).to.equal(rawValue);
    expect(entitlement.data).to.be.equal(dataObject);
  });

  it('should return raw, granStatus and source for pingback', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, granted,
      grantReason, dataObject});
    const pingbackData = entitlement.jsonForPingback();
    expect(pingbackData).to.deep.equal(
        Object.assign({raw}, entitlement.json()));
  });
});

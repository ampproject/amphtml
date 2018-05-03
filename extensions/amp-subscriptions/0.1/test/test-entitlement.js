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

import {Entitlement, GrantReasons} from '../entitlement';


describes.realWin('EntitlementClass', {}, () => {
  const service = 'sample-service';
  const source = 'sample-source';
  const granted = true;
  const grantReason = GrantReasons.SUBSCRIBED;
  const data = {
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
      grantReason, data});
    expect(entitlement.json()).to.deep.equal({
      service,
      source,
      raw,
      granted,
      grantReason,
      data,
    });
  });

  it('should be able to parse itself from json', () => {
    const json = {
      service,
      source,
      granted,
      grantReason,
      data,
    };
    const entitlement = Entitlement.parseFromJson(json);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.granted).to.be.equal(granted);
    expect(entitlement.grantReason).to.be.equal(grantReason);
    expect(entitlement.raw).to.be.equal(JSON.stringify(json));
    expect(entitlement.data).to.be.equal(data);
  });

  it('should be able to parse raw from json', () => {
    const json = {
      service,
      source,
      granted,
      grantReason,
      data,
    };
    const rawValue = 'rawValue';
    const entitlement = Entitlement.parseFromJson(json, rawValue);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.granted).to.be.equal(granted);
    expect(entitlement.grantReason).to.be.equal(grantReason);
    expect(entitlement.raw).to.equal(rawValue);
    expect(entitlement.data).to.be.equal(data);
  });

  it('should return raw, granStatus and source for pingback', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, granted,
      grantReason, data});
    const pingbackData = entitlement.jsonForPingback();
    expect(pingbackData.raw).to.be.equal(raw);
    expect(pingbackData.source).to.be.equal(entitlement.source);
    expect(pingbackData.grantState).to.be.equal(entitlement.granted);
  });
});

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

import {Entitlement} from '../entitlement';


describes.realWin('EntitlementClass', {}, () => {
  const service = 'sample-service';
  const source = 'sample-source';
  const products = ['scenic-2017.appspot.com:news',
    'scenic-2017.appspot.com:product2'];
  const subscriptionToken = 'token';
  const loggedIn = true;
  const metering = {
    left: 1,
    total: 10,
    resetTime: 30,
    durationUnit: 'days',
    token: 'token',
  };
  it('should give json representation of the object', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, products,
      subscriptionToken, loggedIn, metering});
    expect(entitlement.json()).to.deep.equal({
      service,
      source,
      raw,
      products,
      subscriptionToken,
      loggedIn,
      metering,
    });
  });

  it('should be able to parse itself from json', () => {
    const json = {
      service,
      source,
      products,
      subscriptionToken,
      loggedIn,
      metering,
    };
    const entitlement = Entitlement.parseFromJson(json);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.products).to.be.equal(products);
    expect(entitlement.subscriptionToken).to.be.equal(subscriptionToken);
    expect(entitlement.raw).to.be.equal(JSON.stringify(json));
    expect(entitlement.loggedIn).to.be.equal(loggedIn);
    expect(entitlement.metering).to.deep.equal(metering);
  });

  it('should be able to parse raw from json', () => {
    const json = {
      service,
      source,
      products,
      subscriptionToken,
      loggedIn,
      metering,
    };
    const rawValue = 'rawValue';
    const entitlement = Entitlement.parseFromJson(json, rawValue);
    expect(entitlement.source).to.be.equal(source);
    expect(entitlement.products).to.be.equal(products);
    expect(entitlement.subscriptionToken).to.be.equal(subscriptionToken);
    expect(entitlement.raw).to.equal(rawValue);
    expect(entitlement.loggedIn).to.be.equal(loggedIn);
    expect(entitlement.metering).to.deep.equal(metering);
  });

  it('should tell if current product is enabled', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, products,
      subscriptionToken, loggedIn});
    entitlement.setCurrentProduct(products[0]);
    expect(entitlement.enablesThis()).to.be.true;
    entitlement.setCurrentProduct('lipsum');
    expect(entitlement.enablesThis()).to.be.false;
  });

  it('should return raw, granStatus and source for pingback', () => {
    const raw = 'raw';
    const entitlement = new Entitlement({source, raw, service, products,
      subscriptionToken, loggedIn});
    entitlement.setCurrentProduct(products[0]);
    const pingbackData = entitlement.jsonForPingback();
    expect(pingbackData.raw).to.be.equal(raw);
    expect(pingbackData.source).to.be.equal(entitlement.source);
    expect(pingbackData.grantState).to.be.equal(entitlement.enablesThis());
  });
});

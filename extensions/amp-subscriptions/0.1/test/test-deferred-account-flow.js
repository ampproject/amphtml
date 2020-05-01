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
import {DeferredAccountFlow} from '../deferred-account-flow';
import {Entitlement, GrantReason} from '../entitlement';
import {Services} from '../../../../src/services';

const HAS_ACCOUNT_URL = 'https://fakeUrl.com/hasAccount';
const CREATE_ACCOUNT_URL = 'https://fakeUrl.com/createAccount';
const PLATFORM_ID = 'fake_platform_id';

const ENTITLEMENT = new Entitlement({
  service: PLATFORM_ID,
  granted: true,
  grantReason: GrantReason.SUBSCRIBER,
  dataObject: {data: 'this is the data'},
});
const RAW_ENTITLEMENT =
  '{"raw":"","service":"fake_platform_id","granted":true,"grantReason":"SUBSCRIBER","data":{"data":"this is the data"}}';
const ENTITLEMENT_HASH = 'W29iamVjdCBBcnJheUJ1ZmZlcl0=';

describes.realWin('deferred-account-flow', {amp: true}, (env) => {
  let xhr;
  let navigator;
  let navigateToStub;
  let storage;
  let platform;
  let fetchStub;
  let deferredCreationStub;

  beforeEach(() => {
    xhr = Services.xhrFor(env.win);
    navigator = Services.navigationForDoc(env.ampdoc);
    navigateToStub = env.sandbox.stub(navigator, 'navigateTo');
    navigateToStub.callsFake(() => {
      /* make fake to avoid redirect */
    });
    storage = Services.storageForDoc(env.ampdoc);
    platform = {
      getServiceId: () => Promise.resolve(PLATFORM_ID),
      consentDeferredAccountCreation: () => {},
    };
    fetchStub = env.sandbox.stub(xhr, 'fetchJson');
    deferredCreationStub = env.sandbox.stub(
      platform,
      'consentDeferredAccountCreation'
    );
  });

  it('should not call deferred account creation when user is already found', async () => {
    const actualStorage = await storage;
    env.sandbox
      .stub(actualStorage, 'get')
      .callsFake(() => Promise.resolve(undefined));
    env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

    fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
      Promise.resolve({
        json: () => Promise.resolve({found: true}),
      })
    );

    deferredCreationStub.returns(Promise.resolve());

    const deferredFlow = new DeferredAccountFlow(
      env.ampdoc,
      HAS_ACCOUNT_URL,
      CREATE_ACCOUNT_URL,
      platform
    );
    await deferredFlow.run(ENTITLEMENT);

    expect(deferredCreationStub).to.not.be.called;
  });

  it('should redirect to new account creation page when associated account absent', async () => {
    const actualStorage = await storage;
    env.sandbox
      .stub(actualStorage, 'get')
      .callsFake(() => Promise.resolve(undefined));
    env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

    fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
      Promise.resolve({
        json: () => Promise.resolve({found: false}),
      })
    );

    deferredCreationStub.returns(Promise.resolve(true));

    const deferredFlow = new DeferredAccountFlow(
      env.ampdoc,
      HAS_ACCOUNT_URL,
      CREATE_ACCOUNT_URL,
      platform
    );
    await deferredFlow.run(ENTITLEMENT);

    expect(fetchStub).to.be.calledWith(HAS_ACCOUNT_URL, {
      body: {
        entitlements: RAW_ENTITLEMENT,
      },
      credentials: 'include',
      method: 'POST',
    });
    expect(navigateToStub).to.be.calledWith(env.win, CREATE_ACCOUNT_URL);
  });

  it('should not redirect to new account creation page when user gives no consent', async () => {
    const actualStorage = await storage;
    env.sandbox
      .stub(actualStorage, 'get')
      .callsFake(() => Promise.resolve(undefined));
    env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

    fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
      Promise.resolve({
        json: () => Promise.resolve({found: false}),
      })
    );

    deferredCreationStub.returns(Promise.resolve(false));

    const deferredFlow = new DeferredAccountFlow(
      env.ampdoc,
      HAS_ACCOUNT_URL,
      CREATE_ACCOUNT_URL,
      platform
    );
    await deferredFlow.run(ENTITLEMENT);

    expect(fetchStub).to.be.calledWith(HAS_ACCOUNT_URL, {
      body: {
        entitlements: RAW_ENTITLEMENT,
      },
      credentials: 'include',
      method: 'POST',
    });
    expect(navigateToStub).to.not.be.called;
  });

  describe('local storage', async () => {
    it('should skip call to publisher API when user is already found', async () => {
      const actualStorage = await storage;
      env.sandbox
        .stub(actualStorage, 'get')
        .withArgs(`account-exists-on-publisher-side_${ENTITLEMENT_HASH}`)
        .callsFake(() => Promise.resolve(true));
      env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

      deferredCreationStub.returns(Promise.resolve(true));

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );
      await deferredFlow.run(ENTITLEMENT);

      expect(fetchStub).to.not.be.called;
      expect(deferredCreationStub).to.not.be.called;
    });

    it('should still redirect when user not found fetched by local storage', async () => {
      const actualStorage = await storage;
      env.sandbox
        .stub(actualStorage, 'get')
        .withArgs(`account-exists-on-publisher-side_${ENTITLEMENT_HASH}`)
        .callsFake(() => Promise.resolve(false));
      env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

      fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
        Promise.resolve({
          json: () => Promise.resolve({found: false}),
        })
      );

      deferredCreationStub.returns(Promise.resolve(true));

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );
      await deferredFlow.run(ENTITLEMENT);

      expect(fetchStub).to.not.be.called;
      expect(deferredCreationStub).to.be.called;
    });

    it('should save data when setStorageData_ is called', async () => {
      const actualStorage = await storage;
      const saveStorageStub = env.sandbox
        .stub(actualStorage, 'set')
        .callsFake(() => Promise.resolve());

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );
      await deferredFlow.setStorageData_('storage_key', ENTITLEMENT, 'data');

      expect(saveStorageStub).to.be.calledWith(
        `storage_key_${ENTITLEMENT_HASH}`,
        'data'
      );
    });

    it('should save user found status and rejection', async () => {
      const actualStorage = await storage;
      env.sandbox
        .stub(actualStorage, 'get')
        .withArgs(`account-exists-on-publisher-side_${ENTITLEMENT_HASH}`)
        .callsFake(() => Promise.resolve());

      fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
        Promise.resolve({
          json: () => Promise.resolve({found: false}),
        })
      );

      deferredCreationStub.returns(Promise.resolve(false));

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );

      const saveStorageStub = env.sandbox
        .stub(deferredFlow, 'setStorageData_')
        .callsFake(() => Promise.resolve());

      await deferredFlow.run(ENTITLEMENT);

      expect(fetchStub).to.be.called;
      expect(deferredCreationStub).to.be.called;
      expect(saveStorageStub).to.be.calledWith(
        `account-exists-on-publisher-side`,
        ENTITLEMENT,
        false
      );
      expect(saveStorageStub).to.be.calledWith(
        `user-rejected-account-creation-request`,
        ENTITLEMENT,
        true
      );
    });

    it('should not make any call if user has already rejected consent', async () => {
      const actualStorage = await storage;
      env.sandbox
        .stub(actualStorage, 'get')
        .withArgs(`user-rejected-account-creation-request_${ENTITLEMENT_HASH}`)
        .callsFake(() => Promise.resolve(true));
      env.sandbox.stub(actualStorage, 'set').callsFake(() => Promise.resolve());

      deferredCreationStub.returns(Promise.resolve());

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );
      await deferredFlow.run(ENTITLEMENT);

      expect(fetchStub).to.not.be.called;
      expect(deferredCreationStub).to.not.be.called;
    });

    it('should handle storage exceptions when loading data', async () => {
      const actualStorage = await storage;
      env.sandbox
        .stub(actualStorage, 'get')
        .callsFake(() => Promise.reject(new Error('unsupported storage')));
      env.sandbox
        .stub(actualStorage, 'set')
        .callsFake(() => Promise.reject(new Error('unsupported storage')));

      deferredCreationStub.returns(Promise.resolve());
      fetchStub.withArgs(HAS_ACCOUNT_URL).returns(
        Promise.resolve({
          json: () => Promise.resolve({found: false}),
        })
      );

      const deferredFlow = new DeferredAccountFlow(
        env.ampdoc,
        HAS_ACCOUNT_URL,
        CREATE_ACCOUNT_URL,
        platform
      );
      await deferredFlow.run(ENTITLEMENT);

      expect(fetchStub).to.be.called;
      expect(deferredCreationStub).to.be.called;
    });
  });
});

/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
  AmpUserNotification,
  UserNotificationManager,
} from '../amp-user-notification';
import {
  getServiceForDoc,
  getServicePromiseForDoc,
} from '../../../../src/service';


describes.realWin('amp-user-notification', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-user-notification'],
  },
}, env => {
  let ampdoc;
  let win;
  let dftAttrs;
  let storageMock;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    win = env.win;
    dftAttrs = {
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get/here',
      'data-dismiss-href': 'https://www.ampproject.org/post/here',
      'layout': 'nodisplay',
    };
    const storage = getServiceForDoc(ampdoc, 'storage');
    storageMock = sandbox.mock(storage);

    return getServicePromiseForDoc(ampdoc, 'userNotificationManager')
        .then(manager => {
          sandbox.stub(manager, 'registerUserNotification');
        });
  });

  function getUserNotification(attrs = {}) {
    const doc = win.document;
    const elem = doc.createElement('amp-user-notification');
    elem.getAmpDoc = () => ampdoc;

    for (const attr in attrs) {
      elem.setAttribute(attr, attrs[attr]);
    }
    const button = doc.createElement('button');
    button.setAttribute('on', 'tap:' + elem.getAttribute('id') + 'dismiss');
    elem.appendChild(button);

    doc.body.appendChild(elem);
    return elem;
  }

  it('should have storage key', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();
    expect(impl.storageKey_).to.equal('amp-user-notification:n1');
  });

  it('should require an id', () => {
    const el = getUserNotification({
      'data-show-if-href': 'https://www.ampproject.org/get/here',
      'data-dismiss-href': 'https://www.ampproject.org/post/here',
      'layout': 'nodisplay',
    });
    const impl = el.implementation_;
    expect(impl.buildCallback.bind(impl)).to.throw(/should have an id/);
  });

  it('should NOT require `data-show-if-href`', () => {
    const el = getUserNotification({
      id: 'n1',
    });
    const impl = el.implementation_;
    expect(impl.buildCallback.bind(impl)).to.not.throw;
  });

  it('should NOT require `data-dismiss-href`', () => {
    const el = getUserNotification({
      id: 'n1',
      'data-show-if-href': 'https://www.ampproject.org/get',
    });
    const impl = el.implementation_;
    expect(impl.buildCallback.bind(impl)).to.not.throw;
  });

  it('isDismissed should return true if dismissal has been recorded', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .once();
    impl.isDismissed().then(dismissed => {
      expect(dismissed).to.be.true;
      storageMock.verify();
    });
  });

  it('isDismissed should return false if dismissal has not been recorded',
      () => {
        const el = getUserNotification(dftAttrs);
        const impl = el.implementation_;
        impl.buildCallback();

        storageMock.expects('get')
            .withExactArgs('amp-user-notification:n1')
            .returns(Promise.resolve(null))
            .once();
        impl.isDismissed().then(dismissed => {
          expect(dismissed).to.be.false;
          storageMock.verify();
        });
      });

  it('isDismissed should return false if data-persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get').never();
    impl.isDismissed().then(dismissed => {
      expect(dismissed).to.be.false;
      storageMock.verify();
    });
  });

  it('isDismissed should return false if storage throws error', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();
    impl.isDismissed().then(dismissed => {
      expect(dismissed).to.be.false;
      storageMock.verify();
    });
  });

  it('shouldShow should return false if storage has been recorded', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    sandbox.stub(impl, 'getAsyncCid_').throws();
    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .once();
    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(false);
      storageMock.verify();
    });
  });

  it('should skip storage if data-persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .never();

    const cidStub = sandbox.stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(true);
      expect(cidStub).to.be.calledOnce;
      expect(showEndpointStub).to.be.calledOnce;
      storageMock.verify();
    });
  });

  it('should set persistDismissal to false', () => {
    const el = getUserNotification({
      id: 'n1',
      layout: 'nodisplay',
      'data-persist-dismissal': false,
    });
    const impl = el.implementation_;
    impl.buildCallback();
    expect(impl.persistDismissal_).to.be.false;
  });

  it('should set persistDismissal to true for any other value', () => {
    const el = getUserNotification({
      id: 'n1',
      layout: 'nodisplay',
      'data-persist-dismissal': 'anything',
    });
    const impl = el.implementation_;
    impl.buildCallback();
    expect(impl.persistDismissal_).to.be.true;
  });

  it('shouldShow should fallback to xhr and return true', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

    const cidStub = sandbox.stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(true);
      expect(cidStub).to.be.calledOnce;
      expect(showEndpointStub).to.be.calledOnce;
      storageMock.verify();
    });
  });

  it('shouldShow should fallback to xhr and return false', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

    const cidStub = sandbox.stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: false}));

    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(false);
      expect(cidStub).to.be.calledOnce;
      expect(showEndpointStub).to.be.calledOnce;
      storageMock.verify();
    });
  });

  it('shouldShow should return true if not stored and no xhr', () => {
    const el = getUserNotification({id: 'n1'});
    const impl = el.implementation_;
    impl.buildCallback();

    sandbox.stub(impl, 'getAsyncCid_').throws();
    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(undefined))
        .once();
    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(true);
      storageMock.verify();
    });
  });

  it('shouldShow should recover from error to xhr', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();

    const cidStub = sandbox.stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    const showEndpointStub = sandbox.stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(true);
      expect(cidStub).to.be.calledOnce;
      expect(showEndpointStub).to.be.calledOnce;
      storageMock.verify();
    });
  });

  it('shouldShow should recover from error and return true with no xhr', () => {
    const el = getUserNotification({id: 'n1'});
    const impl = el.implementation_;
    impl.buildCallback();

    sandbox.stub(impl, 'getAsyncCid_').throws();
    storageMock.expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();
    return impl.shouldShow().then(shouldShow => {
      expect(shouldShow).to.equal(true);
      storageMock.verify();
    });
  });

  it('should store value on dismiss and run post', () => {
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .once();
    const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

    impl.dismiss();
    expect(postDismissStub).to.be.calledOnce;
    return impl.storagePromise_.then(() => {
      storageMock.verify();
    });
  });

  it('should ignore post on dismiss if not configured', () => {
    const el = getUserNotification({id: 'n1'});
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .once();
    const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

    impl.dismiss();
    expect(postDismissStub).to.have.not.been.called;
    return impl.storagePromise_.then(() => {
      storageMock.verify();
    });
  });

  it('should not store value on dismiss if persist-dismissal=false', () => {
    dftAttrs['data-persist-dismissal'] = false;
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .never();
    const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

    impl.dismiss();
    expect(postDismissStub).to.be.calledOnce;
    return impl.storagePromise_.then(() => {
      storageMock.verify();
    });
  });

  it('should not store value on dismiss if persist-dismissal=no', () => {
    dftAttrs['data-persist-dismissal'] = 'no';
    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();

    storageMock.expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .never();
    const postDismissStub = sandbox.stub(impl, 'postDismissEnpoint_');

    impl.dismiss();
    expect(postDismissStub).to.be.calledOnce;
    return impl.storagePromise_.then(() => {
      storageMock.verify();
    });
  });

  it('should have class `amp-active`', () => {
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();
    impl.dialogPromise_ = Promise.resolve();
    const addToFixedLayerStub = sandbox.stub(
        impl.getViewport(), 'addToFixedLayer');

    expect(el).to.not.have.class('amp-active');

    return impl.shouldShow().then(() => {
      expect(el).to.not.have.class('amp-active');
      return impl.show().then(() => {
        expect(el).to.have.class('amp-active');
        expect(addToFixedLayerStub).to.be.calledOnce;
        expect(addToFixedLayerStub.getCall(0).args[0]).to.equal(el);
      });
    });
  });

  it('should not have `amp-active`', () => {
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: false}));

    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();
    impl.dialogPromise_ = Promise.resolve();
    impl.dialogResolve_ = function() {};

    expect(el).to.not.have.class('amp-active');

    return impl.shouldShow().then(shouldShow => {
      if (shouldShow) {
        impl.show();
      }

      expect(el).to.not.have.class('amp-active');
    });
  });

  it('should have `amp-hidden` and no `amp-active`', () => {
    sandbox.stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
    sandbox.stub(AmpUserNotification.prototype,
        'getShowEndpoint_').returns(Promise.resolve({showNotification: true}));
    const stub2 = sandbox.stub(AmpUserNotification.prototype,
        'postDismissEnpoint_').returns(Promise.resolve());

    const el = getUserNotification(dftAttrs);
    const impl = el.implementation_;
    impl.buildCallback();
    impl.dialogPromise_ = Promise.resolve();
    impl.dialogResolve_ = function() {};
    const removeFromFixedLayerStub = sandbox.stub(
        impl.getViewport(), 'removeFromFixedLayer');

    expect(el).to.not.have.class('amp-active');

    return impl.shouldShow().then(shouldShow => {
      if (shouldShow) {
        impl.show();
      }
      expect(el).to.have.class('amp-active');
      expect(stub2.calledOnce).to.be.false;
      impl.executeAction({method: 'dismiss', satisfiesTrust: () => true});
      expect(el).to.not.have.class('amp-active');
      expect(el).to.have.class('amp-hidden');
      expect(stub2.calledOnce).to.be.true;
      expect(removeFromFixedLayerStub).to.be.calledOnce;
      expect(removeFromFixedLayerStub.getCall(0).args[0]).to.equal(el);
    });
  });

  it('should have a default `role` if unspecified', () => {
    const el = getUserNotification({id: 'n1'});
    const impl = el.implementation_;
    impl.buildCallback();
    expect(el.getAttribute('role')).to.equal('alert');
  });

  it('should not override `role` if specified', () => {
    const el = getUserNotification({id: 'n1', role: 'status'});
    const impl = el.implementation_;
    impl.buildCallback();
    expect(el.getAttribute('role')).to.equal('status');
  });

  describe('buildPostDismissRequest_', () => {
    it('should return JSON request body', () => {
      const el = getUserNotification(dftAttrs);
      const impl = el.implementation_;
      const elementId = 'elementId';
      const ampUserId = '1';
      const request = impl.buildPostDismissRequest_('application/json',
          elementId, ampUserId);
      expect(request.method).to.equal('POST');
      expect(request.body.elementId).to.equal(elementId);
      expect(request.body.ampUserId).to.equal(ampUserId);
    });
  });

  describe('buildGetHref_', () => {

    it('should do url replacement', () => {
      dftAttrs['data-show-if-href'] = 'https://www.ampproject.org/path/?ord=RANDOM';
      const el = getUserNotification(dftAttrs);
      const impl = el.implementation_;
      impl.buildCallback();
      return impl.buildGetHref_('12345').then(href => {
        const value = href.match(/\?ord=(.*)$/)[1];
        expect(href).to.not.contain('RANDOM');
        expect(parseInt(value, 10)).to.be.a('number');
      });
    });

    it('should build a valid url', () => {
      const el = getUserNotification(dftAttrs);
      const impl = el.implementation_;
      impl.buildCallback();
      return impl.buildGetHref_('12345').then(href => {
        expect(href).to
            .equal('https://www.ampproject.org/get/here?elementId=n1&ampUserId=12345');
      });
    });
  });

  describe('userNotificationManager', () => {
    let service;
    let tag;

    beforeEach(() => {
      service = new UserNotificationManager(ampdoc);
      service.managerReadyPromise_ = Promise.resolve();
      service.nextInQueue_ = service.managerReadyPromise_;
      tag = {
        shouldShow: () => Promise.resolve(true),
        show: () => Promise.resolve(),
      };
    });

    it('getNotificaiton should return notification object after ' +
        'registration', () => {
      const element = getUserNotification();
      const notification = new AmpUserNotification(element);
      service.registerUserNotification('n1', notification);
      return Promise.all([
        expect(service.getNotification('n1'))
            .to.eventually.equal(notification),
        expect(service.getNotification('n2'))
            .to.eventually.equal(undefined),
      ]);
    });

    it('should be able to get AmpUserNotification object by ID', () => {
      const element = getUserNotification();
      const userNotification = new AmpUserNotification(element);
      userNotification.dialogResolve_();
      service.registerUserNotification('n1', userNotification);
      return expect(service.get('n1')).to.eventually.equal(userNotification);
    });

    it('should queue up multiple amp-user-notification elements', () => {
      const tag1 = Object.assign({}, tag);
      const tag2 = Object.assign({}, tag);
      const show1 = sandbox.spy(tag, 'show');
      const show2 = sandbox.spy(tag1, 'show');
      const show3 = sandbox.spy(tag2, 'show');
      const p1 = service.registerUserNotification('n1', tag);
      const p2 = service.registerUserNotification('n2', tag1);
      const p3 = service.registerUserNotification('n3', tag2);

      return p1.then(() => {
        expect(show1.calledOnce).to.be.true;
        expect(show2.calledOnce).to.be.false;
        expect(show3.calledOnce).to.be.false;
        return p2.then(() => {
          expect(show2.calledOnce).to.be.true;
          expect(show3.calledOnce).to.be.false;
          return p3.then(() => {
            expect(show3.calledOnce).to.be.true;
          });
        });
      });
    });

    it('should be able to get before a registration of an element', () => {
      const get = service.get.bind(service, 'n4');
      expect(get).to.not.throw();
      expect(get().then).to.be.a('function');
    });
  });

  describe('optOutOfCid', () => {
    const cidMock = {
      optOut() {
        return optoutPromise;
      },
    };
    let dismissSpy;
    let optoutPromise;
    let optOutOfCidStub;

    beforeEach(() => {
      optOutOfCidStub = sandbox.spy(cidMock, 'optOut');
    });

    it('should call cid.optOut() and dismiss', () => {
      const element = getUserNotification({id: 'n1'});
      const impl = element.implementation_;
      impl.buildCallback();
      optoutPromise = Promise.resolve();
      impl.getCidService_ = () => { return Promise.resolve(cidMock); };
      dismissSpy = sandbox.spy(impl, 'dismiss');

      return impl.optoutOfCid_().then(() => {
        expect(dismissSpy).to.be.calledWithExactly(false);
        expect(optOutOfCidStub).to.be.calledOnce;
      });
    });

    it('should dissmiss without persistence if cid.optOut() fails', () => {
      const element = getUserNotification({id: 'n1'});
      const impl = element.implementation_;
      impl.buildCallback();
      optoutPromise = Promise.reject('failed');
      impl.getCidService_ = () => { return Promise.resolve(cidMock); };
      dismissSpy = sandbox.spy(impl, 'dismiss');

      return impl.optoutOfCid_().then(() => {
        expect(dismissSpy).to.be.calledWithExactly(true);
        expect(optOutOfCidStub).to.be.calledOnce;
      });
    });

  });
});

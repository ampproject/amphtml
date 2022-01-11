import {Services} from '#service';

import {macroTask} from '#testing/helpers';

import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service-helpers';
import {GEO_IN_GROUP} from '../../../amp-geo/0.1/amp-geo-in-group';
import {
  AmpUserNotification,
  UserNotificationManager,
} from '../amp-user-notification';

describes.realWin(
  'amp-user-notification',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-user-notification'],
    },
  },
  (env) => {
    let ampdoc;
    let win;
    let dftAttrs;
    let storageMock;
    let ISOCountryGroups;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      win = env.win;
      dftAttrs = {
        id: 'n1',
        'data-show-if-href': 'https://www.ampproject.org/get/here',
        'data-dismiss-href': 'https://www.ampproject.org/post/here',
        'layout': 'nodisplay',
      };

      resetServiceForTesting(win, 'geo');
      registerServiceBuilder(win, 'geo', function () {
        return Promise.resolve({
          isInCountryGroup: (group) =>
            ISOCountryGroups.indexOf(group) >= 0
              ? GEO_IN_GROUP.IN
              : GEO_IN_GROUP.NOT_IN,
        });
      });

      const el = ampdoc.getHeadNode();
      return Promise.all([
        Services.userNotificationManagerForDoc(el),
        Services.storageForDoc(el),
      ]).then((services) => {
        const userNotificationManager = services[0];
        env.sandbox.stub(userNotificationManager, 'registerUserNotification');

        const storage = services[1];
        storageMock = env.sandbox.mock(storage);
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

    it('should have storage key', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();
      expect(impl.storageKey_).to.equal('amp-user-notification:n1');
    });

    it('should require an id', async () => {
      const el = getUserNotification({
        'data-show-if-href': 'https://www.ampproject.org/get/here',
        'data-dismiss-href': 'https://www.ampproject.org/post/here',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      allowConsoleError(() => {
        expect(impl.buildCallback.bind(impl)).to.throw(/should have an id/);
      });
    });

    it.skip('should NOT require `data-show-if-href`', async () => {
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'nafta',
      });
      const impl = await el.getImpl(false);
      expect(impl.buildCallback.bind(impl)).to.not.throw();
    });

    it.skip('should NOT require `data-show-if-geo`', async () => {
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-href': 'https://www.ampproject.org/get',
      });
      const impl = await el.getImpl(false);
      expect(impl.buildCallback.bind(impl)).to.not.throw();
    });

    it('should throw if more than one data-how-if-* attrib is defined', async () => {
      const el = getUserNotification({
        'data-show-if-href': 'https://www.ampproject.org/get/here',
        'data-show-if-geo': 'foo',
        'id': 'n1',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      allowConsoleError(() =>
        expect(impl.buildCallback.bind(impl)).to.throw(
          /Only one "data-show-if-\*" attribute allowed​​​/
        )
      );
    });

    it.skip('should NOT require `data-dismiss-href`', async () => {
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-href': 'https://www.ampproject.org/get',
      });
      const impl = await el.getImpl(false);
      expect(impl.buildCallback.bind(impl)).to.not.throw();
    });

    it('isDismissed should return true if dismissal has been recorded', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .once();
      impl.isDismissed().then((dismissed) => {
        expect(dismissed).to.be.true;
        storageMock.verify();
      });
    });

    it('isDismissed should return false if dismissal has not been recorded', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(null))
        .once();
      impl.isDismissed().then((dismissed) => {
        expect(dismissed).to.be.false;
        storageMock.verify();
      });
    });

    it('isDismissed should return false if data-persist-dismissal=false', async () => {
      dftAttrs['data-persist-dismissal'] = false;
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock.expects('get').never();
      impl.isDismissed().then((dismissed) => {
        expect(dismissed).to.be.false;
        storageMock.verify();
      });
    });

    it('isDismissed should return false if storage throws error', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();
      impl.isDismissed().then((dismissed) => {
        expect(dismissed).to.be.false;
        storageMock.verify();
      });
    });

    it('shouldShow should return false if storage has been recorded', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      env.sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .once();
      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(false);
        storageMock.verify();
      });
    });

    it('should skip storage if data-persist-dismissal=false', async () => {
      dftAttrs['data-persist-dismissal'] = false;
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(true))
        .never();

      const cidStub = env.sandbox
        .stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      const showEndpointStub = env.sandbox
        .stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
        storageMock.verify();
      });
    });

    it('should set persistDismissal to false', async () => {
      const el = getUserNotification({
        id: 'n1',
        layout: 'nodisplay',
        'data-persist-dismissal': false,
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();
      expect(impl.persistDismissal_).to.be.false;
    });

    it('should set persistDismissal to true for any other value', async () => {
      const el = getUserNotification({
        id: 'n1',
        layout: 'nodisplay',
        'data-persist-dismissal': 'anything',
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();
      expect(impl.persistDismissal_).to.be.true;
    });

    it('shouldShow should fallback to xhr and return true', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

      const cidStub = env.sandbox
        .stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      const showEndpointStub = env.sandbox
        .stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
        storageMock.verify();
      });
    });

    it('shouldShow should fallback to xhr and return false', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

      const cidStub = env.sandbox
        .stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      const showEndpointStub = env.sandbox
        .stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: false}));

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(false);
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
        storageMock.verify();
      });
    });

    it.skip('shouldShow should return true if not stored and no xhr', async () => {
      const el = getUserNotification({id: 'n1'});
      const impl = await el.getImpl(false);
      impl.buildCallback();

      env.sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(undefined))
        .once();
      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
        storageMock.verify();
      });
    });

    it('shouldShow should recover from error to xhr', async () => {
      expectAsyncConsoleError(
        '[amp-user-notification] Failed to read storage intentional'
      );
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();

      const cidStub = env.sandbox
        .stub(impl, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      const showEndpointStub = env.sandbox
        .stub(impl, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
        expect(cidStub).to.be.calledOnce;
        expect(showEndpointStub).to.be.calledOnce;
        storageMock.verify();
      });
    });

    it.skip('shouldShow should recover from error and return true with no xhr', async () => {
      expectAsyncConsoleError(
        '[amp-user-notification] Failed to read storage intentional'
      );
      const el = getUserNotification({id: 'n1'});
      const impl = await el.getImpl(false);
      impl.buildCallback();

      env.sandbox.stub(impl, 'getAsyncCid_').throws();
      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.reject('intentional'))
        .once();
      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
        storageMock.verify();
      });
    });

    it.skip('should store value on dismiss and run post', async () => {
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .once();
      const postDismissStub = env.sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.be.calledOnce;
      return impl.storagePromise_.then(() => {
        storageMock.verify();
      });
    });

    it.skip('should ignore post on dismiss if not configured', async () => {
      const el = getUserNotification({id: 'n1'});
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .once();
      const postDismissStub = env.sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.have.not.been.called;
      return impl.storagePromise_.then(() => {
        storageMock.verify();
      });
    });

    it('should not store value on dismiss if persist-dismissal=false', async () => {
      dftAttrs['data-persist-dismissal'] = false;
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .never();
      const postDismissStub = env.sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.be.calledOnce;
      return impl.storagePromise_.then(() => {
        storageMock.verify();
      });
    });

    it('shouldShow should return true if no datashow-if-* is specified', async () => {
      const el = getUserNotification({
        id: 'n1',
        'layout': 'nodisplay',
      });
      ISOCountryGroups = [];
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
      });
    });

    it('shouldShow should return true if geo matches', async () => {
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'nafta',
        'layout': 'nodisplay',
      });
      ISOCountryGroups = ['nafta'];
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
      });
    });

    it('shouldShow should hande comma separated country groups', async () => {
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'eea, nafta, anz',
        'layout': 'nodisplay',
      });
      ISOCountryGroups = ['nafta'];
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('get')
        .withExactArgs('amp-user-notification:n1')
        .returns(Promise.resolve(false))
        .once();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
      });
    });

    it('shouldShow should return false if geo does not match', async () => {
      ISOCountryGroups = ['nafta'];
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'eea',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(false);
      });
    });

    it('shouldShow should return false no match and comma separated groups', async () => {
      ISOCountryGroups = ['nafta'];
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'eea',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(false);
      });
    });

    it('shouldShow should return true when not geo is used', async () => {
      ISOCountryGroups = [];
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-not-geo': 'anz',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(true);
      });
    });

    it('shouldShow should return false when any match not geo is used', async () => {
      ISOCountryGroups = ['waldo'];
      const el = getUserNotification({
        id: 'n1',
        'data-show-if-geo': 'eea, nafta, anz',
        'layout': 'nodisplay',
      });
      const impl = await el.getImpl(false);
      impl.buildCallback();

      return impl.shouldShow().then((shouldShow) => {
        expect(shouldShow).to.equal(false);
      });
    });

    it('should not store value on dismiss if persist-dismissal=no', async () => {
      dftAttrs['data-persist-dismissal'] = 'no';
      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();

      storageMock
        .expects('set')
        .withExactArgs('amp-user-notification:n1', true)
        .returns(Promise.resolve())
        .never();
      const postDismissStub = env.sandbox.stub(impl, 'postDismissEnpoint_');

      impl.dismiss();
      expect(postDismissStub).to.be.calledOnce;
      return impl.storagePromise_.then(() => {
        storageMock.verify();
      });
    });

    it('should have class `amp-active`', async () => {
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));

      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      const addToFixedLayerStub = env.sandbox.stub(
        impl.getViewport(),
        'addToFixedLayer'
      );

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

    it('should not have `amp-active`', async () => {
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: false}));

      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      impl.dialogResolve_ = function () {};

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then((shouldShow) => {
        if (shouldShow) {
          impl.show();
        }

        expect(el).to.not.have.class('amp-active');
      });
    });

    it('should have `amp-hidden` and no `amp-active`', async () => {
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getAsyncCid_')
        .returns(Promise.resolve('12345'));
      env.sandbox
        .stub(AmpUserNotification.prototype, 'getShowEndpoint_')
        .returns(Promise.resolve({showNotification: true}));
      const stub2 = env.sandbox
        .stub(AmpUserNotification.prototype, 'postDismissEnpoint_')
        .returns(Promise.resolve());

      const el = getUserNotification(dftAttrs);
      const impl = await el.getImpl(false);
      impl.buildCallback();
      impl.dialogPromise_ = Promise.resolve();
      impl.dialogResolve_ = function () {};
      const removeFromFixedLayerStub = env.sandbox.stub(
        impl.getViewport(),
        'removeFromFixedLayer'
      );

      expect(el).to.not.have.class('amp-active');

      return impl.shouldShow().then((shouldShow) => {
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

    it.skip('should have a default `role` if unspecified', async () => {
      const el = getUserNotification({id: 'n1'});
      const impl = await el.getImpl(false);
      impl.buildCallback();
      expect(el.getAttribute('role')).to.equal('alert');
    });

    it.skip('should not override `role` if specified', async () => {
      const el = getUserNotification({id: 'n1', role: 'status'});
      const impl = await el.getImpl(false);
      impl.buildCallback();
      expect(el.getAttribute('role')).to.equal('status');
    });

    describe('buildPostDismissRequest_', async () => {
      it('should return JSON request body', async () => {
        const el = getUserNotification(dftAttrs);
        const impl = await el.getImpl(false);
        const elementId = 'elementId';
        const ampUserId = '1';
        const request = impl.buildPostDismissRequest_(
          'application/json',
          elementId,
          ampUserId
        );
        expect(request.method).to.equal('POST');
        expect(request.body.elementId).to.equal(elementId);
        expect(request.body.ampUserId).to.equal(ampUserId);
      });
    });

    describe('buildGetHref_', () => {
      it('should do url replacement', async () => {
        dftAttrs['data-show-if-href'] =
          'https://www.ampproject.org/path/?ord=RANDOM';
        const el = getUserNotification(dftAttrs);
        const impl = await el.getImpl(false);
        impl.buildCallback();
        return impl.buildGetHref_('12345').then((href) => {
          const value = href.match(/\?ord=(.*)$/)[1];
          expect(href).to.not.contain('RANDOM');
          expect(parseInt(value, 10)).to.be.a('number');
        });
      });

      it('should build a valid url', async () => {
        const el = getUserNotification(dftAttrs);
        const impl = await el.getImpl(false);
        impl.buildCallback();
        return impl.buildGetHref_('12345').then((href) => {
          expect(href).to.equal(
            'https://www.ampproject.org/get/here?elementId=n1&ampUserId=12345'
          );
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

      it.skip(
        'getNotificaiton should return notification object after ' +
          'registration',
        () => {
          const element = getUserNotification();
          const notification = new AmpUserNotification(element);
          service.registerUserNotification('n1', notification);
          return Promise.all([
            expect(service.getNotification('n1')).to.eventually.equal(
              notification
            ),
            expect(service.getNotification('n2')).to.eventually.equal(
              undefined
            ),
          ]);
        }
      );

      it.skip('should be able to get AmpUserNotification object by ID', () => {
        const element = getUserNotification();
        const userNotification = new AmpUserNotification(element);
        userNotification.dialogResolve_();
        service.registerUserNotification('n1', userNotification);
        return expect(service.get('n1')).to.eventually.equal(userNotification);
      });

      it('should queue up multiple amp-user-notification elements', function* () {
        const tag1 = {...tag};
        const tag2 = {...tag};
        let resolve1;
        let resolve2;

        const s1 = new Promise((resolve) => {
          resolve1 = resolve;
        });
        const s2 = new Promise((resolve) => {
          resolve2 = resolve;
        });

        const show1 = env.sandbox.stub(tag, 'show').callsFake(() => {
          return s1;
        });
        const show2 = env.sandbox.stub(tag1, 'show').callsFake(() => {
          return s2;
        });
        const show3 = env.sandbox.spy(tag2, 'show');

        service.registerUserNotification('n1', tag);
        service.registerUserNotification('n2', tag1);
        service.registerUserNotification('n3', tag2);
        yield macroTask();

        expect(show1).to.be.calledOnce;
        expect(show2).to.not.be.called;
        expect(show3).to.not.be.called;

        resolve1();
        yield macroTask();
        expect(show2).to.be.calledOnce;
        expect(show3).to.not.be.called;

        resolve2();
        yield macroTask();
        expect(show3).to.be.calledOnce;
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
        optOutOfCidStub = env.sandbox.spy(cidMock, 'optOut');
      });

      it.skip('should call cid.optOut() and dismiss', async () => {
        const element = getUserNotification({id: 'n1'});
        const impl = await element.getImpl(false);
        impl.buildCallback();
        optoutPromise = Promise.resolve();
        impl.getCidService_ = () => {
          return Promise.resolve(cidMock);
        };
        dismissSpy = env.sandbox.spy(impl, 'dismiss');

        return impl.optoutOfCid_().then(() => {
          expect(dismissSpy).to.be.calledWithExactly(false);
          expect(optOutOfCidStub).to.be.calledOnce;
        });
      });

      it.skip('should dismiss without persistence if cid.optOut() fails', async () => {
        expectAsyncConsoleError(
          '[amp-user-notification] Failed to opt out of Cid failed'
        );

        const element = getUserNotification({id: 'n1'});
        const impl = await element.getImpl(false);
        impl.buildCallback();
        optoutPromise = Promise.reject('failed');
        impl.getCidService_ = () => {
          return Promise.resolve(cidMock);
        };
        dismissSpy = env.sandbox.spy(impl, 'dismiss');

        return impl.optoutOfCid_().then(() => {
          expect(dismissSpy).to.be.calledWithExactly(true);
          expect(optOutOfCidStub).to.be.calledOnce;
        });
      });
    });
  }
);

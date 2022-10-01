import * as fakeTimers from '@sinonjs/fake-timers';

import {Services} from '#service';

import * as log from '#utils/log';

import {macroTask} from '#testing/helpers';

import {installLinkerReaderService} from '../linker-reader';
import {RequestHandler, expandPostMessage} from '../requests';
import * as ResourceTiming from '../resource-timing';
import {installSessionServiceForTesting} from '../session-manager';
import {ExpansionOptions, installVariableServiceForTesting} from '../variables';

describes.realWin('Requests', {amp: 1}, (env) => {
  let ampdoc;
  let clock;
  let preconnect;
  let preconnectSpy;
  let analyticsElement;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    installLinkerReaderService(env.win);
    installVariableServiceForTesting(ampdoc);
    installSessionServiceForTesting(ampdoc);
    ampdoc.defaultView = env.win;
    clock = fakeTimers.withGlobal(ampdoc.win).install();
    preconnectSpy = env.sandbox.spy();
    preconnect = {
      url: preconnectSpy,
    };
    analyticsElement = env.win.document.createElement('amp-analytics');
    env.win.document.body.appendChild(analyticsElement);
    analyticsElement.getAmpDoc = () => ampdoc;
  });

  afterEach(() => {
    clock.uninstall();
  });

  function createRequestHandler(request, spy) {
    return new RequestHandler(
      analyticsElement,
      request,
      preconnect,
      {sendRequest: spy},
      false
    );
  }

  describe('RequestHandler', () => {
    describe('send with request origin', () => {
      let spy;
      beforeEach(() => {
        spy = env.sandbox.spy();
      });

      it('should convert expandUrlAsync(baseUrl) errors into user errors', async () => {
        env.sandbox.stub(Services, 'urlReplacementsForDoc').returns({
          expandUrlAsync: async () => {
            throw new Error('Invalid URL');
          },
        });

        env.sandbox.stub(log, 'userAssert');

        const baseUrl = 'https://?';
        const r = {baseUrl, 'origin': 'http://example.test'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});

        await macroTask();

        expect(
          log.userAssert.withArgs(
            false,
            env.sandbox.match(new RegExp(`${baseUrl}.+Invalid URL`))
          )
        ).to.have.been.calledOnce;
      });

      it('should prepend request origin', function* () {
        const r = {'baseUrl': '/r1', 'origin': 'http://example.test'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('http://example.test/r1');
      });

      it('handle trailing slash in request origin', function* () {
        const r = {'baseUrl': '/r1', 'origin': 'http://example.test/'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('http://example.test/r1');
      });

      it('handle trailing path in request origin', function* () {
        const r = {'baseUrl': '/r1', 'origin': 'http://example.test/test'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('http://example.test/r1');
      });

      it('handle empty requestOrigin', function* () {
        const r = {'baseUrl': '/r1', 'origin': ''};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('/r1');
      });

      it('handle undefined requestOrigin', function* () {
        const r = {'baseUrl': '/r1', 'origin': undefined};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('/r1');
      });

      it('handle baseUrl with no leading slash', function* () {
        const r = {
          'baseUrl': 'r1',
          'origin': 'https://requestorigin.test',
        };
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('https://requestorigin.testr1');
      });

      it('prepend request origin to absolute baseUrl', function* () {
        const r = {
          'baseUrl': 'https://baseurl.test',
          'origin': 'https://requestorigin.test',
        };
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith(
          'https://requestorigin.testhttps://baseurl.test'
        );
      });

      it('handle relative request origin', function* () {
        const r = {
          'baseUrl': '/r1',
          'origin': '/requestorigin',
        };
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith(
          'http://localhost:9876/r1' // 9876 is the port karma uses
        );
      });

      it('should expand request origin', function* () {
        const r = {'baseUrl': '/r2', 'origin': '${documentReferrer}'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({
          'documentReferrer': 'http://example.test',
        });

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('http://example.test/r2');
      });

      it('should expand nested request origin', function* () {
        const r = {'baseUrl': '/r3', 'origin': '${a}'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({
          'a': '${b}',
          'b': 'http://example.test',
        });

        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledWith('http://example.test/r3');
      });
    });

    describe('batch', () => {
      it('should batch multiple send', function* () {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r2', 'batchInterval': 1};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should work properly with no batch', function* () {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r1'};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledTwice;
      });

      it('should preconnect', function* () {
        const r = {'baseUrl': 'r2?cid=CLIENT_ID(scope)&var=${test}'};
        const handler = createRequestHandler(r, env.sandbox.spy());
        const expansionOptions = new ExpansionOptions({'test': 'expanded'});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(preconnectSpy).to.be.calledWith(
          env.sandbox.match.object, // AmpDoc
          env.sandbox.match(/^r2\?cid=amp-[^&]+&var=expanded$/)
        );
      });
    });

    describe('batch with batchInterval', () => {
      let spy;
      beforeEach(() => {
        spy = env.sandbox.spy();
      });

      it('should support number', () => {
        const r = {'baseUrl': 'r1', 'batchInterval': 5};
        const handler = createRequestHandler(r, spy);

        expect(handler.batchIntervalPointer_).to.not.be.null;
        expect(handler.batchInterval_).to.deep.equal([5000]);
      });

      it('should support array', () => {
        const r = {'baseUrl': 'r1', 'batchInterval': [1, 2, 3]};
        const handler = createRequestHandler(r, spy);

        expect(handler.batchIntervalPointer_).to.not.be.null;
        expect(handler.batchInterval_).to.deep.equal([1000, 2000, 3000]);
      });

      it('should check batchInterval is valid', () => {
        //Should be number
        const r1 = {'baseUrl': 'r', 'batchInterval': 'invalid'};
        const r2 = {'baseUrl': 'r', 'batchInterval': ['invalid']};
        try {
          createRequestHandler(r1, spy);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          createRequestHandler(r2, spy);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }

        //Should be greater than BATCH_INTERVAL_MIN
        const r3 = {'baseUrl': 'r', 'batchInterval': 0.01};
        const r4 = {'baseUrl': 'r', 'batchInterval': [-1, 5]};
        const r5 = {'baseUrl': 'r', 'batchInterval': [1, 0.01]};
        try {
          createRequestHandler(r3, spy);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          createRequestHandler(r4, spy);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          createRequestHandler(r5, spy);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
      });

      it('should schedule send request with interval array', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': [1, 2]};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});
        clock.tick(998);
        handler.send({}, {}, expansionOptions, {});
        clock.tick(2);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.not.be.called;
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.not.be.called;
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should not schedule send request w/o trigger', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': [1]};
        createRequestHandler(r, spy);
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should schedule send independent of trigger immediate', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': [1, 2]};
        const handler = createRequestHandler(r, spy);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(999);
        handler.send({}, {'important': true}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });
    });

    describe('reportWindow', () => {
      let spy;
      beforeEach(() => {
        spy = env.sandbox.spy();
      });

      it('should accept reportWindow with number', () => {
        const r = {'baseUrl': 'r', 'reportWindow': 1};
        const handler = createRequestHandler(r, spy);

        const r2 = {'baseUrl': 'r', 'reportWindow': '2'};
        const handler2 = createRequestHandler(r2, spy);

        const r3 = {'baseUrl': 'r', 'reportWindow': 'invalid'};
        const handler3 = createRequestHandler(r3, spy);

        expect(handler.reportWindow_).to.equal(1);
        expect(handler2.reportWindow_).to.equal(2);
        expect(handler3.reportWindow_).to.be.null;
      });

      it('should stop bathInterval outside batch report window', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 0.5, 'reportWindow': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        clock.tick(500);
        expect(handler.batchIntervalTimeoutId_).to.be.null;
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should stop send request outside batch report window', function* () {
        const r = {'baseUrl': 'r', 'reportWindow': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.resetHistory();
        clock.tick(1000);
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should flush batch queue after batch report window', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 5, 'reportWindow': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should respect immediate trigger', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 0.2, 'reportWindow': 0.5};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        clock.tick(500);
        yield macroTask();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(200);
        expect(spy).to.not.be.called;
        handler.send({}, {'important': true}, expansionOptions, {});
      });
    });

    describe('batch segments', () => {
      it('should respect config extraUrlParam', function* () {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r1', 'batchInterval': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        handler.send({'e1': 'e1'}, {}, expansionOptions);
        handler.send({'e1': 'e1'}, {}, expansionOptions);
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledWith('r1', [
          {extraUrlParams: {e1: 'e1'}, timestamp: 0, trigger: undefined},
          {extraUrlParams: {e1: 'e1'}, timestamp: 0, trigger: undefined},
        ]);
      });

      it('should respect trigger extraUrlParam', function* () {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r1', 'batchInterval': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({'v2': '中'});
        handler.send(
          {},
          {
            'extraUrlParams': {
              'e1': 'e1',
              'e2': '${v2}', // check vars are used and not double encoded
            },
          },
          expansionOptions,
          {}
        );
        handler.send(
          {},
          {'extraUrlParams': {'e1': 'e1'}},
          expansionOptions,
          {}
        );
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledWith('r1', [
          {
            extraUrlParams: {e1: 'e1', e2: '中'},
            timestamp: 0,
            trigger: undefined,
          },
          {extraUrlParams: {e1: 'e1'}, timestamp: 0, trigger: undefined},
        ]);
      });

      it('should respect nested extraUrlParam', async () => {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r1', 'batchInterval': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({
          'test1': 'TEST1',
          'test2': 'TEST2',
          'test3': 'TEST3',
        });
        const expansionOptions2 = new ExpansionOptions({
          'test1': 'Test1',
          'test2': 'Test2',
          'test3': 'Test3',
        });
        const trigger = {
          'extraUrlParams': {
            'e1': {
              'e2': {
                'data': '${test1}',
              },
            },
            'e3': [['${test2}'], '${test3}'],
          },
        };
        handler.send({}, trigger, expansionOptions, {});
        handler.send({}, trigger, expansionOptions2, {});

        clock.tick(1000);
        await macroTask();
        expect(spy).to.be.calledWith('r1', [
          {
            extraUrlParams: {
              e1: {
                e2: {
                  data: 'TEST1',
                },
              },
              e3: [['TEST2'], 'TEST3'],
            },
            timestamp: 0,
            trigger: undefined,
          },
          {
            extraUrlParams: {
              e1: {
                e2: {
                  data: 'Test1',
                },
              },
              e3: [['Test2'], 'Test3'],
            },
            timestamp: 0,
            trigger: undefined,
          },
        ]);
      });

      it('should keep extraUrlParam', function* () {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r1&${extraUrlParams}&r2', 'batchInterval': 1};
        const handler = createRequestHandler(r, spy);

        const expansionOptions = new ExpansionOptions({});
        handler.send(
          {},
          {'extraUrlParams': {'e1': 'e1'}},
          expansionOptions,
          {}
        );
        handler.send(
          {},
          {'extraUrlParams': {'e2': 'e2'}},
          expansionOptions,
          {}
        );
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledWith('r1&${extraUrlParams}&r2', [
          {extraUrlParams: {e1: 'e1'}, timestamp: 0, trigger: undefined},
          {extraUrlParams: {e2: 'e2'}, timestamp: 0, trigger: undefined},
        ]);
      });
    });

    describe('batch plugin', () => {
      it('should throw error when defined on non batched request', () => {
        const spy = env.sandbox.spy();
        const r = {'baseUrl': 'r', 'batchPlugin': '_ping_'};
        try {
          createRequestHandler(r, spy);
        } catch (e) {
          expect(e).to.match(
            /batchPlugin cannot be set on non-batched request/
          );
        }
      });

      it('should throw error with unsupported batchPlugin', () => {
        const spy = env.sandbox.spy();
        const r = {
          'baseUrl': 'r',
          'batchInterval': 1,
          'batchPlugin': 'invalid',
        };
        try {
          createRequestHandler(r, spy);
        } catch (e) {
          expect(e).to.match(/unsupported batch plugin/);
        }
      });
    });
  });

  it('should replace dynamic bindings RESOURCE_TIMING', function* () {
    const spy = env.sandbox.spy();
    const r = {'baseUrl': 'r1&${resourceTiming}'};
    const handler = createRequestHandler(r, spy);
    const expansionOptions = new ExpansionOptions({
      'resourceTiming': 'RESOURCE_TIMING',
    });
    env.sandbox
      .stub(ResourceTiming, 'getResourceTiming')
      .returns(Promise.resolve('resource-timing'));
    handler.send({}, {}, expansionOptions);
    yield macroTask();
    expect(spy).to.be.calledWith('r1&resource-timing');
  });

  it('should replace dynamic bindings CONSENT_STATE', function* () {
    const spy = env.sandbox.spy();
    const r = {'baseUrl': 'r1&$CONSENT_STATEtest&${consentState}test2'};
    const handler = createRequestHandler(r, spy);
    const expansionOptions = new ExpansionOptions({
      'consentState': 'CONSENT_STATE',
    });
    handler.send({}, {}, expansionOptions);
    yield macroTask();
    expect(spy).to.be.calledWith('r1&test&test2');
  });

  it('should replace dynamic bindings CONSENT_METADATA', async () => {
    const spy = env.sandbox.spy();
    const r = {
      'baseUrl':
        'r1&$CONSENT_METADATA(gdprApplies)test&${consentMetadata(additionalConsent)}test2',
    };
    const handler = createRequestHandler(r, spy);
    const expansionOptions = new ExpansionOptions({
      'consentMetadata': 'CONSENT_METADATA',
    });
    handler.send({}, {}, expansionOptions);
    await macroTask();
    expect(spy).to.be.calledWith('r1&test&test2');
  });

  it('COOKIE read cookie value', function* () {
    const spy = env.sandbox.spy();
    const r = {'baseUrl': 'r1&c1=COOKIE(test)&c2=${cookie(test)}'};
    let handler = createRequestHandler(r, spy);
    const expansionOptions = new ExpansionOptions({
      'cookie': 'COOKIE',
    });
    handler.send({}, {}, expansionOptions);
    yield macroTask();
    expect(spy).to.be.calledWith('r1&c1=&c2=');

    env.win.document.cookie = 'test=123';
    spy.resetHistory();
    handler = createRequestHandler(r, spy);
    handler.send({}, {}, expansionOptions);
    yield macroTask();
    expect(spy).to.be.calledWith('r1&c1=123&c2=123');
  });

  describe('expandPostMessage', () => {
    let expansionOptions;
    let params;
    let element;

    beforeEach(() => {
      expansionOptions = new ExpansionOptions({
        'teste1': 'TESTE1',
        'teste3': 3,
        'teste4': true,
      });
      params = {
        'e1': '${teste1}',
        'e2': 'teste2',
        'e3': '${teste3}',
        'e4': '${teste4}',
      };
      // expandPostMessage() uses the URL replacements service scoped to the
      // passed element. Use the top-level service for testing.
      element = env.win.document.documentElement;
    });

    it('should expand', () => {
      return expandPostMessage(
        ampdoc,
        'test foo 123 ... ${teste1}',
        undefined,
        {},
        expansionOptions,
        element
      ).then((msg) => {
        expect(msg).to.equal('test foo 123 ... TESTE1');
      });
    });

    it('should replace not append ${extraUrlParams}', () => {
      const replacePromise = expandPostMessage(
        ampdoc,
        'test ${extraUrlParams} foo',
        params /* configParams */,
        {} /* trigger */,
        expansionOptions,
        element
      );
      const appendPromise = expandPostMessage(
        ampdoc,
        'test foo',
        params /* configParams */,
        {} /* trigger */,
        expansionOptions,
        element
      );
      return replacePromise.then((replace) => {
        expect(replace).to.equal('test e1=TESTE1&e2=teste2&e3=3&e4=true foo');
        expect(appendPromise).to.eventually.equal('test foo');
      });
    });
  });
});

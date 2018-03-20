/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as lolex from 'lolex';
import {ExpansionOptions, installVariableService} from '../variables';
import {REPLACEMENT_EXP_NAME} from '../../../../src/service/url-replacements-impl';
import {RequestHandler, expandConfigRequest} from '../requests';
import {dict} from '../../../../src/utils/object';
import {macroTask} from '../../../../testing/yield';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('Requests', {amp: 1}, env => {
  let ampdoc;
  let analytics;
  let clock;
  let preconnect;
  let preconnectSpy;

  beforeEach(() => {
    installVariableService(env.win);
    ampdoc = env.ampdoc;
    analytics = {getAmpDoc: function() { return ampdoc; }};
    clock = lolex.install({target: ampdoc.win});
    preconnectSpy = sandbox.spy();
    preconnect = {
      url: preconnectSpy,
    };
  });

  afterEach(() => {
    clock.uninstall();
  });

  describe('RequestHandler', () => {
    describe('batch', () => {
      it('should batch multiple send', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r2', 'batchInterval': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
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
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1'};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledTwice;
      });


      it('should preconnect', function* () {
        const r = {'baseUrl': 'r2?cid=CLIENT_ID(scope)&var=${test}'};
        const handler = new RequestHandler(
            analytics, r, preconnect, sandbox.spy(), false);
        const expansionOptions = new ExpansionOptions({'test': 'expanded'});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(preconnectSpy).to.be.calledWith(
            'r2?cid=CLIENT_ID(scope)&var=expanded');
      });
    });

    describe('batch with batchInterval', () => {
      let spy;
      beforeEach(() => {
        spy = sandbox.spy();
      });

      it('should support number', () => {
        const r = {'baseUrl': 'r1', 'batchInterval': 5};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        expect(handler.batchIntervalPointer_).to.not.be.null;
        expect(handler.batchInterval_).to.deep.equal([5000]);
      });

      it('should support array', () => {
        const r = {'baseUrl': 'r1', 'batchInterval': [1, 2, 3]};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        expect(handler.batchIntervalPointer_).to.not.be.null;
        expect(handler.batchInterval_).to.deep.equal([1000, 2000, 3000]);
      });

      it('should check batchInterval is valid', () => {
        //Should be number
        const r1 = {'baseUrl': 'r', 'batchInterval': 'invalid'};
        const r2 = {'baseUrl': 'r', 'batchInterval': ['invalid']};
        try {
          new RequestHandler(analytics, r1, preconnect, spy, false);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          new RequestHandler(analytics, r2, preconnect, spy, false);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }

        //Should be greater than BATCH_INTERVAL_MIN
        const r3 = {'baseUrl': 'r', 'batchInterval': 0.01};
        const r4 = {'baseUrl': 'r', 'batchInterval': [-1, 5]};
        const r5 = {'baseUrl': 'r', 'batchInterval': [1, 0.01]};
        try {
          new RequestHandler(analytics, r3, preconnect, spy, false);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          new RequestHandler(analytics, r4, preconnect, spy, false);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
        try {
          new RequestHandler(analytics, r5, preconnect, spy, false);
          throw new Error('should never happen');
        } catch (e) {
          expect(e).to.match(/Invalid batchInterval value/);
        }
      });

      it('should schedule send request with interval array', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': [1, 2]};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        clock.tick(998);
        handler.send({}, {}, expansionOptions, {});
        clock.tick(2);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.not.be.called;
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
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
        new RequestHandler(analytics, r, preconnect, spy, false);
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should schedule send independent of trigger immediate', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': [1, 2]};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(999);
        handler.send({}, {'important': true}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });
    });

    describe('reportWindow', () => {
      let spy;
      beforeEach(() => {
        spy = sandbox.spy();
      });

      it('should accept reportWindow with number', () => {
        const r = {'baseUrl': 'r', 'reportWindow': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const r2 = {'baseUrl': 'r', 'reportWindow': '2'};
        const handler2 = new RequestHandler(
            analytics, r2, preconnect, spy, false);
        const r3 = {'baseUrl': 'r', 'reportWindow': 'invalid'};
        const handler3 = new RequestHandler(
            analytics, r3, preconnect, spy, false);
        expect(handler.reportWindow_).to.equal(1);
        expect(handler2.reportWindow_).to.equal(2);
        expect(handler3.reportWindow_).to.be.null;
      });

      it('should stop bathInterval outside batch report window', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 0.5, 'reportWindow': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        clock.tick(500);
        expect(handler.batchIntervalTimeoutId_).to.be.null;
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should stop send request outside batch report window', function* () {
        const r = {'baseUrl': 'r', 'reportWindow': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledOnce;
        spy.reset();
        clock.tick(1000);
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.not.be.called;
      });

      it('should flush batch queue after batch report window', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 5, 'reportWindow': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should respect immediate trigger', function* () {
        const r = {'baseUrl': 'r', 'batchInterval': 0.2, 'reportWindow': 0.5};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
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
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1', 'batchInterval': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({'e1': 'e1'}, {}, expansionOptions, {});
        handler.send({'e1': 'e1'}, {}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('r1?e1=e1&e1=e1');
      });

      it('should respect trigger extraUrlParam', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1', 'batchInterval': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({'v2': '中'});
        handler.send({}, {
          'extraUrlParams': {
            'e1': 'e1',
            'e2': '${v2}', // check vars are used and not double encoded
          },
        }, expansionOptions, {});
        handler.send(
            {}, {'extraUrlParams': {'e1': 'e1'}}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('r1?e1=e1&e2=%E4%B8%AD&e1=e1');
      });

      it('should replace extraUrlParam', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1&${extraUrlParams}&r2', 'batchInterval': 1};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send(
            {}, {'extraUrlParams': {'e1': 'e1'}}, expansionOptions, {});
        handler.send(
            {}, {'extraUrlParams': {'e2': 'e2'}}, expansionOptions, {});
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('r1&e1=e1&e2=e2&r2');
      });
    });

    describe('batch plugin', () => {
      it('should throw error when defined on non batched request', () => {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r', 'batchPlugin': '_ping_'};
        try {
          new RequestHandler(analytics, r, preconnect, spy, false);
        } catch (e) {
          expect(e).to.match(
              /batchPlugin cannot be set on non-batched request/);
        }
      });

      it('should throw error with unsupported batchPlugin', () => {
        const spy = sandbox.spy();
        const r =
            {'baseUrl': 'r', 'batchInterval': 1, 'batchPlugin': 'invalid'};
        try {
          new RequestHandler(analytics, r, preconnect, spy, false);
        } catch (e) {
          expect(e).to.match(/unsupported batch plugin/);
        }
      });

      it('should handle batchPlugin function error', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r', 'batchInterval': 1, 'batchPlugin': '_ping_'};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        // Overwrite batchPlugin function
        handler.batchingPlugin_ = () => {throw new Error('test');};
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {'extraUrlParams': {'e1': 'e1'}}, expansionOptions);
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('');
      });

      it('should pass in correct batchSegments', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r', 'batchInterval': 1, 'batchPlugin': '_ping_'};
        const handler = new RequestHandler(
            analytics, r, preconnect, spy, false);
        // Overwrite batchPlugin function
        const batchPluginSpy = sandbox.spy(handler, 'batchingPlugin_');
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {'on': 'timer', 'extraUrlParams': {'e1': 'e1'}},
            expansionOptions);
        clock.tick(5);
        // Test that we decode when pass to batchPlugin function
        handler.send({}, {'on': 'click', 'extraUrlParams': {'e2': '&e2'}},
            expansionOptions);
        clock.tick(5);
        handler.send({}, {'on': 'visible', 'extraUrlParams': {'e3': ''}},
            expansionOptions);
        clock.tick(1000);
        yield macroTask();
        expect(batchPluginSpy).to.be.calledOnce;
        expect(batchPluginSpy).to.be.calledWith('r', [dict({
          'trigger': 'timer',
          'timestamp': 0,
          'extraUrlParams': {
            'e1': 'e1',
          },
        }), dict({
          'trigger': 'click',
          'timestamp': 5,
          'extraUrlParams': {
            'e2': '&e2',
          },
        }), dict({
          'trigger': 'visible',
          'timestamp': 10,
          'extraUrlParams': {
            'e3': '',
          },
        })]);
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith('testFinalUrl');
      });
    });
  });

  //TODO: Move the expansion related tests here.

  it('expandConfigRequest function', () => {
    let config = {
      'requests': {
        'foo': 'test',
        'bar': {
          'baseUrl': 'test1',
        },
        'foobar': {},
      },
    };
    config = expandConfigRequest(config);
    expect(config).to.jsonEqual({
      'requests': {
        'foo': {
          'baseUrl': 'test',
        },
        'bar': {
          'baseUrl': 'test1',
        },
        'foobar': {},
      },
    });
  });

  it('should replace dynamic bindings', function* () {
    const spy = sandbox.spy();
    const r = {'baseUrl': 'r1&${extraUrlParams}&BASE_VALUE'};
    const handler = new RequestHandler(
        analytics, r, preconnect, spy, false);
    const expansionOptions = new ExpansionOptions({
      'param1': 'PARAM_1',
      'param2': 'PARAM_2',
      'param3': 'PARAM_3',
    });
    const bindings = {
      'PARAM_1': 'val1',
      'PARAM_2': () => 'val2',
      'PARAM_3': Promise.resolve('val3'),
      'BASE_VALUE': 'val_base',
    };
    const params = {
      'extraUrlParams': {
        'key1': '${param1}',
        'key2': '${param2}',
        'key3': '${param3}',
      },
    };
    handler.send({}, params, expansionOptions, bindings);
    yield macroTask();
    expect(spy).to.be.calledOnce;
    expect(spy.args[0][0]).to.equal(
        'r1&key1=val1&key2=val2&key3=val3&val_base');
  });


  it('should replace bindings with v2 flag', function* () {
    toggleExperiment(env.win, REPLACEMENT_EXP_NAME, true);
    const spy = sandbox.spy();
    const r = {
      'baseUrl': 'r1&${extraUrlParams}&BASE_VALUE&foo=${foo}',
    };
    const handler = new RequestHandler(
        analytics, r, preconnect, spy, false);
    const expansionOptions = new ExpansionOptions({
      'param1': 'PARAM_1',
      'param2': 'PARAM_2',
      'param3': 'PARAM_3',
      'foo': 'TOUPPERCASE(BASE64(foo))',
    });
    const bindings = {
      'PARAM_1': 'val1',
      'PARAM_2': () => 'val2',
      'PARAM_3': Promise.resolve('val3'),
      'BASE_VALUE': 'val_base',
    };
    const params = {
      'extraUrlParams': {
        'key1': '${param1}',
        'key2': '${param2}',
        'key3': '${param3}',
      },
    };
    handler.send({}, params, expansionOptions, bindings);
    yield macroTask();
    expect(spy).to.be.calledOnce;
    expect(spy.args[0][0]).to.equal(
        'r1&key1=val1&key2=val2&key3=val3&val_base&foo=ZM9V');
    toggleExperiment(env.win, REPLACEMENT_EXP_NAME);
  });
});

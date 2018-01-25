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

import {installVariableService, ExpansionOptions} from '../variables';
import {expandConfigRequest, RequestHandler} from '../requests';
import {macroTask} from '../../../../testing/yield';
import {dict} from '../../../../src/utils/object';
import * as lolex from 'lolex';


describes.realWin('Requests', {amp: 1}, env => {
  let ampdoc;
  let clock;
  let preconnect;
  let preconnectSpy;

  beforeEach(() => {
    installVariableService(env.win);
    ampdoc = env.ampdoc;
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
    describe('batch Delay', () => {
      it('maxDelay should  be a number', () => {
        const r1 = {'baseUrl': 'r1', 'maxDelay': 1};
        const r2 = {'baseUrl': 'r2', 'maxDelay': '2'};
        const r3 = {'baseUrl': 'r3', 'maxDelay': '2.5'};
        const r4 = {'baseUrl': 'r4', 'maxDelay': 'invalid'};
        const r5 = {'baseUrl': 'r5'};
        const handler1 = new RequestHandler(ampdoc, r1, preconnect, false);
        const handler2 = new RequestHandler(ampdoc, r2, preconnect, false);
        const handler3 = new RequestHandler(ampdoc, r3, preconnect, false);
        const handler4 = new RequestHandler(ampdoc, r4, preconnect, false);
        const handler5 = new RequestHandler(ampdoc, r5, preconnect, false);
        expect(handler1.maxDelay_).to.equal(1);
        expect(handler2.maxDelay_).to.equal(2);
        expect(handler3.maxDelay_).to.equal(2.5);
        expect(handler4.maxDelay_).to.equal(0);
        expect(handler5.maxDelay_).to.equal(0);
      });

      it('should work properly with 0 delay', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1'};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(spy).to.be.calledTwice;
      });

      it('should respect maxDelay', function* () {
        const h1Spy = sandbox.spy();
        const h2Spy = sandbox.spy();
        const r1 = {'baseUrl': 'r1'};
        const r2 = {'baseUrl': 'r2', 'maxDelay': 1};
        const handler1 =
            new RequestHandler(ampdoc, r1, preconnect, h1Spy, false);
        const handler2 =
            new RequestHandler(ampdoc, r2, preconnect, h2Spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler1.send({}, {}, expansionOptions, {});
        handler1.send({}, {}, expansionOptions, {});
        handler2.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(h1Spy).to.be.calledTwice;
        clock.tick(999);
        yield macroTask();
        expect(h2Spy).to.not.be.called;
        clock.tick(1);
        yield macroTask();
        expect(h2Spy).to.be.calledOnce;
      });

      it('should batch multiple send', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r2', 'maxDelay': 1};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
        const expansionOptions = new ExpansionOptions({});
        handler.send({}, {}, expansionOptions, {});
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        handler.send({}, {}, expansionOptions, {});
        clock.tick(500);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should preconnect', function* () {
        const r = {'baseUrl': 'r2?cid=CLIENT_ID(scope)&var=${test}'};
        const handler =
            new RequestHandler(ampdoc, r, preconnect, sandbox.spy(), false);
        const expansionOptions = new ExpansionOptions({'test': 'expanded'});
        handler.send({}, {}, expansionOptions, {});
        yield macroTask();
        expect(preconnectSpy).to.be.calledWith(
            'r2?cid=CLIENT_ID(scope)&var=expanded');


      });
    });

    describe('batch segments', () => {
      it('should respect config extraUrlParam', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r1', 'maxDelay': 1};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
        const r = {'baseUrl': 'r1', 'maxDelay': 1};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
        const r = {'baseUrl': 'r1&${extraUrlParams}&r2', 'maxDelay': 1};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
        const r = {'baseUrl': 'r', 'maxDelay': 0, 'batchPlugin': '_ping_'};
        try {
          new RequestHandler(ampdoc, r, preconnect, spy, false);
        } catch (e) {
          expect(e).to.match(
              /batchPlugin cannot be set on non-batched request/);
        }
      });

      it('should throw error with unsupported batchPlugin', () => {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r', 'maxDelay': 1, 'batchPlugin': 'invalid'};
        try {
          new RequestHandler(ampdoc, r, preconnect, spy, false);
        } catch (e) {
          expect(e).to.match(/unsupported batch plugin/);
        }
      });

      it('should handle batchPlugin function error', function* () {
        const spy = sandbox.spy();
        const r = {'baseUrl': 'r', 'maxDelay': 1, 'batchPlugin': '_ping_'};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
        const r = {'baseUrl': 'r', 'maxDelay': 1, 'batchPlugin': '_ping_'};
        const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
    const handler = new RequestHandler(ampdoc, r, preconnect, spy, false);
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
});

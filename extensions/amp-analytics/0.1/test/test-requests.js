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
import * as lolex from 'lolex';


describes.realWin('Requests', {amp: 1}, env => {
  let win;
  let ampdoc;
  let clock;
  let preconnect;
  let preconnectSpy;

  beforeEach(() => {
    installVariableService(env.win);
    win = env.win;
    ampdoc = env.ampdoc;
    clock = lolex.install(win);
    preconnectSpy = sandbox.spy();
    preconnect = {
      url: preconnectSpy,
    };
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
        handler.send({}, {}, expansionOptions);
        handler.send({}, {}, expansionOptions);
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
        handler1.send({}, {}, expansionOptions);
        handler1.send({}, {}, expansionOptions);
        handler2.send({}, {}, expansionOptions);
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
        handler.send({}, {}, expansionOptions);
        handler.send({}, {}, expansionOptions);
        clock.tick(500);
        handler.send({}, {}, expansionOptions);
        clock.tick(500);
        yield macroTask();
        expect(spy).to.be.calledOnce;
      });

      it('should preconnect', function* () {
        const r = {'baseUrl': 'r2?cid=CLIENT_ID(scope)&var=${test}'};
        const handler =
            new RequestHandler(ampdoc, r, preconnect, sandbox.spy(), false);
        const expansionOptions = new ExpansionOptions({'test': 'expanded'});
        handler.send({}, {}, expansionOptions);
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
        handler.send({'e1': 'e1'}, {}, expansionOptions);
        handler.send({'e1': 'e1'}, {}, expansionOptions);
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
            'e2': '${v2}',  // check vars are used and not double encoded
          },
        }, expansionOptions);
        handler.send({}, {'extraUrlParams': {'e1': 'e1'}}, expansionOptions);
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
        handler.send({}, {'extraUrlParams': {'e1': 'e1'}}, expansionOptions);
        handler.send({}, {'extraUrlParams': {'e2': 'e2'}}, expansionOptions);
        clock.tick(1000);
        yield macroTask();
        expect(spy).to.be.calledOnce;
        expect(spy.args[0][0]).to.equal('r1&e1=e1&e2=e2&r2');
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
});

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

import {ActionService, parseActionMap} from '../../src/service/action-impl';
import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import * as sinon from 'sinon';


describe('ActionService parseAction', () => {
  function parseAction(s) {
    const actionMap = parseActionMap(s);
    if (actionMap == null) {
      return null;
    }
    const keys = Object.keys(actionMap);
    expect(keys).to.have.length(1);
    return actionMap[keys[0]];
  }

  it('should parse full form', () => {
    const a = parseAction('event1:target1.method1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('should parse with default method', () => {
    const a = parseAction('event1:target1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('activate');
  });

  it('should parse with numeric target', () => {
    const a = parseAction('event1:1234.method1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('1234');
    expect(a.method).to.equal('method1');
  });

  it('should parse with lots of whitespace', () => {
    const a = parseAction('  event1  :  target1  .  method1  ');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('should parse with an arg', () => {
    const a = parseAction('event1:target1.method1(key1=value1)');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
  });

  it('should parse with multiple args', () => {
    const a = parseAction('event1:target1.method1(key1=value1, key2 = value2)');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal('value2');
  });

  it('should parse with multiple args with whitespace', () => {
    const a = parseAction(
        'event1:target1.method1  (  key1 =  value1  ,  key2 = value2  ) ');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal('value2');
  });

  it('should parse with no args', () => {
    const a = parseAction('event1:target1.method1()');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args).to.be.null;
  });

  it('should parse with no args with whitespace', () => {
    const a = parseAction('event1:target1.method1 (  ) ');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args).to.be.null;
  });

  it('should parse with double-quoted args', () => {
    const a = parseAction(
        'event1:target1.method1(key1=value1, key2 = "value (2)\'")');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal('value (2)\'');
  });

  it('should parse with single-quoted args', () => {
    const a = parseAction(
        'event1:target1.method1(key1=value1, key2 = \'value (2)"\')');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal('value (2)"');
  });

  it('should parse with args with trailing comma', () => {
    const a = parseAction(
        'event1:target1.method1(key1=value1, )');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(Object.keys(a.args)).to.have.length(1);
  });

  it('should parse with boolean args', () => {
    expect(parseAction('e:t.m(k=true)').args['k']).to.equal(true);
    expect(parseAction('e:t.m(k=false)').args['k']).to.equal(false);
  });

  it('should parse with numeric args', () => {
    expect(parseAction('e:t.m(k=123)').args['k']).to.equal(123);
    expect(parseAction('e:t.m(k=1.23)').args['k']).to.equal(1.23);
    expect(parseAction('e:t.m(k=.123)').args['k']).to.equal(.123);
  });

  it('should parse with term semicolon', () => {
    expect(parseAction('e:t.m(k=1); ').args['k']).to.equal(1);
  });

  it('should parse with args as a proto-less object', () => {
    expect(parseAction('e:t.m(k=1)').args.__proto__).to.be.undefined;
  });

  it('should interprete key always as string', () => {
    expect(parseAction('true:t.m').event).to.equal('true');
    expect(parseAction('e:true.m').target).to.equal('true');
    expect(parseAction('e:t.true').method).to.equal('true');
    expect(parseAction('e:t.m(true=1)').args['true']).to.equal(1);
    expect(parseAction('e:t.m(01=1)').args['01']).to.equal(1);
  });

  it('should parse empty to null', () => {
    const a = parseAction('');
    expect(a).to.equal(null);
  });

  it('should fail parse without event', () => {
    expect(() => {
      parseAction('target1.method1');
    }).to.throw(/expected \[\:\]/);
  });

  it('should fail parse without target', () => {
    expect(() => {
      parseAction('event1:');
    }).to.throw(/Invalid action/);
    expect(() => {
      parseAction('.method1');
    }).to.throw(/Invalid action/);
    expect(() => {
      parseAction('event1:.method1');
    }).to.throw(/Invalid action/);
  });

  it('should fail parse with period in event or method', () => {
    expect(() => {
      parseAction('event.1:target1.method');
    }).to.throw(/Invalid action/);
    expect(() => {
      parseAction('event:target1.method.1');
    }).to.throw(/Invalid action/);
  });

  it('should fail parse with invalid args', () => {
    // No args allowed without explicit action.
    expect(() => {
      parseAction('event:target1()');
    }).to.throw(/Invalid action/);
    // Missing parens
    expect(() => {
      parseAction('event:target1.method(');
    }).to.throw(/Invalid action/);
    expect(() => {
      parseAction('event:target1.method(key = value');
    }).to.throw(/Invalid action/);
    // No arg value.
    expect(() => {
      parseAction('event:target1.method(key)');
    }).to.throw(/Invalid action/);
    expect(() => {
      parseAction('event:target1.method(key=)');
    }).to.throw(/Invalid action/);
    // Missing quote
    expect(() => {
      parseAction('event:target1.method(key = "value)');
    }).to.throw(/Invalid action/);
    // Broken quotes.
    expect(() => {
      parseAction('event:target1.method(key = "value"")');
    }).to.throw(/Invalid action/);
    // Missing comma.
    expect(() => {
      parseAction('event:target1.method(key = value key2 = value2)');
    }).to.throw(/Invalid action/);
  });
});


describe('Action parseActionMap', () => {

  it('should parse with a single action', () => {
    const m = parseActionMap('event1:action1');
    expect(m['event1'].target).to.equal('action1');
  });

  it('should parse with two actions', () => {
    const m = parseActionMap('event1:action1; event2: action2');
    expect(m['event1'].target).to.equal('action1');
    expect(m['event2'].target).to.equal('action2');
  });

  it('should parse with dupe actions by overriding with last', () => {
    const m = parseActionMap('event1:action1; event1: action2');
    // Currently, we overwrite the events.
    expect(m['event1'].target).to.equal('action2');
  });

  it('should parse empty forms to null', () => {
    expect(parseActionMap('')).to.equal(null);
    expect(parseActionMap('  ')).to.equal(null);
    expect(parseActionMap(';;;')).to.equal(null);
  });
});


describe('Action findAction', () => {

  let sandbox;
  let action;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    action = new ActionService(new AmpDocSingle(window));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create action map in getActionMap_', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    const m = action.getActionMap_(element);
    expect(m['event1'].target).to.equal('action1');
  });

  it('should cache action map', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    const m1 = action.getActionMap_(element);
    const m2 = action.getActionMap_(element);
    expect(m1).to.equal(m2);
  });


  it('should find action on the same element', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    const a = action.findAction_(element, 'event1');
    expect(a.node).to.equal(element);
    expect(a.actionInfo.target).to.equal('action1');

    expect(action.findAction_(element, 'event3')).to.equal(null);
  });

  it('should find action in subtree', () => {
    const parent = document.createElement('div');
    parent.setAttribute('on', 'event1:action1');
    const element = document.createElement('div');
    element.setAttribute('on', 'event2:action2');
    parent.appendChild(element);

    let a = action.findAction_(element, 'event1');
    expect(a.node).to.equal(parent);
    expect(a.actionInfo.target).to.equal('action1');

    a = action.findAction_(element, 'event2');
    expect(a.node).to.equal(element);
    expect(a.actionInfo.target).to.equal('action2');

    expect(action.findAction_(element, 'event3')).to.equal(null);
  });
});


describe('Action method', () => {

  let sandbox;
  let action;
  let onEnqueue;
  let targetElement, parent, child, execElement;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    action = new ActionService(new AmpDocSingle(window));
    onEnqueue = sandbox.spy();
    targetElement = document.createElement('target');
    const id = ('E' + Math.random()).replace('.', '');
    targetElement.setAttribute('on', 'tap:' + id + '.method1');
    parent = document.createElement('parent');
    child = document.createElement('child');
    parent.appendChild(targetElement);
    targetElement.appendChild(child);
    document.body.appendChild(parent);

    execElement = document.createElement('amp-element');
    execElement.setAttribute('id', id);
    execElement.enqueAction = onEnqueue;
    parent.appendChild(execElement);
  });

  afterEach(() => {
    document.body.removeChild(parent);
    sandbox.restore();
  });


  it('should invoke on the AMP element', () => {
    action.invoke_(execElement, 'method1', /* args */ null,
        'source1', 'event1');
    expect(onEnqueue.callCount).to.equal(1);
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal('source1');
    expect(inv.event).to.equal('event1');
    expect(inv.args).to.be.null;
  });

  it('should invoke on the AMP element with args', () => {
    action.invoke_(execElement, 'method1', {'key1': 11},
        'source1', 'event1');
    expect(onEnqueue.callCount).to.equal(1);
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal('source1');
    expect(inv.event).to.equal('event1');
    expect(inv.args['key1']).to.equal(11);
  });

  it('should not allow invoke on non-AMP and non-whitelisted element', () => {
    expect(() => {
      action.invoke_({tagName: 'img'}, 'method1', /* args */ null,
          'source1', 'event1');
    }).to.throw(/Target element does not support provided action/);
    expect(onEnqueue.callCount).to.equal(0);
  });

  it('should invoke on non-AMP but whitelisted element', () => {
    const handlerSpy = sandbox.spy();
    const target = {tagName: 'form'};
    action.installActionHandler(target, handlerSpy);
    action.invoke_(target, 'submit', /* args */ null,
        'button', 'tap');
    expect(handlerSpy).to.be.calledOnce;
    const callArgs = handlerSpy.getCall(0).args[0];
    expect(callArgs.target).to.be.equal(target);
    expect(callArgs.method).to.be.equal('submit');
    expect(callArgs.args).to.be.equal(null);
    expect(callArgs.source).to.be.equal('button');
    expect(callArgs.event).to.be.equal('tap');
  });

  it('should not allow invoke on unresolved AMP element', () => {
    expect(() => {
      action.invoke_({tagName: 'amp-img'}, 'method1', /* args */ null,
          'source1', 'event1');
    }).to.throw(/Unrecognized AMP element/);
    expect(onEnqueue.callCount).to.equal(0);
  });

  it('should trigger event', () => {
    action.trigger(child, 'tap', null);
    expect(onEnqueue.callCount).to.equal(1);
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal(targetElement);
  });

  it('should execute method', () => {
    action.execute(execElement, 'method1', {'key1': 11}, child, null);
    expect(onEnqueue.callCount).to.equal(1);
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.args['key1']).to.equal(11);
    expect(inv.source).to.equal(child);
  });
});


describe('Action interceptor', () => {

  let sandbox;
  let clock;
  let action;
  let target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    action = new ActionService(new AmpDocSingle(window));
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getQueue() {
    return target['__AMP_ACTION_QUEUE__'];
  }


  it('should not initialize until called', () => {
    expect(getQueue()).to.be.undefined;
  });

  it('should queue actions', () => {
    action.invoke_(target, 'method1', /* args */ null, 'source1', 'event1');
    action.invoke_(target, 'method2', /* args */ null, 'source2', 'event2');

    const queue = getQueue();
    expect(Array.isArray(queue)).to.be.true;
    expect(queue).to.have.length(2);

    const inv0 = queue[0];
    expect(inv0.target).to.equal(target);
    expect(inv0.method).to.equal('method1');
    expect(inv0.source).to.equal('source1');
    expect(inv0.event).to.equal('event1');

    const inv1 = queue[1];
    expect(inv1.target).to.equal(target);
    expect(inv1.method).to.equal('method2');
    expect(inv1.source).to.equal('source2');
    expect(inv1.event).to.equal('event2');
  });

  it('should dequeue actions after handler set', () => {
    action.invoke_(target, 'method1', /* args */ null, 'source1', 'event1');
    action.invoke_(target, 'method2', /* args */ null, 'source2', 'event2');

    expect(Array.isArray(getQueue())).to.be.true;
    expect(getQueue()).to.have.length(2);

    const handler = sandbox.spy();
    action.installActionHandler(target, handler);
    expect(Array.isArray(getQueue())).to.be.false;
    expect(handler.callCount).to.equal(0);

    clock.tick(10);
    expect(handler.callCount).to.equal(2);

    const inv0 = handler.getCall(0).args[0];
    expect(inv0.target).to.equal(target);
    expect(inv0.method).to.equal('method1');
    expect(inv0.source).to.equal('source1');
    expect(inv0.event).to.equal('event1');

    const inv1 = handler.getCall(1).args[0];
    expect(inv1.target).to.equal(target);
    expect(inv1.method).to.equal('method2');
    expect(inv1.source).to.equal('source2');
    expect(inv1.event).to.equal('event2');

    action.invoke_(target, 'method3', /* args */ null, 'source3', 'event3');
    expect(Array.isArray(getQueue())).to.be.false;
    expect(handler.callCount).to.equal(3);
    const inv2 = handler.getCall(2).args[0];
    expect(inv2.target).to.equal(target);
    expect(inv2.method).to.equal('method3');
    expect(inv2.source).to.equal('source3');
    expect(inv2.event).to.equal('event3');
  });
});


describe('Action common handler', () => {

  let sandbox;
  let action;
  let target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    action = new ActionService(new AmpDocSingle(window));
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');

    action.vsync_ = {mutate: callback => callback()};
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should execute actions registered', () => {
    const action1 = sandbox.spy();
    const action2 = sandbox.spy();
    action.addGlobalMethodHandler('action1', action1);
    action.addGlobalMethodHandler('action2', action2);

    action.invoke_(target, 'action1', /* args */ null, 'source1', 'event1');
    expect(action1.callCount).to.equal(1);
    expect(action2.callCount).to.equal(0);

    action.invoke_(target, 'action2', /* args */ null, 'source2', 'event2');
    expect(action2.callCount).to.equal(1);
    expect(action1.callCount).to.equal(1);

    expect(target['__AMP_ACTION_QUEUE__']).to.not.exist;
  });
});


describe('Core events', () => {
  let sandbox;
  let action;
  let target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(window.document, 'addEventListener');
    action = new ActionService(new AmpDocSingle(window));
    sandbox.stub(action, 'trigger');
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');

    action.vsync_ = {mutate: callback => callback()};
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should trigger tap event', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('click');
    const handler = window.document.addEventListener.getCall(0).args[1];
    const element = {tagName: 'target1', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
  });

  it('should trigger submit event', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('submit');
    const handler = window.document.addEventListener.getCall(1).args[1];
    const element = {tagName: 'target1', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'submit', event);
  });

  it('should trigger change event', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('change');
    const handler = window.document.addEventListener.getCall(2).args[1];
    const element = {tagName: 'target2', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'change', event);
  });
});

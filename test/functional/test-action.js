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
  ActionService,
  OBJECT_STRING_ARGS_KEY,
  applyActionInfoArgs,
  parseActionMap,
} from '../../src/service/action-impl';
import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {createCustomEvent} from '../../src/event-helper';
import {setParentWindow} from '../../src/service';
import * as sinon from 'sinon';


function createExecElement(id, enqueAction) {
  const execElement = document.createElement('amp-element');
  execElement.setAttribute('id', id);
  execElement.enqueAction = enqueAction;
  return execElement;
}


function assertInvocation(inv, target, method, source, opt_event, opt_args) {
  expect(inv.target).to.equal(target);
  expect(inv.method).to.equal(method);
  expect(inv.source).to.equal(source);

  if (opt_event !== undefined) {
    expect(inv.event).to.equal(opt_event);
  }

  if (opt_args !== undefined) {
    expect(inv.args).to.deep.equal(opt_args);
  }
}


describe('ActionService parseAction', () => {
  function parseMultipleActions(s) {
    const actionMap = parseActionMap(s);
    if (actionMap == null) {
      return null;
    }
    const keys = Object.keys(actionMap);
    expect(keys).to.have.length(1);
    return actionMap[keys[0]];
  }

  function parseAction(s) {
    const actions = parseMultipleActions(s);
    if (actions == null) {
      return null;
    }
    expect(actions).to.have.length(1);
    return actions[0];
  }

  it('should parse full form', () => {
    const a = parseAction('event1:target1.method1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('should parse full form with two actions', () => {
    const a = parseMultipleActions('event1:target1.methodA,target2.methodB');
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('target1');
    expect(a[0].method).to.equal('methodA');
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('target2');
    expect(a[1].method).to.equal('methodB');
  });

  it('should parse with default method', () => {
    const a = parseAction('event1:target1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('activate');
  });

  it('should parse with default method for two different targets', () => {
    const a = parseMultipleActions('event1:target1,target2');
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('target1');
    expect(a[0].method).to.equal('activate');
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('target2');
    expect(a[1].method).to.equal('activate');
  });

  it('should parse with numeric target', () => {
    const a = parseAction('event1:1234.method1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('1234');
    expect(a.method).to.equal('method1');
  });

  it('should parse with two numeric targets', () => {
    const a = parseMultipleActions('event1:1234.method1,9876.method2');
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('1234');
    expect(a[0].method).to.equal('method1');
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('9876');
    expect(a[1].method).to.equal('method2');
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
    expect(a.args['key1']()).to.equal('value1');
  });

  it('should parse args in more than one action', () => {
    const a = parseMultipleActions(
      'event1:target1.methodA(key1=value1),target2.methodB(keyA=valueA)');
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('target1');
    expect(a[0].method).to.equal('methodA');
    expect(a[0].args['key1']()).to.equal('value1');
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('target2');
    expect(a[1].method).to.equal('methodB');
    expect(a[1].args['keyA']()).to.equal('valueA');
  });

  it('should parse multiple event types with multiple actions', () => {
    const a = parseActionMap(
        'event1:foo, baz.firstMethod, corge.secondMethod(keyA=valueA);' +
        'event2:bar, qux.thirdMethod, grault.fourthMethod(keyB=valueB)');

    expect(Object.keys(a)).to.have.length(2);

    expect(a['event1']).to.have.length(3);
    expect(a['event2']).to.have.length(3);

    // action definitions for event1
    expect(a['event1'][0].event).to.equal('event1');
    expect(a['event1'][0].target).to.equal('foo');
    expect(a['event1'][0].method).to.equal('activate');
    expect(a['event1'][0].args).to.be.null;

    expect(a['event1'][1].event).to.equal('event1');
    expect(a['event1'][1].target).to.equal('baz');
    expect(a['event1'][1].method).to.equal('firstMethod');
    expect(a['event1'][1].args).to.be.null;

    expect(a['event1'][2].event).to.equal('event1');
    expect(a['event1'][2].target).to.equal('corge');
    expect(a['event1'][2].method).to.equal('secondMethod');
    expect(a['event1'][2].args['keyA']()).to.equal('valueA');

    // action definitions for event2
    expect(a['event2'][0].event).to.equal('event2');
    expect(a['event2'][0].target).to.equal('bar');
    expect(a['event2'][0].method).to.equal('activate');
    expect(a['event2'][0].args).to.be.null;

    expect(a['event2'][1].event).to.equal('event2');
    expect(a['event2'][1].target).to.equal('qux');
    expect(a['event2'][1].method).to.equal('thirdMethod');
    expect(a['event2'][1].args).to.be.null;

    expect(a['event2'][2].event).to.equal('event2');
    expect(a['event2'][2].target).to.equal('grault');
    expect(a['event2'][2].method).to.equal('fourthMethod');
    expect(a['event2'][2].args['keyB']()).to.equal('valueB');
  });

  it('should parse with multiple args', () => {
    const a = parseAction('event1:target1.method1(key1=value1, key2 = value2)');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']()).to.equal('value1');
    expect(a.args['key2']()).to.equal('value2');
  });

  it('should parse with multiple args with whitespace', () => {
    const a = parseAction(
        'event1:target1.method1  (  key1 =  value1  ,  key2 = value2  ) ');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']()).to.equal('value1');
    expect(a.args['key2']()).to.equal('value2');
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
    expect(a.args['key1']()).to.equal('value1');
    expect(a.args['key2']()).to.equal('value (2)\'');
  });

  it('should parse with single-quoted args', () => {
    const a = parseAction(
        'event1:target1.method1(key1=value1, key2 = \'value (2)"\')');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']()).to.equal('value1');
    expect(a.args['key2']()).to.equal('value (2)"');
  });

  it('should parse with args with trailing comma', () => {
    const a = parseAction(
        'event1:target1.method1(key1=value1, )');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']()).to.equal('value1');
    expect(Object.keys(a.args)).to.have.length(1);
  });

  it('should parse with boolean args', () => {
    expect(parseAction('e:t.m(k=true)').args['k']()).to.equal(true);
    expect(parseAction('e:t.m(k=false)').args['k']()).to.equal(false);
  });

  it('should parse with numeric args', () => {
    expect(parseAction('e:t.m(k=123)').args['k']()).to.equal(123);
    expect(parseAction('e:t.m(k=1.23)').args['k']()).to.equal(1.23);
    expect(parseAction('e:t.m(k=.123)').args['k']()).to.equal(.123);
  });

  it('should parse with term semicolon', () => {
    expect(parseAction('e:t.m(k=1); ').args['k']()).to.equal(1);
  });

  it('should parse with args as a proto-less object', () => {
    expect(parseAction('e:t.m(k=1)').args.__proto__).to.be.undefined;
  });

  it('should interprete key always as string', () => {
    expect(parseAction('true:t.m').event).to.equal('true');
    expect(parseAction('e:true.m').target).to.equal('true');
    expect(parseAction('e:t.true').method).to.equal('true');
    expect(parseAction('e:t.m(true=1)').args['true']()).to.equal(1);
    expect(parseAction('e:t.m(01=1)').args['01']()).to.equal(1);
  });

  it('should parse with object literal args', () => {
    const a = parseAction('e:t.m({"foo": {"bar": "qux"}})');
    expect(a.args[OBJECT_STRING_ARGS_KEY]())
        .to.equal('{"foo": {"bar": "qux"}}');
  });

  it('should dereference vars in arg value identifiers', () => {
    const data = {foo: {bar: 'baz'}};
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(a.args['key1']()).to.equal(null);
    expect(a.args['key1'](data)).to.equal('baz');
  });

  it('should NOT dereference vars in identifiers without "." operator', () => {
    const a = parseAction('e:t.m(key1=foo)');
    expect(a.args['key1']({foo: 'bar'})).to.equal('foo');
  });

  it('should NOT dereference vars in arg value strings', () => {
    const a = parseAction('e:t.m(key1="abc")');
    expect(a.args['key1']()).to.equal('abc');
    expect(a.args['key1']({foo: 'bar'})).to.equal('abc');
    expect(() => {
      parseAction('e:t.m(key1="abc".foo)');
    }).to.throw(/Expected either/);
  });

  it('should NOT dereference vars in arg value booleans', () => {
    const a = parseAction('e:t.m(key1=true)');
    expect(a.args['key1']()).to.equal(true);
    expect(a.args['key1']({true: 'bar'})).to.equal(true);
    expect(() => {
      parseAction('e:t.m(key1=true.bar)');
    }).to.throw(/Expected either/);
  });

  it('should NOT dereference vars in arg value numerics', () => {
    const a = parseAction('e:t.m(key1=123)');
    expect(a.args['key1']()).to.equal(123);
    expect(a.args['key1']({123: 'bar'})).to.equal(123);
    expect(() => {
      parseAction('e:t.m(key1=123.bar)');
    }).to.throw(/Expected either/);
  });

  it('should return null for undefined references in arg values', () => {
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(a.args['key1'](null)).to.equal(null);
    expect(a.args['key1']({})).to.equal(null);
    expect(a.args['key1']({foo: null})).to.equal(null);
  });

  it('should NOT dereference non-primitives in arg values', () => {
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(a.args['key1']({foo: {bar: undefined}})).to.equal(null);
    expect(a.args['key1']({foo: {bar: {}}})).to.equal(null);
    expect(a.args['key1']({foo: {bar: []}})).to.equal(null);
    expect(a.args['key1']({foo: {bar: () => {}}})).to.equal(null);
  });

  it('should apply arg functions with no event', () => {
    const a = parseAction('e:t.m(key1=foo)');
    expect(applyActionInfoArgs(a.args, null)).to.deep.equal({key1: 'foo'});
  });

  it('applied arg values should be proto-less objects', () => {
    const a = parseAction('e:t.m(key1=foo)');
    expect(applyActionInfoArgs(a.args, null).__proto__).to.be.undefined;
    expect(applyActionInfoArgs(a.args, null).constructor).to.be.undefined;
  });

  it('should apply arg value functions with an event with data', () => {
    const a = parseAction('e:t.m(key1=event.foo)');
    const event = createCustomEvent(window, 'MyEvent', {foo: 'bar'});
    expect(applyActionInfoArgs(a.args, event)).to.deep.equal({key1: 'bar'});
  });

  it('should apply arg value functions with an event without data', () => {
    const a = parseAction('e:t.m(key1=foo)');
    const event = createCustomEvent(window, 'MyEvent');
    expect(applyActionInfoArgs(a.args, event)).to.deep.equal({key1: 'foo'});
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
    // Empty (2...n)nd target
    expect(() => {
      parseAction('event:target1,');
    }).to.throw(/Invalid action/);
  });
});

describe('Action parseActionMap', () => {

  it('should parse with a single action', () => {
    const m = parseActionMap('event1:action1');
    expect(m['event1'][0].target).to.equal('action1');
  });

  it('should parse with two actions', () => {
    const m = parseActionMap('event1:action1; event2: action2');
    expect(m['event1'][0].target).to.equal('action1');
    expect(m['event2'][0].target).to.equal('action2');
  });

  it('should parse with dupe actions by overriding with last', () => {
    const m = parseActionMap('event1:action1; event1: action2');
    expect(m['event1']).to.have.length(1);
    // Currently, we overwrite the events.
    expect(m['event1'][0].target).to.equal('action2');
  });

  it('should parse empty forms to null', () => {
    expect(parseActionMap('')).to.equal(null);
    expect(parseActionMap('  ')).to.equal(null);
    expect(parseActionMap(';;;')).to.equal(null);
  });
});


describes.sandboxed('Action adoptEmbedWindow', {}, () => {
  let win;
  let action;
  let embedWin;

  beforeEach(() => {
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
    embedWin = {
      frameElement: document.createElement('div'),
      document: document.implementation.createHTMLDocument(''),
    };
    setParentWindow(embedWin, win);
  });

  it('should create embedded action service', () => {
    action.adoptEmbedWindow(embedWin);
    const embedService = embedWin.services.action
        && embedWin.services.action.obj;
    expect(embedService).to.exist;
    expect(embedService.ampdoc).to.equal(action.ampdoc);
    expect(embedService.root_).to.equal(embedWin.document);
  });
});


describe('Action findAction', () => {
  let sandbox;
  let win;
  let action;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should create action map in getActionMap_', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    const m = action.getActionMap_(element);
    expect(m['event1']).to.have.length(1);
    expect(m['event1'][0].target).to.equal('action1');
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
    expect(a.actionInfos).to.have.length(1);
    expect(a.actionInfos[0].target).to.equal('action1');

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
    expect(a.actionInfos).to.have.length(1);
    expect(a.actionInfos[0].target).to.equal('action1');

    a = action.findAction_(element, 'event2');
    expect(a.node).to.equal(element);
    expect(a.actionInfos).to.have.length(1);
    expect(a.actionInfos[0].target).to.equal('action2');

    expect(action.findAction_(element, 'event3')).to.equal(null);
  });
});


describe('Action method', () => {
  let sandbox;
  let win;
  let action;
  let onEnqueue;
  let targetElement, parent, child, execElement;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
    onEnqueue = sandbox.spy();
    targetElement = document.createElement('target');
    const id = ('E' + Math.random()).replace('.', '');
    targetElement.setAttribute('on', 'tap:' + id + '.method1');
    parent = document.createElement('parent');
    child = document.createElement('child');
    parent.appendChild(targetElement);
    targetElement.appendChild(child);
    document.body.appendChild(parent);

    execElement = createExecElement(id, onEnqueue);
    parent.appendChild(execElement);
  });

  afterEach(() => {
    document.body.removeChild(parent);
    sandbox.restore();
  });


  it('should invoke on the AMP element', () => {
    action.invoke_(execElement, 'method1', /* args */ null,
        'source1', 'event1');
    expect(onEnqueue).to.be.calledOnce;
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
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal('source1');
    expect(inv.event).to.equal('event1');
    expect(inv.args['key1']).to.equal(11);
  });

  it('should not allow invoke on non-AMP and non-whitelisted element', () => {
    expect(() => {
      action.invoke_(document.createElement('img'), 'method1', /* args */ null,
          'source1', 'event1');
    }).to.throw(/Target element does not support provided action/);
    expect(onEnqueue).to.have.not.been.called;
  });

  it('should invoke on non-AMP but whitelisted element', () => {
    const handlerSpy = sandbox.spy();
    const target = document.createElement('form');
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
    expect(onEnqueue).to.have.not.been.called;
  });

  it('should trigger event', () => {
    action.trigger(child, 'tap', null);
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal(targetElement);
  });

  it('should execute method', () => {
    action.execute(execElement, 'method1', {'key1': 11}, child, null);
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.target).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.args['key1']).to.equal(11);
    expect(inv.source).to.equal(child);
  });
});


describe('Multiple handlers action method', () => {
  let sandbox;
  let win;
  let action;
  let onEnqueue1, onEnqueue2;
  let targetElement, parent, child, execElement1, execElement2;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
    onEnqueue1 = sandbox.spy();
    onEnqueue2 = sandbox.spy();
    targetElement = document.createElement('target');
    const id1 = 'elementFoo';
    const id2 = 'elementBar';
    targetElement.setAttribute('on', `tap:${id1}.method1,${id2}.method2`);
    parent = document.createElement('parent');
    child = document.createElement('child');
    parent.appendChild(targetElement);
    targetElement.appendChild(child);
    document.body.appendChild(parent);

    execElement1 = createExecElement(id1, onEnqueue1);
    execElement2 = createExecElement(id2, onEnqueue2);

    parent.appendChild(execElement1);
    parent.appendChild(execElement2);
  });

  afterEach(() => {
    document.body.removeChild(parent);
    sandbox.restore();
  });

  it('should trigger event', () => {
    action.trigger(child, 'tap', null);
    expect(onEnqueue1).to.be.calledOnce;
    assertInvocation(onEnqueue1.getCall(0).args[0], execElement1, 'method1',
        targetElement);
    assertInvocation(onEnqueue2.getCall(0).args[0], execElement2, 'method2',
        targetElement);
  });
});


describe('Action interceptor', () => {
  let sandbox;
  let win;
  let clock;
  let action;
  let target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getQueue() {
    return target['__AMP_ACTION_QUEUE__'];
  }

  function getActionHandler() {
    return target['__AMP_ACTION_HANDLER__'];
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
    expect(getActionHandler()).to.be.undefined;
    expect(getQueue()).to.have.length(2);

    const handler = sandbox.spy();
    action.installActionHandler(target, handler);
    expect(getActionHandler()).to.not.be.undefined;
    expect(handler).to.have.not.been.called;

    clock.tick(10);
    expect(handler).to.have.callCount(2);

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
    expect(handler).to.have.callCount(3);
    const inv2 = handler.getCall(2).args[0];
    expect(inv2.target).to.equal(target);
    expect(inv2.method).to.equal('method3');
    expect(inv2.source).to.equal('source3');
    expect(inv2.event).to.equal('event3');
  });
});


describe('Action common handler', () => {
  let sandbox;
  let win;
  let action;
  let target;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
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
    expect(action1).to.be.calledOnce;
    expect(action2).to.have.not.been.called;

    action.invoke_(target, 'action2', /* args */ null, 'source2', 'event2');
    expect(action2).to.be.calledOnce;
    expect(action1).to.be.calledOnce;

    expect(target['__AMP_ACTION_QUEUE__']).to.not.exist;
  });
});


describes.sandboxed('Action global target', {}, () => {
  let win;
  let action;

  beforeEach(() => {
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
  });

  it('should register global target', () => {
    const target1 = sandbox.spy();
    const target2 = sandbox.spy();
    const event = {};
    action.addGlobalTarget('target1', target1);
    action.addGlobalTarget('target2', target2);

    const element = document.createElement('div');
    element.setAttribute('on', 'tap:target1.action1(a=b)');
    action.trigger(element, 'tap', event);
    expect(target2).to.not.be.called;
    expect(target1).to.be.calledOnce;
    assertInvocation(target1.args[0][0], document, 'action1', element, event,
        {a: 'b'});

    const element2 = document.createElement('div');
    element2.setAttribute('on', 'tap:target2.action1');
    action.trigger(element2, 'tap', event);
    expect(target2).to.be.calledOnce;
    expect(target1).to.be.calledOnce;

    const element3 = document.createElement('div');
    element3.setAttribute('on', 'tap:target1.action1,target2.action1');
    action.trigger(element3, 'tap', event);
    expect(target2).to.be.calledTwice;
    expect(target1).to.be.calledTwice;

    const element4 = document.createElement('div');
    element4.setAttribute('on', 'tap:target1.action1,target2.action2(x=y)');
    action.trigger(element4, 'tap', event);
    expect(target2).to.be.calledThrice;
    expect(target1).to.be.calledThrice;
    assertInvocation(target2.args[2][0], document, 'action2', element4, event,
        {x: 'y'});
  });
});


describe('Core events', () => {
  let sandbox;
  let win;
  let action;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(window.document, 'addEventListener');
    win = {
      document: {body: {}},
      services: {
        vsync: {obj: {}},
      },
    };
    action = new ActionService(new AmpDocSingle(win), document);
    sandbox.stub(action, 'trigger');
    action.vsync_ = {mutate: callback => callback()};
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should trigger tap event on click', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('click');
    const handler = window.document.addEventListener.getCall(0).args[1];
    const element = {tagName: 'target1', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
  });

  it('should trigger tap event on key press if focused element has ' +
     'role=button', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('keydown');
    const handler = window.document.addEventListener.getCall(1).args[1];
    const element = document.createElement('div');
    element.setAttribute('role', 'button');
    const event = {
      target: element,
      keyCode: 13,
      preventDefault: sandbox.stub()};
    handler(event);
    expect(event.preventDefault).to.have.been.called;
    expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
  });

  it('should NOT trigger tap event on key press if focused element DOES NOT ' +
     'have role=button', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('keydown');
    const handler = window.document.addEventListener.getCall(1).args[1];
    const element = document.createElement('div');
    element.setAttribute('role', 'not-a-button');
    const event = {target: element, keyCode: 13};
    handler(event);
    expect(action.trigger).to.not.have.been.called;
  });

  it('should trigger submit event', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('submit');
    const handler = window.document.addEventListener.getCall(2).args[1];
    const element = {tagName: 'target1', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'submit', event);
  });

  it('should trigger change event', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('change');
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = {tagName: 'target2', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'change', event);
  });

  it('should trigger change event with details for whitelisted inputs', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('input');
    element.setAttribute('type', 'range');
    element.setAttribute('min', '0');
    element.setAttribute('max', '10');
    element.setAttribute('value', '5');
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(
        element,
        'change',
        // Event doesn't seem to play well with sinon matchers
        sinon.match(object => {
          const detail = object.detail;
          return detail.min == 0 && detail.max == 10 && detail.value == 5;
        }));
  });

  it('should trigger change event with details for select elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('select');
    element.innerHTML =
        `<option value="foo"></option>
        <option value="bar"></option>
        <option value="qux"></option>`;
    element.selectedIndex = 2;
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(
        element,
        'change',
        sinon.match(object => {
          const detail = object.detail;
          return detail.value == 'qux';
        }));
  });

});

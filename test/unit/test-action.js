import {
  ActionTrust_Enum,
  DEFAULT_ACTION,
  RAW_OBJECT_ARGS_KEY,
} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {htmlFor} from '#core/dom/static-template';

import {
  ActionInvocation,
  ActionService,
  DeferredEvent,
  dereferenceArgsVariables,
  parseActionMap,
} from '#service/action-impl';
import {AmpDocSingle} from '#service/ampdoc-impl';

import {createCustomEvent} from '#utils/event-helper';

import {FakePerformance} from '#testing/fake-dom';
import {macroTask} from '#testing/helpers';
import {whenCalled} from '#testing/helpers/service';

/**
 * @return {!ActionService}
 */
function actionService() {
  const win = {
    document: {
      body: {},
      head: {
        nodeType: /* ELEMENT */ 1,
        querySelector: () => null,
        querySelectorAll: () => [],
      },
    },
    __AMP_SERVICES: {
      vsync: {obj: {}, ctor: Object},
    },
    performance: new FakePerformance(window),
  };
  return new ActionService(new AmpDocSingle(win), document);
}

function createExecElement(id, enqueAction, defaultActionAlias) {
  const execElement = document.createElement('amp-element');
  execElement.setAttribute('id', id);
  execElement.enqueAction = enqueAction;
  execElement.getDefaultActionAlias = defaultActionAlias;
  return execElement;
}

function assertInvocation(
  inv,
  node,
  method,
  source,
  caller,
  opt_event,
  child,
  opt_args
) {
  expect(inv.node).to.equal(node);
  expect(inv.method).to.equal(method);
  expect(inv.caller).to.equal(caller);

  if (opt_event !== undefined) {
    expect(inv.event).to.equal(opt_event);
  }

  if (opt_args !== undefined) {
    expect(inv.args).to.deep.equal(opt_args);
  }
}

describes.sandboxed('ActionService parseAction', {}, () => {
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
    expect(a.method).to.equal(DEFAULT_ACTION);
  });

  it('should parse with default method for two different targets', () => {
    const a = parseMultipleActions('event1:target1,target2');
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('target1');
    expect(a[0].method).to.equal(DEFAULT_ACTION);
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('target2');
    expect(a[1].method).to.equal(DEFAULT_ACTION);
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
    expect(a.args['key1']).to.equal('value1');
  });

  it('should parse args in more than one action', () => {
    const a = parseMultipleActions(
      'event1:target1.methodA(key1=value1),target2.methodB(keyA=valueA)'
    );
    expect(a[0].event).to.equal('event1');
    expect(a[0].target).to.equal('target1');
    expect(a[0].method).to.equal('methodA');
    expect(a[0].args['key1']).to.equal('value1');
    expect(a[1].event).to.equal('event1');
    expect(a[1].target).to.equal('target2');
    expect(a[1].method).to.equal('methodB');
    expect(a[1].args['keyA']).to.equal('valueA');
  });

  it('should parse multiple event types with multiple actions', () => {
    const a = parseActionMap(
      'event1:foo, baz.firstMethod, corge.secondMethod(keyA=valueA);' +
        'event2:bar, qux.thirdMethod, grault.fourthMethod(keyB=valueB)'
    );

    expect(Object.keys(a)).to.have.length(2);

    expect(a['event1']).to.have.length(3);
    expect(a['event2']).to.have.length(3);

    // action definitions for event1
    expect(a['event1'][0].event).to.equal('event1');
    expect(a['event1'][0].target).to.equal('foo');
    expect(a['event1'][0].method).to.equal(DEFAULT_ACTION);
    expect(a['event1'][0].args).to.be.null;

    expect(a['event1'][1].event).to.equal('event1');
    expect(a['event1'][1].target).to.equal('baz');
    expect(a['event1'][1].method).to.equal('firstMethod');
    expect(a['event1'][1].args).to.be.null;

    expect(a['event1'][2].event).to.equal('event1');
    expect(a['event1'][2].target).to.equal('corge');
    expect(a['event1'][2].method).to.equal('secondMethod');
    expect(a['event1'][2].args['keyA']).to.equal('valueA');

    // action definitions for event2
    expect(a['event2'][0].event).to.equal('event2');
    expect(a['event2'][0].target).to.equal('bar');
    expect(a['event2'][0].method).to.equal(DEFAULT_ACTION);
    expect(a['event2'][0].args).to.be.null;

    expect(a['event2'][1].event).to.equal('event2');
    expect(a['event2'][1].target).to.equal('qux');
    expect(a['event2'][1].method).to.equal('thirdMethod');
    expect(a['event2'][1].args).to.be.null;

    expect(a['event2'][2].event).to.equal('event2');
    expect(a['event2'][2].target).to.equal('grault');
    expect(a['event2'][2].method).to.equal('fourthMethod');
    expect(a['event2'][2].args['keyB']).to.equal('valueB');
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
      'event1:target1.method1  (  key1 =  value1  ,  key2 = value2  ) '
    );
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
      'event1:target1.method1(key1=value1, key2 = "value (2)\'")'
    );
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal("value (2)'");
  });

  it('should parse with single-quoted args', () => {
    const a = parseAction(
      "event1:target1.method1(key1=value1, key2 = 'value (2)\"')"
    );
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
    expect(a.args['key1']).to.equal('value1');
    expect(a.args['key2']).to.equal('value (2)"');
  });

  it('should parse with args with trailing comma', () => {
    const a = parseAction('event1:target1.method1(key1=value1, )');
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
    expect(parseAction('e:t.m(k=.123)').args['k']).to.equal(0.123);
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

  it('should parse with object literal args', () => {
    const a = parseAction('e:t.m({"foo": {"bar": "qux"}})');
    expect(a.args[RAW_OBJECT_ARGS_KEY]).to.equal('{"foo": {"bar": "qux"}}');
  });

  it('should parse with expression args', () => {
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(a.args['key1']).to.deep.equal({expression: 'foo.bar'});
  });

  it('should return null for undefined references in dereferenced arg', () => {
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(dereferenceArgsVariables(a.args, null)).to.deep.equal({key1: null});
    expect(dereferenceArgsVariables(a.args, {})).to.deep.equal({key1: null});
    expect(dereferenceArgsVariables(a.args, {foo: null})).to.deep.equal({
      key1: null,
    });
  });

  it('should return null for non-primitives in dereferenced args', () => {
    const a = parseAction('e:t.m(key1=foo.bar)');
    expect(
      dereferenceArgsVariables(a.args, {foo: {bar: undefined}})
    ).to.deep.equal({key1: null});
    expect(dereferenceArgsVariables(a.args, {foo: {bar: {}}})).to.deep.equal({
      key1: null,
    });
    expect(dereferenceArgsVariables(a.args, {foo: {bar: []}})).to.deep.equal({
      key1: null,
    });
    expect(
      dereferenceArgsVariables(a.args, {foo: {bar: () => {}}})
    ).to.deep.equal({key1: null});
  });

  it('should support event data and opt_args', () => {
    const a = parseAction('e:t.m(key1=foo,key2=x)');
    const event = createCustomEvent(window, 'MyEvent');
    expect(dereferenceArgsVariables(a.args, event, {x: 'bar'})).to.deep.equal({
      key1: 'foo',
      key2: 'bar',
    });
  });

  it('evaluated args should be proto-less objects', () => {
    const a = parseAction('e:t.m(key1=foo)');
    expect(dereferenceArgsVariables(a.args, null).__proto__).to.be.undefined;
    expect(dereferenceArgsVariables(a.args, null).constructor).to.be.undefined;
  });

  it('should dereference arg expressions', () => {
    const a = parseAction('e:t.m(key1=foo)');
    expect(dereferenceArgsVariables(a.args, null)).to.deep.equal({key1: 'foo'});
  });

  it('should dereference arg expressions with an event without data', () => {
    const a = parseAction('e:t.m(key1=foo)');
    const event = createCustomEvent(window, 'MyEvent');
    expect(dereferenceArgsVariables(a.args, {event})).to.deep.equal({
      key1: 'foo',
    });
  });

  it('should dereference arg expressions with an event with data', () => {
    const a = parseAction('e:t.m(key1=event.foo)');
    const event = createCustomEvent(window, 'MyEvent', {foo: 'bar'});
    expect(dereferenceArgsVariables(a.args, event)).to.deep.equal({
      key1: 'bar',
    });
  });

  it('should parse empty to null', () => {
    const a = parseAction('');
    expect(a).to.equal(null);
  });

  it('should fail parse without event', () => {
    allowConsoleError(() => {
      expect(() => {
        parseAction('target1.method1');
      }).to.throw(/expected \[\:\]/);
    });
  });

  it('should fail parse without target', () => {
    allowConsoleError(() => {
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
  });

  it('should fail parse with period in event or method', () => {
    allowConsoleError(() => {
      expect(() => {
        parseAction('event.1:target1.method');
      }).to.throw(/Invalid action/);
      expect(() => {
        parseAction('event:target1.method.1');
      }).to.throw(/Invalid action/);
    });
  });

  it('should fail parse with invalid args', () => {
    allowConsoleError(() => {
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
});

describes.sandboxed('ActionService setActions', {}, () => {
  it('should set actions', () => {
    const action = actionService();
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');

    // Invoke findAction_ once at the start to cache the actions.
    action.findAction_(element, 'event1');

    // Reset the actions with a new actions string.
    action.setActions(element, 'event2:action2');

    // `on` attribute should reflect the new action defs.
    expect(element.getAttribute('on')).to.equal('event2:action2');

    // Action cache should have been cleared.
    expect(action.findAction_(element, 'event1')).to.be.null;
    expect(action.findAction_(element, 'event2')).to.be.not.null;
  });
});

describes.sandboxed('Action parseActionMap', {}, () => {
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

describes.sandboxed('Action findAction', {}, () => {
  let action;

  beforeEach(() => {
    action = actionService();
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

  it('should skip action on disabled elements', () => {
    const parent = document.createElement('button');
    parent.setAttribute('on', 'event1:action1');
    parent.disabled = true;

    expect(action.findAction_(parent, 'event1')).to.equal(null);
  });

  it('should skip parent action on descendants of disabled elements', () => {
    const parent = document.createElement('button');
    parent.setAttribute('on', 'event1:action1');
    parent.disabled = true;
    const element = document.createElement('div');
    parent.appendChild(element);

    expect(action.findAction_(element, 'event1')).to.equal(null);
  });

  it('should skip action on form control in a disabled fieldset', () => {
    const parent = document.createElement('fieldset');
    parent.setAttribute('on', 'event1:action1');
    parent.disabled = true;
    const element = document.createElement('button');
    element.setAttribute('on', 'event2:action2');
    parent.appendChild(element);

    expect(action.findAction_(element, 'event1')).to.equal(null);
    expect(action.findAction_(element, 'event2')).to.equal(null);
  });
});

describes.sandboxed('Action hasAction', {}, () => {
  let action;

  beforeEach(() => {
    action = actionService();
  });

  it('returns true if the target element has the target action', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    expect(action.hasAction(element, 'event1')).to.equal(true);
  });

  it('returns true if an intermediate element has target action', () => {
    const child = document.createElement('div');
    const element = document.createElement('div');
    element.appendChild(child);
    element.setAttribute('on', 'event1:action1');
    const parent = document.createElement('div');
    parent.appendChild(element);
    parent.setAttribute('on', 'event2:action2');
    expect(action.hasAction(element, 'event1', parent)).to.equal(true);
    expect(action.hasAction(element, 'event2', parent)).to.equal(false);
  });

  it('returns false if the target element does not have the target action', () => {
    const element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    expect(action.hasAction(element, 'event2')).to.equal(false);
  });
});

describes.fakeWin('Action hasResolvableAction', {amp: true}, (env) => {
  let action;
  let html;

  beforeEach(() => {
    html = htmlFor(env.win.document);
    action = new ActionService(env.ampdoc, env.win.document);

    // Insert element for valid actions to be resolved.
    env.win.document.body.appendChild(html` <div id="valid-target"></div> `);
  });

  it('returns true if the target element exists (single)', () => {
    const element = html` <div on="event1: valid-target"></div> `;
    expect(action.hasResolvableAction(element, 'event1')).to.equal(true);
  });

  it('returns true if the target element exists (action up the tree)', () => {
    const wrapper = html` <div on="event1: valid-target"></div> `;
    const child = html` <div></div> `;
    wrapper.appendChild(child);
    expect(action.hasResolvableAction(child, 'event1')).to.equal(true);
  });

  it('returns true if the target element exists (one amongst many)', () => {
    const element = html`
      <div on="event1: i-dont-exist, valid-target, i-dont-exist-either"></div>
    `;
    expect(action.hasResolvableAction(element, 'event1')).to.equal(true);
  });

  it('returns false if the target element does not exist (one)', () => {
    const element = html` <div on="event1: i-do-not-exist"></div> `;
    expect(action.hasResolvableAction(element, 'event1')).to.equal(false);
  });

  it('returns false if the target element does not exist (multiple)', () => {
    const element = html`
      <div on="event1: i-do-not-exist, i-dont-exist-either"></div>
    `;
    expect(action.hasResolvableAction(element, 'event1')).to.equal(false);
  });

  it('returns false if target element does not have the target action', () => {
    const element = html` <div on="event1: valid-target"></div> `;
    expect(action.hasResolvableAction(element, 'event2')).to.equal(false);
  });
});

describes.sandboxed('Action method', {}, (env) => {
  let action;
  let getDefaultActionAlias;
  let id;
  let onEnqueue;
  let targetElement, parent, child, execElement;

  beforeEach(() => {
    action = actionService();
    onEnqueue = env.sandbox.spy();
    getDefaultActionAlias = env.sandbox.spy();
    targetElement = document.createElement('target');
    id = ('E' + Math.random()).replace('.', '');
    targetElement.setAttribute('on', 'tap:' + id + '.method1');
    parent = document.createElement('parent');
    child = document.createElement('child');
    parent.appendChild(targetElement);
    targetElement.appendChild(child);
    document.body.appendChild(parent);

    execElement = createExecElement(id, onEnqueue, getDefaultActionAlias);
    parent.appendChild(execElement);
  });

  afterEach(() => {
    document.body.removeChild(parent);
  });

  it('should invoke on the AMP element', () => {
    action.invoke_(
      new ActionInvocation(
        execElement,
        'method1',
        /* args */ null,
        'source1',
        'caller1',
        'event1'
      )
    );
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.node).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal('source1');
    expect(inv.caller).to.equal('caller1');
    expect(inv.event).to.equal('event1');
    expect(inv.args).to.be.null;
  });

  it('should invoke on the AMP element with args', () => {
    action.invoke_(
      new ActionInvocation(
        execElement,
        'method1',
        {'key1': 11},
        'source1',
        'caller1',
        'event1'
      )
    );
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.node).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal('source1');
    expect(inv.caller).to.equal('caller1');
    expect(inv.event).to.equal('event1');
    expect(inv.args['key1']).to.equal(11);
  });

  it('should not allow invoke on non-AMP and non-allowlisted element', () => {
    allowConsoleError(() => {
      expect(() => {
        action.invoke_(
          new ActionInvocation(
            document.createElement('img'),
            'method1',
            /* args */ null,
            'source1',
            'event1'
          )
        );
      }).to.throw(/doesn't support "method1" action/);
    });
    expect(onEnqueue).to.have.not.been.called;
  });

  it('should not allow invoke on unresolved AMP element', () => {
    allowConsoleError(() => {
      expect(() => {
        action.invoke_(
          new ActionInvocation(
            document.createElement('amp-foo'),
            'method1',
            /* args */ null,
            'source1',
            'event1'
          )
        );
      }).to.throw(/Unrecognized AMP element/);
    });
    expect(onEnqueue).to.have.not.been.called;
  });

  it('should trigger event', () => {
    action.trigger(child, 'tap', null);
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.node).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.source).to.equal(child);
    expect(inv.caller).to.equal(targetElement);
  });

  it('should execute method', () => {
    action.execute(execElement, 'method1', {'key1': 11}, child, null);
    expect(onEnqueue).to.be.calledOnce;
    const inv = onEnqueue.getCall(0).args[0];
    expect(inv.node).to.equal(execElement);
    expect(inv.method).to.equal('method1');
    expect(inv.args['key1']).to.equal(11);
    expect(inv.source).to.equal(child);
  });

  describe('macros', () => {
    let ampActionMacro;

    beforeEach(() => {
      // A caller that references an action macro.
      targetElement.setAttribute('on', 'tap:action-macro-id.execute(arg1=2)');
      ampActionMacro = document.createElement('amp-action-macro');
      ampActionMacro.setAttribute('id', id);
      ampActionMacro.setAttribute(
        'execute',
        'action-macro-id.method(realArgName=arg1)'
      );
      ampActionMacro.setAttribute('arguments', 'arg1');
      document.body.appendChild(ampActionMacro);
    });

    it('should invoke proper action', () => {
      // Given that an amp action macro is triggered.
      const invoke_ = env.sandbox.stub(action, 'invoke_');
      env.sandbox
        .stub(action.root_, 'getElementById')
        .withArgs('action-macro-id')
        .returns(ampActionMacro);
      action.trigger(
        ampActionMacro,
        'tap',
        null,
        ActionTrust_Enum.HIGH,
        /* opt_args */ {arg1: 'realArgValue'}
      );

      return whenCalled(invoke_).then(() => {
        expect(action.invoke_).to.have.been.calledOnce;
        const invocation = action.invoke_.getCall(0).args[0];
        const {
          actionEventType,
          args,
          caller,
          event,
          method,
          node,
          source,
          tagOrTarget,
          trust,
        } = invocation;
        expect(node).to.equal(ampActionMacro);
        expect(caller).to.equal(ampActionMacro);
        expect(event).to.be.null;
        expect(method).to.equal('method');
        expect(actionEventType).to.equal('tap');
        expect(args).to.deep.equal({realArgName: 'realArgValue'});
        expect(trust).to.equal(ActionTrust_Enum.HIGH);
        expect(tagOrTarget).to.equal('AMP-ACTION-MACRO');
        expect(actionEventType).to.equal('tap');
        expect(source).to.equal(ampActionMacro);
      });
    });
  });
});

describes.sandboxed('installActionHandler', {}, (env) => {
  let action;

  beforeEach(() => {
    action = actionService();
  });

  it('should invoke on non-AMP but allowlisted element', () => {
    const handlerSpy = env.sandbox.spy();
    const target = document.createElement('form');
    action.installActionHandler(target, handlerSpy);
    action.invoke_(
      new ActionInvocation(
        target,
        'submit',
        /* args */ null,
        'button',
        'button',
        'tap',
        ActionTrust_Enum.HIGH
      )
    );
    expect(handlerSpy).to.be.calledOnce;
    const callArgs = handlerSpy.getCall(0).args[0];
    expect(callArgs.node).to.be.equal(target);
    expect(callArgs.method).to.be.equal('submit');
    expect(callArgs.args).to.be.equal(null);
    expect(callArgs.source).to.be.equal('button');
    expect(callArgs.caller).to.be.equal('button');
    expect(callArgs.event).to.be.equal('tap');
    expect(callArgs.trust).to.be.equal(ActionTrust_Enum.HIGH);
  });

  it('should not check trust level (handler should check)', () => {
    const handlerSpy = env.sandbox.spy();
    const target = document.createElement('form');
    action.installActionHandler(target, handlerSpy);

    const invocation = new ActionInvocation(
      target,
      'submit',
      /* args */ null,
      'button',
      'button',
      'tapEvent',
      ActionTrust_Enum.HIGH
    );
    action.invoke_(invocation);
    expect(handlerSpy).to.be.calledOnce;

    invocation.trust = ActionTrust_Enum.LOW;
    action.invoke_(invocation);
    expect(handlerSpy).to.be.calledTwice;
  });
});

describes.sandboxed('Multiple handlers action method', {}, (env) => {
  let action;
  let getDefaultActionAlias;
  let onEnqueue1, onEnqueue2;
  let targetElement, parent, child, execElement1, execElement2;

  beforeEach(() => {
    action = actionService();
    onEnqueue1 = env.sandbox.spy();
    onEnqueue2 = env.sandbox.spy();
    getDefaultActionAlias = env.sandbox.spy();
    targetElement = document.createElement('target');
    targetElement.setAttribute('on', 'tap:foo.method1,bar.method2');
    parent = document.createElement('parent');
    child = document.createElement('child');
    parent.appendChild(targetElement);
    targetElement.appendChild(child);
    document.body.appendChild(parent);

    execElement1 = createExecElement('foo', onEnqueue1, getDefaultActionAlias);
    execElement2 = createExecElement('bar', onEnqueue2, getDefaultActionAlias);

    parent.appendChild(execElement1);
    parent.appendChild(execElement2);
  });

  afterEach(() => {
    document.body.removeChild(parent);
  });

  it('should trigger event', () => {
    action.trigger(child, 'tap', null);
    expect(onEnqueue1).to.be.calledOnce;
    assertInvocation(
      onEnqueue1.getCall(0).args[0],
      execElement1,
      'method1',
      child,
      targetElement
    );
    assertInvocation(
      onEnqueue2.getCall(0).args[0],
      execElement2,
      'method2',
      child,
      targetElement
    );
  });

  it('should chain asynchronous actions', () => {
    let resolveAbc;
    const promiseAbc = new Promise((resolve) => {
      resolveAbc = resolve;
    });
    const abc = env.sandbox.stub().returns(promiseAbc);
    action.addGlobalTarget('ABC', abc);

    let resolveXyz;
    const promiseXyz = new Promise((resolve) => {
      resolveXyz = resolve;
    });
    const xyz = env.sandbox.stub().returns(promiseXyz);
    action.addGlobalTarget('XYZ', xyz);

    const element = document.createElement('target');
    element.setAttribute(
      'on',
      'tap:ABC.abc, foo.method1, XYZ.xyz, bar.method2'
    );
    parent.appendChild(element);

    action.trigger(element, 'tap', null);

    expect(abc).calledOnce;
    expect(onEnqueue1).to.not.have.been.called;
    expect(xyz).to.not.have.been.called;
    expect(onEnqueue2).to.not.have.been.called;

    resolveAbc();
    return macroTask()
      .then(() => {
        expect(abc).calledOnce;
        expect(onEnqueue1).calledOnce;
        expect(xyz).calledOnce;
        expect(onEnqueue2).to.not.have.been.called;

        resolveXyz();
        return macroTask();
      })
      .then(() => {
        expect(abc).calledOnce;
        expect(onEnqueue1).calledOnce;
        expect(xyz).calledOnce;
        expect(onEnqueue2).calledOnce;
      });
  });
});

describes.sandboxed('Action interceptor', {}, (env) => {
  let clock;
  let action;
  let target;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    action = actionService();
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');
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
    action.invoke_(
      new ActionInvocation(
        target,
        'method1',
        /* args */ null,
        'source1',
        'caller1',
        'event1'
      )
    );
    action.invoke_(
      new ActionInvocation(
        target,
        'method2',
        /* args */ null,
        'source2',
        'caller2',
        'event2'
      )
    );

    const queue = getQueue();
    expect(Array.isArray(queue)).to.be.true;
    expect(queue).to.have.length(2);

    const inv0 = queue[0];
    expect(inv0.node).to.equal(target);
    expect(inv0.method).to.equal('method1');
    expect(inv0.source).to.equal('source1');
    expect(inv0.caller).to.equal('caller1');
    expect(inv0.event).to.equal('event1');

    const inv1 = queue[1];
    expect(inv1.node).to.equal(target);
    expect(inv1.method).to.equal('method2');
    expect(inv1.source).to.equal('source2');
    expect(inv1.caller).to.equal('caller2');
    expect(inv1.event).to.equal('event2');
  });

  it('should dequeue actions after handler set', () => {
    action.invoke_(
      new ActionInvocation(
        target,
        'method1',
        /* args */ null,
        'source1',
        'caller1',
        'event1',
        ActionTrust_Enum.HIGH
      )
    );
    action.invoke_(
      new ActionInvocation(
        target,
        'method2',
        /* args */ null,
        'source2',
        'caller2',
        'event2',
        ActionTrust_Enum.HIGH
      )
    );

    expect(Array.isArray(getQueue())).to.be.true;
    expect(getActionHandler()).to.be.undefined;
    expect(getQueue()).to.have.length(2);

    const handler = env.sandbox.spy();
    action.installActionHandler(target, handler);
    expect(getActionHandler()).to.exist;
    expect(handler).to.have.not.been.called;

    clock.tick(10);
    expect(handler).to.have.callCount(2);

    const inv0 = handler.getCall(0).args[0];
    expect(inv0.node).to.equal(target);
    expect(inv0.method).to.equal('method1');
    expect(inv0.source).to.equal('source1');
    expect(inv0.caller).to.equal('caller1');
    expect(inv0.event).to.equal('event1');

    const inv1 = handler.getCall(1).args[0];
    expect(inv1.node).to.equal(target);
    expect(inv1.method).to.equal('method2');
    expect(inv1.source).to.equal('source2');
    expect(inv1.caller).to.equal('caller2');
    expect(inv1.event).to.equal('event2');

    action.invoke_(
      new ActionInvocation(
        target,
        'method3',
        /* args */ null,
        'source3',
        'caller3',
        'event3',
        ActionTrust_Enum.HIGH
      )
    );
    expect(handler).to.have.callCount(3);
    const inv2 = handler.getCall(2).args[0];
    expect(inv2.node).to.equal(target);
    expect(inv2.method).to.equal('method3');
    expect(inv2.source).to.equal('source3');
    expect(inv2.caller).to.equal('caller3');
    expect(inv2.event).to.equal('event3');
  });
});

describes.sandboxed('Action common handler', {}, (env) => {
  let action;
  let target;

  beforeEach(() => {
    action = actionService();
    target = document.createElement('target');
    target.setAttribute('id', 'amp-test-1');

    action.vsync_ = {mutate: (callback) => callback()};
  });

  it('should execute actions registered', () => {
    const action1 = env.sandbox.spy();
    const action2 = env.sandbox.spy();
    action.addGlobalMethodHandler('action1', action1);
    action.addGlobalMethodHandler('action2', action2);

    action.invoke_(
      new ActionInvocation(
        target,
        'action1',
        /* args */ null,
        'source1',
        'caller1',
        'event1',
        ActionTrust_Enum.HIGH
      )
    );
    expect(action1).to.be.calledOnce;
    expect(action2).to.have.not.been.called;

    action.invoke_(
      new ActionInvocation(
        target,
        'action2',
        /* args */ null,
        'source2',
        'caller2',
        'event2',
        ActionTrust_Enum.HIGH
      )
    );
    expect(action2).to.be.calledOnce;
    expect(action1).to.be.calledOnce;

    expect(target['__AMP_ACTION_QUEUE__']).to.not.exist;
  });

  it('should check trust before invoking action', () => {
    const handler = env.sandbox.spy();
    action.addGlobalMethodHandler('foo', handler, ActionTrust_Enum.HIGH);

    action.invoke_(
      new ActionInvocation(
        target,
        'foo',
        /* args */ null,
        'source1',
        'caller1',
        'event1',
        ActionTrust_Enum.HIGH
      )
    );
    expect(handler).to.be.calledOnce;

    return allowConsoleError(() => {
      action.invoke_(
        new ActionInvocation(
          target,
          'foo',
          /* args */ null,
          'source1',
          'caller1',
          'event1',
          ActionTrust_Enum.LOW
        )
      );
      expect(handler).to.be.calledOnce;
    });
  });
});

describes.sandboxed('Action global target', {}, (env) => {
  let action;

  beforeEach(() => {
    action = actionService();
  });

  it('should register global target', () => {
    const target1 = env.sandbox.spy();
    const target2 = env.sandbox.spy();
    const event = {};
    action.addGlobalTarget('target1', target1);
    action.addGlobalTarget('target2', target2);

    const element = document.createElement('div');
    element.setAttribute('on', 'tap:target1.action1(a=b)');
    action.trigger(element, 'tap', event);
    expect(target2).to.not.be.called;
    expect(target1).to.be.calledOnce;
    assertInvocation(
      target1.args[0][0],
      document,
      'action1',
      element,
      element,
      event,
      {a: 'b'}
    );

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
    assertInvocation(
      target2.args[2][0],
      document,
      'action2',
      element4,
      element4,
      event,
      {x: 'y'}
    );
  });
});

describes.fakeWin('Core events', {amp: true}, (env) => {
  let window;
  let document;
  let action;
  let triggerPromise;

  beforeEach(() => {
    window = env.win;
    document = window.document;
    env.sandbox.stub(window.document, 'addEventListener');
    const {ampdoc} = env;
    action = new ActionService(ampdoc, document);
    const originalTrigger = action.trigger;
    triggerPromise = new Promise((resolve, reject) => {
      env.sandbox.stub(action, 'trigger').callsFake(() => {
        try {
          originalTrigger.apply(action, action.trigger.getCall(0).args);
          resolve();
          return true;
        } catch (e) {
          reject(e);
        }
      });
    });
    action.vsync_ = {mutate: (callback) => callback()};
  });

  it('should trigger tap event on click', () => {
    expect(window.document.addEventListener).to.have.been.calledWith('click');
    const handler = window.document.addEventListener.getCall(0).args[1];
    const element = {tagName: 'target1', nodeType: 1};
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
  });

  it(
    'should trigger tap event on key press if focused element has ' +
      'role=button',
    () => {
      action.trigger.returns(false);
      expect(window.document.addEventListener).to.have.been.calledWith(
        'keydown'
      );
      const handler = window.document.addEventListener.getCall(1).args[1];
      const element = document.createElement('div');
      element.setAttribute('role', 'button');
      const event = {
        target: element,
        key: Keys_Enum.ENTER,
        preventDefault: env.sandbox.stub(),
      };
      handler(event);
      expect(event.preventDefault).to.not.have.been.called;
      expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
    }
  );

  it(
    'should trigger tap event and prevent default on key press if focused ' +
      'element has role=button and has an action invoked',
    () => {
      expect(window.document.addEventListener).to.have.been.calledWith(
        'keydown'
      );
      const handler = window.document.addEventListener.getCall(1).args[1];
      const element = document.createElement('div');
      element.setAttribute('role', 'button');
      const event = {
        target: element,
        key: Keys_Enum.ENTER,
        preventDefault: env.sandbox.stub(),
      };
      handler(event);
      // Expect prevent default to have been called.
      expect(event.preventDefault).to.have.been.called;
      expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
    }
  );

  it(
    'should trigger tap event on key press if focused element has ' +
      'role=option',
    () => {
      action.trigger.returns(false);
      expect(window.document.addEventListener).to.have.been.calledWith(
        'keydown'
      );
      const handler = window.document.addEventListener.getCall(1).args[1];
      const element = document.createElement('div');
      element.setAttribute('role', 'option');
      const event = {
        target: element,
        key: Keys_Enum.ENTER,
        preventDefault: env.sandbox.stub(),
      };
      handler(event);
      expect(event.preventDefault).to.not.have.been.called;
      expect(action.trigger).to.have.been.calledWith(element, 'tap', event);
    }
  );

  it(
    'should NOT trigger tap event on key press if focused element DOES NOT ' +
      'have role=button',
    () => {
      expect(window.document.addEventListener).to.have.been.calledWith(
        'keydown'
      );
      const handler = window.document.addEventListener.getCall(1).args[1];
      const element = document.createElement('div');
      element.setAttribute('role', 'not-a-button');
      const event = {target: element, key: Keys_Enum.ENTER};
      handler(event);
      expect(action.trigger).to.not.have.been.called;
    }
  );

  it(
    'should NOT trigger tap event on key press if focused element DOES NOT ' +
      'have any role',
    () => {
      expect(window.document.addEventListener).to.have.been.calledWith(
        'keydown'
      );
      const handler = window.document.addEventListener.getCall(1).args[1];
      const element = document.createElement('input');
      const event = {target: element, key: Keys_Enum.ENTER};
      handler(event);
      expect(action.trigger).to.not.have.been.called;
    }
  );

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

  it('should trigger change event for <input type="checkbox"> elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('input');
    element.setAttribute('type', 'checkbox');
    element.setAttribute('value', 'foo');
    element.checked = true;
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match(
        (object) => object.detail.checked && object.detail.value == 'foo'
      )
    );
  });

  it('should trigger change event for <input type="range"> elements', () => {
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
      env.sandbox.match((e) => {
        const {max, min, value, valueAsNumber} = e.detail;
        return (
          min === '0' && max === '10' && value === '5' && valueAsNumber === 5
        );
      })
    );
  });

  it('should trigger change event for <input type="search"> elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('input');
    element.setAttribute('type', 'search');
    element.value = 'foo';
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match((e) => e.detail.value == 'foo')
    );
  });

  it('should trigger change event for <input type="file"> elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('input');
    element.setAttribute('type', 'file');
    const event = {target: element};
    handler(event);
    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match((e) => e.detail.files.length == 0)
    );

    element.setAttribute('multiple', '');
    Object.defineProperty(element, 'files', {
      value: {
        0: new File(['foo'], 'foo.txt', {type: 'text/plain'}),
        1: new File(['bar'], 'bar.txt', {type: 'text/plain'}),
        length: 2,
      },
    });

    handler({target: element});
    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match({
        detail: {
          files: [
            {name: 'foo.txt', size: 3, type: 'text/plain'},
            {name: 'bar.txt', size: 3, type: 'text/plain'},
          ],
        },
      })
    );
  });

  it('should trigger change event with details for <select> elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('select');
    element.innerHTML = `<option value="foo"></option>
        <option value="bar"></option>
        <option value="qux"></option>`;
    element.selectedIndex = 2;
    const event = {target: element};
    handler(event);

    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match((object) => {
        const {detail} = object;
        return detail.value == 'qux';
      })
    );
  });

  it('should trigger change event with details for <textarea> elements', () => {
    const handler = window.document.addEventListener.getCall(3).args[1];
    const element = document.createElement('textarea');
    element.value = 'foo';
    const event = {target: element};
    handler(event);

    expect(action.trigger).to.have.been.calledWith(
      element,
      'change',
      env.sandbox.match((object) => {
        const {detail} = object;
        return detail.value == 'foo';
      })
    );
  });

  it('should trigger input-debounced event on input', () => {
    env.sandbox.stub(action, 'invoke_');
    const handler = window.document.addEventListener.getCall(4).args[1];
    const element = document.createElement('input');
    element.id = 'test';
    element.setAttribute('on', 'input-debounced:test.hide');
    element.value = 'foo bar baz';
    const event = {target: element};
    document.body.appendChild(element);
    handler(event);

    return triggerPromise.then(() => {
      expect(action.trigger).to.have.been.calledWith(
        element,
        'input-debounced',
        env.sandbox.match((event) => {
          const {value} = event.target;
          return value == 'foo bar baz';
        })
      );
    });
  });

  it('should trigger input-throttled event on input', () => {
    env.sandbox.stub(action, 'invoke_');
    const handler = window.document.addEventListener.getCall(5).args[1];
    const element = document.createElement('input');
    element.id = 'test';
    element.setAttribute('on', 'input-throttled:test.hide');
    element.value = 'foo bar baz';
    const event = {target: element};
    document.body.appendChild(element);
    handler(event);

    return triggerPromise.then(() => {
      expect(action.trigger).to.have.been.calledWith(
        element,
        'input-throttled',
        env.sandbox.match((event) => {
          const {value} = event.target;
          return value == 'foo bar baz';
        })
      );
    });
  });

  describe('DeferredEvent', () => {
    it('should copy the properties of an event object', () => {
      const event = createCustomEvent(window, 'MyEvent', {foo: 'bar'});
      const deferredEvent = new DeferredEvent(event);

      for (const key in deferredEvent) {
        if (typeof deferredEvent[key] !== 'function') {
          expect(deferredEvent[key]).to.deep.equal(event[key]);
        }
      }
    });

    it('should replace functions with throws', function* () {
      const event = createCustomEvent(window, 'MyEvent', {foo: 'bar'});
      const deferredEvent = new DeferredEvent(event);
      const errorText = 'cannot access native event functions';

      // Specifically test these commonly used functions
      yield allowConsoleError(() => {
        expect(() => deferredEvent.preventDefault()).to.throw(errorText);
      });
      yield allowConsoleError(() => {
        expect(() => deferredEvent.stopPropagation()).to.throw(errorText);
      });

      // Test all functions
      for (const key in deferredEvent) {
        const value = deferredEvent[key];
        if (typeof value === 'function') {
          yield allowConsoleError(() => {
            expect(() => value()).to.throw(errorText);
          });
        }
      }
    });
  });
});

describes.realWin(
  'Action allowlisting',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let action;
    let target;
    let spy;
    let getDefaultActionAlias;

    function getActionInvocation(element, action, opt_tagOrTarget) {
      return new ActionInvocation(
        element,
        action,
        /* args */ null,
        'source',
        'caller',
        'event',
        ActionTrust_Enum.HIGH,
        'tap',
        opt_tagOrTarget || element.tagName
      );
    }

    beforeEach(() => {
      spy = env.sandbox.spy();
      getDefaultActionAlias = env.sandbox.stub();
      target = createExecElement('foo', spy, getDefaultActionAlias);
    });

    describe('with null action allowlist', () => {
      beforeEach(() => {
        action = new ActionService(env.ampdoc, env.win.document);
      });

      it('should allow all actions by default', () => {
        const i = getActionInvocation(target, 'setState', 'AMP');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow all actions case insensitive', () => {
        const i = getActionInvocation(target, 'setState', 'amp');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });
    });

    describe('with non-null action allowlist', () => {
      beforeEach(() => {
        action = new ActionService(env.ampdoc, env.win.document);
        action.setAllowlist([
          {tagOrTarget: 'AMP', method: 'pushState'},
          {tagOrTarget: 'AMP', method: 'setState'},
          {tagOrTarget: '*', method: 'show'},
          {tagOrTarget: 'amp-element', method: 'defaultAction'},
        ]);
      });

      it('should allow default actions if alias is registered default', () => {
        // Given that 'defaultAction' is a registered default action.
        getDefaultActionAlias.returns('defaultAction');
        // Expect the 'activate' call to invoke it.
        const i = getActionInvocation(target, 'activate', null);
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow allowlisted actions with wildcard target', () => {
        const i = getActionInvocation(target, 'show', 'DIV');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should not allow non-allowlisted actions', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        env.sandbox.stub(action, 'error_');
        expect(action.invoke_(i)).to.be.null;
        expect(action.error_).to.be.calledWithMatch(
          /"AMP.print" is not allowlisted/
        );
      });

      it('should allow adding actions to the allowlist', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        action.addToAllowlist('AMP', 'print');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should allow adding action lists to the allowlist', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        action.addToAllowlist('AMP', ['print']);
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });
    });

    it('should not allow any action with empty allowlist', () => {
      action = new ActionService(env.ampdoc, env.win.document);
      action.setAllowlist([]);
      const i = getActionInvocation(target, 'print', 'AMP');
      env.sandbox.stub(action, 'error_');
      expect(action.invoke_(i)).to.be.null;
      expect(action.error_).to.be.calledWith(
        '"AMP.print" is not allowlisted [].'
      );
    });

    it('should throw error with unparseable allowlist entries', () => {
      action = new ActionService(env.ampdoc, env.win.document);
      expect(() =>
        action.setAllowlist([
          {tagOrTarget: 'AMP', method: 'pushState'},
          {invalidEntry: 'invalid'},
          {},
          {tagOrTarget: 'AMP', method: 'setState'},
          {tagOrTarget: '*', method: 'show'},
          {tagOrTarget: '*'},
          {method: 'show'},
        ])
      ).to.throw(
        'Action allowlist entries should be of shape { tagOrTarget: string, method: string }'
      );
      expect(action.allowlist_).to.be.null;
    });

    describe('email documents', () => {
      beforeEach(() => {
        env.win.document.documentElement.setAttribute('amp4email', '');
        action = new ActionService(env.ampdoc, env.win.document);
      });

      it('should supply default actions allowlist', () => {
        const i = getActionInvocation(target, 'toggleClass', 'AMP');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should supply default actions allowlist', () => {
        const i = getActionInvocation(target, 'toggleChecked', 'AMP');
        action.invoke_(i);
        expect(spy).to.be.calledWithExactly(i);
      });

      it('should not allow non-default actions', () => {
        const i = getActionInvocation(target, 'print', 'AMP');
        env.sandbox.stub(action, 'error_');
        expect(action.invoke_(i)).to.be.null;
        expect(action.error_).to.be.calledWithMatch(
          /"AMP.print" is not allowlisted/
        );
      });
    });
  }
);

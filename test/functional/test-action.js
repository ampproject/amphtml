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

import {Action} from '../../src/action';

describe('Action', () => {

  let sandbox;
  let action;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    action = new Action(window);
  });

  afterEach(() => {
    action = null;
    sandbox.restore();
    sandbox = null;
  });


  it('parseAction_ - default event and method', () => {
    let a = action.parseAction_('target1');
    expect(a.event).to.equal('tap');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('activate');
  });

  it('parseAction_ - default event', () => {
    let a = action.parseAction_('target1.method1');
    expect(a.event).to.equal('tap');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('parseAction_ - default method', () => {
    let a = action.parseAction_('event1:target1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('activate');
  });

  it('parseAction_ - no defaults', () => {
    let a = action.parseAction_('event1:target1.method1');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('parseAction_ - lots of whitespace', () => {
    let a = action.parseAction_('  event1  :  target1  .  method1  ');
    expect(a.event).to.equal('event1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method1');
  });

  it('parseAction_ - empty', () => {
    let a = action.parseAction_('');
    expect(a).to.equal(null);
  });

  it('parseAction_ - no target', () => {
    expect(action.parseAction_('event1:')).to.equal(null);
    expect(action.parseAction_('.method1')).to.equal(null);
    expect(action.parseAction_('event1:.method1')).to.equal(null);
  });

  it('parseAction_ - period in event or method', () => {
    let a = action.parseAction_('event.1:target1.method.1');
    expect(a.event).to.equal('event.1');
    expect(a.target).to.equal('target1');
    expect(a.method).to.equal('method.1');
  });


  it('parseActionMap_ - single action', () => {
    let m = action.parseActionMap_('event1:action1');
    expect(m['event1'].target).to.equal('action1');
  });

  it('parseActionMap_ - two actions', () => {
    let m = action.parseActionMap_('event1:action1; event2: action2');
    expect(m['event1'].target).to.equal('action1');
    expect(m['event2'].target).to.equal('action2');
  });

  it('parseActionMap_ - dupe actions', () => {
    let m = action.parseActionMap_('event1:action1; event1: action2');
    // Currently, we overwrite the events.
    expect(m['event1'].target).to.equal('action2');
  });

  it('parseActionMap_ - empty', () => {
    expect(action.parseActionMap_('')).to.equal(null);
    expect(action.parseActionMap_('  ')).to.equal(null);
    expect(action.parseActionMap_(';;;')).to.equal(null);
  });


  it('getActionMap_', () => {
    var element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    let m = action.getActionMap_(element);
    expect(m['event1'].target).to.equal('action1');
  });

  it('getActionMap_ - cached', () => {
    var element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    let m1 = action.getActionMap_(element);
    let m2 = action.getActionMap_(element);
    expect(m1).to.equal(m2);
  });


  it('findAction_ - direct', () => {
    var element = document.createElement('div');
    element.setAttribute('on', 'event1:action1');
    let a = action.findAction_(element, 'event1');
    expect(a.node).to.equal(element);
    expect(a.actionInfo.target).to.equal('action1');

    expect(action.findAction_(element, 'event3')).to.equal(null);
  });

  it('findAction_ - hierarchy', () => {
    var parent = document.createElement('div');
    parent.setAttribute('on', 'event1:action1');
    var element = document.createElement('div');
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


  it('invoke_', () => {
    var activateCalled = false;
    var element = {
      activate: function() {
        activateCalled = true;
      }
    };

    action.invoke_(element, {event: 'event1', target: 'target1',
        method: 'activate', str: 'action1'});
    expect(activateCalled).to.equal(true);
  });

  it('invoke_ - no method', () => {
    var activateCalled = false;
    var element = {
    };

    expectFailure(() => {
      action.invoke_(element, {event: 'event1', target: 'target1',
          method: 'activate', str: 'action1'});
    });
    expect(activateCalled).to.equal(false);
  });

  function expectFailure(func) {
    try {
      func();
    } catch(e) {
      // ignore, expected.
    }
  }

});

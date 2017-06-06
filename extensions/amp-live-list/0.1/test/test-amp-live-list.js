/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import * as sinon from 'sinon';
import {AmpDocSingle} from '../../../../src/service/ampdoc-impl';
import {AmpLiveList, getNumberMaxOrDefault} from '../amp-live-list';
import {LiveListManager} from '../live-list-manager';
import {adopt} from '../../../../src/runtime';

adopt(window);

describe('amp-live-list', () => {
  let sandbox;
  let ampdoc;
  let liveList;
  let elem;
  let dftAttrs;
  let itemsSlot;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    ampdoc = new AmpDocSingle(window);
    elem = document.createElement('amp-live-list');
    elem.getAmpDoc = () => ampdoc;
    const updateSlot = document.createElement('button');
    itemsSlot = document.createElement('div');
    updateSlot.setAttribute('update', '');
    itemsSlot.setAttribute('items', '');
    elem.appendChild(updateSlot);
    elem.appendChild(itemsSlot);
    dftAttrs = {
      'id': 'my-list',
      'data-poll-interval': 2000,
      'data-max-items-per-page': 5,
      'data-sort-time': Date.now(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  function buildElement(elem, attrs) {
    for (const key in attrs) {
      elem.setAttribute(key, attrs[key]);
    }
    liveList = new AmpLiveList(elem);
    liveList.getVsync = () => {
      return {
        mutate(cb) { cb(); },
        measure(cb) { cb(); },
        runPromise(task, state = {}) {
          if (task.measure) {
            task.measure(state);
          }
          if (task.mutate) {
            task.mutate(state);
          }
          return Promise.resolve();
        },
      };
    };
    liveList.mutateElement = (cb, opt_el) => {
      return Promise.resolve().then(() => {
        cb();
      });
    };
    liveList.deferMutate = cb => {
      cb();
    };
    return elem;
  }

  /**
   * @param {!Array<number>} childIds
   * @param {!Element=} opt_pagination
   * @return {!Element<!Element>}
   */
  function createFromServer(childAttrs = [], opt_pagination) {
    const parent = document.createElement('div');
    const itemsCont = document.createElement('div');
    itemsCont.setAttribute('items', '');
    parent.appendChild(itemsCont);
    for (let i = 0; i < childAttrs.length; i++) {
      const childAttr = childAttrs[i];
      const child = document.createElement('div');
      child.setAttribute('id', `${childAttr.id}`);
      child.setAttribute('data-sort-time',
          `${childAttr.sortTime || Date.now()}`);
      if ('updateTime' in childAttr) {
        child.setAttribute('data-update-time', `${childAttr.updateTime}`);
      }
      if ('tombstone' in childAttr) {
        child.setAttribute('data-tombstone', '');
      }
      itemsCont.appendChild(child);
    }
    if (opt_pagination) {
      opt_pagination.setAttribute('pagination', '');
      parent.appendChild(opt_pagination);
    }
    return parent;
  }

  it('validates that elem has an id on initial load', () => {
    buildElement(elem, {});
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have an id/);

    expect(() => {
      liveList.element.setAttribute('id', 'my-list');
      liveList.buildCallback();
    }).to.not.throw(/must have an id/);
  });

  it('validates its items slot on initial load', () => {
    const child = document.createElement('div');
    elem.querySelector('[items]').appendChild(child);
    buildElement(elem, dftAttrs);
    const stub = sandbox.stub(liveList, 'validateLiveListItems_');
    expect(stub).to.have.not.been.called;
    liveList.buildCallback();
    expect(stub).to.be.calledOnce;
  });

  it('validates correctly', () => {
    const child = document.createElement('div');
    elem.querySelector('[items]').appendChild(child);
    buildElement(elem, dftAttrs);
    expect(() => {
      liveList.validateLiveListItems_(elem.querySelector('[items]'));
    }).to.throw(/children must have id and data-sort-time/);

    expect(() => {
      child.setAttribute('id', 'child-id');
      liveList.buildCallback();
    }).to.throw(/children must have id and data-sort-time/);

    child.removeAttribute('id');

    expect(() => {
      child.setAttribute('data-sort-time', Date.now());
      liveList.buildCallback();
    }).to.throw(/children must have id and data-sort-time/);

    expect(() => {
      child.setAttribute('id', 'child-id');
      liveList.buildCallback();
    }).to.not.throw();
  });

  it('has a minimum interval', () => {
    let attrs = Object.assign({}, dftAttrs, {'data-poll-interval': 17000});
    buildElement(elem, attrs);
    liveList.buildCallback();
    expect(liveList.element.getAttribute('data-poll-interval'))
        .to.equal('17000');
    expect(liveList.getInterval())
        .to.equal(17000);

    attrs = Object.assign({}, dftAttrs, {'data-poll-interval': 4000});
    buildElement(elem, attrs);
    liveList.buildCallback();
    expect(liveList.element.getAttribute('data-poll-interval'))
        .to.equal('4000');
    expect(liveList.getInterval())
        .to.equal(LiveListManager.getMinDataPollInterval());
  });

  it('should enforce max-items-per-page', () => {
    let attrs = Object.assign({}, dftAttrs, {'data-max-items-per-page': ''});
    buildElement(elem, attrs);
    // Errors out because no data-max-items-per-page is given
    expect(liveList.element.getAttribute('data-max-items-per-page'))
        .to.equal('');
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have data-max-items-per-page/);

    // Errors out because data-max-items-per-page does not exist
    attrs = Object.assign({}, dftAttrs);
    expect('data-max-items-per-page' in attrs).to.be.true;
    delete attrs['data-max-items-per-page'];
    expect('data-max-items-per-page' in attrs).to.be.false;
    buildElement(elem, attrs);
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have data-max-items-per-page/);

    // Errors out because data-max-items-per-page is not parseable as a number
    attrs = Object.assign({}, dftAttrs, {'data-max-items-per-page': 'hello'});
    buildElement(elem, attrs);
    expect(liveList.element.getAttribute('data-max-items-per-page'))
        .to.equal('hello');
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have data-max-items-per-page/);

    attrs = Object.assign({}, dftAttrs, {'data-max-items-per-page': '10'});
    buildElement(elem, attrs);
    expect(liveList.element.getAttribute('data-max-items-per-page'))
        .to.equal('10');
    expect(() => {
      liveList.buildCallback();
      expect(liveList.maxItemsPerPage_).to.equal(10);
    }).to.not.throw(/must have data-max-items-per-page/);
  });

  it('should use actual initial items count instead of ' +
     'data-max-items-per-page if greater', () => {
    for (let i = 0; i < 20; i++) {
      const child = document.createElement('div');
      child.setAttribute('data-sort-time', Date.now());
      child.setAttribute('id', i);
      if (i == 15) {
        child.setAttribute('data-tombstone', '');
      }
      itemsSlot.appendChild(child);
    }
    buildElement(elem, dftAttrs);
    liveList.buildCallback();
    expect(liveList.maxItemsPerPage_)
        .to.not.equal(LiveListManager.getMinDataMaxItemsPerPage());
    expect(liveList.maxItemsPerPage_)
        .to.equal(19);
  });

  it('should enforce update slot', () => {
    buildElement(elem, dftAttrs);
    elem.removeChild(elem.querySelector('[update]'));
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have an "update" slot/);
  });

  it('should enforce items slot', () => {
    buildElement(elem, dftAttrs);
    elem.removeChild(elem.querySelector('[items]'));
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have an "items" slot/);
  });

  it('should have aria-live=polite by default', () => {
    buildElement(elem, dftAttrs);
    liveList.buildCallback();
    expect(liveList.element.getAttribute('aria-live')).to.equal('polite');
  });

  it('should use explicitly defined aria-live attribute value', () => {
    buildElement(elem, {
      'aria-live': 'assertive',
      'id': 'my-list',
      'data-poll-interval': 2000,
      'data-max-items-per-page': 5,
      'data-sort-time': Date.now(),
    });
    liveList.buildCallback();
    expect(liveList.element.getAttribute('aria-live')).to.equal('assertive');
  });

  describe('#update', () => {

    beforeEach(() => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
    });

    it('sends amp-dom-update and amp-live-list.update ' +
       'events on new items', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      const domUpdateSpy = sandbox.spy(liveList, 'sendAmpDomUpdateEvent_');
      const triggerSpy = sandbox.spy(liveList.actions_, 'trigger');
      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(domUpdateSpy).to.have.been.calledOnce;
        expect(triggerSpy).to.have.been.calledWith(elem, 'update', null);
      });
    });

    it('sends amp-dom-update and amp-live-list.update ' +
       'events on replace items', () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      child1.setAttribute('id', 'id1');
      child2.setAttribute('id', 'id2');
      child1.setAttribute('data-sort-time', '123');
      child2.setAttribute('data-sort-time', '124');
      itemsSlot.appendChild(child1);
      itemsSlot.appendChild(child2);
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      const fromServer1 = createFromServer([
        {id: 'id1', updateTime: 125},
      ]);
      const domUpdateSpy = sandbox.spy(liveList, 'sendAmpDomUpdateEvent_');
      const triggerSpy = sandbox.spy(liveList.actions_, 'trigger');
      // We stub and restore to not trigger `update` calling `updateAction_`.
      const stub = sinon./*OK*/stub(liveList, 'updateAction_');
      liveList.update(fromServer1);
      stub./*OK*/restore();
      return liveList.updateAction_().then(() => {
        expect(domUpdateSpy).to.have.been.calledOnce;
        expect(triggerSpy).to.have.been.calledWith(elem, 'update', null);
      });
    });

    it('should NOT send amp-dom-update and amp-live-list.update ' +
       'events on tombstone items', () => {
      const child1 = document.createElement('div');
      const child2 = document.createElement('div');
      child1.setAttribute('id', 'id1');
      child2.setAttribute('id', 'id2');
      child1.setAttribute('data-sort-time', '123');
      child2.setAttribute('data-sort-time', '124');
      itemsSlot.appendChild(child1);
      itemsSlot.appendChild(child2);
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      const fromServer1 = createFromServer([
        {id: 'id1', tombstone: null},
      ]);
      const domUpdateSpy = sandbox.spy(liveList, 'sendAmpDomUpdateEvent_');
      const triggerSpy = sandbox.spy(liveList.actions_, 'trigger');
      // We stub and restore to not trigger `update` calling `updateAction_`.
      const stub = sinon./*OK*/stub(liveList, 'updateAction_');
      liveList.update(fromServer1);
      stub./*OK*/restore();
      return liveList.updateAction_().then(() => {
        expect(domUpdateSpy).to.not.have.been.called;
        expect(triggerSpy).to.not.have.been.called;
      });
    });

    it('validates children during update', () => {
      const update = document.createElement('div');
      const updateLiveListItems = document.createElement('div');
      updateLiveListItems.setAttribute('items', '');
      update.appendChild(updateLiveListItems);
      updateLiveListItems.appendChild(document.createElement('div'));
      const stub = sandbox.stub(liveList, 'validateLiveListItems_');
      expect(stub).to.have.not.been.called;
      expect(() => {
        liveList.update(update);
      }).to.throw();
      expect(stub).to.be.calledOnce;
    });

    it('should call updateFixedLayer on update with inserts', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      const spy = sandbox.spy(liveList.viewport_, 'updateFixedLayer');
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      const fromServer1 = createFromServer([{id: 'id0'}]);
      expect(spy).to.have.not.been.called;
      liveList.update(fromServer1);
      expect(spy).to.have.been.calledOnce;
    });

    it('no items slot on update should be a no op update', () => {
      const update = document.createElement('div');
      expect(() => {
        liveList.update(update);
      }).to.not.throw();
    });

    it('discovers children to insert when they have newly discovered ' +
       'ids', () => {
      buildElement(elem, dftAttrs);

      const child = document.createElement('div');
      child.setAttribute('id', 'id0');
      child.setAttribute('data-sort-time', '12345');
      itemsSlot.appendChild(child);

      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(1);

      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      expect(liveList.pendingItemsInsert_).to.have.length(0);

      const fromServer2 = createFromServer([
        {id: 'id0'}, {id: 'id1'}, {id: 'id2'},
      ]);
      const fromServer2ItemsCont = fromServer2
          .querySelector('[items]');
      expect(fromServer2ItemsCont.childElementCount).to.equal(3);
      expect(liveList.pendingItemsInsert_).to.have.length(0);
      liveList.update(fromServer2);
      expect(liveList.pendingItemsInsert_).to.have.length(2);
    });

    it('should wait for user interaction before inserting', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      expect(liveList.pendingItemsInsert_).to.have.length(1);
      return liveList.updateAction_().then(() => {
        expect(liveList.pendingItemsInsert_).to.have.length(0);
        expect(liveList.itemsSlot_.childElementCount).to.equal(1);
      });
    });

    // TODO(erwinm): remove the skip when we support scroll repositioning
    // correctly with components that can ask for a resize like
    // amp-twitter for example.
    it.skip('should insert w/o user interaction', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      expect(liveList.itemsSlot_.childElementCount).to.equal(0);

      const fromServer1 = createFromServer();
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(0);
      expect(liveList.itemsSlot_.childElementCount).to.equal(1);
    });

    it('should add amp-live-list-item-new class for newly inserted ' +
       'items', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      expect(liveList.itemsSlot_.childElementCount).to.equal(0);

      const fromServer1 = createFromServer([
        {id: 'id0'},
      ]);
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(liveList.itemsSlot_.firstElementChild)
            .to.have.class('amp-live-list-item-new');
      });
    });

    it('should remove amp-live-list-item-new when no longer latest ' +
       'items', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      expect(liveList.itemsSlot_.childElementCount).to.equal(0);

      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(liveList.itemsSlot_.lastElementChild)
            .to.have.class('amp-live-list-item-new');
        expect(liveList.itemsSlot_.childElementCount).to.equal(1);

        const fromServer2 = createFromServer([{id: 'id1'}]);
        liveList.update(fromServer2);
        return liveList.updateAction_().then(() => {
          expect(liveList.itemsSlot_.childElementCount).to.equal(2);
          expect(liveList.itemsSlot_.lastElementChild)
              .to.not.have.class('amp-live-list-item-new');
        });
      });
    });

    it('should always add amp-live-list-item class to children', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      expect(liveList.itemsSlot_.childElementCount).to.equal(0);

      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(liveList.itemsSlot_.lastElementChild)
            .to.have.class('amp-live-list-item');

        const fromServer2 = createFromServer([{id: 'id1'}]);
        liveList.update(fromServer2);
        return liveList.updateAction_().then(() => {
          expect(liveList.itemsSlot_.childElementCount).to.equal(2);
          expect(liveList.itemsSlot_.lastElementChild)
              .to.have.class('amp-live-list-item');
        });
      });
    });

    it('should display update indicator', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('amp-hidden');

      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      expect(liveList.pendingItemsInsert_).to.have.length(1);
      expect(liveList.updateSlot_).to.not.have.class('amp-hidden');

      return liveList.updateAction_(fromServer1).then(() => {
        expect(liveList.updateSlot_).to.have.class('amp-hidden');
      });
    });

    it('should have correct insertion by using data-sort-time', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('amp-hidden');

      const oldDate = Date.now();

      const fromServer1 = createFromServer([
        {id: 'unique-id-num-3', sortTime: oldDate + 1},
        {id: 'unique-id-num-4', sortTime: oldDate + 2},
        {id: 'unique-id-num-5', sortTime: oldDate},
      ]);

      liveList.update(fromServer1);

      // Sort order should be 5, 3, 4
      expect(liveList.pendingItemsInsert_[0].getAttribute('id'))
          .to.equal('unique-id-num-5');
      expect(liveList.pendingItemsInsert_[1].getAttribute('id'))
          .to.equal('unique-id-num-3');
      expect(liveList.pendingItemsInsert_[2].getAttribute('id'))
          .to.equal('unique-id-num-4');
      return liveList.updateAction_().then(() => {
        // Insertion order should be 4, 3, 5
        expect(liveList.itemsSlot_.children[0].getAttribute('id'))
            .to.equal('unique-id-num-4');
        expect(liveList.itemsSlot_.children[1].getAttribute('id'))
            .to.equal('unique-id-num-3');
        expect(liveList.itemsSlot_.children[2].getAttribute('id'))
            .to.equal('unique-id-num-5');
        expect(liveList.itemsSlot_.children.length).to.equal(3);
      });
    });
  });

  it('should have the correct "update time"', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    expect(() => {
      liveList.buildCallback();
    }).to.not.throw();
    expect(liveList.updateTime_).to.equal(124);

    const fromServer1 = createFromServer([
      {id: 'id1', sortTime: 129},
    ]);
    // Does not get updated since it is a cached id.
    expect(liveList.update(fromServer1)).to.equal(124);

    // Find the highest data-sort-time
    const fromServer2 = createFromServer([
      {id: 'id3', sortTime: 130},
      {id: 'id4', sortTime: 133},
    ]);
    expect(liveList.update(fromServer2)).to.equal(133);

    // Find the highest data-update-time
    const fromServer3 = createFromServer([
      {id: 'id6', sortTime: 150, updateTime: 200},
      {id: 'id7', sortTime: 150, updateTime: 180},
    ]);
    expect(liveList.update(fromServer3)).to.equal(200);

    // No update is made since data-update-time did not change
    // and only data-sort-time changed, but its treated
    // immutable even if the server sent us a new value.
    const fromServer4 = createFromServer([
      {id: 'id6', sortTime: 300, updateTime: 200},
    ]);
    expect(liveList.update(fromServer4)).to.equal(200);

    // data-update-time is used
    const fromServer5 = createFromServer([
      {id: 'id6', sortTime: 300, updateTime: 600},
    ]);
    expect(liveList.update(fromServer5)).to.equal(600);
  });

  it('should be able to accumulate insert items', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 125},
      {id: 'id3'},
    ]);

    const spy = sandbox.spy(liveList, 'updateAction_');
    liveList.update(fromServer1);

    expect(liveList.pendingItemsInsert_).to.have.length(1);
    expect(spy).to.have.not.been.called;

    const fromServer2 = createFromServer([
      {id: 'id4'},
      {id: 'id7'},
      {id: 'id9'},
    ]);
    liveList.update(fromServer2);
    expect(liveList.pendingItemsInsert_).to.have.length(4);
    expect(spy).to.have.not.been.called;
  });

  it('should have pending replace items', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 125},
      {id: 'id3'},
    ]);

    const spy = sandbox.spy(liveList, 'updateAction_');
    liveList.update(fromServer1);

    expect(liveList.pendingItemsInsert_).to.have.length(1);
    expect(liveList.pendingItemsReplace_).to.have.length(1);
    // Should wait for user action until `updateAction_`
    expect(spy).to.have.not.been.called;
  });

  it('should have pending replace items even w/o new inserts', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 125},
    ]);

    const spy = sandbox.spy(liveList, 'updateAction_');
    liveList.update(fromServer1);

    expect(liveList.pendingItemsInsert_).to.have.length(0);
    expect(liveList.pendingItemsReplace_).to.have.length(1);
    // If there is no pending items to insert, flush the replace items
    // right away.
    expect(spy).to.be.calledOnce;
  });

  it('should always use latest update to replace when in pending state', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 125},
      {id: 'id3'},
    ]);

    const spy = sandbox.spy(liveList, 'updateAction_');
    liveList.update(fromServer1);

    expect(liveList.pendingItemsReplace_).to.have.length(1);
    expect(liveList.pendingItemsReplace_[0].getAttribute('id')).to.equal('id1');
    expect(liveList.pendingItemsReplace_[0].getAttribute('data-update-time'))
        .to.equal('125');
    // Should wait for user action until `updateAction_`
    expect(spy).to.have.not.been.called;

    const fromServer2 = createFromServer([
      {id: 'id1', updateTime: 127},
    ]);
    liveList.update(fromServer2);

    expect(liveList.pendingItemsReplace_).to.have.length(1);
    expect(liveList.pendingItemsReplace_[0].getAttribute('id')).to.equal('id1');
    expect(liveList.pendingItemsReplace_[0].getAttribute('data-update-time'))
        .to.equal('127');

    expect(spy).to.have.not.been.called;
  });

  it('should replace pagination section', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    const originalPagination = document.createElement('div');
    originalPagination.setAttribute('pagination', '');
    elem.appendChild(originalPagination);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    expect(liveList.paginationSlot_).to.equal(originalPagination);
    expect(liveList.pendingPagination_).to.equal(null);

    const newPagination = document.createElement('div');
    const fromServer1 = createFromServer([
      {id: 'id1', tombstone: null},
      {id: 'id3'},
      {id: 'id2', tombstone: null},
    ], newPagination);
    liveList.update(fromServer1);

    expect(liveList.pendingPagination_).to.equal(newPagination);
    expect(liveList.paginationSlot_).to.equal(originalPagination);

    return liveList.updateAction_().then(() => {
      expect(liveList.pendingPagination_).to.equal(null);
      expect(liveList.paginationSlot_).to.equal(newPagination);

      const newPagination2 = document.createElement('div');
      const fromServer2 = createFromServer([
        {id: 'id6'},
      ], newPagination2);
      liveList.update(fromServer2);

      expect(liveList.pendingPagination_).to.equal(newPagination2);
      expect(liveList.paginationSlot_).to.equal(newPagination);
      return liveList.updateAction_().then(() => {
        expect(liveList.pendingPagination_).to.equal(null);
        expect(liveList.paginationSlot_).to.equal(newPagination2);
      });
    });
  });

  it('should not replace pagination if only no insert or tombstone', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    const originalPagination = document.createElement('div');
    originalPagination.setAttribute('pagination', '');
    elem.appendChild(originalPagination);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    expect(liveList.paginationSlot_).to.equal(originalPagination);
    expect(liveList.pendingPagination_).to.equal(null);

    const newPagination = document.createElement('div');
    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 999},
    ], newPagination);
    liveList.update(fromServer1);

    expect(liveList.pendingPagination_).to.equal(newPagination);
    expect(liveList.paginationSlot_).to.equal(originalPagination);

    return liveList.updateAction_().then(() => {
      expect(liveList.pendingPagination_).to.equal(null);
      expect(liveList.paginationSlot_).to.equal(originalPagination);
    });
  });

  it('should find items to tombstone', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', tombstone: null},
      {id: 'id3'},
      {id: 'id2', tombstone: null},
    ]);
    expect(liveList.pendingItemsTombstone_).to.have.length(0);

    liveList.update(fromServer1);

    expect(liveList.pendingItemsTombstone_).to.have.length(2);
  });

  it('should empty out descendants of tombstones item', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', tombstone: null},
      {id: 'id3'},
      {id: 'id2', tombstone: null},
    ]);
    expect(liveList.pendingItemsTombstone_).to.have.length(0);

    liveList.update(fromServer1);

    expect(liveList.pendingItemsTombstone_).to.have.length(2);
    expect(child1.childNodes).to.have.length(2);
    expect(child2.childNodes).to.have.length(0);

    return liveList.updateAction_().then(() => {
      expect(child1.childNodes).to.have.length(0);
      expect(child2.childNodes).to.have.length(0);
    });
  });

  it('should not tombstone item multiple times', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', tombstone: null},
      {id: 'id3'},
      {id: 'id2', tombstone: null},
    ]);
    expect(liveList.pendingItemsTombstone_).to.have.length(0);

    liveList.update(fromServer1);

    expect(liveList.pendingItemsTombstone_).to.have.length(2);
    expect(child1.childNodes).to.have.length(2);
    expect(child2.childNodes).to.have.length(0);

    return liveList.updateAction_().then(() => {
      expect(child1.childNodes).to.have.length(0);
      expect(child2.childNodes).to.have.length(0);
    }).then(() => {
      const fromServer2 = createFromServer([
        {id: 'id1', tombstone: null},
        {id: 'id3'},
        {id: 'id2', tombstone: null},
      ]);
      expect(liveList.pendingItemsTombstone_).to.have.length(0);
      liveList.update(fromServer2);
      // Shouldn't find anything a second time around
      expect(liveList.pendingItemsTombstone_).to.have.length(0);
    });
  });

  it('should choose tombstone over update', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id1', updateTime: 999, tombstone: null},
      {id: 'id3'},
      {id: 'id2', tombstone: null},
    ]);
    expect(liveList.pendingItemsTombstone_).to.have.length(0);
    expect(liveList.pendingItemsReplace_).to.have.length(0);

    liveList.update(fromServer1);

    expect(liveList.pendingItemsTombstone_).to.have.length(2);
    expect(liveList.pendingItemsReplace_).to.have.length(0);
  });


  it('should choose tombstone over insert', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    itemsSlot.appendChild(child1);
    itemsSlot.appendChild(child2);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer1 = createFromServer([
      {id: 'id3', tombstone: null},
    ]);
    expect(liveList.pendingItemsTombstone_).to.have.length(0);
    expect(liveList.pendingItemsInsert_).to.have.length(0);

    liveList.update(fromServer1);

    expect(liveList.pendingItemsTombstone_).to.have.length(1);
    expect(liveList.pendingItemsInsert_).to.have.length(0);
  });

  it('should be able to toggle the `disabled` attribute', () => {
    buildElement(elem, dftAttrs);
    liveList.buildCallback();
    expect(elem.hasAttribute('disabled')).to.be.false;
    expect(liveList.isEnabled()).to.be.true;
    liveList.toggle(false);
    expect(elem.hasAttribute('disabled')).to.be.true;
    expect(liveList.isEnabled()).to.be.false;
    liveList.toggle(true);
    expect(elem.hasAttribute('disabled')).to.be.false;
    expect(liveList.isEnabled()).to.be.true;
  });

  it('should delete old items to accomodate new items', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    // append child 2 first
    itemsSlot.appendChild(child2);
    itemsSlot.appendChild(child1);
    buildElement(elem, Object.assign({}, dftAttrs,
        {'data-max-items-per-page': 3}));
    sandbox.stub(liveList, 'isElementBelowViewport_').returns(true);
    liveList.buildCallback();
    const removeChildSpy = sandbox.spy(liveList.itemsSlot_, 'removeChild');

    const fromServer1 = createFromServer([
      {id: 'id3'},
    ]);

    // Insert 1 new item
    expect(liveList.curNumOfLiveItems_).to.equal(2);
    expect(liveList.pendingItemsInsert_).to.have.length(0);

    liveList.update(fromServer1);
    expect(liveList.pendingItemsInsert_).to.have.length(1);
    expect(liveList.curNumOfLiveItems_).to.equal(2);
    expect(removeChildSpy).to.have.not.been.called;

    return liveList.updateAction_().then(() => {
      expect(liveList.curNumOfLiveItems_).to.equal(3);
      expect(liveList.pendingItemsInsert_).to.have.length(0);

      expect(removeChildSpy).to.have.not.been.called;
      // tombstone id3
      const fromServer = createFromServer([
        {id: 'id3', tombstone: null},
        // id6 actually doesn't exist.
        {id: 'id6', tombstone: null},
      ]);
      liveList.update(fromServer);
      // Note that updateAction_ is actually called twice here, since
      // `update` will call it right away w/o any insertion operation.
      return liveList.updateAction_().then(() => {
        expect(removeChildSpy).to.have.not.been.called;
        expect(liveList.curNumOfLiveItems_).to.equal(2);
      });
    }).then(() => {
      // Insert 1 new item
      const fromServer = createFromServer([
        {id: 'id4'},
      ]);
      liveList.update(fromServer);
      return liveList.updateAction_().then(() => {
        // We have room for 1 more since we did a tombstone to id3
        expect(removeChildSpy).to.have.not.been.called;
        expect(liveList.curNumOfLiveItems_).to.equal(3);
        expect(liveList.itemsSlot_
            .lastElementChild.getAttribute('id')).to.equal('id1');
      });
    }).then(() => {
      // Insert 1 new item
      const fromServer = createFromServer([
        {id: 'id8'},
      ]);
      liveList.update(fromServer);
      return liveList.updateAction_().then(() => {
        // We finally call removeChild on parent as we've
        // passed the max items limit.
        expect(removeChildSpy).to.be.calledOnce;
        expect(liveList.curNumOfLiveItems_).to.equal(3);
        // Last item is now id2, since id1 would have been removed from live
        // DOM.
        expect(liveList.itemsSlot_
            .lastElementChild.getAttribute('id')).to.equal('id2');
      });
    });
  });

  it('should only delete items below the viewport', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '123');
    child2.setAttribute('data-sort-time', '124');
    // append child 2 first
    itemsSlot.appendChild(child2);
    itemsSlot.appendChild(child1);
    buildElement(elem, Object.assign({}, dftAttrs,
        {'data-max-items-per-page': 2}));
    const pred = sandbox.stub(liveList, 'isElementBelowViewport_');
    // id1
    pred.onCall(0).returns(true);
    // Anything else
    pred.returns(false);
    liveList.buildCallback();
    const removeChildSpy = sandbox.spy(liveList.itemsSlot_, 'removeChild');

    const fromServer1 = createFromServer([
      {id: 'id3'},
      {id: 'id4'},
      {id: 'id5'},
      {id: 'id6'},
    ]);


    liveList.update(fromServer1);
    expect(removeChildSpy).to.have.not.been.called;

    return liveList.updateAction_().then(() => {
      // Will only remove id1 and not id2
      expect(removeChildSpy).to.be.calledOnce;
    });
  });


  it('should keep correct count of live items', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id2');
    child1.setAttribute('data-sort-time', '1');
    child2.setAttribute('data-sort-time', '2');
    // append child 2 first
    itemsSlot.appendChild(child2);
    itemsSlot.appendChild(child1);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();
    sandbox.stub(liveList, 'isElementBelowViewport_').returns(true);
    const removeChildSpy = sandbox.spy(liveList.itemsSlot_, 'removeChild');

    const fromServer = createFromServer([
      {id: 'id3', sortTime: 110},
      {id: 'id4', sortTime: 111},
    ]);
    liveList.update(fromServer);
    expect(liveList.curNumOfLiveItems_).to.equal(2);

    return liveList.updateAction_().then(() => {
      expect(liveList.curNumOfLiveItems_).to.equal(4);
    }).then(() => {

      // Currently 4 items, plus 4 insertions = 8, minus 1 tombstone item.
      // This means we currently have 7 items and 2 items to "delete" from the
      // live DOM.
      const fromServer = createFromServer([
        {id: 'id1', tombstone: null},
        // Bad tombstone example to make sure it doesnt decrement incorrectly.
        {id: 'id100', tombstone: null},
        {id: 'id5'},
        {id: 'id6'},
        {id: 'id7'},
        {id: 'id8'},
      ]);
      expect(liveList.itemsSlot_.lastElementChild.getAttribute('id'))
          .to.equal('id1');
      liveList.update(fromServer);
      // Nothing removed yet
      expect(removeChildSpy).to.have.not.been.called;
      return liveList.updateAction_();
    }).then(() => {
      expect(liveList.curNumOfLiveItems_).to.equal(5);
      expect(removeChildSpy).to.have.callCount(2);
      // Deleted id1 and id2
      expect(liveList.itemsSlot_.lastElementChild.getAttribute('id'))
          .to.equal('id1');
      expect(liveList.itemsSlot_
          .lastElementChild.hasAttribute('data-tombstone')).to.be.true;
      // Notice that id1's previous sibling is id3 and not id2
      // as id2 has been deleted from the live DOM to make room for new items.
      expect(liveList.itemsSlot_.lastElementChild
          .previousElementSibling.getAttribute('id')).to.equal('id4');
    });
  });

  it('should insert properly using sort-time', () => {
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    child1.setAttribute('id', 'id1');
    child1.textContent = 'hello world';
    child1.appendChild(document.createElement('div'));
    child2.setAttribute('id', 'id4');
    child1.setAttribute('data-sort-time', '1');
    child2.setAttribute('data-sort-time', '4');
    itemsSlot.appendChild(child2);
    itemsSlot.appendChild(child1);
    buildElement(elem, dftAttrs);
    liveList.buildCallback();

    const fromServer = createFromServer([
      {id: 'id2', sortTime: 2},
      {id: 'id3', sortTime: 3},
    ]);

    expect(liveList.itemsSlot_.children[0].getAttribute('id'))
        .to.equal('id4');
    expect(liveList.itemsSlot_.children[1].getAttribute('id'))
        .to.equal('id1');

    liveList.update(fromServer);
    return liveList.updateAction_().then(() => {
      expect(liveList.curNumOfLiveItems_).to.equal(4);
      expect(liveList.itemsSlot_.children[0].getAttribute('id'))
          .to.equal('id4');
      expect(liveList.itemsSlot_.children[1].getAttribute('id'))
          .to.equal('id3');
      expect(liveList.itemsSlot_.children[2].getAttribute('id'))
          .to.equal('id2');
      expect(liveList.itemsSlot_.children[3].getAttribute('id'))
          .to.equal('id1');
    });
  });

  describe('#getNumberMaxOrDefault', () => {

    it('should return correct value', () => {
      expect(getNumberMaxOrDefault('', 10)).to.equal(10);
      expect(getNumberMaxOrDefault(undefined, 10)).to.equal(10);
      expect(getNumberMaxOrDefault(null, 10)).to.equal(10);
      expect(getNumberMaxOrDefault('hello world', 10)).to.equal(10);
      expect(getNumberMaxOrDefault(NaN, 10)).to.equal(10);
      expect(getNumberMaxOrDefault('12', 10)).to.equal(12);
      expect(getNumberMaxOrDefault('037', 10)).to.equal(37);
      expect(getNumberMaxOrDefault('0', 10)).to.equal(10);
      expect(getNumberMaxOrDefault(0, 10)).to.equal(10);
    });
  });
});

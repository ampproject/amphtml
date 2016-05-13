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
import {AmpLiveList, getNumberMaxOrDefault} from '../amp-live-list';
import {LiveListManager} from '../live-list-manager';
import {adopt} from '../../../../src/runtime';
import {toggleExperiment} from '../../../../src/experiments';

adopt(window);

describe('amp-live-list', () => {
  let sandbox;
  let liveList;
  let elem;
  let dftAttrs;
  let itemsSlot;

  beforeEach(() => {
    toggleExperiment(window, 'amp-live-list', true);
    sandbox = sinon.sandbox.create();
    elem = document.createElement('amp-live-list');
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
    toggleExperiment(window, 'amp-live-list', false);
    sandbox.restore();
  });

  function buildElement(elem, attrs) {
    for (key in attrs) {
      elem.setAttribute(key, attrs[key]);
    }
    liveList = new AmpLiveList(elem);
    liveList.getVsync = () => {
      return {mutate(cb) { cb(); }};
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
   * @return {!Element<!Element>}
   */
  function createFromServer(childAttrs = []) {
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
      itemsCont.appendChild(child);
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
    expect(stub.callCount).to.equal(0);
    liveList.buildCallback();
    expect(stub.callCount).to.equal(1);
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
    expect(liveList.element.getAttribute('data-max-items-per-page'))
        .to.equal('');
    expect(() => {
      liveList.buildCallback();
      expect(liveList.maxItemsPerPage_)
          .to.equal(LiveListManager.getMinDataMaxItemsPerPage());
    }).to.throw(/must have data-max-items-per-page/);

    attrs = Object.assign({}, dftAttrs, {'data-max-items-per-page': 'hello'});
    buildElement(elem, attrs);
    expect(liveList.element.getAttribute('data-max-items-per-page'))
        .to.equal('hello');
    expect(() => {
      liveList.buildCallback();
      expect(liveList.maxItemsPerPage_)
          .to.equal(LiveListManager.getMinDataMaxItemsPerPage());
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

  describe('#update', () => {

    beforeEach(() => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
    });

    it('validates children during update', () => {
      const update = document.createElement('div');
      const updateLiveListItems = document.createElement('div');
      updateLiveListItems.setAttribute('items', '');
      update.appendChild(updateLiveListItems);
      updateLiveListItems.appendChild(document.createElement('div'));
      const stub = sandbox.stub(liveList, 'validateLiveListItems_');
      expect(stub.callCount).to.equal(0);
      expect(() => {
        liveList.update(update);
      }).to.throw();
      expect(stub.callCount).to.equal(1);
    });

    it('asserts that an items slot was provided on update', () => {
      const update = document.createElement('div');
      const updateLiveListItems = document.createElement('div');
      update.appendChild(updateLiveListItems);
      updateLiveListItems.appendChild(document.createElement('div'));

      expect(() => {
        liveList.update(update);
      }).to.throw(/amp-live-list must have an `items` slot/);

      updateLiveListItems.setAttribute('items', '');

      expect(() => {
        liveList.update(update);
      }).to.not.throw(/amp-live-list must have an `items` slot/);
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
      expect(liveList.insertFragment_.childElementCount).to.equal(0);

      const fromServer2 = createFromServer([
        {id: 'id0'}, {id: 'id1'}, {id: 'id2'},
      ]);
      const fromServer2ItemsCont = fromServer2
          .querySelector('[items]');
      expect(fromServer2ItemsCont.childElementCount).to.equal(3);
      expect(liveList.insertFragment_.childElementCount).to.equal(0);
      liveList.update(fromServer2);
      expect(liveList.insertFragment_.childElementCount).to.equal(2);
    });

    it('should wait for user interaction before inserting', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(1);
      return liveList.updateAction_().then(() => {
        expect(liveList.insertFragment_.childElementCount).to.equal(0);
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
      expect(elem.querySelector('[update]')).to.have.class('-amp-hidden');

      const fromServer1 = createFromServer([{id: 'id0'}]);
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(1);
      expect(liveList.updateSlot_).to.not.have.class('-amp-hidden');

      return liveList.updateAction_(fromServer1).then(() => {
        expect(liveList.updateSlot_).to.have.class('-amp-hidden');
      });
    });

    it('should have correct insertion by using data-sort-time', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('-amp-hidden');

      const oldDate = Date.now();

      const fromServer1 = createFromServer([
        {id: 'unique-id-num-3', sortTime: oldDate + 1},
        {id: 'unique-id-num-4', sortTime: oldDate + 2},
        {id: 'unique-id-num-5', sortTime: oldDate},
      ]);

      liveList.update(fromServer1);

      expect(liveList.insertFragment_.children[0].getAttribute('id'))
          .to.equal('unique-id-num-4');
      expect(liveList.insertFragment_.children[1].getAttribute('id'))
          .to.equal('unique-id-num-3');
      expect(liveList.insertFragment_.children[2].getAttribute('id'))
          .to.equal('unique-id-num-5');
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

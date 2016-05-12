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
import {AmpLiveList} from '../amp-live-list';
import {LiveListManager} from '../live-list-manager';
import {adopt} from '../../../../src/runtime';
import {toggleExperiment} from '../../../../src/experiments';

adopt(window);

describe('amp-live-list', () => {
  let sandbox;
  let liveList;
  let elem;
  let dftAttrs;

  beforeEach(() => {
    toggleExperiment(window, 'amp-live-list', true);
    sandbox = sinon.sandbox.create();
    elem = document.createElement('amp-live-list');
    const updateSlot = document.createElement('button');
    const itemsSlot = document.createElement('div');
    updateSlot.setAttribute('update', '');
    itemsSlot.setAttribute('items', '');
    elem.appendChild(updateSlot);
    elem.appendChild(itemsSlot);
    dftAttrs = {
      'id': 'my-list',
      'data-poll-interval': 2000,
      'data-max-items-per-page': 5,
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

  function createFromServer(numOfChild = 1, opt_withId) {
    const parent = document.createElement('div');
    const itemsCont = document.createElement('div');
    itemsCont.setAttribute('items', '');
    parent.appendChild(itemsCont);
    for (let i = 0; i < numOfChild; i++) {
      const child = document.createElement('div');
      if (opt_withId) {
        child.setAttribute('id', `id${i}`);
        child.setAttribute('data-sort-time', Date.now());
      }
      itemsCont.appendChild(child);
    }
    return parent;
  }

  it('validates that elem has an id on creation', () => {
    buildElement(elem, {});
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have an id/);

    expect(() => {
      liveList.element.setAttribute('id', 'my-list');
      liveList.buildCallback();
    }).to.not.throw(/must have an id/);
  });

  it('validates its children to have ids', () => {
    const child = document.createElement('div');
    elem.querySelector('[items]').appendChild(child);
    buildElement(elem, dftAttrs);
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/children must have an id/);

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
    }).to.throw(/must have an `update` slot/);
  });

  it('should enforce items slot', () => {
    buildElement(elem, dftAttrs);
    elem.removeChild(elem.querySelector('[items]'));
    expect(() => {
      liveList.buildCallback();
    }).to.throw(/must have an `items` slot/);
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

      expect(() => {
        liveList.update(update);
      }).to.throw(/children must have an id/);

      const update2 = document.createElement('div');
      const update2LiveListItems = document
          .createElement('div');
      update2LiveListItems.setAttribute('items', '');
      update2.appendChild(update2LiveListItems);
      const update2Child = document.createElement('div');
      update2Child.setAttribute('id', 'i-have-an-id');
      update2LiveListItems.appendChild(update2Child);

      expect(() => {
        liveList.update(update2);
      }).to.not.throw();
    });

    it('asserts that an items slot was provided on update', () => {
      const update = document.createElement('div');
      const updateLiveListItems = document.createElement('div');
      updateLiveListItems.setAttribute('items', '');
      update.appendChild(updateLiveListItems);
      updateLiveListItems.appendChild(document.createElement('div'));

      expect(() => {
        liveList.update(update);
      }).to.throw(/children must have an id/);

      const update2 = document.createElement('div');
      const update2LiveListItems = document
          .createElement('div');
      update2.appendChild(update2LiveListItems);
      const update2Child = document.createElement('div');
      update2Child.setAttribute('id', 'i-have-an-id');
      update2LiveListItems.appendChild(update2Child);

      expect(() => {
        liveList.update(update2);
      }).to.throw(/amp-live-list must have an `items` slot/);
    });

    it('discovers children to insert when they have newly discovered ' +
       'ids', () => {
      buildElement(elem, dftAttrs);

      const child = document.createElement('div');
      child.setAttribute('id', 'id0');
      elem.querySelector('[items]').appendChild(child);

      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(1);

      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(0);

      const fromServer2 = createFromServer(3, true);
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
      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
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
      const fromServer1ItemsCont = fromServer1
          .querySelector('amp-live-list-items');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(0);
      expect(liveList.itemsSlot_.childElementCount).to.equal(1);
    });

    it('should add amp-live-list-item-new class for newly inserted ' +
       'items', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();

      expect(liveList.itemsSlot_.childElementCount).to.equal(0);

      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
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

      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(liveList.itemsSlot_.lastElementChild)
            .to.have.class('amp-live-list-item-new');
        expect(liveList.itemsSlot_.childElementCount).to.equal(1);

        const fromServer2 = createFromServer();
        const fromServer2ItemsCont = fromServer2
            .querySelector('[items]');
        fromServer2ItemsCont.firstElementChild.setAttribute('id', 'id1');
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

      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
      liveList.update(fromServer1);
      return liveList.updateAction_().then(() => {
        expect(liveList.itemsSlot_.lastElementChild)
            .to.have.class('amp-live-list-item');

        const fromServer2 = createFromServer();
        const fromServer2ItemsCont = fromServer2
            .querySelector('[items]');
        fromServer2ItemsCont.firstElementChild.setAttribute('id', 'id1');
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

      const fromServer1 = createFromServer();
      const fromServer1ItemsCont = fromServer1
          .querySelector('[items]');
      fromServer1ItemsCont.firstElementChild.setAttribute('id', 'id0');
      liveList.update(fromServer1);
      expect(liveList.insertFragment_.childElementCount).to.equal(1);
      expect(liveList.updateSlot_).to.not.have.class('-amp-hidden');

      return liveList.updateAction_(fromServer1).then(() => {
        expect(liveList.updateSlot_).to.have.class('-amp-hidden');
      });
    });

    it('should validate that updates have data-sort-time', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('-amp-hidden');

      const fromServer1 = document.createElement('amp-live-list');
      const fromServer1Items = document.createElement('div');
      fromServer1Items.setAttribute('items', '');
      fromServer1.appendChild(fromServer1Items);
      const fromServer1ItemsChild1 = document.createElement('div');
      fromServer1ItemsChild1.setAttribute('id', 'unique-id-num-3');
      const fromServer1ItemsChild2 = document.createElement('div');
      fromServer1ItemsChild2.setAttribute('id', 'unique-id-num-4');
      fromServer1Items.appendChild(fromServer1ItemsChild1);
      fromServer1Items.appendChild(fromServer1ItemsChild2);

      expect(() => {
        liveList.update(fromServer1);
      }).to.throw(/`data-sort-time` attribute must exist/);
    });

    it('should validate that data-sort-time values are Numbers', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('-amp-hidden');

      const fromServer1 = document.createElement('amp-live-list');
      const fromServer1Items = document.createElement('div');
      fromServer1Items.setAttribute('items', '');
      fromServer1.appendChild(fromServer1Items);
      const fromServer1ItemsChild1 = document.createElement('div');
      fromServer1ItemsChild1.setAttribute('id', 'unique-id-num-3');
      fromServer1ItemsChild1.setAttribute('data-sort-time', 'hello');
      const fromServer1ItemsChild2 = document.createElement('div');
      fromServer1ItemsChild2.setAttribute('id', 'unique-id-num-4');
      fromServer1ItemsChild2.setAttribute('data-sort-time', 'world');
      fromServer1Items.appendChild(fromServer1ItemsChild1);
      fromServer1Items.appendChild(fromServer1ItemsChild2);

      expect(() => {
        liveList.update(fromServer1);
      }).to.throw(/value must be a number/);
    });

    it('should have correct insertion by using data-sort-time', () => {
      buildElement(elem, dftAttrs);
      liveList.buildCallback();
      expect(liveList.itemsSlot_.childElementCount).to.equal(0);
      expect(elem.querySelector('[update]')).to.have.class('-amp-hidden');

      const oldDate = Date.now();

      const fromServer1 = document.createElement('amp-live-list');
      const fromServer1Items = document.createElement('div');
      fromServer1Items.setAttribute('items', '');
      fromServer1.appendChild(fromServer1Items);
      const fromServer1ItemsChild1 = document.createElement('div');
      fromServer1ItemsChild1.setAttribute('id', 'unique-id-num-3');
      fromServer1ItemsChild1.setAttribute('data-sort-time', oldDate + 1);
      const fromServer1ItemsChild2 = document.createElement('div');
      fromServer1ItemsChild2.setAttribute('id', 'unique-id-num-4');
      fromServer1ItemsChild2.setAttribute('data-sort-time', oldDate + 2);
      const fromServer1ItemsChild3 = document.createElement('div');
      fromServer1ItemsChild3.setAttribute('id', 'unique-id-num-5');
      fromServer1ItemsChild3.setAttribute('data-sort-time', oldDate);
      fromServer1Items.appendChild(fromServer1ItemsChild1);
      fromServer1Items.appendChild(fromServer1ItemsChild2);
      fromServer1Items.appendChild(fromServer1ItemsChild3);

      liveList.update(fromServer1);

      expect(liveList.insertFragment_.children[0].getAttribute('id'))
          .to.equal('unique-id-num-4');
      expect(liveList.insertFragment_.children[1].getAttribute('id'))
          .to.equal('unique-id-num-3');
      expect(liveList.insertFragment_.children[2].getAttribute('id'))
          .to.equal('unique-id-num-5');
    });
  });
});

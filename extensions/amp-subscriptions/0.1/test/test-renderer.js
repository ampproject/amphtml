/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {CSS} from '../../../../build/amp-subscriptions-0.1.css';
import {Renderer} from '../renderer';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';
import {installStylesForDoc} from '../../../../src/style-installer';


function isDisplayed(el) {
  const win = el.ownerDocument.defaultView;
  const styles = win.getComputedStyle(el);
  return styles.display != 'none';
}


describes.realWin('amp-subscriptions renderer before initialized', {
  amp: {},
}, env => {
  let win, doc;
  let unrelated;
  let section, action, dialog;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    unrelated = createElementWithAttributes(doc, 'div', {});
    section = createElementWithAttributes(doc, 'div', {
      'subscriptions-section': '',
    });
    action = createElementWithAttributes(doc, 'div', {
      'subscriptions-action': '',
    });
    dialog = createElementWithAttributes(doc, 'div', {
      'subscriptions-dialog': '',
    });
    doc.body.appendChild(unrelated);
    doc.body.appendChild(section);
    doc.body.appendChild(action);
    doc.body.appendChild(dialog);
  });

  it('should initial elements correctly before the extension is loaded', () => {
    expect(isDisplayed(unrelated)).to.be.true;
    expect(isDisplayed(section)).to.be.false;
    expect(isDisplayed(action)).to.be.false;
    expect(isDisplayed(dialog)).to.be.false;
  });
});


describes.realWin('amp-subscriptions renderer', {
  amp: {},
}, env => {
  let win, doc;
  let ampdoc;
  let renderer;
  let unrelated;
  let loading1, loading2;
  let content1, content2;
  let contentNotGranted1, contentNotGranted2;
  let actions1, actions2;
  let actionLogin, actionLogout, actionSubscribe;
  let dialog1, dialog2;
  let elements;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;

    installStylesForDoc(ampdoc, CSS, () => {}, false, 'amp-subscriptions');

    const vsync = Services.vsyncFor(win);
    sandbox.stub(vsync, 'mutate').callsFake(mutator => {
      mutator();
    });

    unrelated = createElementWithAttributes(doc, 'div', {});

    loading1 = createElementWithAttributes(doc, 'div', {
      id: 'loading1',
      'subscriptions-section': 'loading',
    });
    loading2 = createElementWithAttributes(doc, 'div', {
      id: 'loading2',
      'subscriptions-section': 'loading',
    });

    content1 = createElementWithAttributes(doc, 'div', {
      id: 'content1',
      'subscriptions-section': 'content',
    });
    content2 = createElementWithAttributes(doc, 'div', {
      id: 'content2',
      'subscriptions-section': 'content',
    });

    contentNotGranted1 = createElementWithAttributes(doc, 'div', {
      id: 'contentNotGranted1',
      'subscriptions-section': 'content-not-granted',
    });
    contentNotGranted2 = createElementWithAttributes(doc, 'div', {
      id: 'contentNotGranted2',
      'subscriptions-section': 'content-not-granted',
    });

    dialog1 = createElementWithAttributes(doc, 'div', {
      id: 'dialog1',
      'subscriptions-dialog': 'dialog1',
    });
    dialog2 = createElementWithAttributes(doc, 'div', {
      id: 'dialog2',
      'subscriptions-dialog': 'dialog2',
    });

    actions1 = createElementWithAttributes(doc, 'div', {
      id: 'actions1',
      'subscriptions-section': 'actions',
    });
    actions2 = createElementWithAttributes(doc, 'div', {
      id: 'actions2',
      'subscriptions-section': 'actions',
    });

    actionLogin = createElementWithAttributes(doc, 'div', {
      id: 'actionLogin',
      'subscriptions-action': 'login',
    });
    actionLogout = createElementWithAttributes(doc, 'div', {
      id: 'actionLogout',
      'subscriptions-action': 'logout',
    });
    actionSubscribe = createElementWithAttributes(doc, 'div', {
      id: 'actionSubscribe',
      'subscriptions-action': 'subscribe',
    });

    doc.body.appendChild(unrelated);

    elements = [
      loading1, loading2,
      content1, content2,
      contentNotGranted1, contentNotGranted2,
      actions1, actions2,
      actionLogin, actionLogout, actionSubscribe,
      dialog1, dialog2,
    ];
    elements.forEach(element => {
      doc.body.appendChild(element);
    });
    renderer = new Renderer(ampdoc);
  });

  function displayed(array) {
    expect(isDisplayed(unrelated)).to.be.true;
    elements.forEach(element => {
      const shouldBeDisplayed = array.includes(element);
      expect(isDisplayed(element)).to.equal(
          shouldBeDisplayed,
          'Expected ' + element.id + ' to be ' +
          (shouldBeDisplayed ? 'displayed' : 'not displayed'));
    });
  }

  it('should hide elements in the unknown state', () => {
    displayed([]);
  });

  it('should show loading', () => {
    renderer.toggleLoading(true);
    displayed([loading1, loading2]);
  });

  it('should show appropriate elements when granted', () => {
    renderer.setGrantState(true);
    displayed([content1, content2]);
  });

  it('should show appropriate elements when denied', () => {
    renderer.setGrantState(false);
    displayed([contentNotGranted1, contentNotGranted2]);
  });
});

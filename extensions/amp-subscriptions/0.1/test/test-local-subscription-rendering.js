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
import {Dialog} from '../dialog';
import {Entitlement} from '../entitlement';
import {LocalSubscriptionPlatformRenderer} from '../local-subscription-platform-renderer';
import {ServiceAdapter} from '../service-adapter';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin('local-subscriptions-rendering', {amp: true}, env => {
  let win, doc, ampdoc;
  let renderer;
  let dialog, serviceAdapter;
  let entitlementsForService1;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    dialog = new Dialog(ampdoc);
    serviceAdapter = new ServiceAdapter(null);
    renderer = new LocalSubscriptionPlatformRenderer(
      ampdoc,
      dialog,
      serviceAdapter
    );
    const serviceIds = ['service1', 'service2'];
    entitlementsForService1 = new Entitlement({
      service: serviceIds[0],
      granted: false,
      grantReason: null,
    });
  });

  describe('render method', () => {
    it(
      'should call renderActions_ and renderDialog with ' +
        'the entitlements provided',
      () => {
        const actionRenderStub = sandbox.stub(renderer, 'renderActions_');
        const dialogRenderStub = sandbox.stub(renderer, 'renderDialog_');
        renderer.render(entitlementsForService1);
        expect(actionRenderStub).to.be.calledWith(entitlementsForService1);
        expect(dialogRenderStub).to.be.calledWith(entitlementsForService1);
      }
    );
  });

  describe('action rendering', () => {
    let actions1, actions2;
    let elements;
    let delegateUIStub;
    beforeEach(() => {
      actions1 = createElementWithAttributes(doc, 'div', {
        id: 'actions1',
        'subscriptions-action': 'login',
        'subscriptions-display': 'loggedIn',
      });
      actions2 = createElementWithAttributes(doc, 'div', {
        id: 'actions2',
        'subscriptions-section': 'actions',
        'subscriptions-display': 'subscribed',
        'subscriptions-action': 'login',
        'subscriptions-service': 'service',
        'subscriptions-decorate': '',
      });
      elements = [actions1, actions2];
      elements.forEach(element => {
        doc.body.appendChild(element);
      });
    });

    beforeEach(() => {
      delegateUIStub = sandbox.stub(serviceAdapter, 'decorateServiceAction');
    });

    function isDisplayed(el) {
      return el.classList.contains('i-amphtml-subs-display');
    }

    function displayed(array) {
      elements.forEach(element => {
        const shouldBeDisplayed = array.includes(element);
        expect(isDisplayed(element)).to.equal(
          shouldBeDisplayed,
          'Expected ' +
            element.id +
            ' to be ' +
            (shouldBeDisplayed ? 'displayed' : 'not displayed')
        );
      });
    }

    it('should display actions and action-sections', () => {
      return renderer.render({loggedIn: true}).then(() => {
        displayed([actions1]);
      });
    });

    it('should display actions and action-sections', () => {
      return renderer.render({subscribed: true}).then(() => {
        displayed([actions2]);
        expect(delegateUIStub).to.be.called;
      });
    });

    it('should hide sections on reset', () => {
      return renderer
        .render({subscribed: true})
        .then(() => {
          displayed([actions2]);
          return renderer.reset();
        })
        .then(() => {
          displayed([]);
        });
    });
  });

  describe('dialog renderer', () => {
    let templatesMock;
    let dialogMock;
    let dialog0, dialog1, dialog2, dialog3;

    beforeEach(() => {
      templatesMock = sandbox.mock(Services.templatesFor(win));
      dialogMock = sandbox.mock(renderer.dialog_);
      dialog0 = createElementWithAttributes(doc, 'div', {
        'id': 'dialog0',
        'subscriptions-dialog': '',
        'subscriptions-display': '',
      });
      dialog1 = createElementWithAttributes(doc, 'div', {
        'id': 'dialog1',
        'subscriptions-dialog': '',
        'subscriptions-display': 'value = "A"',
      });
      dialog1.textContent = 'dialog1';
      dialog2 = createElementWithAttributes(doc, 'template', {
        'id': 'dialog2',
        'subscriptions-dialog': '',
        'subscriptions-display': 'value = "B"',
      });
      dialog3 = createElementWithAttributes(doc, 'div', {
        'id': 'dialog3',
        'subscriptions-dialog': '',
        'subscriptions-display': 'value = "B"',
      });
      doc.body.appendChild(dialog0);
      doc.body.appendChild(dialog1);
      doc.body.appendChild(dialog2);
      doc.body.appendChild(dialog3);
    });

    afterEach(() => {
      templatesMock.verify();
      dialogMock.verify();
    });

    it('should render an element', () => {
      templatesMock.expects('renderTemplate').never();
      let content;
      dialogMock
        .expects('open')
        .withExactArgs(
          sinon.match(arg => {
            content = arg;
            return true;
          }),
          true
        )
        .once();
      return renderer.renderDialog_({value: 'A'}).then(() => {
        expect(content.id).to.equal('dialog1');
        expect(content.textContent).to.equal('dialog1');
        expect(content).to.not.equal(dialog1);
        expect(content).to.not.have.attribute('subscriptions-dialog');
        expect(content).to.not.have.attribute('subscriptions-display');
      });
    });

    it('should render a template', () => {
      const rendered = createElementWithAttributes(doc, 'div', {});
      const data = {value: 'B'};
      templatesMock
        .expects('renderTemplate')
        .withExactArgs(dialog2, data)
        .returns(Promise.resolve(rendered))
        .once();
      let content;
      dialogMock
        .expects('open')
        .withExactArgs(
          sinon.match(arg => {
            content = arg;
            return true;
          }),
          true
        )
        .once();
      return renderer.renderDialog_(data).then(() => {
        expect(content).to.equal(rendered);
      });
    });

    it('should ignore rendering if nothing found', () => {
      templatesMock.expects('renderTemplate').never();
      dialogMock.expects('open').never();
      return renderer.render({value: 'C'});
    });

    it('should hide the dialog on reset', () => {
      dialogMock.expects('close').once();
      return renderer.reset();
    });
  });
});

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

import * as LocalRenderer from '../local-subscription-platform-renderer';
import * as sinon from 'sinon';
import {Dialog} from '../dialog';
import {DialogRenderer} from '../dialog-renderer';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';

describes.realWin('amp-subscriptions DialogRenderer', {
  amp: {},
}, env => {
  let win, doc, ampdoc;
  let templatesMock;
  let dialogMock;
  let renderer;
  let dialog0, dialog1, dialog2, dialog3;
  let actionRendererStub;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    templatesMock = sandbox.mock(Services.templatesFor(win));
    actionRendererStub = sandbox.stub(LocalRenderer, 'renderActions').callsFake(
        (ampdoc, rootNode, element) => Promise.resolve(element));
    const dialog = new Dialog(ampdoc);
    dialogMock = sandbox.mock(dialog);
    renderer = new DialogRenderer(ampdoc, dialog);
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
    actionRendererStub.restore();
  });

  it('should render an element', () => {
    templatesMock.expects('renderTemplate').never();
    let content;
    dialogMock.expects('open')
        .withExactArgs(sinon.match(arg => {
          content = arg;
          return true;
        }), true)
        .once();
    return renderer.render({value: 'A'}).then(() => {
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
    templatesMock.expects('renderTemplate')
        .withExactArgs(dialog2, data)
        .returns(Promise.resolve(rendered))
        .once();
    let content;
    dialogMock.expects('open')
        .withExactArgs(sinon.match(arg => {
          content = arg;
          return true;
        }), true)
        .once();
    return renderer.render(data).then(() => {
      expect(content).to.equal(rendered);
      expect(actionRendererStub).to.be.calledOnce;
    });
  });

  it('should ignore rendering if nothign found', () => {
    templatesMock.expects('renderTemplate').never();
    dialogMock.expects('open').never();
    return renderer.render({value: 'C'});
  });
});

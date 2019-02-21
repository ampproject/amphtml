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
import {Dialog} from '../dialog';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';
import {installStylesForDoc} from '../../../../src/style-installer';


describes.realWin('AmpSubscriptions Dialog', {amp: true}, env => {
  let win, doc, ampdoc;
  let dialog;
  let content;
  let vsync, viewport;
  let addToFixedLayerSpy, updatePaddingSpy;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    doc.body.parentNode.setAttribute('amp-version', '1');
    ampdoc = env.ampdoc;
    installStylesForDoc(ampdoc, CSS, () => {}, false, 'amp-subscriptions');
    vsync = Services.vsyncFor(ampdoc.win);
    viewport = Services.viewportForDoc(ampdoc);
    addToFixedLayerSpy = sandbox.stub(viewport, 'addToFixedLayer');
    updatePaddingSpy = sandbox.stub(viewport, 'updatePaddingBottom');
    dialog = new Dialog(ampdoc);
    content = createElementWithAttributes(doc, 'div', {
      style: 'height:17px',
    });
  });

  it('should construct correctly', () => {
    expect(dialog.getRoot().tagName.toLowerCase())
        .to.equal('amp-subscriptions-dialog');
    expect(dialog.getRoot().getAttribute('role'))
        .to.equal('dialog');
    expect(dialog.getRoot().parentNode).to.equal(doc.body);
    expect(dialog.closeButton_).to.have.display('none');

    expect(dialog.getRoot()).to.have.display('none');
    const styles = getComputedStyle(dialog.getRoot());
    expect(styles.position).to.equal('fixed');
  });

  it('should open content when invisible', () => {
    const promise = dialog.open(content, false);
    expect(dialog.getRoot()).to.have.display('none');
    return vsync.mutatePromise(() => {}).then(() => {
      // First vsync displays the dialog.
      expect(content.parentNode).to.equal(dialog.getRoot());
      expect(dialog.isVisible()).to.be.true;
      expect(dialog.getRoot()).to.have.display('block');
      const styles = getComputedStyle(dialog.getRoot());
      expect(styles.transform).to.contain('17');
      return promise;
    }).then(() => vsync.mutatePromise(() => {})).then(() => {
      expect(dialog.getRoot()).to.have.display('block');
      const styles = getComputedStyle(dialog.getRoot());
      expect(styles.transform).to.not.contain('17');
      expect(dialog.closeButton_).to.have.display('none');
      expect(updatePaddingSpy).to.be.calledOnce.calledWith(17);
      // TODO(dvoytenko, #20608): add to fixed layer, once the SwG/FL
      // conflict is resolved.
      // expect(addToFixedLayerSpy).to.be.calledOnce
      //     .calledWith(dialog.getRoot());
      expect(addToFixedLayerSpy).to.not.be.called;
      expect(dialog.isVisible()).to.be.true;
    });
  });

  it('should re-open content when visible', () => {
    const content2 = createElementWithAttributes(doc, 'div', {
      style: 'height:21px',
    });
    const promise = dialog.open(content2, false);
    return vsync.mutatePromise(() => {}).then(() => {
      expect(content2.parentNode).to.equal(dialog.getRoot());
      return promise;
    }).then(() => {
      expect(content2.parentNode).to.equal(dialog.getRoot());
      expect(content.parentNode).to.be.null;
      expect(dialog.getRoot()).to.have.display('block');
      const styles = getComputedStyle(dialog.getRoot());
      expect(styles.transform).to.not.contain('21');
    });
  });

  it('should close', () => {
    return dialog.open(content, false).then(() => {
      expect(content.parentNode).to.equal(dialog.getRoot());
      expect(dialog.getRoot()).to.have.display('block');
      return dialog.close();
    }).then(() => {
      expect(dialog.getRoot()).to.have.display('none');
      expect(dialog.isVisible()).to.be.false;
      expect(content.parentNode).to.equal(dialog.getRoot());
      expect(dialog.getRoot().parentNode).to.equal(doc.body);
    });
  });

  it('should re-open after close', () => {
    return dialog.open(content, false).then(() => {
      expect(dialog.isVisible()).to.be.true;
      return dialog.close();
    }).then(() => {
      expect(dialog.isVisible()).to.be.false;
      return dialog.open(content, false);
    }).then(() => {
      expect(dialog.isVisible()).to.be.true;
    });
  });

  it('should show close button', () => {
    doc.body.classList.add('i-amphtml-subs-grant-yes');
    return dialog.open(content, true).then(() => {
      expect(dialog.closeButton_).to.have.display('block');
    });
  });

  it('should not show close button if content is not granted', () => {
    doc.body.classList.remove('i-amphtml-subs-grant-yes');
    return dialog.open(content, true).then(() => {
      expect(dialog.closeButton_).to.have.display('none');
    });
  });
});

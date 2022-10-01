import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {CSS} from '../../../../build/amp-subscriptions-0.1.css';
import {installStylesForDoc} from '../../../../src/style-installer';
import {Dialog} from '../dialog';

describes.realWin('AmpSubscriptions Dialog', {amp: true}, (env) => {
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
    addToFixedLayerSpy = env.sandbox.stub(viewport, 'addToFixedLayer');
    updatePaddingSpy = env.sandbox.stub(viewport, 'updatePaddingBottom');
    dialog = new Dialog(ampdoc);
    content = createElementWithAttributes(doc, 'div', {
      style: 'height:17px',
    });
  });

  it('should construct correctly', () => {
    expect(dialog.getRoot().tagName.toLowerCase()).to.equal(
      'amp-subscriptions-dialog'
    );
    expect(dialog.getRoot().getAttribute('role')).to.equal('dialog');
    expect(dialog.getRoot().parentNode).to.equal(doc.body);
    expect(dialog.closeButton_).to.have.display('none');

    expect(dialog.getRoot()).to.have.display('none');
    const styles = getComputedStyle(dialog.getRoot());
    expect(styles.position).to.equal('fixed');
  });

  it('should open content when invisible', async () => {
    let styles;

    const promise = dialog.open(content, false);
    expect(dialog.getRoot()).to.have.display('none');

    await vsync.mutatePromise(() => {});
    // First vsync displays the dialog.
    expect(content.parentNode).to.equal(dialog.getRoot());
    expect(dialog.isVisible()).to.be.true;
    expect(dialog.getRoot()).to.have.display('block');
    styles = getComputedStyle(dialog.getRoot());
    expect(styles.transform).to.contain('17');

    await promise;
    await vsync.mutatePromise(() => {});
    expect(dialog.getRoot()).to.have.display('block');
    styles = getComputedStyle(dialog.getRoot());
    expect(styles.transform).to.not.contain('17');
    expect(dialog.closeButton_).to.have.display('none');
    expect(updatePaddingSpy).to.be.calledOnce.calledWith(17);
    expect(addToFixedLayerSpy).to.be.calledOnce.calledWith(dialog.getRoot());
    expect(dialog.isVisible()).to.be.true;
  });

  it('should re-open content when visible', async () => {
    const content2 = createElementWithAttributes(doc, 'div', {
      style: 'height:21px',
    });
    const promise = dialog.open(content2, false);
    await vsync.mutatePromise(() => {});
    expect(content2.parentNode).to.equal(dialog.getRoot());

    await promise;
    expect(content2.parentNode).to.equal(dialog.getRoot());
    expect(content.parentNode).to.be.null;
    expect(dialog.getRoot()).to.have.display('block');
    const styles = getComputedStyle(dialog.getRoot());
    expect(styles.transform).to.not.contain('21');
  });

  it('should close', async () => {
    await dialog.open(content, false);
    expect(content.parentNode).to.equal(dialog.getRoot());
    expect(dialog.getRoot()).to.have.display('block');

    await dialog.close();
    expect(dialog.getRoot()).to.have.display('none');
    expect(dialog.isVisible()).to.be.false;
    expect(content.parentNode).to.equal(dialog.getRoot());
    expect(dialog.getRoot().parentNode).to.equal(doc.body);
  });

  it('should re-open after close', async () => {
    await dialog.open(content, false);
    expect(dialog.isVisible()).to.be.true;

    await dialog.close();
    expect(dialog.isVisible()).to.be.false;

    await dialog.open(content, false);
    expect(dialog.isVisible()).to.be.true;
  });

  it('should show close button', async () => {
    doc.body.classList.add('i-amphtml-subs-grant-yes');
    await dialog.open(content, true);
    expect(dialog.closeButton_).to.have.display('block');
  });

  it('should not show close button if content is not granted', async () => {
    doc.body.classList.remove('i-amphtml-subs-grant-yes');
    await dialog.open(content, true);
    expect(dialog.closeButton_).to.have.display('none');
  });
});

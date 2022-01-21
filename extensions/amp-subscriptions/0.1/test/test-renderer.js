import {createElementWithAttributes} from '#core/dom';

import {Services} from '#service';

import {CSS} from '../../../../build/amp-subscriptions-0.1.css';
import {installStylesForDoc} from '../../../../src/style-installer';
import {Action} from '../analytics';
import {Renderer} from '../renderer';

function isDisplayed(el) {
  const win = el.ownerDocument.defaultView;
  const styles = win.getComputedStyle(el);
  return styles.display != 'none';
}

describes.realWin(
  'amp-subscriptions renderer before initialized',
  {
    amp: {},
  },
  (env) => {
    let win, doc;
    let unrelated;
    let section, action, dialog;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      doc.body.parentNode.setAttribute('amp-version', '1');
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
  }
);

describes.realWin(
  'amp-subscriptions renderer',
  {
    amp: {},
  },
  (env) => {
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
      doc.body.parentNode.setAttribute('amp-version', '1');

      installStylesForDoc(ampdoc, CSS, () => {}, false, 'amp-subscriptions');

      const mutator = Services.mutatorForDoc(ampdoc);
      env.sandbox
        .stub(mutator, 'mutateElement')
        .callsFake((element, mutator) => {
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
        'subscriptions-action': Action.LOGIN,
      });
      actionLogout = createElementWithAttributes(doc, 'div', {
        id: 'actionLogout',
        'subscriptions-action': Action.LOGOUT,
      });
      actionSubscribe = createElementWithAttributes(doc, 'div', {
        id: 'actionSubscribe',
        'subscriptions-action': Action.SUBSCRIBE,
      });

      doc.body.appendChild(unrelated);

      elements = [
        loading1,
        loading2,
        content1,
        content2,
        contentNotGranted1,
        contentNotGranted2,
        actions1,
        actions2,
        actionLogin,
        actionLogout,
        actionSubscribe,
        dialog1,
        dialog2,
      ];
      elements.forEach((element) => {
        doc.body.appendChild(element);
      });
      renderer = new Renderer(ampdoc);
    });

    function displayed(array) {
      expect(isDisplayed(unrelated)).to.be.true;
      elements.forEach((element) => {
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

    describe('addLoadingBar', () => {
      let insertBeforeStub;

      beforeEach(() => {
        insertBeforeStub = env.sandbox.stub(
          renderer.ampdoc_.getBody(),
          'insertBefore'
        );
      });

      it("shouldn't add a progress bar if loading section is found", async () => {
        await renderer.addLoadingBar();
        expect(insertBeforeStub).to.not.be.called;
      });

      it('should add a progress bar if no loading section is found', async () => {
        loading1.remove();
        loading2.remove();

        await renderer.addLoadingBar();
        expect(insertBeforeStub).to.be.called;
        const element = insertBeforeStub.getCall(0).args[0];
        expect(element.tagName).to.be.equal('DIV');
        expect(element.className).to.be.equal('i-amphtml-subs-progress');
        expect(insertBeforeStub.getCall(0).args[1]).to.be.null;
      });

      it('should add a progress bar before footer', async () => {
        loading1.remove();
        loading2.remove();
        const fakeFooter = createElementWithAttributes(doc, 'footer', {});
        const fakeFooterContainer = createElementWithAttributes(doc, 'div', {});
        fakeFooterContainer.appendChild(fakeFooter);
        renderer.ampdoc_.getBody().appendChild(fakeFooterContainer);
        const footer = createElementWithAttributes(doc, 'footer', {});
        renderer.ampdoc_.getBody().appendChild(footer);

        await renderer.addLoadingBar();
        expect(insertBeforeStub).to.be.called;
        const element = insertBeforeStub.getCall(0).args[0];
        expect(element.tagName).to.be.equal('DIV');
        expect(element.className).to.be.equal('i-amphtml-subs-progress');
        expect(insertBeforeStub.getCall(0).args[1]).to.equal(footer);
      });
    });
  }
);

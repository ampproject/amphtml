import '../amp-selector';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {htmlFor} from '#core/dom/static-template';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

import {waitFor} from '#testing/helpers/service';

describes.realWin(
  'amp-selector:1.0',
  {
    amp: {
      extensions: ['amp-selector:1.0'],
    },
  },
  (env) => {
    let win;
    let html;
    let element;

    async function waitForSelected(el, selected) {
      const isSelectedOrNot = () => el.hasAttribute('selected') === selected;
      await waitFor(isSelectedOrNot, 'element selected updated');
    }

    beforeEach(async () => {
      win = env.win;
      html = htmlFor(win.document);
      toggleExperiment(win, 'bento-selector', true, true);
      element = html`
        <amp-selector multiple layout="container">
          <ul>
            <li option="1">Option 1</li>
            <li option="2" selected>Option 2</li>
            <li option="3" disabled>Option 3</li>
          </ul>
        </amp-selector>
      `;
      win.document.body.appendChild(element);
      await element.buildInternal();
    });

    it('should render with options', () => {
      expect(element.getAttribute('aria-multiselectable')).to.equal('true');
      expect(element.getAttribute('aria-disabled')).to.equal('false');
      expect(element.getAttribute('role')).to.equal('listbox');

      const options = element.querySelectorAll('[option]');
      expect(options).to.have.length(3);
      expect(options[0]).not.to.have.attribute('selected');
      expect(options[0].getAttribute('aria-disabled')).to.equal('false');
      expect(options[0].getAttribute('role')).to.equal('option');
      expect(options[1]).to.have.attribute('selected');
      expect(options[1].getAttribute('aria-disabled')).to.equal('false');
      expect(options[1].getAttribute('role')).to.equal('option');
      expect(options[2]).not.to.have.attribute('selected');
      expect(options[2]).to.have.attribute('disabled');
      expect(options[2].getAttribute('aria-disabled')).to.equal('true');
      expect(options[2].getAttribute('role')).to.equal('option');
    });

    it('should select option on click', async () => {
      const options = element.querySelectorAll('[option]');
      const firstOption = options[0];
      const secondOption = options[1];
      expect(secondOption).to.have.attribute('selected');

      firstOption.click();
      await waitForSelected(firstOption, true);

      expect(firstOption).to.have.attribute('selected');
      expect(secondOption).to.have.attribute('selected');
    });

    it('should mutate multiple value', async () => {
      const options = element.querySelectorAll('[option]');
      const firstOption = options[0];
      firstOption.click();
      await waitForSelected(firstOption, true);

      const getSelectedCount = () =>
        element.querySelectorAll('[selected]').length;
      expect(getSelectedCount()).to.equal(2);

      element.removeAttribute('multiple');
      await waitFor(
        () => getSelectedCount() == 1,
        'only one element stays selected'
      );
    });

    it('should select and deselect on attribute change', async () => {
      const options = element.querySelectorAll('[option]');

      options[0].setAttribute('selected', '');
      await waitForSelected(options[0], true);

      expect(options[0]).to.have.attribute('selected');
      expect(options[1]).to.have.attribute('selected');
      expect(options[2]).to.not.have.attribute('selected');

      options[0].removeAttribute('selected');
      await waitForSelected(options[0], false);

      expect(options[0]).to.not.have.attribute('selected');
      expect(options[1]).to.have.attribute('selected');
      expect(options[2]).to.not.have.attribute('selected');

      options[1].removeAttribute('selected');
      await waitForSelected(options[0], false);

      expect(options[0]).to.not.have.attribute('selected');
      expect(options[1]).to.not.have.attribute('selected');
      expect(options[2]).to.not.have.attribute('selected');
    });

    it('should fire DOM event on select', async () => {
      const options = element.querySelectorAll('[option]');
      const eventSpy = env.sandbox.spy();
      element.addEventListener('select', eventSpy);

      options[0].click();

      expect(eventSpy).to.be.calledOnce;
      expect(eventSpy.firstCall).calledWithMatch({
        'data': {
          'targetOption': '1',
          'selectedOptions': ['2', '1'],
        },
      });
    });

    describe('imperative api', () => {
      let option1;
      let option2;
      let option3;

      beforeEach(() => {
        const options = element.querySelectorAll('[option]');

        option1 = options[0];
        option2 = options[1];
        option3 = options[2];
      });

      function invocation(method, args = {}) {
        const source = null;
        const caller = null;
        const event = null;
        const trust = ActionTrust_Enum.DEFAULT;
        return new ActionInvocation(
          element,
          method,
          args,
          source,
          caller,
          event,
          trust
        );
      }

      describe('multi-select selector', () => {
        it('toggle one option', async () => {
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('toggle', {index: 0, value: true}));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Toggle with force select does nothing
          element.enqueAction(invocation('toggle', {index: 0, value: true}));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Toggle also deselects
          element.enqueAction(invocation('toggle', {index: 1}));
          await waitForSelected(option2, false);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });

        it('select up', async () => {
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option2, false);
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // option 3 cannot be selected because it is disabled,
          // so loop back around to option 2.
          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Make option 3 selectable
          option3.removeAttribute('disabled');
          await waitFor(
            () => option3.getAttribute('aria-disabled') === 'false'
          );
          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');
        });

        it('select down', async () => {
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Option 3 cannot be selected because it is disabled.
          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Make option 3 selectable
          option3.removeAttribute('disabled');
          await waitFor(
            () => option3.getAttribute('aria-disabled') === 'false'
          );
          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');
        });

        it('select down by delta', async () => {
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // The target option is "1" (delta: 1) -> "2" (delta: 2) -> "1" (delta: 3)
          // because option 3 is skipped.
          element.enqueAction(invocation('selectDown', {delta: 3}));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Make option 3 selectable
          option3.removeAttribute('disabled');
          await waitFor(
            () => option3.getAttribute('aria-disabled') === 'false'
          );
          // The target option is "2" (delta: 1) -> "3" (delta: 2)
          // because option 3 is no longer skipped.
          element.enqueAction(invocation('selectDown', {delta: 2}));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');

          element.enqueAction(invocation('selectDown', {delta: 2}));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });

        it('clear all', async () => {
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('toggle', {index: 0, value: true}));
          await waitForSelected(option1, true);
          await waitForSelected(option2, true);

          // Multiple options are selected.
          expect(option1).to.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('clear'));
          await waitForSelected(option1, false);
          await waitForSelected(option2, false);

          // All options cleared.
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });
      });

      describe('single select amp-selector', () => {
        beforeEach(async () => {
          win.document.body.removeChild(element);
          element = html`
            <amp-selector layout="container">
              <ul>
                <li option="1">Option 1</li>
                <li option="2">Option 2</li>
                <li option="3">Option 3</li>
              </ul>
            </amp-selector>
          `;
          win.document.body.appendChild(element);
          await element.buildInternal();

          const options = element.querySelectorAll('[option]');

          option1 = options[0];
          option2 = options[1];
          option3 = options[2];
        });

        it('toggle one option', async () => {
          element.enqueAction(invocation('toggle', {index: 0, value: true}));
          await waitForSelected(option1, true);

          // Toggle one option
          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Toggle with force select does nothing
          element.enqueAction(invocation('toggle', {index: 0, value: true}));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Toggle another option deselects the prior option
          element.enqueAction(invocation('toggle', {index: 1, value: true}));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Toggle also deselects itself
          element.enqueAction(invocation('toggle', {index: 1}));
          await waitForSelected(option2, false);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });

        it('select up', async () => {
          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');

          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectUp'));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });

        it('select down', async () => {
          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectDown'));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');
        });

        it('select down by 2', async () => {
          element.enqueAction(invocation('selectDown', {delta: 2}));
          await waitForSelected(option2, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          // Select down loops back around through options
          element.enqueAction(invocation('selectDown', {delta: 2}));
          await waitForSelected(option1, true);

          expect(option1).to.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('selectDown', {delta: 2}));
          await waitForSelected(option3, true);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.have.attribute('selected');
        });

        it('clear all', async () => {
          element.enqueAction(invocation('toggle', {index: 1, value: true}));
          await waitForSelected(option2, true);

          // All options are selected.
          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');

          element.enqueAction(invocation('clear'));
          await waitForSelected(option2, false);

          expect(option1).to.not.have.attribute('selected');
          expect(option2).to.not.have.attribute('selected');
          expect(option3).to.not.have.attribute('selected');
        });
      });
    });
  }
);

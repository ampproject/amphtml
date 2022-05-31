import {ActionTrust_Enum} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Keys_Enum} from '#core/constants/key-codes';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {AmpSelector} from '../amp-selector';

describes.realWin(
  'amp-selector',
  {
    win: {
      /* window spec */
      location: '...',
      historyOff: false,
    },
    amp: {
      /* amp spec */
      runtimeOn: false,
      extensions: ['amp-selector:0.1'],
    },
  },
  (env) => {
    let win;
    describe('test extension', () => {
      let getElementsSizesStub;

      beforeEach(() => {
        getElementsSizesStub = env.sandbox.stub(
          AmpSelector.prototype,
          'getElementsSizes_'
        );
      });

      function getSelector(options) {
        win = env.win;

        const attributes = options.attributes || {};
        const config = options.config || {};

        const ampSelector = win.document.createElement('amp-selector');
        ampSelector.setAttribute('layout', 'container');
        Object.keys(attributes).forEach((key) => {
          ampSelector.setAttribute(key, attributes[key]);
        });

        const numberOfChildren = config.count || 3;
        let selectedCount = config.selectedCount || 0;
        let disabledCount = config.disabledCount || 0;
        const rectArray = [];
        for (let i = 0; i < numberOfChildren; i++) {
          const child = win.document.createElement('div');
          child.setAttribute('width', '10');
          child.setAttribute('height', '10');
          child.setAttribute('option', i);

          if (numberOfChildren > selectedCount + disabledCount) {
            if (selectedCount > 0) {
              child.setAttribute('selected', '');
              selectedCount--;
            } else if (disabledCount > 0) {
              child.setAttribute('disabled', '');
              disabledCount--;
            }
          } else {
            if (selectedCount > 0) {
              child.setAttribute('selected', '');
              selectedCount--;
            }
            if (disabledCount > 0) {
              child.setAttribute('disabled', '');
              disabledCount--;
            }
          }
          rectArray.push({width: 10, height: 10});
          const childAttributes = options.optionAttributes || {};
          Object.keys(childAttributes).forEach((key) => {
            child.setAttribute(key, childAttributes[key]);
          });

          ampSelector.appendChild(child);
        }
        getElementsSizesStub.resolves(rectArray);
        win.document.body.appendChild(ampSelector);
        return ampSelector;
      }

      async function keyPress(ampSelector, key, opt_target) {
        const impl = await ampSelector.getImpl(false);
        const event = {
          key,
          preventDefault: () => {},
          target: opt_target,
        };
        return impl.keyDownHandler_(event);
      }

      it('should build properly', async () => {
        let ampSelector = getSelector({});
        let impl = await ampSelector.getImpl(false);
        let initSpy = env.sandbox.spy(impl, 'init_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.false;
        expect(initSpy).to.be.calledOnce;

        ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        impl = await ampSelector.getImpl(false);
        initSpy = env.sandbox.spy(impl, 'init_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.be.calledOnce;

        ampSelector = getSelector({
          attributes: {
            disabled: true,
            multiple: true,
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        impl = await ampSelector.getImpl(false);
        initSpy = env.sandbox.spy(impl, 'init_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.be.calledOnce;
      });

      it('should retain existing roles', async () => {
        const ampSelector = getSelector({
          attributes: {
            role: 'tablist',
          },
          optionAttributes: {
            role: 'tab',
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        const impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();
        expect(impl.element.getAttribute('role')).to.equal('tablist');
        const options = impl.getElementsForTesting();
        expect(options[0].getAttribute('role')).to.equal('tab');
      });

      it('should init properly for single select', async () => {
        let ampSelector = getSelector({});
        let impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        let setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        let initSpy = env.sandbox.spy(impl, 'init_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.false;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(0);
        expect(setInputsSpy).to.have.been.calledOnce;

        ampSelector = getSelector({
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        impl = await ampSelector.getImpl(false);
        setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        initSpy = env.sandbox.spy(impl, 'init_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.false;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(1);
        const options = impl.getElementsForTesting();
        expect(options[1].hasAttribute('selected')).to.be.true;
        expect(options[1].getAttribute('aria-selected')).to.be.equal('true');
        expect(setInputsSpy).to.have.been.calledThrice; // once to set, twice to clear
      });

      it('should init properly for multiselect', async () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        const impl = await ampSelector.getImpl(false);
        const initSpy = env.sandbox.spy(impl, 'init_');
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        await ampSelector.buildInternal();
        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(2);
        expect(setInputsSpy).to.have.been.calledOnce;
      });

      it('should init properly for selector with disabled options', async () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 10,
            selectedCount: 2,
            disabledCount: 5,
          },
        });
        const impl = await ampSelector.getImpl(false);
        const initSpy = env.sandbox.spy(impl, 'init_');
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        await ampSelector.buildInternal();

        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getElementsForTesting().length).to.equal(10);
        expect(impl.getSelectedElementsForTesting().length).to.equal(2);
        expect(setInputsSpy).to.have.been.calledOnce;
      });

      it('should setSelection for single select', async () => {
        const ampSelector = getSelector({
          config: {
            count: 5,
            selectedCount: 2,
          },
        });

        const impl = await ampSelector.getImpl(false);
        const initSpy = env.sandbox.spy(impl, 'init_');
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        const clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        expect(impl.isMultiple_).to.be.false;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(1);
        expect(setInputsSpy).to.have.been.calledThrice;
        expect(options[1].hasAttribute('selected')).to.be.true;
        expect(options[1].getAttribute('aria-selected')).to.be.equal('true');

        impl.setSelection_(options[3]);
        expect(impl.getSelectedElementsForTesting().length).to.equal(1);
        expect(clearSelectionSpy).to.have.been.calledWith(options[1]);
        expect(options[3].hasAttribute('selected')).to.be.true;
        expect(options[3].getAttribute('aria-selected')).to.be.equal('true');
      });

      it('should setSelection for multi select', async () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 5,
            selectedCount: 2,
          },
        });

        const impl = await ampSelector.getImpl(false);
        const initSpy = env.sandbox.spy(impl, 'init_');
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(2);
        expect(setInputsSpy).to.have.been.calledOnce;
        expect(options[0].hasAttribute('selected')).to.be.true;
        expect(options[0].getAttribute('aria-selected')).to.be.equal('true');
        expect(options[1].hasAttribute('selected')).to.be.true;
        expect(options[1].getAttribute('aria-selected')).to.be.equal('true');

        impl.setSelection_(options[3]);
        expect(impl.getSelectedElementsForTesting().length).to.equal(3);
        expect(options[3].hasAttribute('selected')).to.be.true;
        expect(options[3].getAttribute('aria-selected')).to.be.equal('true');
      });

      it('should clearSelection', async () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 5,
            selectedCount: 2,
          },
        });

        const impl = await ampSelector.getImpl(false);
        const initSpy = env.sandbox.spy(impl, 'init_');
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        expect(impl.isMultiple_).to.be.true;
        expect(initSpy).to.have.been.calledOnce;
        expect(impl.getSelectedElementsForTesting().length).to.equal(2);
        expect(setInputsSpy).to.have.been.calledOnce;
        expect(options[0].hasAttribute('selected')).to.be.true;
        expect(options[0].getAttribute('aria-selected')).to.be.equal('true');
        expect(options[1].hasAttribute('selected')).to.be.true;
        expect(options[1].getAttribute('aria-selected')).to.be.equal('true');

        impl.clearSelection_(options[1]);
        expect(impl.getSelectedElementsForTesting().length).to.equal(1);
        expect(options[1].hasAttribute('selected')).to.be.false;
        expect(options[1].getAttribute('aria-selected')).to.be.equal('false');
      });

      it('should setInputs properly', async () => {
        let ampSelector = getSelector({});
        let impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();
        expect(impl.inputs_.length).to.equal(0);

        ampSelector = getSelector({
          attributes: {
            name: 'single_select',
          },
        });

        impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();
        expect(impl.inputs_.length).to.equal(0);

        ampSelector = getSelector({
          attributes: {
            name: 'single_select',
          },
          config: {
            count: 4,
            selectedCount: 0,
          },
        });
        impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();
        expect(impl.inputs_.length).to.equal(0);

        ampSelector = getSelector({
          attributes: {
            name: 'single_select',
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();

        let options = impl.getElementsForTesting();
        expect(impl.inputs_.length).to.equal(1);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[1],
        ]);

        impl.setSelection_(options[3]);
        impl.setInputs_();
        expect(impl.inputs_.length).to.equal(1);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[3],
        ]);

        impl.executeAction({
          method: 'selectDown',
          satisfiesTrust: () => true,
        });
        expect(impl.inputs_.length).to.equal(1);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[0],
        ]);

        impl.executeAction({
          method: 'selectUp',
          satisfiesTrust: () => true,
        });
        expect(impl.inputs_.length).to.equal(1);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[3],
        ]);

        ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        impl = await ampSelector.getImpl(false);

        await ampSelector.buildInternal();
        options = impl.getElementsForTesting();
        expect(impl.inputs_.length).to.equal(2);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[0],
          options[1],
        ]);

        impl.setSelection_(options[2]);
        impl.setInputs_();
        expect(impl.inputs_.length).to.equal(3);
        expect(impl.getSelectedElementsForTesting()).to.include.members([
          options[0],
          options[1],
          options[2],
        ]);
      });

      it('should not create hidden inputs for disabled options', async () => {
        const ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 4,
            selectedCount: 2,
            disabledCount: 4,
          },
        });
        const impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        expect(impl.inputs_.length).to.equal(0);
        impl.setSelection_(options[3]);
        impl.setInputs_();
        expect(impl.inputs_.length).to.equal(0);
      });

      it('should handle clicks', async () => {
        let ampSelector = getSelector({
          attributes: {
            name: 'single_select',
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        let impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();

        let options = impl.getElementsForTesting();
        let clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        let setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');
        let e = {
          target: options[3],
        };
        impl.clickHandler_(e);

        expect(options[3].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[3]);
        expect(clearSelectionSpy).to.have.been.calledWith(options[1]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        e = {
          target: document.body,
        };

        impl.clickHandler_(e);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        e = {
          target: options[3],
        };
        impl.clickHandler_(e);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 5,
            selectedCount: 2,
          },
        });

        impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();

        options = impl.getElementsForTesting();
        clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');

        e = {
          target: options[4],
        };

        impl.clickHandler_(e);
        expect(options[4].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[4]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.not.have.been.called;

        impl.clickHandler_(e);
        expect(options[4].hasAttribute('selected')).to.be.false;
        expect(clearSelectionSpy).to.have.been.calledWith(options[4]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        e = {
          target: options[2],
        };
        impl.clickHandler_(e);
        expect(options[2].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[2]);
        expect(setSelectionSpy).to.have.been.calledTwice;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 5,
            disabledCount: 2,
          },
        });

        impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();
        clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');

        e = {
          target: impl.element.children[0],
        };

        impl.clickHandler_(e);
        expect(setSelectionSpy).to.not.have.been.called;
        expect(clearSelectionSpy).to.not.have.been.called;
      });

      it('should handle keyboard selection', async () => {
        let ampSelector = getSelector({
          attributes: {
            name: 'single_select',
          },
          config: {
            count: 4,
            selectedCount: 2,
          },
        });
        let impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();

        let options = impl.getElementsForTesting();
        let clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        let setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');

        await keyPress(ampSelector, Keys_Enum.ENTER, options[3]);
        expect(options[3].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[3]);
        expect(clearSelectionSpy).to.have.been.calledWith(options[1]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        await keyPress(ampSelector, Keys_Enum.ENTER, options[3]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 5,
            selectedCount: 2,
          },
        });

        impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();

        options = impl.getElementsForTesting();
        clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');

        await keyPress(ampSelector, Keys_Enum.SPACE, options[4]);
        expect(options[4].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[4]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.not.have.been.called;

        await keyPress(ampSelector, Keys_Enum.SPACE, options[4]);
        expect(options[4].hasAttribute('selected')).to.be.false;
        expect(clearSelectionSpy).to.have.been.calledWith(options[4]);
        expect(setSelectionSpy).to.have.been.calledOnce;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        await keyPress(ampSelector, Keys_Enum.ENTER, options[2]);
        expect(options[2].hasAttribute('selected')).to.be.true;
        expect(setSelectionSpy).to.have.been.calledWith(options[2]);
        expect(setSelectionSpy).to.have.been.calledTwice;
        expect(clearSelectionSpy).to.have.been.calledOnce;

        ampSelector = getSelector({
          attributes: {
            name: 'muti_select',
            multiple: true,
          },
          config: {
            count: 5,
            disabledCount: 2,
          },
        });

        impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();
        clearSelectionSpy = env.sandbox.spy(impl, 'clearSelection_');
        setSelectionSpy = env.sandbox.spy(impl, 'setSelection_');

        await keyPress(ampSelector, Keys_Enum.SPACE, impl.element.children[0]);
        expect(setSelectionSpy).to.not.have.been.called;
        expect(clearSelectionSpy).to.not.have.been.called;
      });

      it('should update selection when `selected` attribute is mutated', async () => {
        const ampSelector = getSelector({
          config: {
            count: 5,
            selectedCount: 1,
          },
        });

        const impl = await ampSelector.getImpl(false);
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        const setInputsSpy = env.sandbox.spy(impl, 'setInputs_');

        expect(options[0].hasAttribute('selected')).to.be.true;
        expect(options[3].hasAttribute('selected')).to.be.false;

        impl.mutatedAttributesCallback({selected: '3'});

        expect(options[0].hasAttribute('selected')).to.be.false;
        expect(options[3].hasAttribute('selected')).to.be.true;

        // Integers should be converted to strings.
        impl.mutatedAttributesCallback({selected: 0});

        expect(options[0].hasAttribute('selected')).to.be.true;
        expect(options[3].hasAttribute('selected')).to.be.false;

        expect(setInputsSpy).to.have.callCount(4);
      });

      it('should support `disabled` attribute mutation', async () => {
        const ampSelector = getSelector({
          config: {
            count: 5,
            selectedCount: 1,
          },
        });

        const impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();
        await ampSelector.buildInternal();

        const options = impl.getElementsForTesting();
        expect(options[0].hasAttribute('selected')).to.be.true;
        expect(options[3].hasAttribute('selected')).to.be.false;

        impl.clickHandler_({target: options[3]});

        // When not disabled, clicking an option should select it.
        expect(options[0].hasAttribute('selected')).to.be.false;
        expect(options[3].hasAttribute('selected')).to.be.true;

        expect(ampSelector.hasAttribute('aria-disabled')).to.be.false;

        ampSelector.setAttribute('disabled', '');
        impl.mutatedAttributesCallback({disabled: true});

        expect(ampSelector.getAttribute('aria-disabled')).to.equal('true');

        impl.clickHandler_({target: options[0]});

        // When disabled, clicking an option should not select it.
        expect(options[0].hasAttribute('selected')).to.be.false;
        expect(options[3].hasAttribute('selected')).to.be.true;
      });

      it(
        'should trigger `toggle` action even when no `value` argument is' +
          ' provided to the function',
        async () => {
          const ampSelector = getSelector({
            config: {
              count: 5,
              selectedCount: 1,
            },
          });
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          // Test the case where the element to be `selected` and the currently
          // selected element are different

          let args = {'index': 2};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.true;

          // Test the case where the element to be `selected` and the currently
          // selected element are the same
          args = {'index': 2};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });

          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
        }
      );

      it(
        'should trigger `toggle` action even with specified `value`' +
          ' argument',
        async () => {
          const ampSelector = getSelector({
            config: {
              count: 5,
              selectedCount: 1,
            },
          });
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          // Test the case where the element to be `selected` and the currently
          // selected element are different
          let args = {'index': 2, 'value': true};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.true;

          // Test the case where the element to be `selected` and the currently
          // selected element are the same
          args = {'index': 2, 'value': true};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.true;

          // Test the case where the element to be removed as `selected` and
          // the currently selected element are the same
          args = {'index': 2, 'value': false};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;

          // Test the case where the element to be removed as `selected`
          // is different from the currently `selected` element
          ampSelector.children[0].setAttribute('selected', '');
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          args = {'index': 2, 'value': false};
          await impl.executeAction({
            method: 'toggle',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
        }
      );

      it('should trigger "select" event when user selects an option', async () => {
        const ampSelector = getSelector({
          config: {
            count: 5,
            selectedCount: 2,
          },
        });
        await ampSelector.buildInternal();
        const impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();

        const options = impl.getElementsForTesting();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        impl.clickHandler_({target: options[3]});

        expect(triggerSpy).to.be.calledOnce;
        expect(triggerSpy).to.have.been.calledWith(ampSelector, 'select');

        const event = triggerSpy.firstCall.args[2];
        expect(event).to.have.property('detail');
        expect(event.detail).to.have.property('targetOption', '3');
        expect(event.detail).to.have.deep.property('selectedOptions', ['3']);

        const trust = triggerSpy.firstCall.args[3];
        expect(trust).to.equal(ActionTrust_Enum.HIGH);
      });

      it('should trigger "select" event when an item is toggled', async () => {
        const ampSelector = getSelector({
          config: {
            count: 5,
            selectedCount: 1,
          },
        });
        await ampSelector.buildInternal();
        const impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();

        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        const args = {'index': 3, 'value': true};
        await impl.executeAction({
          method: 'toggle',
          args,
          satisfiesTrust: () => true,
          trust: 789,
        });

        expect(triggerSpy).to.be.calledOnce;
        expect(triggerSpy).to.have.been.calledWith(ampSelector, 'select');

        const event = triggerSpy.firstCall.args[2];
        expect(event).to.have.property('detail');
        expect(event.detail).to.have.property('targetOption', '3');
        expect(event.detail).to.have.deep.property('selectedOptions', ['3']);

        const trust = triggerSpy.firstCall.args[3];
        expect(trust).to.equal(789);
      });

      it('should trigger "select" event for multiple selections', async () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 6,
          },
        });
        ampSelector.children[0].setAttribute('selected', '');
        ampSelector.children[1].setAttribute('selected', '');

        await ampSelector.buildInternal();
        const impl = await ampSelector.getImpl(false);
        impl.mutateElement = (fn) => fn();

        const options = impl.getElementsForTesting();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');
        impl.clickHandler_({target: options[2]});

        expect(triggerSpy).to.be.calledOnce;
        expect(triggerSpy).to.have.been.calledWith(ampSelector, 'select');

        const event = triggerSpy.firstCall.args[2];
        expect(event).to.have.property('detail');
        expect(event.detail).to.have.property('targetOption', '2');
        expect(event.detail).to.have.deep.property('selectedOptions', [
          '0',
          '1',
          '2',
        ]);

        const trust = triggerSpy.firstCall.args[3];
        expect(trust).to.equal(ActionTrust_Enum.HIGH);
      });

      it(
        'should trigger `select` action when user uses ' +
          '`selectDown` action with default delta value of 1',
        async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
            },
            config: {
              count: 6,
            },
          });
          ampSelector.children[0].setAttribute('selected', '');
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);
          const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          impl.executeAction({
            method: 'selectDown',
            satisfiesTrust: () => true,
            trust: 789,
          });
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[1].hasAttribute('selected')).to.be.true;

          expect(triggerSpy).to.be.calledOnce;
          expect(triggerSpy).to.have.been.calledWith(ampSelector, 'select');

          const event = triggerSpy.firstCall.args[2];
          expect(event).to.have.property('detail');
          expect(event.detail).to.have.property('targetOption', '1');
          expect(event.detail).to.have.deep.property('selectedOptions', ['1']);

          const trust = triggerSpy.firstCall.args[3];
          expect(trust).to.equal(789);
        }
      );

      it(
        'should trigger `select` action when user uses ' +
          '`selectUp` action with default delta value of 1',
        async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
            },
            config: {
              count: 6,
            },
          });
          ampSelector.children[0].setAttribute('selected', '');
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);
          const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          impl.executeAction({
            method: 'selectUp',
            satisfiesTrust: () => true,
            trust: 789,
          });

          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[5].hasAttribute('selected')).to.be.true;

          expect(triggerSpy).to.be.calledOnce;
          expect(triggerSpy).to.have.been.calledWith(ampSelector, 'select');

          const event = triggerSpy.firstCall.args[2];
          expect(event).to.have.property('detail');
          expect(event.detail).to.have.property('targetOption', '5');
          expect(event.detail).to.have.deep.property('selectedOptions', ['5']);

          const trust = triggerSpy.firstCall.args[3];
          expect(trust).to.equal(789);
        }
      );

      it(
        'should trigger `select` action when user uses ' +
          '`selectUp`/`selectDown` action with user specified delta value',
        async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
            },
            config: {
              count: 6,
            },
          });
          ampSelector.children[0].setAttribute('selected', '');
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;

          let args = {'delta': 2};
          impl.executeAction({
            method: 'selectDown',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.true;

          args = {'delta': 2};
          impl.executeAction({
            method: 'selectUp',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;
        }
      );

      it(
        'should trigger `select` action when user uses ' +
          '`selectUp`/`selectDown` action with user specified delta value ' +
          '(test large values)',
        async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
            },
            config: {
              count: 5,
            },
          });
          ampSelector.children[1].setAttribute('selected', '');
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);

          expect(ampSelector.hasAttribute('multiple')).to.be.false;
          expect(ampSelector.children[1].hasAttribute('selected')).to.be.true;

          let args = {'delta': 1001};
          impl.executeAction({
            method: 'selectDown',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[1].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.true;

          args = {'delta': 1001};
          impl.executeAction({
            method: 'selectUp',
            args,
            satisfiesTrust: () => true,
          });
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[1].hasAttribute('selected')).to.be.true;
        }
      );

      describe('keyboard-select-mode', () => {
        it('should have `none` mode by default', async () => {
          const ampSelector = getSelector({});
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);
          expect(impl.kbSelectMode_).to.equal('none');
        });

        it(
          'should initially focus selected option ONLY if ' +
            'it exists for single-select, otherwise first option',
          async () => {
            const selectorWithNoSelection = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
            });
            await selectorWithNoSelection.buildInternal();
            expect(selectorWithNoSelection.children[0].tabIndex).to.equal(0);
            for (let i = 1; i < selectorWithNoSelection.children.length; i++) {
              // No other options should be reachable by
              expect(selectorWithNoSelection.children[i].tabIndex).to.equal(-1);
            }

            const selectorWithSelection = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
              config: {
                count: 3,
              },
            });
            selectorWithSelection.children[1].setAttribute('selected', '');
            await selectorWithSelection.buildInternal();
            expect(selectorWithSelection.children[0].tabIndex).to.equal(-1);
            expect(selectorWithSelection.children[1].tabIndex).to.equal(0);
            expect(selectorWithSelection.children[2].tabIndex).to.equal(-1);
          }
        );

        it('should initially focus first option for multi-select', async () => {
          const ampSelector = getSelector({
            attributes: {
              multiple: true,
              'keyboard-select-mode': 'focus',
            },
            config: {
              count: 3,
            },
          });
          ampSelector.children[1].setAttribute('selected', '');
          await ampSelector.buildInternal();
          expect(ampSelector.children[0].tabIndex).to.equal(0);
          expect(ampSelector.children[1].tabIndex).to.equal(-1);
          expect(ampSelector.children[2].tabIndex).to.equal(-1);
        });

        it('should NOT update focus if keyboard-select-mode is disabled', async () => {
          const ampSelector = getSelector({
            attributes: {
              'keyboard-select-mode': 'none',
            },
            config: {
              count: 3,
            },
          });
          const impl = await ampSelector.getImpl(false);
          const spy = env.sandbox.spy(impl, 'navigationKeyDownHandler_');
          await ampSelector.buildInternal();
          await keyPress(ampSelector, Keys_Enum.RIGHT_ARROW);
          expect(spy).to.not.have.been.called;
        });

        it(
          'should update focus when the user presses the arrow keys when ' +
            'keyboard-select-mode is enabled',
          async () => {
            const ampSelector = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
              config: {
                count: 3,
              },
            });
            await ampSelector.buildInternal();
            expect(ampSelector.children[0].tabIndex).to.equal(0);
            expect(ampSelector.children[1].tabIndex).to.equal(-1);
            expect(ampSelector.children[2].tabIndex).to.equal(-1);
            return keyPress(ampSelector, Keys_Enum.LEFT_ARROW)
              .then(() => {
                expect(ampSelector.children[0].tabIndex).to.equal(-1);
                expect(ampSelector.children[1].tabIndex).to.equal(-1);
                expect(ampSelector.children[2].tabIndex).to.equal(0);
                return keyPress(ampSelector, Keys_Enum.RIGHT_ARROW);
              })
              .then(() => {
                expect(ampSelector.children[0].tabIndex).to.equal(0);
                expect(ampSelector.children[1].tabIndex).to.equal(-1);
                expect(ampSelector.children[2].tabIndex).to.equal(-1);
              });
          }
        );

        it(
          'should update focus when the user presses the home key when ' +
            'keyboard-select-mode is enabled',
          async () => {
            const ampSelector = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
              config: {
                count: 3,
              },
            });
            ampSelector.children[2].setAttribute('selected', '');
            ampSelector.children[0].setAttribute('hidden', '');
            await ampSelector.buildInternal();
            expect(ampSelector.children[0].tabIndex).to.equal(-1);
            expect(ampSelector.children[1].tabIndex).to.equal(-1);
            expect(ampSelector.children[2].tabIndex).to.equal(0);
            return keyPress(ampSelector, Keys_Enum.HOME).then(() => {
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(0);
              expect(ampSelector.children[2].tabIndex).to.equal(-1);
            });
          }
        );

        it(
          'should update focus when the user presses the end key when ' +
            'keyboard-select-mode is enabled',
          async () => {
            const ampSelector = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
              config: {
                count: 3,
              },
            });
            ampSelector.children[2].setAttribute('hidden', '');
            await ampSelector.buildInternal();
            expect(ampSelector.children[0].tabIndex).to.equal(0);
            expect(ampSelector.children[1].tabIndex).to.equal(-1);
            expect(ampSelector.children[2].tabIndex).to.equal(-1);
            return keyPress(ampSelector, Keys_Enum.END).then(() => {
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(0);
              expect(ampSelector.children[2].tabIndex).to.equal(-1);
            });
          }
        );

        it(
          'should update focus for single-select when ' +
            'selection is changed without user interaction',
          async () => {
            const ampSelector = getSelector({
              attributes: {
                'keyboard-select-mode': 'focus',
              },
              config: {
                count: 3,
              },
            });
            ampSelector.children[1].setAttribute('selected', '');
            await ampSelector.buildInternal();
            const impl = await ampSelector.getImpl(false);

            expect(ampSelector.children[0].tabIndex).to.equal(-1);
            expect(ampSelector.children[1].tabIndex).to.equal(0);
            expect(ampSelector.children[2].tabIndex).to.equal(-1);

            impl.mutatedAttributesCallback({
              selected: 2,
            });
            expect(ampSelector.children[0].tabIndex).to.equal(-1);
            expect(ampSelector.children[1].tabIndex).to.equal(-1);
            expect(ampSelector.children[2].tabIndex).to.equal(0);
          }
        );

        it('should NOT allow `select` mode for multi-select selectors', () => {
          const ampSelector = getSelector({
            attributes: {
              'keyboard-select-mode': 'select',
              multiple: true,
            },
          });
          return allowConsoleError(() => {
            return expect(
              ampSelector.buildInternal()
            ).to.eventually.be.rejectedWith(
              /not supported for multiple selection amp-selector​​​/
            );
          });
        });

        it('should ONLY change selection in `select` mode', async () => {
          const ampSelector = getSelector({
            attributes: {
              'keyboard-select-mode': 'select',
            },
            config: {
              count: 3,
            },
          });
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);
          impl.mutateElement = (fn) => fn();
          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[1].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
          return keyPress(ampSelector, Keys_Enum.DOWN_ARROW)
            .then(() => {
              expect(ampSelector.children[0].hasAttribute('selected')).to.be
                .false;
              expect(ampSelector.children[1].hasAttribute('selected')).to.be
                .true;
              expect(ampSelector.children[2].hasAttribute('selected')).to.be
                .false;
              return keyPress(ampSelector, Keys_Enum.UP_ARROW);
            })
            .then(() => {
              expect(ampSelector.children[0].hasAttribute('selected')).to.be
                .true;
              expect(ampSelector.children[1].hasAttribute('selected')).to.be
                .false;
              expect(ampSelector.children[2].hasAttribute('selected')).to.be
                .false;
            });
        });
      });

      describe('clear action', () => {
        it('should clear selection of a single select', async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
            },
            config: {
              count: 3,
              selectedOptions: 1,
            },
          });
          ampSelector.children[1].setAttribute('selected', '');
          await ampSelector.buildInternal();
          await ampSelector.layoutCallback();

          const button = win.document.createElement('button');
          button.setAttribute('on', 'tap:ampSelector.clear');
          win.document.body.appendChild(button);

          button.click();

          expect(ampSelector.children[1].hasAttribute('selected')).to.be.false;
          expect(
            ampSelector.querySelectorAll('input[type="hidden"]').length
          ).to.equal(0);
        });

        it('should clear selection of a multiselect', async () => {
          const ampSelector = getSelector({
            attributes: {
              id: 'ampSelector',
              multiple: true,
            },
            config: {
              count: 6,
            },
          });
          ampSelector.children[0].setAttribute('selected', '');
          ampSelector.children[3].setAttribute('selected', '');
          await ampSelector.buildInternal();
          await ampSelector.layoutCallback();

          const button = win.document.createElement('button');
          button.setAttribute('on', 'tap:ampSelector.clear');
          win.document.body.appendChild(button);

          button.click();

          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
          expect(ampSelector.children[3].hasAttribute('selected')).to.be.false;
          expect(
            ampSelector.querySelectorAll('input[type="hidden"]').length
          ).to.equal(0);
        });
      });

      describe('on DOM_UPDATE', () => {
        it('should refresh stored state if child DOM changes', async () => {
          const ampSelector = getSelector({
            attributes: {
              'keyboard-select-mode': 'focus',
            },
            config: {
              count: 2,
            },
          });
          await ampSelector.buildInternal();
          const impl = await ampSelector.getImpl(false);
          impl.mutateElement = (fn) => fn();

          expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;

          // Add a new child after amp-selector initializes.
          const newChild = env.win.document.createElement('div');
          newChild.setAttribute('option', '3');
          newChild.setAttribute('selected', '');
          ampSelector.appendChild(newChild);
          expect(ampSelector.children[2]).to.equal(newChild);

          expect(ampSelector.children[0].tabIndex).to.equal(0);
          expect(ampSelector.children[1].tabIndex).to.equal(-1);
          expect(ampSelector.children[2].tabIndex).to.equal(-1);

          // Note that the newly added third child is ignored.
          keyPress(ampSelector, Keys_Enum.LEFT_ARROW)
            .then(() => {
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(0);
              expect(ampSelector.children[2].tabIndex).to.equal(-1);

              const e = new CustomEvent(AmpEvents_Enum.DOM_UPDATE, {
                bubbles: true,
              });
              newChild.dispatchEvent(e);

              // `newChild` should be focused since it has the 'selected' attribute.
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(-1);
              expect(ampSelector.children[2].tabIndex).to.equal(0);

              // Tabbing between children now works for `newChild`.
              return keyPress(ampSelector, Keys_Enum.LEFT_ARROW);
            })
            .then(() => {
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(0);
              expect(ampSelector.children[2].tabIndex).to.equal(-1);

              return keyPress(ampSelector, Keys_Enum.RIGHT_ARROW);
            })
            .then(() => {
              expect(ampSelector.children[0].tabIndex).to.equal(-1);
              expect(ampSelector.children[1].tabIndex).to.equal(-1);
              expect(ampSelector.children[2].tabIndex).to.equal(0);
            });
        });
      });
    });
  }
);

describes.realWin(
  'amp-selector component with runtime on',
  {
    amp: {
      extensions: ['amp-selector:0.1'],
      runtimeOn: true,
    },
  },
  (env) => {
    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = createElementWithAttributes(
        env.win.document,
        'amp-selector',
        {'layout': 'container'}
      );
      env.win.document.body.appendChild(element);
      env.sandbox.stub(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      whenUpgradedToCustomElement(element);
      const impl = await element.getImpl();
      env.sandbox.stub(impl, 'setSelection_');

      ['clear', 'selectDown', 'selectUp', 'toggle'].forEach((method) => {
        action.execute(
          element,
          method,
          null,
          'source',
          'caller',
          'event',
          ActionTrust_Enum.HIGH
        );
        expect(element.enqueAction).to.be.calledWith(
          env.sandbox.match({
            actionEventType: '?',
            args: null,
            caller: 'caller',
            event: 'event',
            method,
            node: element,
            source: 'source',
            trust: ActionTrust_Enum.HIGH,
          })
        );
      });
    });
  }
);

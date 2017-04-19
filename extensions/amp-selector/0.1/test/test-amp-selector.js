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

import '../amp-selector';

describes.realWin('amp-selector', {
  win: { /* window spec */
    location: '...',
    historyOff: false,
  },
  amp: { /* amp spec */
    runtimeOn: false,
    extensions: ['amp-selector:0.1'],
  },
}, env => {
  let win;
  describe('test extension', () => {

    function getSelector(options) {
      win = env.win;
      const attributes = options.attributes || {};
      const ampSelector = win.document.createElement('amp-selector');
      ampSelector.setAttribute('layout', 'container');
      if (attributes) {
        Object.keys(attributes).forEach(key => {
          ampSelector.setAttribute(key, attributes[key]);
        });
      }

      const config = options.config || {};
      let noOfSelectables = 3;
      let selectedCount = 0;
      let disabledCount = 0;
      if (config) {
        noOfSelectables = config.count || 3;
        selectedCount = config.selectedCount || 0;
        disabledCount = config.disabledCount || 0;
      }

      for (let i = 0; i < noOfSelectables; i++) {
        const img = win.document.createElement('div');
        img.setAttribute('width', '10');
        img.setAttribute('height', '10');
        img.setAttribute('option', i);

        if (noOfSelectables > selectedCount + disabledCount) {
          if (selectedCount > 0) {
            img.setAttribute('selected', '');
            selectedCount--;
          } else if (disabledCount > 0) {
            img.setAttribute('disabled', '');
            disabledCount--;
          }
        } else {
          if (selectedCount > 0) {
            img.setAttribute('selected', '');
            selectedCount--;
          }
          if (disabledCount > 0) {
            img.setAttribute('disabled', '');
            disabledCount--;
          }
        }
        ampSelector.appendChild(img);
      }
      win.document.body.appendChild(ampSelector);
      return ampSelector;
    }

    function keyPress(ampSelector, key) {
      const impl = ampSelector.implementation_;
      const event = {
        keyCode: key,
        preventDefault: () => {},
      };
      impl.keyHandler_(event);
    }

    it('should build properly', () => {
      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      let initSpy = sandbox.spy(impl, 'init_');
      ampSelector.build();
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
      impl = ampSelector.implementation_;
      initSpy = sandbox.spy(impl, 'init_');
      ampSelector.build();
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
      impl = ampSelector.implementation_;
      initSpy = sandbox.spy(impl, 'init_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.true;
      expect(initSpy).to.be.calledOnce;
    });

    it('should init properly for single select', () => {

      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      impl.mutateElement = fn => fn();
      let setInputsSpy = sandbox.spy(impl, 'setInputs_');
      let initSpy = sandbox.spy(impl, 'init_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.false;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(0);
      expect(setInputsSpy).to.have.been.calledOnce;


      ampSelector = getSelector({
        config: {
          count: 4,
          selectedCount: 2,
        },
      });
      impl = ampSelector.implementation_;
      setInputsSpy = sandbox.spy(impl, 'setInputs_');
      initSpy = sandbox.spy(impl, 'init_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.false;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(1);
      expect(impl.options_[1].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[1].getAttribute('aria-selected')).to.be.equal('true');
      expect(setInputsSpy).to.have.been.calledOnce;
    });

    it('should init properly for multiselect', () => {
      const ampSelector = getSelector({
        attributes: {
          multiple: true,
        },
        config: {
          count: 4,
          selectedCount: 2,
        },
      });
      const impl = ampSelector.implementation_;
      const initSpy = sandbox.spy(impl, 'init_');
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.true;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(2);
      expect(setInputsSpy).to.have.been.calledOnce;
    });

    it('should init properly for selector with disabled options', () => {
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
      const impl = ampSelector.implementation_;
      const initSpy = sandbox.spy(impl, 'init_');
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();

      expect(impl.isMultiple_).to.be.true;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.options_.length).to.equal(10);
      expect(impl.selectedOptions_.length).to.equal(2);
      expect(setInputsSpy).to.have.been.calledOnce;
    });


    it('should setSelection for single select', () => {
      const ampSelector = getSelector({
        config: {
          count: 5,
          selectedCount: 2,
        },
      });

      const impl = ampSelector.implementation_;
      const initSpy = sandbox.spy(impl, 'init_');
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');
      const clearSelectionSpy = sandbox.spy(impl, 'clearSelection_');
      ampSelector.build();

      expect(impl.isMultiple_).to.be.false;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(1);
      expect(setInputsSpy).to.have.been.calledOnce;
      expect(impl.options_[1].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[1].getAttribute('aria-selected')).to.be.equal('true');

      impl.setSelection_(impl.options_[3]);
      expect(impl.selectedOptions_.length).to.equal(1);
      expect(clearSelectionSpy).to.have.been.calledWith(impl.options_[1]);
      expect(impl.options_[3].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[3].getAttribute('aria-selected')).to.be.equal('true');

    });

    it('should setSelection for multi select', () => {
      const ampSelector = getSelector({
        attributes: {
          multiple: true,
        },
        config: {
          count: 5,
          selectedCount: 2,
        },
      });

      const impl = ampSelector.implementation_;
      const initSpy = sandbox.spy(impl, 'init_');
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();


      expect(impl.isMultiple_).to.be.true;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(2);
      expect(setInputsSpy).to.have.been.calledOnce;
      expect(impl.options_[0].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[0].getAttribute('aria-selected')).to.be.equal('true');
      expect(impl.options_[1].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[1].getAttribute('aria-selected')).to.be.equal('true');

      impl.setSelection_(impl.options_[3]);
      expect(impl.selectedOptions_.length).to.equal(3);
      expect(impl.options_[3].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[3].getAttribute('aria-selected')).to.be.equal('true');
    });


    it('should clearSelection', () => {
      const ampSelector = getSelector({
        attributes: {
          multiple: true,
        },
        config: {
          count: 5,
          selectedCount: 2,
        },
      });

      const impl = ampSelector.implementation_;
      const initSpy = sandbox.spy(impl, 'init_');
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();

      expect(impl.isMultiple_).to.be.true;
      expect(initSpy).to.have.been.calledOnce;
      expect(impl.selectedOptions_.length).to.equal(2);
      expect(setInputsSpy).to.have.been.calledOnce;
      expect(impl.options_[0].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[0].getAttribute('aria-selected')).to.be.equal('true');
      expect(impl.options_[1].hasAttribute('selected')).to.be.true;
      expect(
          impl.options_[1].getAttribute('aria-selected')).to.be.equal('true');

      impl.clearSelection_(impl.options_[1]);
      expect(impl.selectedOptions_.length).to.equal(1);
      expect(impl.options_[1].hasAttribute('selected')).to.be.false;
      expect(
          impl.options_[1].getAttribute('aria-selected')).to.be.equal('false');

    });

    it('should setInputs properly', () => {
      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputs_.length).to.equal(0);

      ampSelector = getSelector({
        attributes: {
          name: 'single_select',
        },
      });

      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputs_.length).to.equal(0);;

      ampSelector = getSelector({
        attributes: {
          name: 'single_select',
        },
        config: {
          count: 4,
          selectedCount: 0,
        },
      });
      impl = ampSelector.implementation_;
      ampSelector.build();
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
      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputs_.length).to.equal(1);
      expect(impl.selectedOptions_).to.include.members([impl.options_[1]]);

      impl.setSelection_(impl.options_[3]);
      impl.setInputs_();
      expect(impl.inputs_.length).to.equal(1);
      expect(impl.selectedOptions_).to.include.members([impl.options_[3]]);


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
      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputs_.length).to.equal(2);
      expect(impl.selectedOptions_).to.include.members([
        impl.options_[0],
        impl.options_[1],
      ]);

      impl.setSelection_(impl.options_[2]);
      impl.setInputs_();
      expect(impl.inputs_.length).to.equal(3);
      expect(impl.selectedOptions_).to.include.members([
        impl.options_[0],
        impl.options_[1],
        impl.options_[2],
      ]);
    });

    it('should not create hidden inputs for disabled options', () => {
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
      const impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputs_.length).to.equal(0);

      impl.setSelection_(impl.options_[3]);
      impl.setInputs_();
      expect(impl.inputs_.length).to.equal(0);
    });

    it('should handle clicks', () => {
      let ampSelector = getSelector({
        attributes: {
          name: 'single_select',
        },
        config: {
          count: 4,
          selectedCount: 2,
        },
      });
      let impl = ampSelector.implementation_;
      impl.mutateElement = fn => fn();
      ampSelector.build();
      let clearSelectionSpy = sandbox.spy(impl, 'clearSelection_');
      let setSelectionSpy = sandbox.spy(impl, 'setSelection_');

      let e = {
        target: impl.options_[3],
      };
      impl.clickHandler_(e);

      expect(impl.options_[3].hasAttribute('selected')).to.be.true;
      expect(setSelectionSpy).to.have.been.calledWith(impl.options_[3]);
      expect(clearSelectionSpy).to.have.been.calledWith(impl.options_[1]);
      expect(setSelectionSpy).to.have.been.calledOnce;
      expect(clearSelectionSpy).to.have.been.calledOnce;

      e = {
        target: document.body,
      };

      impl.clickHandler_(e);
      expect(setSelectionSpy).to.have.been.calledOnce;
      expect(clearSelectionSpy).to.have.been.calledOnce;

      e = {
        target: impl.options_[3],
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

      impl = ampSelector.implementation_;
      impl.mutateElement = fn => fn();
      ampSelector.build();
      clearSelectionSpy = sandbox.spy(impl, 'clearSelection_');
      setSelectionSpy = sandbox.spy(impl, 'setSelection_');

      e = {
        target: impl.options_[4],
      };

      impl.clickHandler_(e);
      expect(impl.options_[4].hasAttribute('selected')).to.be.true;
      expect(setSelectionSpy).to.have.been.calledWith(impl.options_[4]);
      expect(setSelectionSpy).to.have.been.calledOnce;
      expect(clearSelectionSpy).to.not.have.been.called;

      impl.clickHandler_(e);
      expect(impl.options_[4].hasAttribute('selected')).to.be.false;
      expect(clearSelectionSpy).to.have.been.calledWith(impl.options_[4]);
      expect(setSelectionSpy).to.have.been.calledOnce;
      expect(clearSelectionSpy).to.have.been.calledOnce;

      e = {
        target: impl.options_[2],
      };
      impl.clickHandler_(e);
      expect(impl.options_[2].hasAttribute('selected')).to.be.true;
      expect(setSelectionSpy).to.have.been.calledWith(impl.options_[2]);
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

      impl = ampSelector.implementation_;
      impl.mutateElement = fn => fn();
      ampSelector.build();
      clearSelectionSpy = sandbox.spy(impl, 'clearSelection_');
      setSelectionSpy = sandbox.spy(impl, 'setSelection_');

      e = {
        target: impl.element.children[0],
      };

      impl.clickHandler_(e);
      expect(setSelectionSpy).to.not.have.been.called;
      expect(clearSelectionSpy).to.not.have.been.called;
    });

    it('should update selection when `selected` attribute is mutated', () => {
      const ampSelector = getSelector({
        config: {
          count: 5,
          selectedCount: 1,
        },
      });

      const impl = ampSelector.implementation_;
      ampSelector.build();
      const setInputsSpy = sandbox.spy(impl, 'setInputs_');

      expect(impl.options_[0].hasAttribute('selected')).to.be.true;
      expect(impl.options_[3].hasAttribute('selected')).to.be.false;

      impl.mutatedAttributesCallback({selected: '3'});

      expect(impl.options_[0].hasAttribute('selected')).to.be.false;
      expect(impl.options_[3].hasAttribute('selected')).to.be.true;

      // Integers should be converted to strings.
      impl.mutatedAttributesCallback({selected: 0});

      expect(impl.options_[0].hasAttribute('selected')).to.be.true;
      expect(impl.options_[3].hasAttribute('selected')).to.be.false;

      expect(setInputsSpy).calledTwice;
    });

    it('should trigger `select` action when user selects an option', () => {
      const ampSelector = getSelector({
        config: {
          count: 5,
          selectedCount: 2,
        },
      });
      ampSelector.build();
      const impl = ampSelector.implementation_;
      impl.mutateElement = fn => fn();
      const triggerSpy = sandbox.spy(impl.action_, 'trigger');

      impl.clickHandler_({target: impl.options_[3]});

      const eventMatcher =
          sandbox.match.has('detail', sandbox.match.has('targetOption', '3'));
      expect(triggerSpy).to.have.been.calledWith(
          ampSelector, 'select', /* CustomEvent */ eventMatcher);
    });

    describe('keyboard-support', () => {

      it('should have `focus` mode by default', () => {
        const ampSelector = getSelector({});
        ampSelector.build();
        expect(ampSelector.getAttribute('keyboard-support')).to.equal('focus');
      });

      it('should initially focus selected option ONLY if ' +
         'it exists for single-select, otherwise first option', () => {
        const selectorWithNoSelection = getSelector({});
        selectorWithNoSelection.build();
        expect(selectorWithNoSelection.children[0].tabIndex).to.equal(0);
        for (let i = 1; i < selectorWithNoSelection.children.length; i++) {
          // No other options should be reachable by
          expect(selectorWithNoSelection.children[i].tabIndex).to.equal(-1);
        }

        const selectorWithSelection = getSelector({
          config: {
            count: 3,
          },
        });
        selectorWithSelection.children[1].setAttribute('selected', '');
        selectorWithSelection.build();
        expect(selectorWithSelection.children[0].tabIndex).to.equal(-1);
        expect(selectorWithSelection.children[1].tabIndex).to.equal(0);
        expect(selectorWithSelection.children[2].tabIndex).to.equal(-1);
      });

      it('should initially focus first option for multi-select', () => {
        const ampSelector = getSelector({
          attributes: {
            multiple: true,
          },
          config: {
            count: 3,
          },
        });
        ampSelector.children[1].setAttribute('selected', '');
        ampSelector.build();
        expect(ampSelector.children[0].tabIndex).to.equal(0);
        expect(ampSelector.children[1].tabIndex).to.equal(-1);
        expect(ampSelector.children[2].tabIndex).to.equal(-1);
      });

      it('should NOT update focus when keyboard-support is disabled', () => {
        const ampSelector = getSelector({
          attributes: {
            'keyboard-support': 'none',
          },
          config: {
            count: 3,
          },
        });
        const addEventSpy = sandbox.spy(ampSelector, 'addEventListener');
        ampSelector.build();
        expect(addEventSpy.calledWith('click')).to.be.true;
        expect(addEventSpy.calledWith('keydown')).to.be.false;
      });

      it('should update focus when the user presses the arrow keys when ' +
         'keyboard-support is enabled', () => {
        const ampSelector = getSelector({
          config: {
            count: 3,
          },
        });
        ampSelector.build();
        expect(ampSelector.children[0].tabIndex).to.equal(0);
        expect(ampSelector.children[1].tabIndex).to.equal(-1);
        expect(ampSelector.children[2].tabIndex).to.equal(-1);
        // Right
        keyPress(ampSelector, 39);
        expect(ampSelector.children[0].tabIndex).to.equal(-1);
        expect(ampSelector.children[1].tabIndex).to.equal(0);
        expect(ampSelector.children[2].tabIndex).to.equal(-1);
        // Left
        keyPress(ampSelector, 37);
        expect(ampSelector.children[0].tabIndex).to.equal(0);
        expect(ampSelector.children[1].tabIndex).to.equal(-1);
        expect(ampSelector.children[2].tabIndex).to.equal(-1);
      });

      it('should update focus for single-select when ' +
         'selection is changed without user interaction', () => {
        const ampSelector = getSelector({
          config: {
            count: 3,
          },
        });
        ampSelector.children[1].setAttribute('selected', '');
        ampSelector.build();
        expect(ampSelector.children[0].tabIndex).to.equal(-1);
        expect(ampSelector.children[1].tabIndex).to.equal(0);
        expect(ampSelector.children[2].tabIndex).to.equal(-1);

        ampSelector.implementation_.mutatedAttributesCallback({selected: 2});
        expect(ampSelector.children[0].tabIndex).to.equal(-1);
        expect(ampSelector.children[1].tabIndex).to.equal(-1);
        expect(ampSelector.children[2].tabIndex).to.equal(0);
      });

      it('should NOT allow `select` mode for multi-select selectors', () => {
        const ampSelector = getSelector({
          attributes: {
            'keyboard-support': 'select',
            multiple: true,
          },
        });
        expect(() => ampSelector.build())
            .to.throw(/not supported for multiple selection amp-selector​​​/);
      });

      it('should ONLY change selection in `select` mode', () => {
        const ampSelector = getSelector({
          attributes: {
            'keyboard-support': 'select',
          },
          config: {
            count: 3,
          },
        });
        ampSelector.build();
        const impl = ampSelector.implementation_;
        impl.mutateElement = fn => fn();
        expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
        expect(ampSelector.children[1].hasAttribute('selected')).to.be.false;
        expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
        // Down
        keyPress(ampSelector, 40);
        expect(ampSelector.children[0].hasAttribute('selected')).to.be.false;
        expect(ampSelector.children[1].hasAttribute('selected')).to.be.true;
        expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
        // Up
        keyPress(ampSelector, 38);
        expect(ampSelector.children[0].hasAttribute('selected')).to.be.true;
        expect(ampSelector.children[1].hasAttribute('selected')).to.be.false;
        expect(ampSelector.children[2].hasAttribute('selected')).to.be.false;
      });
    });
  });
});

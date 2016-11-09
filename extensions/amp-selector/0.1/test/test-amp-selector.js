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
  let ampSelector;
  let selectables = [];
  describe('test extension', () => {

    function getSelector(options) {
      win = env.win;
      const attributes = options.attributes || {};
      ampSelector = win.document.createElement('amp-selector');
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
        noOfSelectables = config.count;
        selectedCount = config.selectedCount;
        disabledCount = config.disabledCount;
      }

      for (let i = 0; i < noOfSelectables; i++) {
        const img = win.document.createElement('div');
        img.setAttribute('width', '10');
        img.setAttribute('height', '10');
        img.setAttribute('option', i)
        if (selectedCount > 0) {
          img.setAttribute('selected', '');
          selectedCount --;
        } else if (disabledCount > 0) {
          img.setAttribute('disabled', '');
          disabledCount --;
        }
        ampSelector.appendChild(img);
      }
      win.document.body.appendChild(ampSelector);
      return ampSelector;
    }


    beforeEach(() => {

    });
    it('should build properly', () => {
      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      let setStateSpy = sandbox.spy(impl, 'setState_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.false;
      expect(impl.setState_).to.be.calledOnce;


      ampSelector = getSelector({
        attributes: {
          multiple: true,
        },
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      setStateSpy = sandbox.spy(impl, 'setState_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.true;
      expect(impl.setState_).to.be.calledOnce;

      ampSelector = getSelector({
        attributes: {
          disabled: true,
          multiple: true,
        },
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      setStateSpy = sandbox.spy(impl, 'setState_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.true;
      expect(impl.setState_).to.be.not.have.been.called;



    });

    it('should setState properly', () => {

      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      let setInputsSpy = sandbox.spy(impl, 'setInputs_');
      let setStateSpy = sandbox.spy(impl, 'setState_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.false;
      expect(impl.setState_).to.be.calledOnce;
      expect(impl.selectedElements_.length).to.equal(0);
      expect(setInputsSpy).to.have.been.calledOnce;


      ampSelector = getSelector({
        attributes: {
          multiple: true,
        },
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      setStateSpy = sandbox.spy(impl, 'setState_');
      setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.true;
      expect(impl.setState_).to.be.calledOnce;
      expect(impl.selectedElements_.length).to.equal(2);
      expect(setInputsSpy).to.have.been.calledOnce;

      impl.element.children[2].setAttribute('selected', '');
      impl.setState_(impl.element.children[3]);
      expect(impl.selectedElements_.length).to.equal(3);
      expect(setInputsSpy).to.have.been.calledTwice;

      impl.element.children[3].setAttribute('disabled', '');
      impl.setState_(impl.element.children[3]);
      expect(impl.selectedElements_.length).to.equal(3);
      expect(setInputsSpy).to.have.been.calledThrice;


      ampSelector = getSelector({
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      setStateSpy = sandbox.spy(impl, 'setState_');
      setInputsSpy = sandbox.spy(impl, 'setInputs_');
      ampSelector.build();
      expect(impl.isMultiple_).to.be.false;
      expect(impl.setState_).to.be.calledOnce;
      expect(impl.selectedElements_.length).to.equal(1);
      expect(setInputsSpy).to.have.been.calledOnce;

      impl.element.children[2].setAttribute('selected', '');
      impl.setState_(impl.element.children[2]);
      expect(impl.selectedElements_.length).to.equal(1);
      expect(setInputsSpy).to.have.been.calledTwice;

      impl.element.children[3].setAttribute('disabled', '');
      impl.setState_(impl.element.children[2]);
      expect(impl.selectedElements_.length).to.equal(1);
      expect(setInputsSpy).to.have.been.calledThrice;

    });
    it('should setInputs properly', () => {
      let ampSelector = getSelector({});
      let impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputWrapper_).to.not.be.ok;

      ampSelector = getSelector({
        attributes: {
          name: 'single_select'
        }
      });

      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputWrapper_).to.be.ok;
      let inputs = [].slice.call(impl.element.querySelectorAll('input'));
      expect(inputs.length).to.equal(0);


      ampSelector = getSelector({
        attributes: {
          name: 'single_select'
        },
        config: {
          count: 4,
          selectedCount : 0,
        }
      });
      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputWrapper_).to.be.ok;
      inputs = [].slice.call(impl.element.querySelectorAll('input'));
      expect(inputs.length).to.equal(0);

      ampSelector = getSelector({
        attributes: {
          name: 'single_select'
        },
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputWrapper_).to.be.ok;
      inputs = [].slice.call(impl.element.querySelectorAll('input'));
      expect(inputs.length).to.equal(1);
      expect(impl.selectedElements_[0]).to.equal(impl.element.children[1]);

      impl.element.children[3].setAttribute('selected', '');
      impl.setState_(impl.element.children[3]);
      expect(inputs.length).to.equal(1);
      expect(impl.selectedElements_[0]).to.equal(impl.element.children[3]);


      ampSelector = getSelector({
        attributes: {
          name: 'muti_select',
          multiple: true
        },
        config: {
          count: 4,
          selectedCount : 2,
        }
      });
      impl = ampSelector.implementation_;
      ampSelector.build();
      expect(impl.inputWrapper_).to.be.ok;
      inputs = [].slice.call(impl.element.querySelectorAll('input'));
      expect(inputs.length).to.equal(2);

      impl.element.children[3].setAttribute('selected', '');
      impl.setState_(impl.element.children[3]);
      inputs = [].slice.call(impl.element.querySelectorAll('input'));
      expect(inputs.length).to.equal(3);
    });
  });

  it('should handle clicks', () => {
    let ampSelector = getSelector({
      attributes: {
        name: 'single_select'
      },
      config: {
        count: 4,
        selectedCount : 2,
      }
    });
    let impl = ampSelector.implementation_;
    let setStateSpy = sandbox.spy(impl, 'setState_');
    ampSelector.build();

    let e = {
      target: impl.element.children[3]
    };
    impl.clickHandler_(e);

    expect(impl.element.children[3].hasAttribute('selected')).to.be.true;
    expect(setStateSpy).to.have.been.calledOnce;

    e = {
      target: document.body
    };

    impl.clickHandler_(e);
    expect(setStateSpy).to.have.been.calledOnce;

    e = {
      target: impl.element.children[3]
    };
    impl.clickHandler_(e);
    expect(setStateSpy).to.have.been.calledOnce;

    ampSelector = getSelector({
      attributes: {
        name: 'muti_select',
        multiple: true
      },
      config: {
        count: 4,
        selectedCount : 2,
        disabledCount : 1
      }
    });

    e = {
      target: impl.element.children[3]
    };

    impl.clickHandler_(e);
    expect(impl.element.children[3].hasAttribute('selected')).to.be.true;
    expect(setStateSpy).to.have.been.calledTwice;

    impl.clickHandler_(e);
    expect(impl.element.children[3].hasAttribute('selected')).to.be.false;
    expect(setStateSpy).to.have.been.calledThrice;

    e = {
      target: impl.element.children[2]
    };
    impl.clickHandler_(e);
    expect(setStateSpy).to.not.have.been.called;
  });
});
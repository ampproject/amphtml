/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../src/preact/index';
import * as fakeTimers from '@sinonjs/fake-timers';
import {CanPlay, CanRender, LoadingProp} from '../../../src/core/contextprops';
import {Slot, useSlotContext} from '../../../src/preact/slot';
import {WithAmpContext} from '../../../src/preact/context';
import {createElementWithAttributes} from '../../../src/dom';
import {createRef, useLayoutEffect, useRef} from '../../../src/preact';
import {forwardRef} from '../../../src/preact/compat';
import {mount} from 'enzyme';
import {setIsRoot, subscribe} from '../../../src/context';

describes.sandboxed('Slot', {}, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <WithAmpContext>
        <div>
          <Slot name="slot1" />
        </div>
      </WithAmpContext>
    );
    setIsRoot(wrapper.find('div').getDOMNode(), true);
  });

  function getProp(element, prop) {
    return new Promise((resolve) => {
      subscribe(element, [prop], resolve);
    });
  }

  it('should set context props on a slot', async () => {
    const slot = wrapper.find(Slot).getDOMNode();
    await expect(getProp(slot, CanRender)).to.be.eventually.true;
    await expect(getProp(slot, CanPlay)).to.be.eventually.true;
    await expect(getProp(slot, LoadingProp)).to.be.eventually.equal('auto');
  });

  it('should update CanRender on a slot', async () => {
    wrapper.setProps({renderable: false});

    const slot = wrapper.find(Slot).getDOMNode();
    await expect(getProp(slot, CanRender)).to.be.eventually.false;
    await expect(getProp(slot, CanPlay)).to.be.eventually.false;
    await expect(getProp(slot, LoadingProp)).to.be.eventually.equal('lazy');
  });

  it('should update CanPlay on a slot', async () => {
    wrapper.setProps({playable: false});

    const slot = wrapper.find(Slot).getDOMNode();
    await expect(getProp(slot, CanRender)).to.be.eventually.true;
    await expect(getProp(slot, CanPlay)).to.be.eventually.false;
    await expect(getProp(slot, LoadingProp)).to.be.eventually.equal('auto');
  });

  it('should update LoadingProp on a slot', async () => {
    wrapper.setProps({loading: 'eager'});

    const slot = wrapper.find(Slot).getDOMNode();
    await expect(getProp(slot, CanRender)).to.be.eventually.true;
    await expect(getProp(slot, CanPlay)).to.be.eventually.true;
    await expect(getProp(slot, LoadingProp)).to.be.eventually.equal('eager');
  });

  it('should reset props on unmount', async () => {
    wrapper.setProps({renderable: false});

    const slot = wrapper.find(Slot).getDOMNode();
    await expect(getProp(slot, CanRender)).to.be.eventually.false;

    wrapper.unmount();
    await expect(getProp(slot, CanRender)).to.be.eventually.true;
  });
});

describes.realWin('Slot mount/unmount', {}, (env) => {
  let win, doc, clock;
  let host;
  let wrapper;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    delete win.requestIdleCallback;
    clock = fakeTimers.withGlobal(win).install();

    host = doc.createElement('div');
    doc.body.appendChild(host);
  });

  afterEach(() => {
    clock.uninstall();
  });

  function stubAmpElement(element) {
    element.classList.add('i-amphtml-element');

    element.ensureLoaded = env.sandbox.stub();
    element.pause = env.sandbox.stub();
    element.unmount = env.sandbox.stub();
    element.getPlaceholder = () => null;

    return element;
  }

  describe('with Shadow DOM', () => {
    let shadowRoot;
    let child1, child2;

    before(function () {
      if (!Element.prototype.attachShadow) {
        this.skipTest();
      }
    });

    beforeEach(() => {
      child1 = createAmpElement({slot: 'slot1'});
      child2 = createAmpElement({slot: 'slot1'});
      host.append(child1, child2);

      shadowRoot = host.attachShadow({mode: 'open'});
      setIsRoot(shadowRoot, true);

      wrapper = mount(
        <WithAmpContext>
          <div>
            <Slot name="slot1" />
          </div>
        </WithAmpContext>,
        {attachTo: shadowRoot}
      );
    });

    function createAmpElement(attrs) {
      const element = createElementWithAttributes(doc, 'amp-element', attrs);
      return stubAmpElement(element);
    }

    it('should load AMP elements on mount', () => {
      clock.runAll();
      expect(child1.ensureLoaded).to.be.calledOnce;
      expect(child2.ensureLoaded).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should unmount AMP elements on unmount', () => {
      wrapper.unmount();
      clock.runAll();
      expect(child1.unmount).to.be.calledOnce;
      expect(child2.unmount).to.be.calledOnce;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should pause AMP elements when playable changes', () => {
      wrapper.setProps({playable: false});
      clock.runAll();
      expect(child1.pause).to.be.calledOnce;
      expect(child2.pause).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
    });

    it('should pause before mount', () => {
      wrapper.unmount();
      clock.runAll();
      child1.ensureLoaded.resetHistory();
      child1.pause.resetHistory();
      child1.unmount.resetHistory();

      const order = [];
      child1.ensureLoaded.callsFake(() => order.push('ensureLoaded'));
      child1.pause.callsFake(() => order.push('pause'));

      // Mount in non-playable mode.
      wrapper.setProps({playable: false});
      wrapper.mount();
      clock.runAll();
      expect(child1.pause).to.be.calledOnce;
      expect(child1.ensureLoaded).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(order).to.deep.equal(['pause', 'ensureLoaded']);
    });
  });

  describe('with Shadow DOM and loading=lazy slot', () => {
    let shadowRoot;
    let child1, child2;

    before(function () {
      if (!Element.prototype.attachShadow) {
        this.skipTest();
      }
    });

    beforeEach(() => {
      child1 = createAmpElement({slot: 'slot1'});
      child2 = createAmpElement({slot: 'slot1'});
      host.append(child1, child2);

      shadowRoot = host.attachShadow({mode: 'open'});
      setIsRoot(shadowRoot, true);

      wrapper = mount(
        <WithAmpContext>
          <div>
            <Slot name="slot1" loading="lazy" />
          </div>
        </WithAmpContext>,
        {attachTo: shadowRoot}
      );
    });

    function createAmpElement(attrs) {
      const element = createElementWithAttributes(doc, 'amp-element', attrs);
      return stubAmpElement(element);
    }

    it('should load AMP elements on mount', () => {
      clock.runAll();
      expect(child1.ensureLoaded).to.not.be.called;
      expect(child2.ensureLoaded).to.not.be.called;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should unmount AMP elements on unmount', () => {
      wrapper.unmount();
      clock.runAll();
      expect(child1.unmount).to.be.calledOnce;
      expect(child2.unmount).to.be.calledOnce;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should pause AMP elements when playable changes', () => {
      wrapper.setProps({playable: false});
      clock.runAll();
      expect(child1.pause).to.be.calledOnce;
      expect(child2.pause).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
    });
  });

  describe('with Light DOM', () => {
    let child1Ref, child2Ref;

    beforeEach(() => {
      setIsRoot(host, true);

      child1Ref = createRef();
      child2Ref = createRef();
      const AmpElement = forwardRef(AmpElementWithRef);
      wrapper = mount(
        <WithAmpContext>
          <div>
            <Container>
              <AmpElement key="1" ref={child1Ref} />
              <AmpElement key="2" ref={child2Ref} />
            </Container>
          </div>
        </WithAmpContext>,
        {attachTo: host}
      );
    });

    function Container({children, ...rest}) {
      const ref = useRef();
      useSlotContext(ref);
      return (
        <div ref={ref} {...rest}>
          {children}
        </div>
      );
    }

    function AmpElementWithRef(props, ref) {
      useLayoutEffect(() => {
        const element = ref.current;
        stubAmpElement(element);
      }, [ref]);
      return <amp-element ref={ref} {...props} />;
    }

    it('should load AMP elements on mount', () => {
      const child1 = child1Ref.current;
      const child2 = child2Ref.current;
      clock.runAll();
      expect(child1.ensureLoaded).to.be.calledOnce;
      expect(child2.ensureLoaded).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should unmount AMP elements on unmount', () => {
      const child1 = child1Ref.current;
      const child2 = child2Ref.current;
      wrapper.unmount();
      clock.runAll();
      expect(child1.unmount).to.be.calledOnce;
      expect(child2.unmount).to.be.calledOnce;
      expect(child1.pause).to.not.be.called;
      expect(child2.pause).to.not.be.called;
    });

    it('should pause AMP elements when playable changes', () => {
      const child1 = child1Ref.current;
      const child2 = child2Ref.current;
      wrapper.setProps({playable: false});
      clock.runAll();
      expect(child1.pause).to.be.calledOnce;
      expect(child2.pause).to.be.calledOnce;
      expect(child1.unmount).to.not.be.called;
      expect(child2.unmount).to.not.be.called;
    });
  });
});

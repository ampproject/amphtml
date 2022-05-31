import * as fakeTimers from '@sinonjs/fake-timers';
import {mount} from 'enzyme';

import {setIsRoot, subscribe} from '#core/context';
import {createElementWithAttributes} from '#core/dom';

import * as Preact from '#preact';
import {createRef, useLayoutEffect, useRef} from '#preact';
import {forwardRef} from '#preact/compat';
import {WithAmpContext} from '#preact/context';
import {CanPlay, CanRender, LoadingProp} from '#preact/contextprops';
import {Slot, createSlot, useSlotContext} from '#preact/slot';

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

describes.realWin('createSlot', {}, (env) => {
  let win, doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should create slot and set corresponding slot attr', () => {
    const element = doc.createElement('div');
    const slot = createSlot(element, 'element');
    expect(element.getAttribute('slot')).to.equal('element');
    expect(slot.type).to.equal(Slot);
    expect(slot.props).to.deep.equal({'name': 'element'});
  });

  it('should create slot with props', () => {
    const element = doc.createElement('div');
    const slot = createSlot(element, 'element', {'propA': true});
    expect(element.getAttribute('slot')).to.equal('element');
    expect(slot.type).to.equal(Slot);
    expect(slot.props).to.deep.equal({'name': 'element', 'propA': true});
  });

  it('should create slot function and set corresponding slot attr', () => {
    const element = doc.createElement('div');
    const slotComp = createSlot(element, 'element', {}, /* as */ true);
    expect(element.getAttribute('slot')).to.equal('element');

    expect(typeof slotComp).to.equal('function');
    expect(slotComp.name).to.equal('SlotWithProps');

    const slot = slotComp();
    expect(slot.type).to.equal(Slot);
    expect(slot.props).to.deep.equal({'name': 'element'});
  });

  it('should create slot function with props', () => {
    const element = doc.createElement('div');
    const slotComp = createSlot(
      element,
      'element',
      {'propA': true},
      /* as */ true
    );
    expect(element.getAttribute('slot')).to.equal('element');

    expect(typeof slotComp).to.equal('function');
    expect(slotComp.name).to.equal('SlotWithProps');

    const slot = slotComp();
    expect(slot.type).to.equal(Slot);
    expect(slot.props).to.deep.equal({'name': 'element', 'propA': true});
  });

  it('should return cached slot function', () => {
    const element = doc.createElement('div');
    const slotComp = createSlot(element, 'element', {}, /* as */ true);
    const slotComp2 = createSlot(element, 'element', {}, /* as */ true);
    expect(slotComp2).to.deep.equal(slotComp);
  });

  it('should update cached slot function with new defaultProps', () => {
    const element = doc.createElement('div');
    const slotComp = createSlot(
      element,
      'element',
      {'propA': false},
      /* as */ true
    );
    const slotComp2 = createSlot(
      element,
      'element',
      {'propA': true},
      /* as */ true
    );
    expect(slotComp2).not.to.deep.equal(slotComp);
  });

  it('should return unique slot functions for unique elements', () => {
    const element = doc.createElement('div');
    const slotComp = createSlot(element, 'element', {}, /* as */ true);

    const element2 = doc.createElement('div');
    const slotComp2 = createSlot(element2, 'element', {}, /* as */ true);
    expect(slotComp2).not.to.deep.equal(slotComp);
  });
});

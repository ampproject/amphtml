import {createElementWithAttributes} from '#core/dom';
import {htmlFor} from '#core/dom/static-template';
import {omit} from '#core/types/object';

import * as Preact from '#preact';
import {PreactBaseElement} from '#preact/base-element';
import {
  createParseAttrsWithPrefix,
  createParseDateAttr,
} from '#preact/parse-props';
import {Slot} from '#preact/slot';

import {upgradeOrRegisterElement} from '#service/custom-element-registry';

import {testElementR1} from '#testing/element-v1';
import {waitFor} from '#testing/helpers/service';

const spec = {amp: true, frameStyle: {width: '300px'}};

describes.realWin('PreactBaseElement', spec, (env) => {
  let win, doc, html;
  let Impl, component, lastProps;
  let isLayoutSupportedOverride;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    html = htmlFor(doc);

    isLayoutSupportedOverride = () => true;
    Impl = class extends PreactBaseElement {
      isLayoutSupported(layout) {
        if (isLayoutSupportedOverride !== undefined) {
          return isLayoutSupportedOverride(layout);
        }
        return super.isLayoutSupported(layout);
      }
    };
    component = env.sandbox.stub().callsFake((props) => {
      lastProps = props;
      return Preact.createElement('div', {
        id: 'component',
        'data-name': props.name,
      });
    });
    Impl['Component'] = component;
    upgradeOrRegisterElement(win, 'amp-preact', Impl);
  });

  function waitForMutation(element, callback) {
    return new Promise((resolve) => {
      const mo = new MutationObserver(() => {
        resolve();
        mo.disconnect();
      });
      mo.observe(element, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });
      callback();
    }).then(() => {
      // Skip couple more animation frames.
      return new Promise((resolve) => setTimeout(resolve, 32));
    });
  }

  describe('R1', () => {
    it('testElementR1', () => {
      testElementR1(PreactBaseElement);
    });

    it('by default prerenderAllowed is tied to the "loadable" flag', () => {
      Impl['loadable'] = false;
      expect(Impl.prerenderAllowed()).to.be.true;

      Impl['loadable'] = true;
      expect(Impl.prerenderAllowed()).to.be.false;
    });

    it('by default previewAllowed is NOT tied to the "loadable" flag', () => {
      Impl['loadable'] = false;
      expect(Impl.previewAllowed()).to.be.false;

      Impl['loadable'] = true;
      expect(Impl.previewAllowed()).to.be.false;
    });
  });

  describe('layout mapping', () => {
    let element;

    beforeEach(() => {
      element = doc.createElement('amp-preact');
      isLayoutSupportedOverride = undefined;
    });

    it('should allow container for layoutSizeDefined', async () => {
      Impl['layoutSizeDefined'] = true;
      doc.body.appendChild(element);
      await element.buildInternal();
      const impl = await element.getImpl();
      expect(impl.isLayoutSupported('fixed')).to.be.true;
      expect(impl.isLayoutSupported('container')).to.be.true;
    });
  });

  describe('attribute mapping', () => {
    const DATE_STRING = '2018-01-01T08:00:00Z';
    const DATE = Date.parse(DATE_STRING);

    let element;

    beforeEach(async () => {
      Impl['props'] = {
        'noValue': {attr: 'no-value'},
        'valueWithDef': {attr: 'value-with-def', default: 'DEFAULT'},
        'propA': {attr: 'prop-a'},
        'minFontSize': {attr: 'min-font-size', type: 'number'},
        'aDate': createParseDateAttr('a-date'),
        'disabled': {attr: 'disabled', type: 'boolean'},
        'enabled': {attr: 'enabled', type: 'boolean'},
        'boolDefTrue': {attr: 'bool-def-true', type: 'boolean', default: true},
        'combined': {
          attrs: ['part-a', 'part-b'],
          parseAttrs: (e) =>
            `${e.getAttribute('part-a')}+${e.getAttribute('part-b')}`,
        },
        'params': createParseAttrsWithPrefix('data-param-'),
        'prefix': createParseAttrsWithPrefix('prefix'),
      };
      element = html`
        <amp-preact
          layout="fixed"
          width="100"
          height="100"
          prop-a="A"
          min-font-size="72"
          disabled
          unknown="1"
          part-a="A"
          part-b="B"
          data-param-test="helloworld"
          data-param-test-two="confirm"
          prefix="pref"
        >
        </amp-preact>
      `;
      element.setAttribute('a-date', DATE_STRING);
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should render content inline', async () => {
      expect(component).to.be.calledOnce;
      expect(element.querySelector('#component')).to.be.ok;
      expect(element.shadowRoot).to.not.be.ok;
    });

    it('should parse attributes on first render', async () => {
      expect(component).to.be.calledOnce;
      expect(lastProps).to.contain({
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        aDate: DATE,
        disabled: true,
        boolDefTrue: true,
        combined: 'A+B',
      });
      expect(lastProps.enabled).to.not.exist;
      expect(lastProps.params.test).to.equal('helloworld');
      expect(lastProps.params.testTwo).to.equal('confirm');
      expect(lastProps).to.not.haveOwnProperty('prefix');
    });

    it('should mutate attributes', async () => {
      element.setAttribute('prop-a', 'B');
      element.setAttribute('min-font-size', '72.5');
      element.setAttribute('a-date', '2018-01-01T08:00:01Z');
      element.setAttribute('enabled', '');
      element.removeAttribute('disabled');
      element.setAttribute('bool-def-true', 'false');
      element.setAttribute('part-b', 'C');
      element.setAttribute('data-param-test', 'worldhello');
      element.setAttribute('data-param-test-two', 'confirmAgain');
      element.setAttribute('prefix', 'prefTwo');

      await waitFor(() => component.callCount > 1, 'component re-rendered');

      expect(component).to.be.calledTwice;
      expect(lastProps).to.contain({
        valueWithDef: 'DEFAULT',
        propA: 'B',
        minFontSize: 72.5,
        aDate: DATE + 1000,
        enabled: true,
        boolDefTrue: false,
        combined: 'A+C',
      });
      expect(lastProps.disabled).to.not.exist;
      expect(lastProps.params.test).to.equal('worldhello');
      expect(lastProps.params.testTwo).to.equal('confirmAgain');
      expect(lastProps).to.not.haveOwnProperty('prefix');
    });

    it('should accept boolean string values', async () => {
      element.setAttribute('enabled', 'true');
      element.setAttribute('bool-def-true', 'true');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
      expect(lastProps).to.contain({
        enabled: true,
        boolDefTrue: true,
      });

      element.setAttribute('enabled', 'false');
      element.setAttribute('bool-def-true', 'false');
      await waitFor(() => component.callCount > 2, 'component re-rendered');
      expect(component).to.be.calledThrice;
      expect(lastProps).to.contain({
        enabled: false,
        boolDefTrue: false,
      });
    });

    it('should ignore non-declared attributes', async () => {
      // Perform ignored mutations.
      await waitForMutation(element, () => {
        element.removeAttribute('unknown');
        element.setAttribute('unknown2', '2');
        element.style.background = 'red';
        element.classList.add('class1');
      });

      // Execute a handled mutation and check that execution happened only
      // twice.
      element.setAttribute('prop-a', 'B');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
      expect(lastProps).to.have.property('propA', 'B');
      expect(lastProps).to.not.have.property('unknown2');
    });
  });

  describe('media-query attribute mapping', () => {
    let element;

    beforeEach(async () => {
      Impl['props'] = {
        'propA': {attr: 'prop-a', media: true},
        'propB': {attr: 'prop-b', media: true},
        'minFontSize': {attr: 'min-font-size', type: 'number', media: true},
      };
      element = html`
        <amp-preact
          layout="fixed"
          width="100"
          height="100"
          prop-a="(max-width: 301px) A, B"
          min-font-size="(max-width: 301px) 72, 84"
        >
        </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(win.innerWidth).to.equal(300);
    });

    it('should parse attributes on first render', async () => {
      expect(component).to.be.calledOnce;
      expect(lastProps.propA).to.equal('A');
      expect(lastProps.minFontSize).to.equal(72);
      // No attribute.
      expect(lastProps.propB).to.be.undefined;
    });

    it('should rerender on media change', async () => {
      env.iframe.style.width = '310px';
      await waitFor(() => component.callCount > 1, 'component re-rendered');

      expect(component).to.be.calledTwice;
      expect(lastProps.propA).to.equal('B');
      expect(lastProps.minFontSize).to.equal(84);
      // No attribute.
      expect(lastProps.propB).to.be.undefined;
    });
  });

  describe('props with staticProps', () => {
    let element;

    const initProps = {x: 'x', tacos: true};

    beforeEach(async () => {
      Impl.prototype.init = () => initProps;
      Impl['staticProps'] = {
        a: 'a',
        b: 123,
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100"></amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('include staticProps', () => {
      expect(lastProps).to.include(Impl['staticProps']);
    });

    it('include init() props', () => {
      expect(lastProps).to.include(initProps);
    });
  });

  describe('usesTemplate', () => {
    let element;

    beforeEach(async () => {
      Impl['usesTemplate'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100"> </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should pick-up template attribute mutations', async () => {
      element.setAttribute('template', 't1');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
    });

    it('should pick-up template child mutations', async () => {
      element.appendChild(document.createElement('template'));
      await waitFor(() => component.callCount > 1, 'component re-rendered');
    });
  });

  describe('shadow container rendering', () => {
    let element;

    beforeEach(() => {
      Impl['usesShadowDom'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div id="child1"></div>
          <div placeholder>foo</div>
          <div fallback>bar</div>
          <div overflow>load more</div>
        </amp-preact>
      `;
    });

    it('should return requiresShadowDom', () => {
      expect(Impl.requiresShadowDom()).to.be.true;
    });

    it('should render from scratch', async () => {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(component).to.be.calledOnce;
      const container = element.shadowRoot.querySelector(':scope c');
      expect(container).to.be.ok;
      expect(container.style.display).to.equal('contents');
      expect(container.querySelector(':scope #component')).to.be.ok;
      expect(
        element.shadowRoot.querySelectorAll('slot[name="i-amphtml-svc"]')
      ).to.have.lengthOf(1);
    });

    it('should pass placeholder, fallback, and overflow elements to service slot', async () => {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
      const serviceSlot = element.shadowRoot.querySelectorAll(
        'slot[name="i-amphtml-svc"]'
      );
      expect(serviceSlot).to.have.lengthOf(1);
      const placeholder = element.querySelector('[placeholder]');
      const fallback = element.querySelector('[fallback]');
      const overflow = element.querySelector('[overflow]');
      expect(placeholder.getAttribute('slot')).to.equal('i-amphtml-svc');
      expect(fallback.getAttribute('slot')).to.equal('i-amphtml-svc');
      expect(overflow.getAttribute('slot')).to.equal('i-amphtml-svc');
      expect(serviceSlot[0].assignedElements()).to.have.lengthOf(3);
      expect(serviceSlot[0].assignedElements()[0]).to.equal(placeholder);
      expect(serviceSlot[0].assignedElements()[1]).to.equal(fallback);
      expect(serviceSlot[0].assignedElements()[2]).to.equal(overflow);
    });

    // TODO(#38975): fix or remove broken test.
    describe.skip('SSR', () => {
      let shadowRoot, container;
      let componentEl, serviceSlotEl, styleEl;

      beforeEach(async () => {
        shadowRoot = element.attachShadow({mode: 'open'});
        container = html`<c></c>`;
        componentEl = html`<div id="component"></div>`;
        container.appendChild(componentEl);
        shadowRoot.appendChild(container);

        serviceSlotEl = html`<slot name="i-amphtml-svc"></slot>`;
        shadowRoot.appendChild(serviceSlotEl);

        styleEl = html`<style></style>`;
        shadowRoot.appendChild(styleEl);

        doc.body.appendChild(element);
        await element.buildInternal();
        await waitFor(() => component.callCount > 0, 'component hydrated');
      });

      it('should hydrate SSR shadow root', () => {
        expect(component).to.be.calledOnce;
        expect(element.shadowRoot.querySelector(':scope > c')).to.equal(
          container
        );
        expect(
          element.shadowRoot.querySelector(':scope > c > #component')
        ).to.equal(componentEl);
        expect(
          element.shadowRoot.querySelectorAll('slot[name="i-amphtml-svc"]')
        ).to.have.lengthOf(1);
        expect(
          element.shadowRoot.querySelector(
            ':scope > slot[name="i-amphtml-svc"]'
          )
        ).to.equal(serviceSlotEl);
        expect(element.shadowRoot.querySelector(':scope > style')).to.equal(
          styleEl
        );
      });

      it('should rerender after SSR hydration', async () => {
        // Only rendering updates attributes.
        const impl = await element.getImpl();
        impl.mutateProps({name: 'A'});
        await waitFor(() => component.callCount > 1, 'component rendered');
        expect(component).to.be.calledTwice;
        expect(componentEl.getAttribute('data-name')).to.equal('A');

        // No changes.
        expect(element.shadowRoot.querySelector(':scope > c')).to.equal(
          container
        );
        expect(
          element.shadowRoot.querySelector(':scope > c > #component')
        ).to.equal(componentEl);
        expect(
          element.shadowRoot.querySelector(
            ':scope > slot[name="i-amphtml-svc"]'
          )
        ).to.equal(serviceSlotEl);
        expect(element.shadowRoot.querySelector(':scope > style')).to.equal(
          styleEl
        );
      });
    });
  });

  describe('lightDom mapping', () => {
    let element;
    let updateEventSpy;

    beforeEach(() => {
      Impl['lightDomTag'] = 'time';
      component = env.sandbox.stub().callsFake((props) => {
        lastProps = props;
        return Preact.createElement(
          'time',
          {...props},
          Preact.createElement('div', {
            id: 'component',
            'data-name': props.name,
          })
        );
      });
      Impl['Component'] = component;
      element = html`
        <amp-preact layout="fixed" width="100" height="100"> </amp-preact>
      `;

      updateEventSpy = env.sandbox.stub();
      element.addEventListener('amp:dom-update', updateEventSpy);
    });

    it('should return requiresShadowDom', () => {
      expect(Impl.requiresShadowDom()).to.be.false;
    });

    it('should render from scratch', async () => {
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(
        () => element.querySelector(':scope > time'),
        'lightDom element created'
      );
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(component).to.be.calledOnce;
      const lightDom = element.querySelector(':scope > time');
      expect(lightDom.className).to.equal('');
      expect(lightDom.hasAttribute('i-amphtml-rendered')).to.be.true;
      expect(lightDom.querySelector(':scope > #component')).to.be.ok;
      expect(lastProps.as).to.equal('time');
      await waitFor(
        () => updateEventSpy.callCount > 0,
        'amp:dom-update called'
      );
    });

    it('should add fill class', async () => {
      Impl['layoutSizeDefined'] = true;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(
        () => element.querySelector(':scope > time'),
        'lightDom element created'
      );
      const lightDom = element.querySelector(':scope > time');
      expect(lightDom.querySelector(':scope > #component')).to.be.ok;
      expect(lightDom.className).to.equal('i-amphtml-fill-content');
      expect(lightDom.hasAttribute('i-amphtml-rendered')).to.be.true;
      expect(lastProps.class).to.equal('i-amphtml-fill-content');
      expect(lastProps.as).to.equal('time');
      await waitFor(
        () => updateEventSpy.callCount > 0,
        'amp:dom-update called'
      );
    });

    it('should use the existing element if exists', async () => {
      Impl['layoutSizeDefined'] = true;
      const existing = createElementWithAttributes(document, 'time', {
        'i-amphtml-rendered': '',
      });
      element.appendChild(existing);
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(element.querySelector(':scope > time')).to.equal(existing);
      expect(existing.querySelector(':scope > #component')).to.be.ok;
      expect(existing.className).to.equal('i-amphtml-fill-content');
      expect(lastProps.class).to.equal('i-amphtml-fill-content');
      expect(lastProps.as).to.equal('time');
      await waitFor(
        () => updateEventSpy.callCount > 0,
        'amp:dom-update called'
      );
    });
  });

  describe('children mapping', () => {
    let element;
    const DATE_STRING = '2018-01-01T08:00:00Z';
    const DATE = Date.parse(DATE_STRING);

    beforeEach(async () => {
      Impl['usesShadowDom'] = true;
      Impl['props'] = {
        'cloned': {
          selector: '[cloned]',
          single: false,
          clone: true,
        },
        'propA': {attr: 'prop-a'},
        'special1': {
          props: {
            'noValue': {attr: 'no-value'},
            'valueWithDef': {attr: 'value-with-def', default: 'DEFAULT'},
            'propA': {attr: 'prop-a'},
            'minFontSize': {attr: 'min-font-size', type: 'number'},
            'aDate': createParseDateAttr('a-date'),
            'disabled': {attr: 'disabled', type: 'boolean'},
            'enabled': {attr: 'enabled', type: 'boolean'},
          },
          selector: '[special1]',
          single: true,
        },
        'special2': {
          selector: '[special2]',
          single: true,
        },
        'specialAs': {
          selector: '[special3]',
          props: {
            'noValue': {attr: 'no-value'},
            'valueWithDef': {attr: 'value-with-def', default: 'DEFAULT'},
            'propA': {attr: 'prop-a'},
            'minFontSize': {attr: 'min-font-size', type: 'number'},
            'disabled': {attr: 'disabled', type: 'boolean'},
            'enabled': {attr: 'enabled', type: 'boolean'},
          },
          single: true,
          as: true,
        },
        'children': {
          props: {
            'boolDefTrue': {
              attr: 'bool-def-true',
              type: 'boolean',
              default: true,
            },
            'combined': {
              attrs: ['part-a', 'part-b'],
              parseAttrs: (e) =>
                `${e.getAttribute('part-a')}+${e.getAttribute('part-b')}`,
            },
            'params': createParseAttrsWithPrefix('data-param-'),
            'prefix': createParseAttrsWithPrefix('prefix'),
          },
          selector: '*', // This should be last as catch-all.
          single: false,
        },
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div
            special1
            prop-a="A"
            min-font-size="72"
            disabled
            unknown="1"
          ></div>
          <div
            special3
            prop-a="A"
            min-font-size="72"
            disabled
            unknown="1"
          ></div>
          <div
            id="child1"
            part-a="A"
            part-b="B"
            data-param-test="helloworld"
            data-param-test-two="confirm"
            prefix="pref"
          ></div>
          <div
            id="child2"
            part-a="C"
            part-b="D"
            data-param-test="helloworld2"
            data-param-test-two="confirm2"
            prefix="pref2"
          ></div>
          <div cloned id="cloned1"></div>
          <div cloned id="cloned2"></div>
          text (should be ignored)
        </amp-preact>
      `;
      element.firstElementChild.setAttribute('a-date', DATE_STRING);
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should return requiresShadowDom', () => {
      expect(Impl.requiresShadowDom()).to.be.true;
    });

    it('should render into shadow DOM', () => {
      expect(component).to.be.calledOnce;
      expect(element.shadowRoot).to.be.ok;
      expect(element.shadowRoot.querySelector('#component')).to.be.ok;
      expect(element.querySelector('#component')).to.not.be.ok;
    });

    it('should skip unavailable children', () => {
      expect(lastProps).to.not.have.property('special2');
    });

    it('should pass children as prop slot for single-element mapping and parse attributes', () => {
      const {special1} = lastProps;
      expect(special1.type).to.equal(Slot);
      expect(special1.props).to.deep.equal({
        name: 'i-amphtml-special1',
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        aDate: DATE,
        disabled: true,
      });

      expect(element.querySelector('[special1]').slot).to.equal(
        'i-amphtml-special1'
      );
    });

    it('should pass children as functional prop slot for single-element mapping with "as" and parse attributes', () => {
      const {specialAs: Comp} = lastProps;
      expect(typeof Comp).to.equal('function');
      expect(Comp.name).to.equal('SlotWithProps');

      const special3 = Comp();
      expect(special3.props).to.deep.equal({
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        disabled: true,
        name: 'i-amphtml-specialAs',
      });

      const special3WithProps = Comp({
        'aria-disabled': 'false',
        disabled: false,
      });
      expect(special3WithProps.props).to.deep.equal({
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        name: 'i-amphtml-specialAs',
        'aria-disabled': 'false',
        disabled: false,
      });

      expect(element.querySelector('[special3]').slot).to.equal(
        'i-amphtml-specialAs'
      );
    });

    it('should pass new functional prop slot for "as" on mutation', async () => {
      const {specialAs: prevComp} = lastProps;
      const prevSpecial3 = prevComp();
      expect(prevSpecial3.props).to.deep.equal({
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        disabled: true,
        name: 'i-amphtml-specialAs',
      });

      // Mutate slot prop, but this won't trigger a rerender
      element
        .querySelector('[special3]')
        .setAttribute('value-with-def', 'CUSTOM');
      // Mutate an observed attr to trigger rerender
      element.setAttribute('prop-a', 'B');

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {specialAs: Comp} = lastProps;
      expect(Comp).not.to.deep.equal(prevComp);
      const special3 = Comp();
      expect(special3.props).to.deep.equal({
        valueWithDef: 'CUSTOM',
        propA: 'A',
        minFontSize: 72,
        disabled: true,
        name: 'i-amphtml-specialAs',
      });
    });

    it('should pass children as prop slot array and parse attributes', () => {
      const {children} = lastProps;
      expect(children).to.have.lengthOf(2);
      const {0: child1, 1: child2} = children;
      expect(child1.type).to.equal(Slot);
      expect(omit(child1.props, 'name')).to.deep.equal({
        boolDefTrue: true,
        combined: 'A+B',
        params: {test: 'helloworld', testTwo: 'confirm'},
      });
      expect(child2.type).to.equal(Slot);
      expect(omit(child2.props, 'name')).to.deep.equal({
        boolDefTrue: true,
        combined: 'C+D',
        params: {test: 'helloworld2', testTwo: 'confirm2'},
      });

      // Names are random and most importantly not equal to each other.
      expect(child1.props.name).to.match(/i-amphtml-children-\d/);
      expect(child2.props.name).to.match(/i-amphtml-children-\d/);
      expect(child1.props.name).to.not.equal(child2.props.name);
      expect(element.querySelector('#child1').slot).to.equal(child1.props.name);
      expect(element.querySelector('#child2').slot).to.equal(child2.props.name);
    });

    it('should rerender on new children', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(2);
      const {0: prevChild1, 1: prevChild2} = prevChildren;

      const newChild = createElementWithAttributes(doc, 'div', {
        'id': 'child3',
        'part-a': 'E',
        'part-b': 'F',
      });
      element.appendChild(newChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(3);
      const {0: child1, 1: child2, 2: child3} = children;

      // New child.
      expect(child3.type).to.equal(Slot);
      expect(omit(child3.props, 'name')).to.deep.equal({
        boolDefTrue: true,
        combined: 'E+F',
      });
      expect(child3.props.name).to.match(/i-amphtml-children-\d/);
      expect(child3.props.name).to.not.equal(prevChild1.props.name);
      expect(child3.props.name).to.not.equal(prevChild2.props.name);
      expect(newChild.slot).to.equal(child3.props.name);

      // No changes.
      expect(child1.type).to.equal(Slot);
      expect(child1.props).to.deep.equal({
        name: prevChild1.props.name,
        boolDefTrue: true,
        combined: 'A+B',
        params: {test: 'helloworld', testTwo: 'confirm'},
      });
      expect(element.querySelector('#child1').slot).to.equal(child1.props.name);
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({
        name: prevChild2.props.name,
        boolDefTrue: true,
        combined: 'C+D',
        params: {test: 'helloworld2', testTwo: 'confirm2'},
      });
      expect(element.querySelector('#child2').slot).to.equal(child2.props.name);
    });

    it('should rerender when children are removed', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(2);
      const {1: prevChild2} = prevChildren;

      const oldChild = element.querySelector('#child1');
      element.removeChild(oldChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const {0: child2} = children;

      // No changes.
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({
        name: prevChild2.props.name,
        boolDefTrue: true,
        combined: 'C+D',
        params: {test: 'helloworld2', testTwo: 'confirm2'},
      });
      expect(element.querySelector('#child2').slot).to.equal(
        prevChild2.props.name
      );
    });

    it('should rerender on reorder', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(2);
      const {0: prevChild1, 1: prevChild2} = prevChildren;

      element.insertBefore(
        element.querySelector('#child2'),
        element.querySelector('#child1')
      );

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(2);
      const {0: child2, 1: child1} = children;

      // No changes, except for ordering.
      expect(child1.type).to.equal(Slot);
      expect(child1.props).to.deep.equal({
        name: prevChild1.props.name,
        boolDefTrue: true,
        combined: 'A+B',
        params: {test: 'helloworld', testTwo: 'confirm'},
      });
      expect(element.querySelector('#child1').slot).to.equal(
        prevChild1.props.name
      );
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({
        name: prevChild2.props.name,
        boolDefTrue: true,
        combined: 'C+D',
        params: {test: 'helloworld2', testTwo: 'confirm2'},
      });
      expect(element.querySelector('#child2').slot).to.equal(
        prevChild2.props.name
      );
    });

    it('should ignore service children mutations', async () => {
      await waitForMutation(element, () => {
        const newChild1 = doc.createElement('i-amphtml-size');
        element.appendChild(newChild1);

        const newChild2 = doc.createElement('div');
        newChild2.setAttribute('slot', 'i-amphtml-svc');
        element.appendChild(newChild2);
      });

      // Execute a handled mutation and check that execution happened only
      // twice.
      element.setAttribute('prop-a', 'B');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
    });

    it('clones children (without descendant) as vnodes into prop', async () => {
      expect(
        component.withArgs(
          env.sandbox.match({
            cloned: [
              env.sandbox.match({
                type: 'div',
                key: element.querySelector('#cloned1'),
                props: {
                  cloned: '',
                  id: 'cloned1',
                },
              }),
              env.sandbox.match({
                type: 'div',
                key: element.querySelector('#cloned2'),
                props: {
                  cloned: '',
                  id: 'cloned2',
                },
              }),
            ],
          })
        )
      ).to.be.calledOnce;
    });
  });

  describe('passthrough mapping', () => {
    let element;

    beforeEach(async () => {
      Impl['usesShadowDom'] = true;
      Impl['props'] = {
        'children': {passthrough: true},
        'propA': {attr: 'prop-a'},
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          Some <b>text</b>
        </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should return requiresShadowDom', () => {
      expect(Impl.requiresShadowDom()).to.be.true;
    });

    it('should render into shadow DOM', () => {
      expect(component).to.be.calledOnce;
      expect(element.shadowRoot).to.be.ok;
      expect(element.shadowRoot.querySelector('#component')).to.be.ok;
      expect(element.querySelector('#component')).to.not.be.ok;
    });

    it('should pass children as prop slot for single-element mapping', () => {
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
      expect(element.querySelector('b').slot).to.equal('');
    });

    it('should re-render on content changes', async () => {
      element.textContent = 'Different content';

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      // No changes.
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
    });

    it('should re-render on empty content', async () => {
      element.textContent = '';

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      // No changes.
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
    });

    it('should ignore service children mutations', async () => {
      await waitForMutation(element, () => {
        const newChild1 = doc.createElement('i-amphtml-size');
        element.appendChild(newChild1);

        const newChild2 = doc.createElement('div');
        newChild2.setAttribute('slot', 'i-amphtml-svc');
        element.appendChild(newChild2);
      });

      // Execute a handled mutation and check that execution happened only
      // twice.
      element.setAttribute('prop-a', 'B');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
    });
  });

  describe('passthrough with empty mapping', () => {
    let element;

    beforeEach(async () => {
      Impl['usesShadowDom'] = true;
      Impl['props'] = {
        'children': {passthroughNonEmpty: true},
        'propA': {attr: 'prop-a'},
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100"> text </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should return requiresShadowDom', () => {
      expect(Impl.requiresShadowDom()).to.be.true;
    });

    it('should render into shadow DOM', () => {
      expect(component).to.be.calledOnce;
      expect(element.shadowRoot).to.be.ok;
      expect(element.shadowRoot.querySelector('#component')).to.be.ok;
      expect(element.querySelector('#component')).to.not.be.ok;
    });

    it('should pass children when not empty', () => {
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
    });

    it('should pass children as undefined when empty', async () => {
      element.textContent = '   ';

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
      expect(lastProps.children).to.be.undefined;
    });

    it('should re-render on content changes', async () => {
      element.textContent = 'Different content';

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      // No changes.
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
    });

    it('should ignore service children mutations', async () => {
      await waitForMutation(element, () => {
        const newChild1 = doc.createElement('i-amphtml-size');
        element.appendChild(newChild1);

        const newChild2 = doc.createElement('div');
        newChild2.setAttribute('slot', 'i-amphtml-svc');
        element.appendChild(newChild2);
      });

      // Execute a handled mutation and check that execution happened only
      // twice.
      element.setAttribute('prop-a', 'B');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
    });
  });

  describe('delegatesFocus mapping', () => {
    let element;

    beforeEach(async () => {
      Impl['delegatesFocus'] = true;
      Impl['props'] = {'children': {passThroughNonEmpty: true}};
      Impl['usesShadowDom'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100"></amp-preact>
      `;
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should focus on the host when an element in the shadow DOM receives focus', async () => {
      // expect the shadowRoot to have delegatesFocus property set to true
      expect(element.shadowRoot.delegatesFocus).to.be.true;

      // initial focus is not on host
      expect(doc.activeElement).to.not.equal(element);

      // focus an element within the shadow DOM
      const inner = element.shadowRoot.querySelector('#component');
      // required to receive focus
      inner.setAttribute('tabIndex', 0);
      inner.focus();

      // host receives focus and custom style for outline
      expect(doc.activeElement).to.equal(element);
    });
  });

  describe('children with passthrough mapping', () => {
    let element;
    const DATE_STRING = '2018-01-01T08:00:00Z';
    const DATE = Date.parse(DATE_STRING);

    beforeEach(async () => {
      Impl['usesShadowDom'] = true;
      Impl['props'] = {
        'cloned': {
          selector: '[cloned]',
          single: false,
          clone: true,
        },
        'propA': {attr: 'prop-a'},
        'special1': {
          props: {
            'noValue': {attr: 'no-value'},
            'valueWithDef': {attr: 'value-with-def', default: 'DEFAULT'},
            'propA': {attr: 'prop-a'},
            'minFontSize': {attr: 'min-font-size', type: 'number'},
            'aDate': createParseDateAttr('a-date'),
            'disabled': {attr: 'disabled', type: 'boolean'},
            'enabled': {attr: 'enabled', type: 'boolean'},
          },
          selector: '[special1]',
          single: true,
        },
        'special2': {
          selector: '[special2]',
          single: true,
        },
        'children': {
          passthrough: true,
        },
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div
            special1
            prop-a="A"
            min-font-size="72"
            disabled
            unknown="1"
          ></div>
          <div
            id="child1"
            part-a="A"
            part-b="B"
            data-param-test="helloworld"
            data-param-test-two="confirm"
            prefix="pref"
          ></div>
          <div
            id="child2"
            part-a="C"
            part-b="D"
            data-param-test="helloworld2"
            data-param-test-two="confirm2"
            prefix="pref2"
          ></div>
          <div cloned id="cloned1"></div>
          <div cloned id="cloned2"></div>
          text (should be passed through)
        </amp-preact>
      `;
      element.firstElementChild.setAttribute('a-date', DATE_STRING);
      doc.body.appendChild(element);
      await element.buildInternal();
      await waitFor(() => component.callCount > 0, 'component rendered');
    });

    it('should render into shadow DOM', () => {
      expect(component).to.be.calledOnce;
      expect(element.shadowRoot).to.be.ok;
      expect(element.shadowRoot.querySelector('#component')).to.be.ok;
      expect(element.querySelector('#component')).to.not.be.ok;
    });

    it('should skip unavailable children', () => {
      expect(lastProps).to.not.have.property('special2');
    });

    it('should pass children as prop slot for single-element mapping and parse attributes', () => {
      const {special1} = lastProps;
      expect(special1.type).to.equal(Slot);
      expect(special1.props).to.deep.equal({
        name: 'i-amphtml-special1',
        valueWithDef: 'DEFAULT',
        propA: 'A',
        minFontSize: 72,
        aDate: DATE,
        disabled: true,
      });

      expect(element.querySelector('[special1]').slot).to.equal(
        'i-amphtml-special1'
      );
    });

    it('should pass children as prop slot array and parse attributes', () => {
      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
      expect(element.querySelector('#child1').slot).to.equal('');
      expect(element.querySelector('#child2').slot).to.equal('');
      expect(element.textContent).to.contain('text (should be passed through)');
    });

    it('should rerender on new children', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren, specialAs: prevSpecialAs} = lastProps;
      expect(prevChildren).to.have.lengthOf(1);

      const newChild = createElementWithAttributes(doc, 'div', {
        'id': 'child3',
        'part-a': 'E',
        'part-b': 'F',
      });
      element.appendChild(newChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children, specialAs} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];

      // New child.
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
      expect(element.querySelector('#child3').slot).to.equal('');

      // No changes.
      expect(element.querySelector('#child1').slot).to.equal('');
      expect(element.querySelector('#child2').slot).to.equal('');
      expect(element.textContent).to.contain('text (should be passed through)');
      expect(specialAs).to.deep.equal(prevSpecialAs);
    });

    it('should rerender on text change', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(1);

      const newChild = doc.createTextNode('more text');
      element.appendChild(newChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];

      // New child.
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});
      expect(element.textContent).to.contain('more text');

      // No changes.
      expect(element.querySelector('#child1').slot).to.equal('');
      expect(element.querySelector('#child2').slot).to.equal('');
      expect(element.textContent).to.contain('text (should be passed through)');
    });

    it('should rerender when children are removed', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(1);

      const oldChild = element.querySelector('#child1');
      element.removeChild(oldChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});

      // No changes.
      expect(element.querySelector('#child2').slot).to.equal('');
      expect(element.textContent).to.contain('text (should be passed through)');
    });

    it('should rerender on reorder', async () => {
      await waitFor(() => component.callCount > 0, 'component rendered');
      const {children: prevChildren} = lastProps;
      expect(prevChildren).to.have.lengthOf(1);
      const child1 = element.querySelector('#child1');
      const child2 = element.querySelector('#child2');
      expect(child1.nextElementSibling).to.equal(child2);

      element.insertBefore(
        element.querySelector('#child2'),
        element.querySelector('#child1')
      );

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const child = children[0];
      expect(child.type).to.equal(Slot);
      expect(child.props).to.deep.equal({loading: 'lazy'});

      // No changes, except for ordering
      expect(child1.slot).to.equal('');
      expect(child2.slot).to.equal('');
      expect(child2.nextElementSibling).to.equal(child1);
      expect(element.textContent).to.contain('text (should be passed through)');
    });

    it('should ignore service children mutations', async () => {
      await waitForMutation(element, () => {
        const newChild1 = doc.createElement('i-amphtml-size');
        element.appendChild(newChild1);

        const newChild2 = doc.createElement('div');
        newChild2.setAttribute('slot', 'i-amphtml-svc');
        element.appendChild(newChild2);
      });

      // Execute a handled mutation and check that execution happened only
      // twice.
      element.setAttribute('prop-a', 'B');
      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
    });

    it('clones children (without descendant) as vnodes into prop', async () => {
      expect(
        component.withArgs(
          env.sandbox.match({
            cloned: [
              env.sandbox.match({
                type: 'div',
                key: element.querySelector('#cloned1'),
                props: {
                  cloned: '',
                  id: 'cloned1',
                },
              }),
              env.sandbox.match({
                type: 'div',
                key: element.querySelector('#cloned2'),
                props: {
                  cloned: '',
                  id: 'cloned2',
                },
              }),
            ],
          })
        )
      ).to.be.calledOnce;
    });
  });
});

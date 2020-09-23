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
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Slot} from '../../../src/preact/slot';
import {htmlFor} from '../../../src/static-template';
import {upgradeOrRegisterElement} from '../../../src/service/custom-element-registry';
import {waitFor} from '../../../testing/test-helper';

describes.realWin('PreactBaseElement', {amp: true}, (env) => {
  let win, doc, html;
  let Impl, component, lastProps;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    html = htmlFor(doc);

    Impl = class extends PreactBaseElement {
      isLayoutSupported() {
        return true;
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
        'aDate': {attr: 'a-date', type: 'date'},
        'disabled': {attr: 'disabled', type: 'boolean'},
        'enabled': {attr: 'enabled', type: 'boolean'},
        'combined': {
          attrs: ['part-a', 'part-b'],
          parseAttrs: (e) =>
            `${e.getAttribute('part-a')}+${e.getAttribute('part-b')}`,
        },
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
        >
        </amp-preact>
      `;
      element.setAttribute('a-date', DATE_STRING);
      doc.body.appendChild(element);
      await element.build();
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
        enabled: false,
        combined: 'A+B',
      });
    });

    it('should mutate attributes', async () => {
      element.setAttribute('prop-a', 'B');
      element.setAttribute('min-font-size', '72.5');
      element.setAttribute('a-date', '2018-01-01T08:00:01Z');
      element.setAttribute('enabled', '');
      element.removeAttribute('disabled');
      element.setAttribute('part-b', 'C');

      await waitFor(() => component.callCount > 1, 'component re-rendered');

      expect(component).to.be.calledTwice;
      expect(lastProps).to.contain({
        valueWithDef: 'DEFAULT',
        propA: 'B',
        minFontSize: 72.5,
        aDate: DATE + 1000,
        disabled: false,
        enabled: true,
        combined: 'A+C',
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

  describe('usesTemplate', () => {
    let element;

    beforeEach(async () => {
      Impl['usesTemplate'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100"> </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.build();
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
      Impl['children'] = {};
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div id="child1"></div>
        </amp-preact>
      `;
    });

    it('should render from scratch', async () => {
      doc.body.appendChild(element);
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(component).to.be.calledOnce;
      const container = element.shadowRoot.querySelector(':scope > c');
      expect(container).to.be.ok;
      expect(container.style.display).to.equal('contents');
      expect(container.querySelector(':scope > #component')).to.be.ok;
      expect(
        element.shadowRoot.querySelectorAll('slot[name="i-amphtml-svc"]')
      ).to.have.lengthOf(1);
    });

    describe('SSR', () => {
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
        await element.build();
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
        element.implementation_.mutateProps({name: 'A'});
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

    it('should render from scratch', async () => {
      doc.body.appendChild(element);
      await element.build();
      await waitFor(
        () => element.querySelector(':scope > time'),
        'lightDom element created'
      );
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(component).to.be.calledOnce;
      const lightDom = element.querySelector(':scope > time');
      expect(lightDom.className).to.equal('');
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
      await element.build();
      await waitFor(
        () => element.querySelector(':scope > time'),
        'lightDom element created'
      );
      const lightDom = element.querySelector(':scope > time');
      expect(lightDom.querySelector(':scope > #component')).to.be.ok;
      expect(lightDom.className).to.equal('i-amphtml-fill-content');
      expect(lastProps.className).to.equal('i-amphtml-fill-content');
      expect(lastProps.as).to.equal('time');
      await waitFor(
        () => updateEventSpy.callCount > 0,
        'amp:dom-update called'
      );
    });

    it('should use the existing element if exists', async () => {
      Impl['layoutSizeDefined'] = true;
      const existing = document.createElement('time');
      element.appendChild(existing);
      doc.body.appendChild(element);
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(element.querySelector(':scope > time')).to.equal(existing);
      expect(existing.querySelector(':scope > #component')).to.be.ok;
      expect(existing.className).to.equal('i-amphtml-fill-content');
      expect(lastProps.className).to.equal('i-amphtml-fill-content');
      expect(lastProps.as).to.equal('time');
      await waitFor(
        () => updateEventSpy.callCount > 0,
        'amp:dom-update called'
      );
    });
  });

  describe('children mapping', () => {
    let element;

    beforeEach(async () => {
      Impl['props'] = {
        'propA': {attr: 'prop-a'},
      };
      Impl['children'] = {
        'special1': {
          name: 'special1',
          selector: '[special1]',
          single: true,
        },
        'special2': {
          name: 'special2',
          selector: '[special2]',
          single: true,
        },
        'cloned': {
          name: 'cloned',
          selector: '[cloned]',
          single: false,
          clone: true,
        },
        'children': {
          name: 'children',
          selector: '*',
          single: false,
        },
      };
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div special1></div>
          <div id="child1"></div>
          <div id="child2"></div>
          <div cloned id="cloned1"></div>
          <div cloned id="cloned2"></div>
        </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.build();
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

    it('should pass children as prop slot for single-element mapping', () => {
      const {special1} = lastProps;
      expect(special1.type).to.equal(Slot);
      expect(special1.props).to.deep.equal({name: 'i-amphtml-special1'});
      expect(element.querySelector('[special1]').slot).to.equal(
        'i-amphtml-special1'
      );
    });

    it('should pass children as prop slot array', () => {
      const {children} = lastProps;
      expect(children).to.have.lengthOf(2);
      const {0: child1, 1: child2} = children;
      expect(child1.type).to.equal(Slot);
      expect(child1.props).to.deep.equal({name: 'i-amphtml-children-0'});
      expect(element.querySelector('#child1').slot).to.equal(
        'i-amphtml-children-0'
      );
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({name: 'i-amphtml-children-1'});
      expect(element.querySelector('#child2').slot).to.equal(
        'i-amphtml-children-1'
      );
    });

    it('should rerender on new children', async () => {
      const newChild = doc.createElement('div');
      newChild.id = 'child3';
      element.appendChild(newChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(3);
      const {0: child1, 1: child2, 2: child3} = children;

      // New child.
      expect(child3.type).to.equal(Slot);
      expect(child3.props).to.deep.equal({name: 'i-amphtml-children-2'});
      expect(newChild.slot).to.equal('i-amphtml-children-2');

      // No changes.
      expect(child1.type).to.equal(Slot);
      expect(child1.props).to.deep.equal({name: 'i-amphtml-children-0'});
      expect(element.querySelector('#child1').slot).to.equal(
        'i-amphtml-children-0'
      );
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({name: 'i-amphtml-children-1'});
      expect(element.querySelector('#child2').slot).to.equal(
        'i-amphtml-children-1'
      );
    });

    it('should rerender when children are removed', async () => {
      const oldChild = element.querySelector('#child1');
      element.removeChild(oldChild);

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;

      const {children} = lastProps;
      expect(children).to.have.lengthOf(1);
      const {0: child2} = children;

      // No changes.
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({name: 'i-amphtml-children-1'});
      expect(element.querySelector('#child2').slot).to.equal(
        'i-amphtml-children-1'
      );
    });

    it('should rerender on reorder', async () => {
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
      expect(child1.props).to.deep.equal({name: 'i-amphtml-children-0'});
      expect(element.querySelector('#child1').slot).to.equal(
        'i-amphtml-children-0'
      );
      expect(child2.type).to.equal(Slot);
      expect(child2.props).to.deep.equal({name: 'i-amphtml-children-1'});
      expect(element.querySelector('#child2').slot).to.equal(
        'i-amphtml-children-1'
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
      Impl['props'] = {
        'propA': {attr: 'prop-a'},
      };
      Impl['passthrough'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          Some <b>text</b>
        </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');
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
      expect(child.props).to.deep.equal({});
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
      expect(child.props).to.deep.equal({});
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
      expect(child.props).to.deep.equal({});
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
      Impl['props'] = {
        'propA': {attr: 'prop-a'},
      };
      Impl['passthroughNonEmpty'] = true;
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          text
        </amp-preact>
      `;
      doc.body.appendChild(element);
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');
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
      expect(child.props).to.deep.equal({});
    });

    it('should pass children as null when empty', async () => {
      element.textContent = '   ';

      await waitFor(() => component.callCount > 1, 'component re-rendered');
      expect(component).to.be.calledTwice;
      expect(lastProps.children).to.be.null;
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
      expect(child.props).to.deep.equal({});
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
});

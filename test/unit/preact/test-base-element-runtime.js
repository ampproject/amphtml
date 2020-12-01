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
import {CanRender} from '../../../src/contextprops';
import {PreactBaseElement} from '../../../src/preact/base-element';
import {Slot} from '../../../src/preact/slot';
import {htmlFor} from '../../../src/static-template';
import {removeElement} from '../../../src/dom';
import {subscribe} from '../../../src/context';
import {upgradeOrRegisterElement} from '../../../src/service/custom-element-registry';
import {useAmpContext, useLoad} from '../../../src/preact/context';
import {waitFor} from '../../../testing/test-helper';

describes.realWin('PreactBaseElement', {amp: true}, (env) => {
  let win, doc, html;
  let Impl, component, lastContext, lastLoad;
  let loader;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    html = htmlFor(doc);

    Impl = class extends PreactBaseElement {
      isLayoutSupported() {
        return true;
      }
    };
    loader = env.sandbox.stub();
    component = env.sandbox.stub().callsFake((props) => {
      lastContext = useAmpContext();
      lastLoad = useLoad(props.loading);
      loader(lastLoad, props);
      if (props.empty) {
        return null;
      }
      return <Slot name="slot1" />;
    });
    Impl['Component'] = component;
    Impl['loadable'] = true;
    Impl['children'] = {};
    Impl['props'] = {
      'empty': {attr: 'empty', type: 'boolean'},
    };
    upgradeOrRegisterElement(win, 'amp-preact', Impl);
  });

  function waitForProp(element, prop, targetValue) {
    return new Promise((resolve) => {
      subscribe(element, [prop], (value) => {
        if (value == targetValue) {
          resolve();
        }
      });
    });
  }

  describe('context', () => {
    let element;

    beforeEach(() => {
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div id="child1" slot="slot1"></div>
          <div id="child2"></div>
        </amp-preact>
      `;
      doc.body.appendChild(element);
    });

    it('should render with default context', async () => {
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');
      expect(lastContext).to.contain({
        renderable: true,
        playable: true,
        loading: 'lazy',
      });
      expect(lastLoad).to.be.false;
      expect(loader).to.not.be.calledWith(true);
    });

    it('should propagate context to children', async () => {
      await element.build();
      await waitFor(() => component.callCount > 0, 'component rendered');

      const child1 = element.querySelector('#child1');
      const child2 = element.querySelector('#child2');
      await waitForProp(child1, CanRender, true);
      await waitForProp(child2, CanRender, false);
    });

    it('should rediscover children when slot is removed', async () => {
      function getSlot() {
        return (
          element.shadowRoot &&
          element.shadowRoot.querySelector('slot[name="slot1"]')
        );
      }

      await element.build();
      const child1 = element.querySelector('#child1');

      await waitFor(() => getSlot(), 'slot rendered');
      await waitForProp(child1, CanRender, true);

      // Slot is removed and the child1 goes to the "unslotted" group.
      element.setAttribute('empty', '');
      await waitFor(() => !getSlot(), 'slot removed');
      await waitForProp(child1, CanRender, false);
    });

    it('should load when requested', async () => {
      loader.callsFake((load, props) => {
        if (load) {
          props.onLoad();
        }
      });

      await element.build();
      await element.layoutCallback();
      expect(lastLoad).to.be.true;
      expect(loader).to.be.calledWith(true);
    });

    it('should handle load failure', async () => {
      loader.callsFake((load, props) => {
        if (load) {
          props.onLoadError();
        }
      });

      await element.build();
      await expect(element.layoutCallback()).to.be.eventually.rejected;
      expect(lastLoad).to.be.true;
      expect(loader).to.be.calledWith(true);
    });
  });

  describe('connect/disconnect', () => {
    let element;

    beforeEach(() => {
      element = html`
        <amp-preact layout="fixed" width="100" height="100">
          <div id="child1" slot="slot1"></div>
          <div id="child2"></div>
        </amp-preact>
      `;
      doc.body.appendChild(element);
    });

    function getSlot() {
      return (
        element.shadowRoot &&
        element.shadowRoot.querySelector('slot[name="slot1"]')
      );
    }

    it('should unrender component on disconnect', async () => {
      await element.build();
      await waitFor(() => getSlot(), 'content rendered');

      // Disconnect.
      removeElement(element);
      await waitFor(() => getSlot() === null, 'content unrendered');
    });

    it('should rerender component on reconnect', async () => {
      await element.build();
      await waitFor(() => getSlot(), 'content rendered');
      removeElement(element);
      await waitFor(() => getSlot() === null, 'content unrendered');

      // Reconnect.
      doc.body.appendChild(element);
      await waitFor(() => getSlot(), 'content rerendered');
    });
  });
});

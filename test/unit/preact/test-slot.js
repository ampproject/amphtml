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
import {CanPlay, CanRender, LoadingProp} from '../../../src/contextprops';
import {Slot} from '../../../src/preact/slot';
import {WithAmpContext} from '../../../src/preact/context';
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

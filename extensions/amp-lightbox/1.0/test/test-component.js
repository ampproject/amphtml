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

import * as Preact from '../../../../src/preact';
import {Lightbox} from '../component';
import {mount} from 'enzyme';

describes.sandboxed('Lightbox preact component v1.0', {}, () => {
  it('renders', () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <Lightbox id="lightbox" ref={ref}>
        <p>Hello World</p>
      </Lightbox>
    );

    // Nothing is rendered at first.
    expect(wrapper.children()).to.have.lengthOf(0);

    ref.current.open();
    wrapper.update();

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.find('p').text()).to.equal('Hello World');

    // Default SR button is present
    const buttons = wrapper.find('button');
    expect(buttons).to.have.lengthOf(1);
    const closeButton = buttons.first().getDOMNode();
    expect(closeButton.getAttribute('aria-label')).to.equal('Close the modal');
    expect(closeButton.textContent).to.equal('');

    // Scroller.
    const scroller = wrapper.getDOMNode().querySelector('[part=scroller]');
    expect(scroller).to.exist;
  });

  it('renders custom close button', () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <Lightbox
        id="lightbox"
        ref={ref}
        closeButtonAs={(props) => (
          <button {...props} aria-label="close my fancy lightbox">
            Close!
          </button>
        )}
      >
        <p>Hello World</p>
      </Lightbox>
    );

    // Nothing is rendered at first.
    expect(wrapper.children()).to.have.lengthOf(0);

    ref.current.open();
    wrapper.update();

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.find('p').text()).to.equal('Hello World');

    // Default SR button is present
    const buttons = wrapper.find('button');
    expect(buttons).to.have.lengthOf(1);
    const closeButton = buttons.first().getDOMNode();
    expect(closeButton.getAttribute('aria-label')).to.equal(
      'close my fancy lightbox'
    );
    expect(closeButton.textContent).to.equal('Close!');
  });
});

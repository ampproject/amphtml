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

import * as Preact from '../../../../src/preact/index';
import {mount} from 'enzyme';
import {useRenderer} from '../../../../src/preact/component';

describes.sandboxed('useRenderer', {}, (env) => {
  function Component({render, data}) {
    const value = useRenderer(render, data);
    return <div>{value}</div>;
  }

  it('should render a sync renderer', () => {
    const render = env.sandbox.stub().callsFake((data) => data.value);
    const data = {value: 'one'};
    const props = {data, render};

    const wrapper = mount(<Component {...props} />);
    expect(wrapper.html()).to.equal('<div>one</div>');
    expect(render).to.be.calledOnce.calledWith(data);

    // Empty re-render with old data.
    wrapper.setProps({...props, inc: 1});
    expect(wrapper.html()).to.equal('<div>one</div>'); // no change.
    expect(render).to.be.calledOnce; // no change.

    // Re-render with new data.
    wrapper.setProps({...props, data: {value: 'two'}});
    expect(wrapper.html()).to.equal('<div>two</div>');
    expect(render).to.be.calledTwice;
  });

  it('should render an async renderer', () => {
    let renderCallback;
    const render = env.sandbox.stub().callsFake((data) => ({
      then(callback) {
        renderCallback = () => callback(data.value);
      },
    }));
    function resolve() {
      renderCallback();
      renderCallback = null;
      wrapper.update();
    }

    const data = {value: 'one'};
    const props = {data, render};

    // First render: start.
    const wrapper = mount(<Component {...props} />);
    expect(wrapper.html()).to.equal('<div></div>');
    expect(render).to.be.calledOnce.calledWith(data);

    // First render: complete.
    resolve();
    expect(wrapper.html()).to.equal('<div>one</div>');
    expect(render).to.be.calledOnce; // no change.

    // Empty re-render with old data.
    wrapper.setProps({...props, inc: 1});
    expect(wrapper.html()).to.equal('<div>one</div>'); // no change.
    expect(render).to.be.calledOnce; // no change.

    // Re-render: start.
    wrapper.setProps({...props, data: {value: 'two'}});
    expect(wrapper.html()).to.equal('<div>one</div>'); // no change.
    expect(render).to.be.calledTwice;

    // Re-render: end.
    resolve();
    expect(wrapper.html()).to.equal('<div>two</div>');
    expect(render).to.be.calledTwice;
  });

  it('should supersede an async renderer', () => {
    const renderCallbacks = [];
    const render = env.sandbox.stub().callsFake((data) => ({
      then(callback) {
        renderCallbacks.push(() => callback(data.value));
      },
    }));
    function resolve(renderCallback) {
      renderCallback();
      renderCallback = null;
      wrapper.update();
    }

    const data = {value: 'one'};
    const props = {data, render};

    // First render: start.
    const wrapper = mount(<Component {...props} />);
    expect(wrapper.html()).to.equal('<div></div>');
    expect(render).to.be.calledOnce;

    // Re-render: start.
    wrapper.setProps({...props, data: {value: 'two'}});
    expect(wrapper.html()).to.equal('<div></div>'); // no change.
    expect(render).to.be.calledTwice;

    // Re-render: end.
    resolve(renderCallbacks[1]);
    expect(wrapper.html()).to.equal('<div>two</div>');
    expect(render).to.be.calledTwice;

    // First render: end.
    resolve(renderCallbacks[0]);
    expect(wrapper.html()).to.equal('<div>two</div>');
    expect(render).to.be.calledTwice; // no change.
  });
});

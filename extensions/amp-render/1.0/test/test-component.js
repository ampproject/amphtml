import {mount} from 'enzyme';

import * as Preact from '#preact';

import {macroTask} from '#testing/helpers';

import {Render} from '../component';

describes.sandboxed('Render 1.0 preact component', {}, () => {
  it('should render', async () => {
    const wrapper = mount(
      <Render
        src={'http://example.com'}
        getJson={() => Promise.resolve({name: 'George'})}
        render={(data) => `Hi ${data.name}`}
      ></Render>
    );

    // Since getJson method retuns a promise, we need to wait for
    // the promise to resolve.
    await macroTask();

    expect(wrapper.getDOMNode().tagName).to.equal('DIV');
    expect(wrapper.getDOMNode().innerHTML).to.equal('Hi George');
  });

  it('should add default aria-live="polite" attribute', async () => {
    const wrapper = mount(
      <Render
        src={'http://example.com'}
        getJson={() => Promise.resolve({name: 'George'})}
        render={(data) => `Hi ${data.name}`}
      ></Render>
    );

    // Since getJson method retuns a promise, we need to wait for
    // the promise to resolve.
    await macroTask();

    expect(wrapper.getDOMNode().getAttribute('aria-live')).to.equal('polite');
  });

  it('should add specified aria-live attribute', async () => {
    const wrapper = mount(
      <Render
        src={'http://example.com'}
        getJson={() => Promise.resolve({name: 'George'})}
        render={(data) => `Hi ${data.name}`}
        ariaLiveValue={'assertive'}
      ></Render>
    );

    // Since getJson method retuns a promise, we need to wait for
    // the promise to resolve.
    await macroTask();

    expect(wrapper.getDOMNode().getAttribute('aria-live')).to.equal(
      'assertive'
    );
  });
});

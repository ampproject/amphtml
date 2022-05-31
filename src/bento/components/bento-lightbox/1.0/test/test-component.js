import {mount} from 'enzyme';

import {BentoLightbox} from '#bento/components/bento-lightbox/1.0/component';

import * as Preact from '#preact';

describes.sandboxed('Lightbox preact component v1.0', {}, () => {
  it('renders', () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <BentoLightbox id="lightbox" ref={ref}>
        <p>Hello World</p>
      </BentoLightbox>
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
      <BentoLightbox
        id="lightbox"
        ref={ref}
        closeButtonAs={(props) => (
          <button {...props} aria-label="close my fancy lightbox">
            Close!
          </button>
        )}
      >
        <p>Hello World</p>
      </BentoLightbox>
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

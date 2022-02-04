import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoStreamGallery} from '../component';

describes.sandboxed('StreamGallery preact component', {}, () => {
  it('should render BentoBaseCarousel', () => {
    const wrapper = mount(
      <BentoStreamGallery>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoStreamGallery>
    );
    const carousel = wrapper.find('BentoBaseCarousel');
    expect(carousel).to.have.lengthOf(1);
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);

    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    expect(slides.first().text()).to.equal('slide 1');
    expect(slides.at(1).text()).to.equal('slide 2');
    expect(slides.last().text()).to.equal('slide 3');
  });

  it('should render custom Arrows when given', () => {
    const arrowPrev = (props) => (
      <div {...props} class="my-custom-arrow-prev">
        left
      </div>
    );
    const arrowNext = (props) => (
      <div {...props} class="my-custom-arrow-next">
        right
      </div>
    );
    const wrapper = mount(
      <BentoStreamGallery arrowPrevAs={arrowPrev} arrowNextAs={arrowNext}>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoStreamGallery>
    );
    const arrows = wrapper.find('Arrow');
    expect(arrows).to.have.lengthOf(2);
    expect(arrows.first().props().as).to.equal(arrowPrev);
    expect(arrows.last().props().as).to.equal(arrowNext);
  });

  it('should not loop by default', () => {
    const wrapper = mount(
      <BentoStreamGallery>
        <div class="my-slide">slide 1</div>
        <div class="my-slide">slide 2</div>
        <div class="my-slide">slide 3</div>
      </BentoStreamGallery>
    );
    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    // Given slides [1][2][3] should be rendered as is, but [3] is a
    // placeholder.
    expect(slides.first().text()).to.equal('slide 1');
    expect(slides.at(1).text()).to.equal('slide 2');
    expect(slides.last().text()).to.equal('slide 3');
  });

  it('should render in preparation for looping with loop prop', () => {
    const wrapper = mount(
      <BentoStreamGallery loop>
        <div class="my-slide">slide 1</div>
        <div class="my-slide">slide 2</div>
        <div class="my-slide">slide 3</div>
      </BentoStreamGallery>
    );
    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    // Given slides [1][2][3] should be rendered as [3][1][2]. But [3] is a
    // placeholder.
    expect(slides.at(0).text()).to.equal('slide 3');
    expect(slides.at(1).text()).to.equal('slide 1');
    expect(slides.at(2).text()).to.equal('slide 2');
  });
});

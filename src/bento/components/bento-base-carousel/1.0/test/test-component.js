import {mount} from 'enzyme';

import {BentoBaseCarousel} from '#bento/components/bento-base-carousel/1.0/component';

import * as Preact from '#preact';

import {useStyles} from '../component.jss';

describes.sandboxed('BentoBaseCarousel preact component', {}, () => {
  const styles = useStyles();

  it('should render Arrows and propagates children to Scroller', () => {
    const wrapper = mount(
      <BentoBaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );

    const arrows = wrapper.find('Arrow');
    expect(arrows).to.have.lengthOf(2);
    const arrow0 = arrows.first();
    const arrow1 = arrows.last();

    // Arrows are given rtl booleans and propagate them as strings.
    expect(arrow0.prop('rtl')).to.equal(false);
    expect(arrow0.children()).to.have.lengthOf(1);
    expect(arrow0.childAt(0).prop('rtl')).to.equal('false');
    expect(arrow1.prop('rtl')).to.equal(false);
    expect(arrow1.children()).to.have.lengthOf(1);
    expect(arrow1.childAt(0).prop('rtl')).to.equal('false');

    expect(wrapper.find('Scroller').prop('group')).to.be.undefined;

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
      <BentoBaseCarousel arrowPrevAs={arrowPrev} arrowNextAs={arrowNext}>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    const arrows = wrapper.find('Arrow');
    expect(arrows).to.have.lengthOf(2);
    expect(arrows.first().props().as).to.equal(arrowPrev);
    expect(arrows.last().props().as).to.equal(arrowNext);
  });

  it('should not loop by default', () => {
    const wrapper = mount(
      <BentoBaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
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
      <BentoBaseCarousel loop>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    const slides = wrapper.find('[data-slide]');
    expect(slides).to.have.lengthOf(3);

    // Given slides [1][2][3] should be rendered as [3][1][2]. But [3] is a
    // placeholder.
    expect(slides.at(0).text()).to.equal('slide 3');
    expect(slides.at(1).text()).to.equal('slide 1');
    expect(slides.at(2).text()).to.equal('slide 2');
  });

  it('should snap to slides by default', () => {
    const wrapper = mount(
      <BentoBaseCarousel>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    expect(wrapper.find(`[snap="true"]`)).not.to.be.null;
    expect(wrapper.find(`.${styles.enableSnap}`)).to.have.lengthOf(3);
  });

  it('should not snap to slides with snap={false}', () => {
    const wrapper = mount(
      <BentoBaseCarousel snap={false}>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    expect(wrapper.find(`[snap="false"]`)).not.to.be.null;
    expect(wrapper.find(`.${styles.disableSnap}`)).to.have.lengthOf(3);
  });

  it('should render Arrows with controls=always', () => {
    const wrapper = mount(
      <BentoBaseCarousel controls="always">
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);
  });

  it('should render Arrows with controls=never and outset-arrows', () => {
    const wrapper = mount(
      <BentoBaseCarousel controls="never" outsetArrows>
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(2);
  });

  it('should not render Arrows with controls=never', () => {
    const wrapper = mount(
      <BentoBaseCarousel controls="never">
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
      </BentoBaseCarousel>
    );
    expect(wrapper.find('Arrow')).to.have.lengthOf(0);
  });

  it('should respect snap-by if snapping', () => {
    const wrapper = mount(
      <BentoBaseCarousel snapBy={2} controls="never">
        <div>slide 1</div>
        <div>slide 2</div>
        <div>slide 3</div>
        <div>slide 4</div>
      </BentoBaseCarousel>
    );
    const snapEnabledSlides = wrapper.find(`.${styles.enableSnap}`);
    expect(snapEnabledSlides).to.have.lengthOf(2);
    expect(snapEnabledSlides.at(0).text()).to.equal('slide 1');
    expect(snapEnabledSlides.at(1).text()).to.equal('slide 3');
  });
});

import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoImageSlider} from '../component';
import {useStyles} from '../component.jss';

describes.sandboxed('ImageSlider preact component v1.0', {}, () => {
  const styles = useStyles();
  const firstImage = (props) => (
    <img
      src="image1.jpg"
      alt="A green apple"
      {...props}
      style={{width: 600, height: 300}}
    />
  );
  const secondImage = (props) => (
    <img
      src="image2.jpg"
      alt="A red apple"
      {...props}
      style={{width: 600, height: 300}}
    />
  );

  it('should render', () => {
    const wrapper = mount(
      <BentoImageSlider firstImageAs={firstImage} secondImageAs={secondImage} />
    );

    const component = wrapper.find(BentoImageSlider.name);
    expect(component).to.have.lengthOf(8);
    expect(wrapper.find(`.image-slider-left-image`)).not.to.be.null;
    expect(wrapper.find(`.image-slider-right-image`)).not.to.be.null;
  });

  it('should render custom labels when given', () => {
    const firstLabel = (props) => <div {...props}>Left Label</div>;
    const secondLabel = (props) => <div {...props}>Right Label</div>;
    const wrapper = mount(
      <BentoImageSlider
        firstImageAs={firstImage}
        secondImageAs={secondImage}
        firstLabelAs={firstLabel}
        secondLabelAs={secondLabel}
      />
    );

    expect(wrapper.find(`.image-slider-left-label`)).not.to.be.null;
    expect(wrapper.find(`.image-slider-right-label`)).not.to.be.null;

    expect(wrapper.find(`.image-slider-left-label`).text()).to.equal(
      'Left Label'
    );

    expect(wrapper.find(`.image-slider-right-label`).text()).to.equal(
      'Right Label'
    );
  });

  it('should render custom hints when given', () => {
    const firstLabel = (props) => <div {...props}>Slide Left</div>;
    const secondLabel = (props) => <div {...props}>Slide Right</div>;
    const wrapper = mount(
      <BentoImageSlider
        firstImageAs={firstImage}
        secondImageAs={secondImage}
        leftHintAs={firstLabel}
        rightHintAs={secondLabel}
      />
    );

    expect(wrapper.find(`.image-slider-left-label`)).not.to.be.null;
    expect(wrapper.find(`.image-slider-right-label`)).not.to.be.null;

    expect(wrapper.find(`.${styles.imageSliderHintLeft}`).text()).to.equal(
      'Slide Left'
    );

    expect(wrapper.find(`.${styles.imageSliderHintRight}`).text()).to.equal(
      'Slide Right'
    );
  });
});

import {mount} from 'enzyme';

import {computedStyle} from '#core/dom/style';

import * as Preact from '#preact';

import {waitFor} from '#testing/helpers/service';

import {BentoFitText, calculateFontSize, setOverflowStyle} from '../component';
import {useStyles} from '../component.jss';

describes.realWin('BentoFitText preact component v1.0', {}, (env) => {
  let win;

  const styles = useStyles();

  beforeEach(() => {
    win = env.win;
  });

  async function expectAsyncFontSize(element, value) {
    await waitFor(
      () => computedStyle(win, element).fontSize === value,
      'font size applied'
    );
    expect(computedStyle(win, element).fontSize).to.equal(value);
  }

  it('renders', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <BentoFitText ref={ref} style={{width: '300px', height: '100px'}}>
        Hello World
      </BentoFitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find(`.${styles.minContentHeight}`).getDOMNode(),
      '60px'
    );
  });

  it('should respect minFontSize', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <BentoFitText
        ref={ref}
        style={{width: '1px', height: '1px'}}
        minFontSize="24"
      >
        Hello World
      </BentoFitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find(`.${styles.minContentHeight}`).getDOMNode(),
      '24px'
    );
  });

  it('should respect maxFontSize', async () => {
    const ref = Preact.createRef();
    const wrapper = mount(
      <BentoFitText
        ref={ref}
        style={{width: '300px', height: '100px'}}
        maxFontSize="48"
      >
        Hello World
      </BentoFitText>,
      {attachTo: win.document.body}
    );

    // Render provided children
    expect(wrapper.children()).to.have.lengthOf(1);
    expect(wrapper.text()).to.equal('Hello World');
    await expectAsyncFontSize(
      wrapper.find(`.${styles.minContentHeight}`).getDOMNode(),
      '48px'
    );
  });
});

describes.realWin('BentoFitText calculateFontSize', {}, (env) => {
  let win, doc;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    element = doc.createElement('div');
    element.style.fontFamily = 'Arial';
    element.style.lineHeight = '1em';
    element.style.position = 'absolute';
    element.style.left = 0;
    element.style.top = 0;
    doc.body.appendChild(element);
  });

  it('should always fit on one line w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 10, 200, 6, 72)).to.equal(10);
  });

  it('should always fit the width w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 200, 10, 6, 72)).to.equal(15);
    expect(calculateFontSize(element, 200, 20, 6, 72)).to.equal(30);
    expect(calculateFontSize(element, 200, 40, 6, 72)).to.equal(60);
  });

  it('should hit min w/ small height and enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 6, 200, 6, 72)).to.equal(6);
    expect(calculateFontSize(element, 3, 200, 6, 72)).to.equal(6);
  });

  it('should hit min w/ small width and enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 200, 2, 6, 72)).to.equal(6);
    expect(calculateFontSize(element, 200, 4, 6, 72)).to.equal(6);
  });

  it('should hit max w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 80, 200, 6, 72)).to.equal(72);
  });

  it('should hit max w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize(element, 200, 48, 6, 72)).to.equal(72);
    expect(calculateFontSize(element, 200, 60, 6, 72)).to.equal(72);
  });

  it('should always fit on two lines w/ enough width', () => {
    element./*OK*/ innerHTML = 'A<br>B';
    expect(calculateFontSize(element, 20, 200, 6, 72)).to.equal(10);
  });
});

describes.realWin('BentoFitText setOverflowStyle', {}, (env) => {
  let win, doc;
  let measurer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    measurer = doc.createElement('div');
    measurer.style.fontFamily = 'Arial';
    measurer.style.lineHeight = '1.15em';
    measurer.style.position = 'absolute';
    measurer.style.width = '300px';
    doc.body.appendChild(measurer);
  });

  function getLineClamp() {
    for (const k in measurer.style) {
      if (k == 'lineClamp' || k.match(/.*LineClamp/)) {
        return measurer.style[k];
      }
    }
    return null;
  }

  it('should always fit on one line', () => {
    measurer./*OK*/ innerHTML = 'A';
    setOverflowStyle(measurer, 24, 20);
    expect(getLineClamp()).to.equal('');
    expect(measurer.style.maxHeight).to.equal('');
  });

  it('should always fit on two lines', () => {
    measurer./*OK*/ innerHTML = 'A<br>B';
    setOverflowStyle(measurer, 24, 20);
    expect(getLineClamp()).to.equal('1');
    expect(measurer.style.maxHeight).to.equal(23 + 'px'); // 23 = 20 * 1.15
  });
});

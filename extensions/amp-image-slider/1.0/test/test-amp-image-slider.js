import '../amp-image-slider';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';

import {toggleExperiment} from '#experiments';

import {ActionInvocation} from '#service/action-impl';

import {waitFor} from '#testing/helpers/service';
import {flush} from '#testing/preact';

import {useStyles} from '../component.jss';

describes.realWin(
  'amp-image-slider-v1.0',
  {
    amp: {
      extensions: ['amp-image-slider:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let element;
    let leftImage, rightImage;
    const styles = useStyles();

    const waitForRender = async () => {
      await element.buildInternal();
      const loadPromise = element.layoutCallback();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('div'), 'component mounted');
      await loadPromise;
    };

    function invocation(method, args = {}) {
      const source = null;
      const caller = null;
      const event = null;
      const trust = ActionTrust_Enum.DEFAULT;
      return new ActionInvocation(
        element,
        method,
        args,
        source,
        caller,
        event,
        trust
      );
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      toggleExperiment(win, 'bento-image-slider', true, true);
      element = createElementWithAttributes(doc, 'amp-image-slider', {
        'layout': 'fixed',
        'width': '300px',
        'height': '200px',
        'initial-slider-position': '0.3',
      });
      leftImage = createElementWithAttributes(doc, 'amp-img', {
        'slot': 'first-image',
        'layout': 'fill',
        'src': '/examples/img/hero@1x.jpg',
      });
      rightImage = createElementWithAttributes(doc, 'amp-img', {
        'slot': 'second-image',
        'layout': 'fill',
        'src': '/examples/img/hero@2x.jpg',
      });
      element.appendChild(leftImage);
      element.appendChild(rightImage);
      doc.body.appendChild(element);
    });

    afterEach(async () => {
      await flush();
    });

    it('should render amp-img', async () => {
      await waitForRender();

      const imageSlots = element.shadowRoot.querySelectorAll(
        'slot[name="first-image"], slot[name="second-image"]'
      );

      expect(imageSlots).to.have.length(2);
      expect(imageSlots[0].assignedElements()).to.have.ordered.members([
        leftImage,
      ]);
      expect(imageSlots[1].assignedElements()).to.have.ordered.members([
        rightImage,
      ]);
    });

    it('should throw warning', async () => {
      element.removeChild(leftImage);
      element.removeChild(rightImage);
      const originalWarn = console.warn;
      const consoleOutput = [];
      const mockedWarn = (output) => consoleOutput.push(output);
      console.warn = mockedWarn;

      await element.buildInternal();
      element.layoutCallback();
      expect(consoleOutput.length).to.equal(1);
      expect(consoleOutput[0]).to.equal(
        '2 images must be provided for comparison'
      );
      console.warn = originalWarn;
    });

    it('should not render labels by default', async () => {
      await waitForRender();

      const labelSlots = element.shadowRoot.querySelectorAll(
        'slot[name="first-label"], slot[name="second-label"]'
      );

      expect(labelSlots).to.have.length(0);
    });

    it('should render custom labels when given', async () => {
      const leftLabel = createElementWithAttributes(doc, 'div', {
        'slot': 'first-label',
      });
      leftLabel.append('Left Label');
      const rightLabel = createElementWithAttributes(doc, 'div', {
        'slot': 'second-label',
      });
      rightLabel.append('Right Label');

      element.appendChild(leftLabel);
      element.appendChild(rightLabel);

      doc.body.appendChild(element);
      await waitForRender();

      const labelSlots = element.shadowRoot.querySelectorAll(
        'slot[name="first-label"], slot[name="second-label"]'
      );

      expect(labelSlots).to.have.length(2);
      expect(labelSlots[0].assignedElements()).to.have.ordered.members([
        leftLabel,
      ]);
      expect(labelSlots[1].assignedElements()).to.have.ordered.members([
        rightLabel,
      ]);
    });

    it('should render default hints', async () => {
      await waitForRender();

      const labelSlots = element.shadowRoot.querySelectorAll(
        `.${styles.imageSliderHint}`
      );

      expect(labelSlots).to.have.length(2);
    });

    it('should render custom hints', async () => {
      const leftHint = createElementWithAttributes(doc, 'div', {
        'slot': 'left-hint',
      });
      const rightHint = createElementWithAttributes(doc, 'div', {
        'slot': 'right-hint',
      });
      element.appendChild(leftHint);
      element.appendChild(rightHint);
      await waitForRender();

      const hintSlots = element.shadowRoot.querySelectorAll(
        'slot[name="left-hint"], slot[name="right-hint"]'
      );

      expect(hintSlots).to.have.length(2);
      expect(hintSlots[0].assignedElements()).to.have.ordered.members([
        leftHint,
      ]);
      expect(hintSlots[1].assignedElements()).to.have.ordered.members([
        rightHint,
      ]);
    });

    it('should execute seekTo action', async () => {
      await waitForRender();
      const sliderBar = element.shadowRoot.querySelector(
        `.${styles.imageSliderBar}`
      );
      const rightMask = element.shadowRoot.querySelector(
        `.${styles.imageSliderRightMask}`
      );
      element.enqueAction(invocation('seekTo', {percent: 1}));
      expect(sliderBar.style.transform).to.equal('translateX(100%)');
      expect(rightMask.style.transform).to.equal('translateX(100%)');

      element.enqueAction(invocation('seekTo', {percent: 0.1}));
      expect(sliderBar.style.transform).to.equal('translateX(10%)');
      expect(rightMask.style.transform).to.equal('translateX(10%)');

      element.enqueAction(invocation('seekTo', {percent: 0.7}));
      expect(sliderBar.style.transform).to.equal('translateX(70%)');
      expect(rightMask.style.transform).to.equal('translateX(70%)');
    });

    it('should execute have initial position', async () => {
      await waitForRender();

      const sliderBar = element.shadowRoot.querySelector(
        `.${styles.imageSliderBar}`
      );
      const rightMask = element.shadowRoot.querySelector(
        `.${styles.imageSliderRightMask}`
      );
      await waitFor(
        () => sliderBar.style.transform !== '',
        'Slider Moved to initial position'
      );
      expect(sliderBar.style.transform).to.equal('translateX(30%)');
      expect(rightMask.style.transform).to.equal('translateX(30%)');
    });
  }
);

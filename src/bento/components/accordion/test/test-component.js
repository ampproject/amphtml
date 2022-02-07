import {mount} from 'enzyme';

import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';

import * as Preact from '#preact';
import {useAmpContext} from '#preact/context';

import {waitFor} from '#testing/helpers/service';

const ContextReader = (props) => {
  const {renderable} = useAmpContext();
  return <div data-renderable={String(renderable)} {...props} />;
};

describes.sandboxed('Accordion preact component', {}, (env) => {
  describe('standalone accordion section', () => {
    it('should render a default section', () => {
      const wrapper = mount(
        <BentoAccordionSection>
          <BentoAccordionHeader>
            <h1>header1</h1>
          </BentoAccordionHeader>
          <BentoAccordionContent>content1</BentoAccordionContent>
        </BentoAccordionSection>
      );

      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');
      expect(dom.children).to.have.lengthOf(2);

      const header = dom.children[0];
      expect(header.localName).to.equal('div');
      expect(header.innerHTML).to.equal('<h1>header1</h1>');
      expect(header.getAttribute('aria-expanded')).to.equal('false');

      const content = dom.children[1];
      expect(content.localName).to.equal('div');
      expect(content.innerHTML).to.equal('content1');
      expect(content.className.includes('content-hidden')).to.be.true;
    });

    it('should render an expanded section', () => {
      const wrapper = mount(
        <BentoAccordionSection expanded>
          <BentoAccordionHeader>
            <h1>header1</h1>
          </BentoAccordionHeader>
          <BentoAccordionContent>content1</BentoAccordionContent>
        </BentoAccordionSection>
      );

      const dom = wrapper.getDOMNode();

      const header = dom.children[0];
      expect(header.localName).to.equal('div');
      expect(header.innerHTML).to.equal('<h1>header1</h1>');
      expect(header.getAttribute('aria-expanded')).to.equal('true');

      const content = dom.children[1];
      expect(content.localName).to.equal('div');
      expect(content.innerHTML).to.equal('content1');
      expect(content.className.includes('content-hidden')).to.be.false;
    });

    it('should toggle expanded state', () => {
      const wrapper = mount(
        <BentoAccordionSection>
          <BentoAccordionHeader>
            <h1>header1</h1>
          </BentoAccordionHeader>
          <BentoAccordionContent>content1</BentoAccordionContent>
        </BentoAccordionSection>
      );
      const dom = wrapper.getDOMNode();
      const header = dom.children[0];
      const content = dom.children[1];

      // Start unexpanded.
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      expect(content.className.includes('content-hidden')).to.be.true;

      // Click on header to expand.
      wrapper.find('div').at(0).simulate('click');
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(content.className.includes('content-hidden')).to.be.false;

      // Click on header again to collapse.
      wrapper.find('div').at(0).simulate('click');
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      expect(content.className.includes('content-hidden')).to.be.true;
    });

    it('should propagate renderable/playable context when expanded', () => {
      const wrapper = mount(
        <BentoAccordionSection expanded>
          <BentoAccordionHeader>
            <h1>header1</h1>
          </BentoAccordionHeader>
          <BentoAccordionContent>
            <ContextReader id="content" />
          </BentoAccordionContent>
        </BentoAccordionSection>
      );
      const dom = wrapper.getDOMNode();
      expect(
        dom.querySelector('#content').getAttribute('data-renderable')
      ).to.equal('true');
    });

    it('should propagate renderable/playable context when collapsed', () => {
      const wrapper = mount(
        <BentoAccordionSection>
          <BentoAccordionHeader>
            <h1>header1</h1>
          </BentoAccordionHeader>
          <BentoAccordionContent>
            <ContextReader id="content" />
          </BentoAccordionContent>
        </BentoAccordionSection>
      );
      const dom = wrapper.getDOMNode();
      expect(
        dom.querySelector('#content').getAttribute('data-renderable')
      ).to.equal('false');
    });
  });

  describe('multi-expand accordion', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <BentoAccordion>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader>header1</BentoAccordionHeader>
            <BentoAccordionContent>content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={2}>
            <BentoAccordionHeader>header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={3}>
            <BentoAccordionHeader>header3</BentoAccordionHeader>
            <BentoAccordionContent>content3</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );
    });

    it('should render all sections', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Expanded state.
      const header0 = sections.at(0).find('div').at(0).getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('true');
      const header1 = sections.at(1).find('div').at(0).getDOMNode();
      expect(header1.getAttribute('aria-expanded')).to.equal('false');
      const header2 = sections.at(2).find('div').at(0).getDOMNode();
      expect(header2.getAttribute('aria-expanded')).to.equal('false');
      const content0 = sections.at(0).find('div').at(1).getDOMNode();
      const content1 = sections.at(1).find('div').at(1).getDOMNode();
      const content2 = sections.at(2).find('div').at(1).getDOMNode();

      // Headers.
      expect(header0.textContent).to.equal('header1');
      expect(header1.textContent).to.equal('header2');
      expect(header2.textContent).to.equal('header3');

      // Contents.
      expect(content0.textContent).to.equal('content1');
      expect(content1.textContent).to.equal('content2');
      expect(content2.textContent).to.equal('content3');
      expect(content0.className.includes('content-hidden')).to.be.false;
      expect(content1.className.includes('content-hidden')).to.be.true;
      expect(content2.className.includes('content-hidden')).to.be.true;

      // Styling.
      expect(header0.className.includes('section-child')).to.be.true;
      expect(header0.className.includes('header')).to.be.true;
      expect(header1.className.includes('section-child')).to.be.true;
      expect(header1.className.includes('header')).to.be.true;
      expect(header2.className.includes('section-child')).to.be.true;
      expect(header2.className.includes('header')).to.be.true;
      expect(content0.className.includes('section-child')).to.be.true;
      expect(content1.className.includes('section-child')).to.be.true;
      expect(content2.className.includes('section-child')).to.be.true;
    });

    it('should include a11y related attributes', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      const header0 = sections.at(0).find('div').at(0).getDOMNode();
      const header1 = sections.at(1).find('div').at(0).getDOMNode();
      const header2 = sections.at(2).find('div').at(0).getDOMNode();
      const content0 = sections.at(0).find('div').at(1).getDOMNode();
      const content1 = sections.at(1).find('div').at(1).getDOMNode();
      const content2 = sections.at(2).find('div').at(1).getDOMNode();

      expect(header0).to.have.attribute('tabindex');
      expect(header0).to.have.attribute('aria-controls');
      expect(header0).to.have.attribute('role');
      expect(header0).to.have.attribute('aria-expanded');
      expect(header0).to.have.attribute('id');
      expect(header0.getAttribute('aria-expanded')).to.equal('true');
      expect(content0).to.have.attribute('id');
      expect(content0).to.have.attribute('aria-labelledby');
      expect(content0).to.have.attribute('role');
      expect(header0.getAttribute('aria-controls')).to.equal(
        content0.getAttribute('id')
      );
      expect(header0.getAttribute('id')).to.equal(
        content0.getAttribute('aria-labelledby')
      );

      expect(header1).to.have.attribute('tabindex');
      expect(header1).to.have.attribute('aria-controls');
      expect(header1).to.have.attribute('role');
      expect(header1).to.have.attribute('aria-expanded');
      expect(header1).to.have.attribute('id');
      expect(header1.getAttribute('aria-expanded')).to.equal('false');
      expect(content1).to.have.attribute('id');
      expect(content1).to.have.attribute('aria-labelledby');
      expect(content1).to.have.attribute('role');
      expect(header1.getAttribute('aria-controls')).to.equal(
        content1.getAttribute('id')
      );
      expect(header1.getAttribute('id')).to.equal(
        content1.getAttribute('aria-labelledby')
      );

      expect(header2).to.have.attribute('tabindex');
      expect(header2).to.have.attribute('aria-controls');
      expect(header2).to.have.attribute('role');
      expect(header2).to.have.attribute('aria-expanded');
      expect(header2).to.have.attribute('id');
      expect(header2.getAttribute('aria-expanded')).to.equal('false');
      expect(content2).to.have.attribute('id');
      expect(content2).to.have.attribute('aria-labelledby');
      expect(content2).to.have.attribute('role');
      expect(header2.getAttribute('aria-controls')).to.equal(
        content2.getAttribute('id')
      );
      expect(header2.getAttribute('id')).to.equal(
        content2.getAttribute('aria-labelledby')
      );
    });

    it('should not overwrite existing header and content ids', () => {
      wrapper = mount(
        <BentoAccordion>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader id="h1">header1</BentoAccordionHeader>
            <BentoAccordionContent id="c1">content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={2}>
            <BentoAccordionHeader id="h2">header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={3}>
            <BentoAccordionHeader>header3</BentoAccordionHeader>
            <BentoAccordionContent id="c3">content3</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );

      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      const header0 = sections.at(0).find('div').at(0).getDOMNode();
      const header1 = sections.at(1).find('div').at(0).getDOMNode();
      const header2 = sections.at(2).find('div').at(0).getDOMNode();
      const content0 = sections.at(0).find('div').at(1).getDOMNode();
      const content1 = sections.at(1).find('div').at(1).getDOMNode();
      const content2 = sections.at(2).find('div').at(1).getDOMNode();

      expect(header0.getAttribute('id')).to.equal('h1');
      expect(content0.getAttribute('id')).to.equal('c1');
      expect(header0.getAttribute('aria-controls')).to.equal(
        content0.getAttribute('id')
      );
      expect(header0.getAttribute('id')).to.equal(
        content0.getAttribute('aria-labelledby')
      );

      expect(header1.getAttribute('id')).to.equal('h2');
      expect(header1.getAttribute('aria-controls')).to.equal(
        content1.getAttribute('id')
      );
      expect(header1.getAttribute('id')).to.equal(
        content1.getAttribute('aria-labelledby')
      );

      expect(content2.getAttribute('id')).to.equal('c3');
      expect(header2.getAttribute('aria-controls')).to.equal(
        content2.getAttribute('id')
      );
      expect(header2.getAttribute('id')).to.equal(
        content2.getAttribute('aria-labelledby')
      );
    });

    it('should default role attribute unless role prop provided', () => {
      wrapper = mount(
        <BentoAccordion>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader role="cat">header1</BentoAccordionHeader>
            <BentoAccordionContent role="dog">content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={2}>
            <BentoAccordionHeader>header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );

      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(2);

      const header0 = sections.at(0).find('div').at(0).getDOMNode();
      const header1 = sections.at(1).find('div').at(0).getDOMNode();
      const content0 = sections.at(0).find('div').at(1).getDOMNode();
      const content1 = sections.at(1).find('div').at(1).getDOMNode();

      expect(header0).to.have.attribute('role');
      expect(header0.getAttribute('role')).to.equal('cat');
      expect(content0).to.have.attribute('role');
      expect(content0.getAttribute('role')).to.equal('dog');

      expect(header1).to.have.attribute('role');
      expect(header1.getAttribute('role')).to.equal('button');
      expect(content1).to.have.attribute('role');
      expect(content1.getAttribute('role')).to.equal('region');
    });

    it('should expand a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(1).find('div').at(0).simulate('click');

      // Expanded state.
      const header0 = sections.at(0).find('div').at(0).getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('true');
      const header1 = sections.at(1).find('div').at(0).getDOMNode();
      expect(header1.getAttribute('aria-expanded')).to.equal('true');

      // Contents.
      expect(sections.at(0).find('div').at(1).getDOMNode().hidden).to.be.false;
      expect(sections.at(1).find('div').at(1).getDOMNode().hidden).to.be.false;
    });

    it('should collapse a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(0).find('div').at(0).simulate('click');

      // Expanded state.
      expect(sections.at(0).getDOMNode()).to.not.have.attribute('expanded');

      // Contents.
      expect(
        sections
          .at(0)
          .find('div')
          .at(1)
          .getDOMNode()
          .className.includes('content-hidden')
      ).to.be.true;
    });

    it('should adjust state when expandSingleSection changes', async () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);

      function countExpanded() {
        const headers = [
          sections.at(0).find('div').first().getDOMNode(),
          sections.at(1).find('div').first().getDOMNode(),
          sections.at(2).find('div').first().getDOMNode(),
        ];
        return headers
          .map((header) => header.getAttribute('aria-expanded') === 'true')
          .reduce((sum, v) => sum + (v ? 1 : 0), 0);
      }

      expect(countExpanded()).to.equal(1);

      sections.at(1).find('div').at(0).simulate('click');
      expect(countExpanded()).to.equal(2);

      await new Promise((resolve) => {
        wrapper.setProps({expandSingleSection: true}, resolve);
      });

      // One of the expanded sections should be collapsed.
      expect(countExpanded()).to.equal(1);
    });
  });

  describe('single-expand accordion', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = mount(
        <BentoAccordion expandSingleSection>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader>header1</BentoAccordionHeader>
            <BentoAccordionContent>content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={2}>
            <BentoAccordionHeader>header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={3}>
            <BentoAccordionHeader>header3</BentoAccordionHeader>
            <BentoAccordionContent>content3</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('should expand a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);
      const header0 = sections.at(0).find('div').first().getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('true');

      // Click to expand.
      sections.at(1).find('div').at(0).simulate('click');

      // Expanded state.
      expect(header0.getAttribute('aria-expanded')).to.equal('false');
      const header1 = sections.at(1).find('div').first().getDOMNode();
      expect(header1.getAttribute('aria-expanded')).to.equal('true');

      // Contents.
      expect(
        sections
          .at(0)
          .find('div')
          .at(1)
          .getDOMNode()
          .className.includes('content-hidden')
      ).to.be.true;
      expect(
        sections
          .at(1)
          .find('div')
          .at(1)
          .getDOMNode()
          .className.includes('content-hidden')
      ).to.be.false;
    });

    it('should collapse a section on click', () => {
      const dom = wrapper.getDOMNode();
      expect(dom.localName).to.equal('section');

      const sections = wrapper.find(BentoAccordionSection);
      expect(sections).to.have.lengthOf(3);

      // Click to expand.
      sections.at(0).find('div').at(0).simulate('click');

      // Expanded state.
      const header0 = sections.at(0).find('div').first().getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('false');

      // Contents.
      expect(
        sections
          .at(0)
          .find('div')
          .at(1)
          .getDOMNode()
          .className.includes('content-hidden')
      ).to.be.true;
    });
  });

  describe('animate', () => {
    let wrapper;
    let animateStub;

    beforeEach(() => {
      animateStub = env.sandbox.stub(Element.prototype, 'animate');
      wrapper = mount(
        <BentoAccordion animate>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader>header1</BentoAccordionHeader>
            <BentoAccordionContent>content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={2}>
            <BentoAccordionHeader>header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );
      document.body.appendChild(wrapper.getDOMNode());
    });

    it('should not animate on mount', () => {
      expect(animateStub).to.not.be.called;
    });

    it('should animate expand on change', () => {
      const animation = {};
      animateStub.returns(animation);
      const sections = wrapper.find(BentoAccordionSection);
      const section = sections.at(1);
      const content = section.find('div').at(1).getDOMNode();

      // Click to expand.
      section.find('div').at(0).simulate('click');

      // The state is immediately reflected.
      const header0 = section.find('div').first().getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('true');
      expect(content.hidden).to.be.false;
      expect(content).to.have.display('block');

      // Animation has been started.
      expect(animateStub).to.be.calledOnce;

      const keyframes = animateStub.firstCall.firstArg;
      const lastFrame = keyframes[keyframes.length - 1];
      const options = animateStub.firstCall.args[1];

      expect(parseFloat(lastFrame.height)).to.be.greaterThan(1);
      expect(parseFloat(lastFrame.opacity)).to.equal(1);
      expect(lastFrame.overflowY).to.equal('hidden');

      expect(options.duration).to.be.greaterThan(100);
      expect(options.easing).to.be.ok;
    });

    it('should animate collapse on change', () => {
      const animation = {};
      animateStub.returns(animation);
      const sections = wrapper.find(BentoAccordionSection);
      const section = sections.at(0);
      const content = section.find('div').at(1).getDOMNode();

      // Click to expand.
      section.find('div').at(0).simulate('click');

      // The state is NOT immediately reflected: `aria-expanded` is updated, but
      // `content[hidden]` is deferred until animation is complete.
      const header0 = section.find('div').at(0).getDOMNode();
      expect(header0.getAttribute('aria-expanded')).to.equal('false');
      expect(content.className.includes('i-amphtml-animating')).to.be.true;
      expect(content).to.have.display('block');

      // Animation has been started.
      expect(animateStub).to.be.calledOnce;

      const keyframes = animateStub.firstCall.firstArg;
      const lastFrame = keyframes[keyframes.length - 1];
      const options = animateStub.firstCall.args[1];

      expect(parseFloat(lastFrame.height)).to.be.equal(0);
      expect(parseFloat(lastFrame.opacity)).to.equal(0);
      expect(lastFrame.overflowY).to.equal('hidden');

      expect(options.duration).to.be.greaterThan(100);
      expect(options.easing).to.be.ok;

      // Cleanup the animation.
      animation.onfinish();
      expect(content.className.includes('i-amphtml-animating')).to.be.false;
      expect(content.className.includes('content-hidden')).to.be.true;
    });

    it('should make animations cancelable', () => {
      const animation = {
        cancel: env.sandbox.spy(),
      };
      animateStub.onFirstCall().returns(animation).onSecondCall().returns({});
      const sections = wrapper.find(BentoAccordionSection);
      const section = sections.at(0);
      const content = section.find('div').at(1).getDOMNode();

      // Click to expand.
      section.find('div').at(0).simulate('click');
      expect(animateStub).to.be.calledOnce;

      // Currently animating
      expect(content.className.includes('i-amphtml-animating')).to.be.true;

      // Unclick. This should cancel the previous animation.
      section.find('div').at(0).simulate('click');
      expect(animateStub).to.be.calledTwice;

      expect(animation.cancel).to.be.calledOnce;
      animation.oncancel();
      expect(content.className.includes('i-amphtml-animating')).to.be.false;
    });

    it('should ignore animations if not available on the platform', () => {
      animateStub./*OK*/ restore();
      const sections = wrapper.find(BentoAccordionSection);
      const section = sections.at(0);
      const content = section.find('div').at(1).getDOMNode();
      env.sandbox.stub(content, 'animate').value(null);

      // Collapse a section.
      section.find('div').at(0).simulate('click');

      // Immediately hidden, which means animation has not been even tried.
      expect(content.className.includes('content-hidden')).to.be.true;
    });
  });

  describe('fire events on expand and collapse', () => {
    let wrapper;
    let ref;
    let onExpandStateChange;

    beforeEach(() => {
      onExpandStateChange = env.sandbox.spy();
      ref = Preact.createRef();

      wrapper = mount(
        <BentoAccordion ref={ref}>
          <BentoAccordionSection key={1} expanded>
            <BentoAccordionHeader>header1</BentoAccordionHeader>
            <BentoAccordionContent>content1</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection
            key={2}
            id="section2"
            onExpandStateChange={onExpandStateChange}
          >
            <BentoAccordionHeader>header2</BentoAccordionHeader>
            <BentoAccordionContent>content2</BentoAccordionContent>
          </BentoAccordionSection>
          <BentoAccordionSection key={3}>
            <BentoAccordionHeader>header3</BentoAccordionHeader>
            <BentoAccordionContent>content3</BentoAccordionContent>
          </BentoAccordionSection>
        </BentoAccordion>
      );
      document.body.appendChild(wrapper.getDOMNode());
    });

    it('should fire events on click', async () => {
      const sections = wrapper.find(BentoAccordionSection);

      // Expand
      sections.at(1).find('div').at(0).simulate('click');
      await waitFor(
        () => onExpandStateChange.callCount == 1,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(1);
      expect(onExpandStateChange.args[0][0]).to.be.true;

      // Collapse
      sections.at(1).find('div').at(0).simulate('click');
      await waitFor(
        () => onExpandStateChange.callCount == 2,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(2);
      expect(onExpandStateChange.args[1][0]).to.be.false;

      // Expand
      sections.at(1).find('div').at(0).simulate('click');
      await waitFor(
        () => onExpandStateChange.callCount == 3,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(3);
      expect(onExpandStateChange.args[2][0]).to.be.true;

      // Collapse
      sections.at(1).find('div').at(0).simulate('click');
      await waitFor(
        () => onExpandStateChange.callCount == 4,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(4);
      expect(onExpandStateChange.args[3][0]).to.be.false;
    });

    it('should fire events on API toggle', async () => {
      // Expand All
      ref.current.toggle();
      wrapper.update();
      await waitFor(
        () => onExpandStateChange.callCount == 1,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(1);
      expect(onExpandStateChange.args[0][0]).to.be.true;

      // Collapse All
      ref.current.collapse();
      wrapper.update();
      await waitFor(
        () => onExpandStateChange.callCount == 2,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(2);
      expect(onExpandStateChange.args[1][0]).to.be.false;

      // Collapsing an already collapsed section should do nothing
      ref.current.collapse('section2');
      wrapper.update();
      await waitFor(
        () => onExpandStateChange.callCount == 2,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(2);
      expect(onExpandStateChange.args[1][0]).to.be.false;

      // Expand All
      ref.current.expand();
      wrapper.update();
      await waitFor(
        () => onExpandStateChange.callCount == 3,
        'event callback called'
      );
      expect(onExpandStateChange.callCount).to.equal(3);
      expect(onExpandStateChange.args[2][0]).to.be.true;
    });
  });

  describe('imperative api', () => {
    let wrapper;
    let ref;

    let header0;
    let header1;
    let header2;

    describe('multi-expand accordion', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <BentoAccordion ref={ref}>
            <BentoAccordionSection key={1} expanded id="section1">
              <BentoAccordionHeader>header1</BentoAccordionHeader>
              <BentoAccordionContent>content1</BentoAccordionContent>
            </BentoAccordionSection>
            <BentoAccordionSection key={2} id="section2">
              <BentoAccordionHeader>header2</BentoAccordionHeader>
              <BentoAccordionContent>content2</BentoAccordionContent>
            </BentoAccordionSection>
            <BentoAccordionSection key={3}>
              <BentoAccordionHeader>header3</BentoAccordionHeader>
              <BentoAccordionContent>content3</BentoAccordionContent>
            </BentoAccordionSection>
          </BentoAccordion>
        );

        const sections = wrapper.find(BentoAccordionSection);
        header0 = sections.at(0).find('div').first().getDOMNode();
        header1 = sections.at(1).find('div').first().getDOMNode();
        header2 = sections.at(2).find('div').first().getDOMNode();
      });

      it('toggle all', () => {
        ref.current.toggle();
        wrapper.update();

        // All sections are toggled
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('true');
        expect(header2.getAttribute('aria-expanded')).to.equal('true');
      });

      it('toggle one section', async () => {
        ref.current.toggle('section1');
        wrapper.update();

        // Only section 1 is toggled
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('expand all', async () => {
        ref.current.expand();
        wrapper.update();

        // All sections are expanded
        expect(header0.getAttribute('aria-expanded')).to.equal('true');
        expect(header1.getAttribute('aria-expanded')).to.equal('true');
        expect(header2.getAttribute('aria-expanded')).to.equal('true');
      });

      it('expand one section', async () => {
        // Collapse first section to setup the test
        ref.current.collapse();
        wrapper.update();

        // Expand the first section
        ref.current.expand('section1');
        wrapper.update();

        // Only the first section is expanded
        expect(header0.getAttribute('aria-expanded')).to.equal('true');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('collapse all', async () => {
        ref.current.collapse();
        wrapper.update();

        // All sections are collapsed
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('collapse one section', async () => {
        ref.current.collapse('section1');
        wrapper.update();

        // Only the first section is collapsed
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });
    });

    describe('single-expand accordion', () => {
      beforeEach(() => {
        ref = Preact.createRef();
        wrapper = mount(
          <BentoAccordion ref={ref} expandSingleSection>
            <BentoAccordionSection key={1} expanded id="section1">
              <BentoAccordionHeader>header1</BentoAccordionHeader>
              <BentoAccordionContent>content1</BentoAccordionContent>
            </BentoAccordionSection>
            <BentoAccordionSection key={2} id="section2">
              <BentoAccordionHeader>header2</BentoAccordionHeader>
              <BentoAccordionContent>content2</BentoAccordionContent>
            </BentoAccordionSection>
            <BentoAccordionSection key={3}>
              <BentoAccordionHeader>header3</BentoAccordionHeader>
              <BentoAccordionContent>content3</BentoAccordionContent>
            </BentoAccordionSection>
          </BentoAccordion>
        );

        const sections = wrapper.find(BentoAccordionSection);
        header0 = sections.at(0).find('div').first().getDOMNode();
        header1 = sections.at(1).find('div').first().getDOMNode();
        header2 = sections.at(2).find('div').first().getDOMNode();
      });

      it('toggle all', async () => {
        ref.current.toggle();
        wrapper.update();

        // Accordion is unchanged (toggle does nothing for single-expand
        // accordion)
        expect(header0.getAttribute('aria-expanded')).to.equal('true');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('toggle one section', async () => {
        ref.current.toggle('section2');
        wrapper.update();

        // Verify that the second section is expanded and the first
        // section is un-expanded
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('true');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');

        ref.current.toggle('section2');
        wrapper.update();

        // Verify that the second section is collapsed
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('expand all', async () => {
        ref.current.expand();
        wrapper.update();

        // Accordion is unchanged (expand does nothing for single-expand
        // accordion)
        expect(header0.getAttribute('aria-expanded')).to.equal('true');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('expand one section', async () => {
        ref.current.expand('section2');
        wrapper.update();

        // Verify that the second section is expanded and the first
        // section is un-expanded
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('true');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('collapse all', async () => {
        ref.current.collapse();
        wrapper.update();

        // All sections are collapsed
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });

      it('collapse one section', async () => {
        ref.current.collapse('section1');
        wrapper.update();

        // Section 1 is collapsed
        expect(header0.getAttribute('aria-expanded')).to.equal('false');
        expect(header1.getAttribute('aria-expanded')).to.equal('false');
        expect(header2.getAttribute('aria-expanded')).to.equal('false');
      });
    });
  });
});

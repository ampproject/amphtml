import '../amp-accordion';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {Keys_Enum} from '#core/constants/key-codes';
import {createElementWithAttributes, tryFocus} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {htmlFor} from '#core/dom/static-template';
import {computedStyle} from '#core/dom/style';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {poll} from '#testing/iframe';

describes.realWin(
  'amp-accordion',
  {
    amp: {
      extensions: ['amp-accordion'],
    },
  },
  (env) => {
    let win, doc;
    let counter = 0;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      counter += 1;
    });

    function getAmpAccordionWithContents(contents, opt_shouldSetId) {
      win.sessionStorage.clear();
      const ampAccordion = doc.createElement('amp-accordion');
      if (opt_shouldSetId) {
        ampAccordion.setAttribute('id', `acc${counter}`);
      }
      for (let i = 0; i < contents.length; i++) {
        const section = doc.createElement('section');
        if (opt_shouldSetId) {
          section.setAttribute('id', `acc${counter}sec${i}`);
        }
        section.innerHTML = contents[i];
        ampAccordion.appendChild(section);
        if (i == 1) {
          section.setAttribute('expanded', '');
        }
      }
      doc.body.appendChild(ampAccordion);
      return ampAccordion
        .buildInternal()
        .then(() => ampAccordion.getImpl())
        .then((impl) => {
          impl.mutateElement = (fn) =>
            new Promise(() => {
              fn();
            });
          return ampAccordion.layoutCallback();
        })
        .then(() => ampAccordion);
    }

    function getAmpAccordion(opt_shouldSetId) {
      const contents = [0, 1, 2].map((i) => {
        return (
          '<h2 tabindex="0">' +
          `Section ${i}<span>nested stuff<span>` +
          `</h2><div id='test${i}'>Lorem ipsum</div>`
        );
      });
      return getAmpAccordionWithContents(contents, opt_shouldSetId);
    }

    /** Helper for invoking expand/collapse actions on amp-accordion. */
    function execute(
      impl,
      method,
      trust = ActionTrust_Enum.HIGH,
      opt_sectionId
    ) {
      const invocation = {
        method,
        trust,
        satisfiesTrust: (min) => trust >= min,
      };
      if (opt_sectionId) {
        invocation.args = {section: opt_sectionId};
      }
      impl.executeAction(invocation);
    }

    it('should expand when high trust toggle action is triggered on a collapsed section', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      impl.toggle_(headerElements[0].parentNode, ActionTrust_Enum.HIGH);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
    });

    it('multiple accordions should not have the same IDs on content', async () => {
      await getAmpAccordion();
      const contentElements = doc.getElementsByClassName(
        'i-amphtml-accordion-content'
      );
      for (let i = 0; i < contentElements.length; i++) {
        expect(contentElements[i].id.startsWith('_AMP_content_')).to.be.false;
      }
    });

    it('should collapse when high trust toggle action is triggered on a expanded section', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');

      impl.toggle_(headerElements[1].parentNode, ActionTrust_Enum.HIGH);

      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
    });

    it('should expand when expand action is triggered on a collapsed section', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      impl.toggle_(headerElements[0].parentNode, ActionTrust_Enum.HIGH, true);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
    });

    it(
      'should collapse other sections when expand action is triggered on a ' +
        'collapsed section if expand-single-section attribute is set',
      async () => {
        const ampAccordion = await getAmpAccordion();
        const impl = await ampAccordion.getImpl();
        ampAccordion.setAttribute('expand-single-section', '');
        expect(ampAccordion.hasAttribute('expand-single-section')).to.be.true;
        const headerElements = doc.querySelectorAll('section > *:first-child');
        // second section is expanded by default
        expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be
          .true;
        expect(headerElements[1].getAttribute('aria-expanded')).to.equal(
          'true'
        );
        // expand the first section
        impl.toggle_(headerElements[0].parentNode, ActionTrust_Enum.HIGH, true);
        // we expect the first section to be expanded
        expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be
          .true;
        expect(headerElements[0].getAttribute('aria-expanded')).to.equal(
          'true'
        );
        // we expect the second section to be collapsed
        expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be
          .false;
        expect(headerElements[1].getAttribute('aria-expanded')).to.equal(
          'false'
        );
      }
    );

    it('should expand when low trust toggle action is triggered on a collapsed section', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      impl.toggle_(headerElements[0].parentNode, ActionTrust_Enum.LOW);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse when low trust toggle action is triggered on an expanded section', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');

      impl.toggle_(headerElements[1].parentNode, ActionTrust_Enum.LOW);

      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
    });

    it(
      "should trigger a section's expand event the section is expanded " +
        'without animation',
      async () => {
        const ampAccordion = await getAmpAccordion(true);
        const impl = await ampAccordion.getImpl();

        impl.sections_[0].setAttribute(
          'on',
          `expand:acc${counter}.expand(section='acc${counter}sec${2}')`
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.false;
        impl.toggle_(impl.sections_[0], ActionTrust_Enum.HIGH, true);

        await poll('wait for first section to expand', () =>
          impl.sections_[0].hasAttribute('expanded')
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.true;
      }
    );

    it(
      "should trigger a section's collapse event the section is expanded " +
        'without animation',
      async () => {
        const ampAccordion = await getAmpAccordion(true);
        const impl = await ampAccordion.getImpl();

        impl.sections_[1].setAttribute(
          'on',
          `collapse:acc${counter}.expand(section='acc${counter}sec${2}')`
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.false;
        impl.toggle_(impl.sections_[1], ActionTrust_Enum.HIGH, false);

        await poll(
          'wait for first section to expand',
          () => !impl.sections_[1].hasAttribute('expanded')
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.true;
      }
    );

    it(
      "should trigger a section's expand event the section is expanded " +
        'with animation',
      async () => {
        const ampAccordion = await getAmpAccordion(true);
        const impl = await ampAccordion.getImpl();

        ampAccordion.setAttribute('animate', '');
        impl.sections_[0].setAttribute(
          'on',
          `expand:acc${counter}.expand(section='acc${counter}sec${2}')`
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.false;
        impl.toggle_(impl.sections_[0], ActionTrust_Enum.HIGH, true);

        await poll('wait for first section to expand', () =>
          impl.sections_[0].hasAttribute('expanded')
        );
        await poll('wait for second section to expand', () =>
          impl.sections_[2].hasAttribute('expanded')
        );
      }
    );

    it(
      "should trigger a section's collapse event the section is expanded " +
        'with animation',
      async () => {
        const ampAccordion = await getAmpAccordion(true);
        const impl = await ampAccordion.getImpl();

        ampAccordion.setAttribute('animate', '');
        impl.sections_[1].setAttribute(
          'on',
          `collapse:acc${counter}.expand(section='acc${counter}sec${2}')`
        );
        expect(impl.sections_[2].hasAttribute('expanded')).to.be.false;
        impl.toggle_(impl.sections_[1], ActionTrust_Enum.HIGH, false);

        await poll(
          'wait for first section to expand',
          () => !impl.sections_[1].hasAttribute('expanded')
        );
        await poll('wait for second section to expand', () =>
          impl.sections_[2].hasAttribute('expanded')
        );
      }
    );

    it('should size responsive children correctly when animating', async () => {
      const contents = [
        `
      <h2>Section header</h2>
      <amp-layout layout="responsive" width="3" height="2"></amp-layout>
    `,
      ];
      const ampAccordion = await getAmpAccordionWithContents(contents, true);
      const impl = await ampAccordion.getImpl();
      const firstSection = impl.sections_[0];
      const content = firstSection.querySelector('amp-layout');

      ampAccordion.setAttribute('animate', '');
      ampAccordion.style.width = '300px';
      impl.toggle_(firstSection, ActionTrust_Enum.HIGH, true);
      await poll('wait for first section to finish animating', () => {
        return (
          firstSection.hasAttribute('expanded') &&
          computedStyle(win, content).opacity == '1'
        );
      });

      expect(content.getBoundingClientRect()).to.include({
        width: 300,
        height: 200,
      });
    });

    it('should size fixed size children correctly when animating', async () => {
      const contents = [
        `
      <h2>Section header</h2>
      <amp-layout layout="fixed" width="300" height="200"></amp-layout>
    `,
      ];
      const ampAccordion = await getAmpAccordionWithContents(contents, true);
      const impl = await ampAccordion.getImpl();
      const firstSection = impl.sections_[0];
      const content = firstSection.querySelector('amp-layout');

      ampAccordion.setAttribute('animate', '');
      ampAccordion.style.width = '400px';
      impl.toggle_(firstSection, ActionTrust_Enum.HIGH, true);
      await poll('wait for first section to finish animating', () => {
        return (
          firstSection.hasAttribute('expanded') &&
          computedStyle(win, content).opacity == '1'
        );
      });

      expect(content.getBoundingClientRect()).to.include({
        width: 300,
        height: 200,
      });
    });

    it('should stay expanded on the expand action when expanded', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      impl.toggle_(headerElements[1].parentNode, ActionTrust_Enum.HIGH, true);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
    });

    it('should collapse on the collapse action when expanded', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      impl.toggle_(headerElements[1].parentNode, ActionTrust_Enum.HIGH, false);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
    });

    it('should stay collapsed on the collapse action when collapsed', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      impl.toggle_(headerElements[0].parentNode, ActionTrust_Enum.HIGH, false);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
    });

    it('should expand when header of a collapsed section is clicked', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const clickEvent = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: env.sandbox.spy(),
      };
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      impl.onHeaderPicked_(clickEvent);
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault.called).to.be.true;
    });

    it("should expand section when header's child is clicked", async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const header = headerElements[0];
      const child = doc.createElement('div');
      header.appendChild(child);
      const clickEvent = {
        target: child,
        currentTarget: header,
        preventDefault: env.sandbox.spy(),
      };
      expect(header.parentNode.hasAttribute('expanded')).to.be.false;
      expect(header.getAttribute('aria-expanded')).to.equal('false');
      impl.onHeaderPicked_(clickEvent);
      expect(header.parentNode.hasAttribute('expanded')).to.be.true;
      expect(header.getAttribute('aria-expanded')).to.equal('true');
      expect(clickEvent.preventDefault).to.have.been.called;
    });

    it('should collapse when header of an expanded section is clicked', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const clickEvent = {
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: env.sandbox.spy(),
      };
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('true');
      impl.onHeaderPicked_(clickEvent);
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[1].getAttribute('aria-expanded')).to.equal('false');
      expect(clickEvent.preventDefault).to.have.been.called;
    });

    it('should allow for clickable links in header', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const a = doc.createElement('a');
      headerElements[0].appendChild(a);
      const aClickEvent = {
        target: a,
        currentTarget: headerElements[0],
        preventDefault: env.sandbox.spy(),
      };
      impl.clickHandler_(aClickEvent);
      expect(aClickEvent.preventDefault).to.not.have.been.called;
    });

    it(
      'should expand when header of a collapsed section is ' +
        'activated via keyboard',
      async () => {
        const ampAccordion = await getAmpAccordion();
        const impl = await ampAccordion.getImpl();
        const headerElements = doc.querySelectorAll('section > *:first-child');
        const keyDownEvent = {
          key: Keys_Enum.SPACE,
          target: headerElements[0],
          currentTarget: headerElements[0],
          preventDefault: env.sandbox.spy(),
        };
        expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be
          .false;
        expect(headerElements[0].getAttribute('aria-expanded')).to.equal(
          'false'
        );
        impl.keyDownHandler_(keyDownEvent);
        expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be
          .true;
        expect(headerElements[0].getAttribute('aria-expanded')).to.equal(
          'true'
        );
        expect(keyDownEvent.preventDefault.called).to.be.true;
      }
    );

    it(
      "should NOT expand section when header's child is " +
        'activated via keyboard',
      async () => {
        const ampAccordion = await getAmpAccordion();
        const impl = await ampAccordion.getImpl();
        const headerElements = doc.querySelectorAll('section > *:first-child');
        const child = doc.createElement('div');
        headerElements[0].appendChild(child);
        const keyDownEvent = {
          key: Keys_Enum.ENTER,
          target: child,
          currentTarget: headerElements[0],
          preventDefault: env.sandbox.spy(),
        };
        expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be
          .false;
        expect(headerElements[0].getAttribute('aria-expanded')).to.equal(
          'false'
        );
        impl.keyDownHandler_(keyDownEvent);
        expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be
          .false;
        expect(headerElements[0].getAttribute('aria-expanded')).to.equal(
          'false'
        );
        expect(keyDownEvent.preventDefault.called).to.be.false;
      }
    );

    it(
      'should collapse when header of an expanded section is ' +
        'activated via keyboard',
      async () => {
        const ampAccordion = await getAmpAccordion();
        const impl = await ampAccordion.getImpl();
        const headerElements = doc.querySelectorAll('section > *:first-child');
        const keyDownEvent = {
          key: Keys_Enum.ENTER,
          target: headerElements[1],
          currentTarget: headerElements[1],
          preventDefault: env.sandbox.spy(),
        };
        expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be
          .true;
        expect(headerElements[1].getAttribute('aria-expanded')).to.equal(
          'true'
        );
        impl.keyDownHandler_(keyDownEvent);
        expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be
          .false;
        expect(headerElements[1].getAttribute('aria-expanded')).to.equal(
          'false'
        );
        expect(keyDownEvent.preventDefault.called).to.be.true;
      }
    );

    it(
      'should be navigable by up and down arrow keys when ' +
        'any header has focus',
      async () => {
        const ampAccordion = await getAmpAccordion();
        const impl = await ampAccordion.getImpl();
        const headerElements = doc.querySelectorAll('section > *:first-child');
        // Focus the first header,
        tryFocus(headerElements[0]);
        expect(doc.activeElement).to.equal(headerElements[0]);
        const upArrowEvent = {
          key: Keys_Enum.UP_ARROW,
          target: headerElements[0],
          currentTarget: headerElements[0],
          preventDefault: env.sandbox.spy(),
        };
        impl.keyDownHandler_(upArrowEvent);
        expect(doc.activeElement).to.equal(
          headerElements[headerElements.length - 1]
        );
        const downArrowEvent = {
          key: Keys_Enum.DOWN_ARROW,
          target: headerElements[headerElements.length - 1],
          currentTarget: headerElements[headerElements.length - 1],
          preventDefault: env.sandbox.spy(),
        };
        impl.keyDownHandler_(downArrowEvent);
        expect(doc.activeElement).to.equal(headerElements[0]);
      }
    );

    it('should return correct sessionStorageKey', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const url = win.location.href;
      impl.element.id = '321';
      const id = impl.getSessionStorageKey_();
      const correctId = 'amp-321-' + url;
      expect(id).to.be.equal(correctId);
    });

    it('should set sessionStorage on change in expansion', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const clickEventExpandElement = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: env.sandbox.spy(),
      };
      const clickEventCollapseElement = {
        target: headerElements[1],
        currentTarget: headerElements[1],
        preventDefault: env.sandbox.spy(),
      };
      expect(Object.keys(impl.currentState_)).to.have.length(0);
      impl.onHeaderPicked_(clickEventExpandElement);
      expect(Object.keys(impl.currentState_)).to.have.length(1);
      expect(impl.currentState_['test0']).to.be.true;
      impl.onHeaderPicked_(clickEventCollapseElement);
      expect(Object.keys(impl.currentState_)).to.have.length(2);
      expect(impl.currentState_['test0']).to.be.true;
      expect(impl.currentState_['test1']).to.be.false;
    });

    it('should respect session states and expand/collapse', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      let headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('false');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
      impl.getSessionState_ = function () {
        return {
          'test0': true,
        };
      };
      impl.buildCallback();
      headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
      impl.getSessionState_ = function () {
        return {
          'test0': true,
          'test1': false,
        };
      };
      impl.buildCallback();
      headerElements = doc.querySelectorAll('section > *:first-child');
      expect(headerElements[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements[0].getAttribute('aria-expanded')).to.equal('true');
      expect(headerElements[1].parentNode.hasAttribute('expanded')).to.be.false;
      expect(headerElements[2].parentNode.hasAttribute('expanded')).to.be.false;
    });

    it('should disable sessionStorage when opt-out', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const setSessionStateSpy = env.sandbox.spy();
      const getSessionStateSpy = env.sandbox.spy();
      impl.win.sessionStorage.setItem = function () {
        setSessionStateSpy();
      };
      impl.win.sessionStorage.getItem = function () {
        getSessionStateSpy();
      };

      ampAccordion.setAttribute('disable-session-states', null);
      impl.buildCallback();
      expect(Object.keys(impl.currentState_)).to.have.length(0);
      const headerElements = doc.querySelectorAll('section > *:first-child');
      const clickEventExpandElement = {
        target: headerElements[0],
        currentTarget: headerElements[0],
        preventDefault: env.sandbox.spy(),
      };
      impl.onHeaderPicked_(clickEventExpandElement);
      expect(getSessionStateSpy).to.not.have.been.called;
      expect(setSessionStateSpy).to.not.have.been.called;
      expect(Object.keys(impl.currentState_)).to.have.length(1);
    });

    it('two accordions should not affect each other', async () => {
      const ampAccordion = await getAmpAccordion();
      const impl = await ampAccordion.getImpl();
      const ampAccordion1 = ampAccordion;
      const ampAccordion2 = doc.createElement('amp-accordion');
      for (let i = 0; i < 3; i++) {
        const section = doc.createElement('section');
        section.innerHTML =
          '<h2>Section ' +
          i +
          "<span>nested stuff<span></h2><div id='test" +
          i +
          "'>Loreum ipsum</div>";
        ampAccordion2.appendChild(section);
      }
      doc.body.appendChild(ampAccordion2);
      await ampAccordion2.buildInternal();

      impl.mutateElement = (fn) => fn();
      await ampAccordion.layoutCallback();

      const headerElements1 = ampAccordion1.querySelectorAll(
        'section > *:first-child'
      );
      const clickEventElement = {
        target: headerElements1[0],
        currentTarget: headerElements1[0],
        preventDefault: env.sandbox.spy(),
      };
      impl.onHeaderPicked_(clickEventElement);
      const headerElements2 = ampAccordion2.querySelectorAll(
        'section > *:first-child'
      );
      expect(headerElements1[0].parentNode.hasAttribute('expanded')).to.be.true;
      expect(headerElements2[0].parentNode.hasAttribute('expanded')).to.be
        .false;
    });

    it('should trigger expand/collapse events', async () => {
      const ampAccordion = await getAmpAccordion(true);
      const impl = await ampAccordion.getImpl();

      const actions = impl.getActionServiceForTesting();
      env.sandbox.stub(actions, 'trigger');

      execute(impl, 'collapse', 123, `acc${counter}sec1`);

      expect(actions.trigger).to.be.calledOnce;
      expect(actions.trigger.getCall(0)).to.be.calledWith(
        /* element */ env.sandbox.match.has('tagName'),
        'collapse',
        /* event */ env.sandbox.match.has('detail'),
        /* trust */ 123
      );

      execute(impl, 'expand', 456, `acc${counter}sec1`);

      expect(actions.trigger).to.be.calledTwice;
      expect(actions.trigger.getCall(1)).to.be.calledWith(
        /* element */ env.sandbox.match.has('tagName'),
        'expand',
        /* event */ env.sandbox.match.has('detail'),
        /* trust */ 456
      );
    });

    it('should include a11y related attributes', async () => {
      await getAmpAccordion();

      const sectionElements = doc.querySelectorAll('section');
      expect(sectionElements.length).to.equal(3);

      const section0 = sectionElements[0];
      const section1 = sectionElements[1];
      const section2 = sectionElements[2];
      const {firstElementChild: header0, lastElementChild: content0} = section0;
      const {firstElementChild: header1, lastElementChild: content1} = section1;
      const {firstElementChild: header2, lastElementChild: content2} = section2;

      expect(header0).to.have.attribute('id');
      expect(header0.getAttribute('aria-controls')).to.equal('test0');
      expect(header0.getAttribute('tabindex')).to.equal('0');
      expect(header0.getAttribute('role')).to.equal('button');
      expect(content0).to.have.attribute('aria-labelledby');
      expect(content0.getAttribute('id')).to.equal('test0');
      expect(content0.getAttribute('role')).to.equal('region');
      expect(header0.getAttribute('aria-controls')).to.equal(
        content0.getAttribute('id')
      );
      expect(header0.getAttribute('id')).to.equal(
        content0.getAttribute('aria-labelledby')
      );

      expect(header1).to.have.attribute('id');
      expect(header1.getAttribute('aria-controls')).to.equal('test1');
      expect(header1.getAttribute('tabindex')).to.equal('0');
      expect(header1.getAttribute('role')).to.equal('button');
      expect(content1).to.have.attribute('aria-labelledby');
      expect(content1.getAttribute('id')).to.equal('test1');
      expect(content1.getAttribute('role')).to.equal('region');
      expect(header1.getAttribute('aria-controls')).to.equal(
        content1.getAttribute('id')
      );
      expect(header1.getAttribute('id')).to.equal(
        content1.getAttribute('aria-labelledby')
      );

      expect(header2).to.have.attribute('id');
      expect(header2.getAttribute('aria-controls')).to.equal('test2');
      expect(header2.getAttribute('tabindex')).to.equal('0');
      expect(header2.getAttribute('role')).to.equal('button');
      expect(content2).to.have.attribute('aria-labelledby');
      expect(content2.getAttribute('id')).to.equal('test2');
      expect(content2.getAttribute('role')).to.equal('region');
      expect(header2.getAttribute('aria-controls')).to.equal(
        content2.getAttribute('id')
      );
      expect(header2.getAttribute('id')).to.equal(
        content2.getAttribute('aria-labelledby')
      );
    });

    it('should respect pre-existing a11y related attributes', async () => {
      const contents = [0, 1, 2].map((i) => {
        return (
          '<h2 role="header" tabindex="0">' +
          `Section ${i}<span>nested stuff<span>` +
          `</h2><div id='test${i}' role="comment">Lorem ipsum</div>`
        );
      });
      await getAmpAccordionWithContents(contents);

      const sectionElements = doc.querySelectorAll('section');
      expect(sectionElements.length).to.equal(3);

      const section0 = sectionElements[0];
      const section1 = sectionElements[1];
      const section2 = sectionElements[2];
      const {firstElementChild: header0, lastElementChild: content0} = section0;
      const {firstElementChild: header1, lastElementChild: content1} = section1;
      const {firstElementChild: header2, lastElementChild: content2} = section2;

      expect(header0).to.have.attribute('id');
      expect(header0.getAttribute('aria-controls')).to.equal('test0');
      expect(header0.getAttribute('tabindex')).to.equal('0');
      expect(header0.getAttribute('role')).to.equal('header');
      expect(content0).to.have.attribute('aria-labelledby');
      expect(content0.getAttribute('id')).to.equal('test0');
      expect(content0.getAttribute('role')).to.equal('comment');
      expect(header0.getAttribute('aria-controls')).to.equal(
        content0.getAttribute('id')
      );
      expect(header0.getAttribute('id')).to.equal(
        content0.getAttribute('aria-labelledby')
      );

      expect(header1).to.have.attribute('id');
      expect(header1.getAttribute('aria-controls')).to.equal('test1');
      expect(header1.getAttribute('tabindex')).to.equal('0');
      expect(header1.getAttribute('role')).to.equal('header');
      expect(content1).to.have.attribute('aria-labelledby');
      expect(content1.getAttribute('id')).to.equal('test1');
      expect(content1.getAttribute('role')).to.equal('comment');
      expect(header1.getAttribute('aria-controls')).to.equal(
        content1.getAttribute('id')
      );
      expect(header1.getAttribute('id')).to.equal(
        content1.getAttribute('aria-labelledby')
      );

      expect(header2).to.have.attribute('id');
      expect(header2.getAttribute('aria-controls')).to.equal('test2');
      expect(header2.getAttribute('tabindex')).to.equal('0');
      expect(header2.getAttribute('role')).to.equal('header');
      expect(content2).to.have.attribute('aria-labelledby');
      expect(content2.getAttribute('id')).to.equal('test2');
      expect(content2.getAttribute('role')).to.equal('comment');
      expect(header2.getAttribute('aria-controls')).to.equal(
        content2.getAttribute('id')
      );
      expect(header2.getAttribute('id')).to.equal(
        content2.getAttribute('aria-labelledby')
      );
    });

    it('should throw an error when amp-bind used with expanded attribute ', async () => {
      const errors = [];
      const consoleError = console.error;
      console.error = (msg) => {
        errors.push(msg);
      };

      const html = htmlFor(win.document);
      const accordion = html`
        <amp-accordion animate>
          <section [expanded]="section1">
            <h2>Section 1</h2>
            <div>Puppies are cute.</div>
          </section>
        </amp-accordion>
      `;
      doc.body.appendChild(accordion);

      await accordion.buildInternal().catch((err) => {
        expect(err.message).to.include('The "expanded" attribute');
      });

      expect(errors.length).to.equal(1);
      expect(errors[0]).to.include('The "expanded" attribute');
      console.error = consoleError;
    });
  }
);

describes.realWin(
  'amp-accordion component with runtime on',
  {
    amp: {
      extensions: ['amp-accordion:0.1'],
      runtimeOn: true,
    },
  },
  (env) => {
    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);

      const element = createElementWithAttributes(
        env.win.document,
        'amp-accordion',
        {'layout': 'container'}
      );
      const section = env.win.document.createElement('section');
      section.appendChild(env.win.document.createElement('h1'));
      section.appendChild(env.win.document.createElement('p'));
      element.appendChild(section);
      env.win.document.body.appendChild(element);
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();

      ['toggle', 'expand', 'collapse'].forEach((method) => {
        action.execute(
          element,
          method,
          null,
          'source',
          'caller',
          'event',
          ActionTrust_Enum.HIGH
        );
        expect(element.enqueAction).to.be.calledWith(
          env.sandbox.match({
            actionEventType: '?',
            args: null,
            caller: 'caller',
            event: 'event',
            method,
            node: element,
            source: 'source',
            trust: ActionTrust_Enum.HIGH,
          })
        );
      });
    });
  }
);

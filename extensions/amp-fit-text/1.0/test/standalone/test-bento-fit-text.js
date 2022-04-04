import {CSS} from '#build/bento-fit-text-1.0.css';

import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';
import {computedStyle} from '#core/dom/style';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';

import {BaseElement as BentoFitText} from '../../base-element';
import {useStyles} from '../../component.jss';

describes.realWin(
  'bento-fit-text component',
  {
    amp: false,
  },
  (env) => {
    let win, doc;
    const styles = useStyles();

    async function waitForRender(element) {
      doc.body.appendChild(element);
      await element.getApi();
      await waitFor(
        () => !!element.shadowRoot?.querySelector('slot:not([name])'),
        'rendered'
      );
    }

    function getContent(fitTextElement) {
      return fitTextElement.shadowRoot.querySelector(
        `[class*=${styles['fitTextContent']}]`
      );
    }

    function getStyle(element, style) {
      return computedStyle(win, getContent(element))[style];
    }
    async function waitForStyle(element, property, value) {
      await waitFor(
        () => getStyle(element, property) === value,
        `${property} applied`
      );
    }
    function expectStyle(element, prop, value) {
      return expect(getStyle(element, prop)).to.equal(value);
    }

    async function expectAsyncStyle(element, property, value) {
      await waitForStyle(element, property, value);
      expectStyle(element, property, value);
    }

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      defineBentoElement('bento-fit-text', BentoFitText, win);
      adoptStyles(win, CSS);
    });

    it('renders', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');
    });

    it('respects min-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
        'min-font-size': 40,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '40px');
    });

    it('respects max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
        'max-font-size': 32,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '32px');
    });

    it('respects equal min-font-size and max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
        'min-font-size': 50,
        'max-font-size': 50,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '50px');
    });

    it('respects min-font-size over max-font-size', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
        'max-font-size': 40,
        'min-font-size': 50,
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, '50px');
    });

    it('supports update of textContent', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');

      const newText = 'updated';
      element.textContent = newText;
      const newAssignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(newAssignedNodes).to.have.lengthOf(1);
      expect(newAssignedNodes[0].nodeType).to.equal(3);
      expect(newAssignedNodes[0].wholeText).to.equal(newText);

      await expectAsyncStyle(element, 'fontSize', '27px');
    });

    it('re-calculates font size if a resize is detected by the measurer', async () => {
      const text = 'Lorem ipsum';
      const element = createElementWithAttributes(doc, 'bento-fit-text', {
        style: 'font-family: Arial; width: 100px; height: 200px;',
      });
      element.textContent = text;
      await waitForRender(element);

      const assignedNodes = element.shadowRoot
        .querySelector('slot:not([name])')
        .assignedNodes();
      expect(assignedNodes).to.have.lengthOf(1);
      expect(assignedNodes[0].nodeType).to.equal(3);
      expect(assignedNodes[0].wholeText).to.equal(text);
      await expectAsyncStyle(element, 'fontSize', '35px');

      element.style.width = '50px';
      element.style.height = '100px';
      await expectAsyncStyle(element, 'fontSize', '17px');
    });
  }
);

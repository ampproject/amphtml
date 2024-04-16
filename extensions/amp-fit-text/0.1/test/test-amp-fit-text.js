import {createDocument as createWorkerDomDoc} from '@ampproject/worker-dom/dist/server-lib.mjs';

import {createElementWithAttributes} from '#core/dom';

import {
  getDeterministicOuterHTML,
  hypenCaseToCamelCase,
  sleep,
} from '#testing/helpers';

import {AmpFitText, calculateFontSize_, updateOverflow_} from '../amp-fit-text';
import {buildDom} from '../build-dom';

describes.realWin(
  'amp-fit-text component',
  {
    amp: {
      extensions: ['amp-fit-text'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getFitText(text, opt_responsive) {
      const ft = doc.createElement('amp-fit-text');
      ft.setAttribute('width', '111');
      ft.setAttribute('height', '222');
      ft.style.fontFamily = 'Arial';
      ft.style.fontSize = '17px';
      ft.style.lineHeight = '17px';
      ft.style.overflow = 'hidden';
      ft.style.width = '111px';
      ft.style.height = '222px';
      ft.style.position = 'relative';
      if (opt_responsive) {
        ft.setAttribute('layout', 'responsive');
      }
      ft.textContent = text;
      doc.body.appendChild(ft);
      return ft
        .buildInternal()
        .then(() => ft.layoutCallback())
        .then(() => ft);
    }

    it('buildDom and buildCallback should result in the same outerHTML', async () => {
      const fitText1 = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '111px',
        height: '222px',
      });
      const fitText2 = fitText1.cloneNode(/* deep */ true);

      new AmpFitText(fitText1).buildCallback();
      buildDom(fitText2);

      expect(fitText1.outerHTML).to.equal(fitText2.outerHTML);
    });

    it('buildDom should behave same in browser and in WorkerDOM', async () => {
      const browserFitText = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '111px',
        height: '222px',
      });
      const workerFitText = createElementWithAttributes(
        createWorkerDomDoc(),
        'amp-fit-text',
        {
          width: '111px',
          height: '222px',
        }
      );

      buildDom(browserFitText);
      buildDom(workerFitText);

      const browserHtml = getDeterministicOuterHTML(browserFitText);
      const workerHtml = getDeterministicOuterHTML(workerFitText);
      expect(workerHtml).to.equal(browserHtml);
    });

    it('buildCallback should assign ivars even when server rendered', async () => {
      const fitText = createElementWithAttributes(doc, 'amp-fit-text', {
        width: '111px',
        height: '222px',
      });
      buildDom(fitText);
      fitText.setAttribute('i-amphtml-ssr', '');
      const baseElement = new AmpFitText(fitText);
      await baseElement.buildCallback();

      expect(baseElement.content_).ok;
      expect(baseElement.contentWrapper_).ok;
      expect(baseElement.measurer_).ok;
    });

    it('buildDom should throw if invalid server rendered dom', async () => {
      const fitText = createElementWithAttributes(doc, 'amp-fit-text', {
        'i-amphtml-ssr': '',
      });
      allowConsoleError(() => {
        expect(() => buildDom(fitText)).throws(/Invalid server render/);
      });
    });

    it('buildDom should not modify dom for server rendered element', async () => {
      const fitText = createElementWithAttributes(doc, 'amp-fit-text');
      buildDom(fitText);
      fitText.setAttribute('i-amphtml-ssr', '');

      const before = fitText.outerHTML;
      buildDom(fitText);
      const after = fitText.outerHTML;

      expect(before).equal(after);
    });

    it('renders', () => {
      const text = 'Lorem ipsum';
      return getFitText(text).then((ft) => {
        const content = ft.querySelector('.i-amphtml-fit-text-content');
        expect(content).to.not.equal(null);
        expect(content.textContent).to.equal(text);
        expect(ft.textContent).to.equal(text);
      });
    });

    it('supports update of textContent', async () => {
      const ft = await getFitText('Lorem ipsum');
      const impl = await ft.getImpl();
      const newText = 'updated';
      ft.textContent = newText;
      expect(ft.textContent).to.equal(newText);
      await impl.mutateElement(() => {});
      const content = ft.querySelector('.i-amphtml-fit-text-content');
      expect(content.textContent).to.equal(newText);
    });

    it('re-calculates font size if a resize is detected by the measurer', async () => {
      const ft = await getFitText(
        'Lorem ipsum dolor sit amet, has nisl nihil convenire et, vim at aeque inermis reprehendunt.'
      );
      const impl = await ft.getImpl();
      const updateFontSizeSpy = env.sandbox.spy(impl, 'updateFontSize_');

      // Wait for the resizeObserver recognize the changes
      // 90ms chosen so that the wait is less than the throttle value for the ResizeObserver.
      await sleep(90);
      // Verify that layoutCallback calls updateFontSize.
      expect(updateFontSizeSpy).to.be.calledOnce;
      updateFontSizeSpy.resetHistory();
      // Modify the size of the fit-text box.
      ft.setAttribute('width', '50');
      ft.setAttribute('height', '100');
      ft.style.width = '50px';
      ft.style.height = '100px';

      // Wait for the resizeObserver recognize the changes
      // 90ms chosen so that the wait is less than the throttle value for the ResizeObserver.
      await sleep(90);
      // Verify that the ResizeObserver calls updateFontSize.
      expect(updateFontSizeSpy).to.be.calledOnce;
    });
  }
);

describes.realWin('amp-fit-text calculateFontSize', {}, (env) => {
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
    element.style.visibility = 'hidden';
    doc.body.appendChild(element);
  });

  it('should always fit on one line w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 20, 200, 6, 72)).to.equal(20);
    expect(calculateFontSize_(element, 10, 200, 6, 72)).to.equal(10);
    expect(calculateFontSize_(element, 40, 200, 6, 72)).to.equal(40);
  });

  it('should always fit the width w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 10, 6, 72)).to.equal(15);
    expect(calculateFontSize_(element, 200, 20, 6, 72)).to.equal(30);
    expect(calculateFontSize_(element, 200, 40, 6, 72)).to.equal(60);
  });

  it('should hit min w/ small height and enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 6, 200, 6, 72)).to.equal(6);
    expect(calculateFontSize_(element, 3, 200, 6, 72)).to.equal(6);
  });

  it('should hit min w/ small width and enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 2, 6, 72)).to.equal(6);
    expect(calculateFontSize_(element, 200, 4, 6, 72)).to.equal(6);
  });

  it('should hit max w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 72, 200, 6, 72)).to.equal(72);
    expect(calculateFontSize_(element, 80, 200, 6, 72)).to.equal(72);
  });

  it('should hit max w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 48, 6, 72)).to.equal(72);
    expect(calculateFontSize_(element, 200, 60, 6, 72)).to.equal(72);
  });

  it('should always fit on two lines w/ enough width', () => {
    element./*OK*/ innerHTML = 'A<br>B';
    expect(calculateFontSize_(element, 20, 200, 6, 72)).to.equal(10);
  });
});

describes.realWin('amp-fit-text updateOverflow', {}, (env) => {
  let win, doc;
  let content;
  let classToggles;
  let measurer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    classToggles = {};
    content = {
      style: {
        setProperty(name, value) {
          content.style[hypenCaseToCamelCase(name)] = value;
        },
      },
      classList: {
        toggle: (className, on) => {
          classToggles[className] = on;
        },
      },
    };

    measurer = doc.createElement('div');
    measurer.style.fontFamily = 'Arial';
    measurer.style.lineHeight = '1.15em';
    measurer.style.position = 'absolute';
    measurer.style.width = '300px';
    doc.body.appendChild(measurer);
  });

  function getLineClamp() {
    for (const k in content.style) {
      if (k == 'lineClamp' || k.match(/.*LineClamp/)) {
        return content.style[k];
      }
    }
    return null;
  }

  it('should always fit on one line', () => {
    measurer./*OK*/ innerHTML = 'A';
    updateOverflow_(content, measurer, 24, 20);
    expect(classToggles['i-amphtml-fit-text-content-overflown']).to.be.false;
    expect(getLineClamp()).to.equal('');
    expect(content.style.maxHeight).to.equal('');
  });

  it('should always fit on two lines', () => {
    measurer./*OK*/ innerHTML = 'A<br>B';
    updateOverflow_(content, measurer, 24, 20);
    expect(classToggles['i-amphtml-fit-text-content-overflown']).to.equal(true);
    expect(getLineClamp()).to.equal(1);
    expect(content.style.maxHeight).to.equal(23 + 'px'); // 23 = 20 * 1.15
  });
});

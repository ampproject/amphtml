import '../amp-truncate-text';
import {setStyles} from '#core/dom/style';
import {toArray} from '#core/types/array';

import {toggleExperiment} from '#experiments';

import {macroTask} from '#testing/helpers';

// Lint complains about a template string due to lines being too long.
const loremText =
  '        \r\n' +
  '   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ' +
  'ullamcorper turpis vel commodo scelerisque. Phasellus\r\n' +
  '   luctus nunc ut elit cursus, et imperdiet diam vehicula. Duis et nisi' +
  'sed urna blandit bibendum et sit amet erat.\r\n' +
  '   Suspendisse potenti. Curabitur consequat volutpat arcu nec elementum. ' +
  'Etiam a turpis ac libero varius condimentum.\r\n' +
  '   Maecenas sollicitudin felis aliquam tortor vulputate, ac posuere velit ' +
  'semper.\r\n        ';

describes.realWin(
  'amp-truncate-text',
  {
    amp: {
      extensions: ['amp-truncate-text'],
    },
  },
  (env) => {
    let doc;
    let win;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    /**
     * @param {{
     *   useShadow: boolean,
     * }} options
     */
    function createTests({useShadow}) {
      beforeEach(() => {
        if (useShadow) {
          toggleExperiment(win, 'amp-truncate-text-shadow', true);
        }
      });

      async function createElement(
        content,
        {container = doc.body, height, layout = 'fixed', width}
      ) {
        const element = win.document.createElement('amp-truncate-text');
        element.setAttribute('layout', layout);
        element.setAttribute('width', width);
        element.setAttribute('height', height);
        setStyles(element, {
          fontSize: '10px',
          lineHeight: '1.3',
        });
        element.innerHTML = content;
        container.appendChild(element);
        await element.buildInternal();
        await element.layoutCallback();
        await macroTask();

        return element;
      }

      function getChildNodes(element) {
        if (element.shadowRoot) {
          return element.childNodes;
        }

        return toArray(element.querySelectorAll('[class$="-slot"]'))
          .map((c) => toArray(c.childNodes))
          .reduce((acc, c) => acc.concat(c), []);
      }

      function getTextContent(element) {
        return element.shadowRoot
          ? element.textContent
          : element.querySelector('.i-amphtml-default-slot').textContent;
      }

      describe(useShadow ? 'using Shadow DOM' : 'without Shadow DOM', () => {
        it('should truncate text for a single Text Node', async () => {
          const element = await createElement(loremText, {
            width: 150,
            height: 26,
          });

          expect(element.scrollHeight).to.equal(26);
          expect(getTextContent(element)).to.match(/… $/);
        });

        it('should not truncate text for short text', async () => {
          const element = await createElement('\n  Hello world\n  ', {
            width: 150,
            height: 26,
          });

          expect(element.scrollHeight).to.equal(26);
          // Leading/trailing whitespace should be preserved.
          expect(getTextContent(element)).to.equal('\n  Hello world\n  ');
        });

        it('should clear out text nodes after the overflow', async () => {
          const element = await createElement(
            `
          ${loremText}
          <span></span>
          world
        `,
            {
              width: 150,
              height: 26,
            }
          );
          const childNodes = getChildNodes(element);
          const endTextNode = childNodes[2];

          expect(childNodes).to.have.length(3);
          expect(endTextNode.textContent.trim()).to.be.empty;
          expect(element.scrollHeight).to.equal(26);
        });

        it('should hide content after the overlow', async () => {
          const element = await createElement(
            `
          ${loremText}
          <button style="padding: 6px">Hello</button>
          world
        `,
            {
              width: 150,
              height: 26,
            }
          );
          const button = element.querySelector('button');

          expect(button.offsetHeight).to.equal(0);
          expect(element.scrollHeight).to.equal(26);
        });

        it('should hide elements that do not fit', async () => {
          const element = await createElement(
            `
          hello world
          <button style="padding: 6px">Hello</button>
        `,
            {
              width: 150,
              height: 13,
            }
          );
          const button = element.querySelector('button');

          expect(button.offsetHeight).to.equal(0);
          expect(element.scrollHeight).to.equal(13);
        });

        it('should not ellipsize empty text nodes', async () => {
          const element = await createElement(
            `
          ${loremText}
          <span></span>
          <span></span>
        `,
            {
              width: 150,
              height: 26,
            }
          );
          const childNodes = getChildNodes(element);
          const emptyTextNode = childNodes[2];

          expect(childNodes).to.have.length(5);
          expect(emptyTextNode.textContent.trim()).to.be.empty;
          expect(element.scrollHeight).to.equal(26);
        });

        it('should restore text nodes on re-layout', async () => {
          const element = await createElement('Hello world', {
            width: 10,
            height: 13,
          });

          expect(element.scrollHeight).to.equal(13);
          expect(getTextContent(element)).to.match(/… $/);

          setStyles(element, {
            width: '80px',
            height: '13px',
          });
          await element.layoutCallback();

          expect(getTextContent(element)).to.equal('Hello world');
          expect(element.scrollHeight).to.equal(13);
        });

        it('should restore content on re-layout', async () => {
          const element = await createElement(
            `
          Hello world this is some text that wraps and pushes off the button
          <button>Hello</button>
        `,
            {
              width: 40,
              height: 26,
            }
          );
          const button = element.querySelector('button');

          expect(button.offsetHeight).to.equal(0);
          expect(button.offsetWidth).to.equal(0);

          setStyles(element, {
            width: '200px',
            height: '80px',
          });
          await element.layoutCallback();

          expect(button.offsetHeight).to.be.gt(0);
          expect(button.offsetWidth).to.be.gt(0);
        });

        it('should truncate again on re-layout', async () => {
          const element = await createElement('Hello world', {
            width: 10,
            height: 13,
          });

          expect(element.scrollHeight).to.equal(13);
          expect(getTextContent(element)).to.match(/… $/);

          setStyles(element, {
            width: '24px',
            height: '13px',
          });
          await element.layoutCallback();

          expect(element.scrollHeight).to.equal(13);
          expect(getTextContent(element)).to.match(/… $/);
        });

        it('should truncate again on text changes', async () => {
          const element = await createElement('Hello world', {
            width: 10,
            height: 13,
          });
          const impl = await element.getImpl(false);
          const childNodes = getChildNodes(element);

          childNodes[0].data = 'Good night and good luck';
          await impl.mutateElement(() => {});

          expect(element.scrollHeight).to.equal(13);
          expect(getTextContent(element)).to.match(/^Good/);
          expect(getTextContent(element)).to.match(/… $/);
        });

        describe('overflow element', () => {
          it('should be shown when overflowing', async () => {
            const element = await createElement(
              `
            ${loremText}
            <button slot="collapsed" style="padding: 2px">
              See more
            </button>
            world
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const button = element.querySelector('button');

            expect(button.offsetHeight).to.gt(0);
            expect(button.offsetWidth).to.gt(0);
            expect(button.offsetTop + button.offsetHeight).to.be.lte(
              element.offsetTop + element.offsetHeight
            );
            expect(button.textContent.trim()).to.equal('See more');
            expect(element.scrollHeight).to.equal(26);
          });

          it('should be hidden when not overflowing', async () => {
            const element = await createElement(
              `
            Hello world
            <button slot="collapsed" style="padding: 2px">
              See more
            </button>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const button = element.querySelector('button');

            expect(button.offsetHeight).to.equal(0);
            expect(button.offsetWidth).to.equal(0);
            expect(element.scrollHeight).to.equal(26);
          });

          it('should be hidden when not overflowing after re-layout', async () => {
            const element = await createElement(
              `
            ${loremText}
            <button slot="collapsed" style="padding: 6px">
              See more
            </button>
            world
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const button = element.querySelector('button');

            setStyles(element, {
              width: '400px',
              height: '600px',
            });
            element.layoutCallback();
            await macroTask();

            expect(button.offsetHeight).to.equal(0);
            expect(button.offsetWidth).to.equal(0);
            expect(element.scrollHeight).to.equal(600);
          });
        });

        describe('expand / collapse', () => {
          it('should hide the collapse element when not overflowing', async () => {
            const element = await createElement(
              `
            ${loremText}
            <span slot="collapsed">See more</span>
            <span slot="expanded">See more</span>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const collapseEl = element.querySelector('[slot="expanded"]');

            expect(collapseEl.offsetHeight).to.equal(0);
            expect(collapseEl.offsetWidth).to.equal(0);
          });

          it('should expand when clicking the expand element', async () => {
            const element = await createElement(
              `
            ${loremText}
            <span slot="collapsed">See more</span>
            <span slot="expanded">See more</span>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const expandEl = element.querySelector('[slot="collapsed"]');
            const collapseEl = element.querySelector('[slot="expanded"]');

            expandEl.click();
            await macroTask();

            expect(element.scrollHeight).to.be.gt(26);
            expect(element.scrollHeight).to.equal(element.offsetHeight);
            expect(collapseEl.offsetHeight).to.be.gt(0);
            expect(collapseEl.offsetWidth).to.be.gt(0);
          });

          it('should hide any sizer element when expanded', async () => {
            const element = await createElement(
              `
              ${loremText}
              <span slot="collapsed">See more</span>
              <span slot="expanded">See more</span>
            `,
              {
                layout: 'responsive',
                width: 150,
                height: 26,
              }
            );
            element.style.width = '150px';

            const expandEl = element.querySelector('[slot="collapsed"]');
            const sizer = element.querySelector('i-amphtml-sizer');

            expect(sizer.getBoundingClientRect()).to.include({
              width: 150,
              height: 26,
            });

            expandEl.click();
            await macroTask();

            expect(sizer.getBoundingClientRect()).to.include({
              width: 0,
              height: 0,
            });
            expect(element.scrollHeight).to.be.gt(26);
            expect(element.scrollHeight).to.equal(element.offsetHeight);
          });

          it('should collapse when clicking the collapse element', async () => {
            const element = await createElement(
              `
            ${loremText}
            <span slot="collapsed">See more</span>
            <span slot="expanded">See more</span>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const expandEl = element.querySelector('[slot="collapsed"]');
            const collapseEl = element.querySelector('[slot="expanded"]');

            expandEl.click();
            await macroTask();
            collapseEl.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
            expect(element.scrollHeight).to.equal(26);
            expect(collapseEl.offsetHeight).to.equal(0);
            expect(collapseEl.offsetWidth).to.equal(0);
          });
        });

        describe('persistent slot', () => {
          it('should show when overflowing', async () => {
            const element = await createElement(
              `
            ${loremText}
            <span slot="persistent">See more</span>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const persistentEl = element.querySelector('[slot="persistent"]');

            expect(persistentEl.offsetHeight).to.be.gt(0);
            expect(persistentEl.offsetWidth).to.be.gt(0);
          });

          it('should show when not overflowing', async () => {
            const element = await createElement(
              `
            Foo
            <span slot="persistent">See more</span>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const persistentEl = element.querySelector('[slot="persistent"]');

            expect(persistentEl.offsetHeight).to.be.gt(0);
            expect(persistentEl.offsetWidth).to.be.gt(0);
          });
        });

        describe('custom expand', () => {
          it('should not expand inline when using an anchor tag', async () => {
            const element = await createElement(
              `
            ${loremText}
            <a href="#" slot="collapsed">See <span>more</span></a>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            const expandSpan = element.querySelector('[slot="collapsed"] span');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });

          it('should not expand when component is within an anchor', async () => {
            const container = win.document.createElement('a');
            container.href = '#';
            doc.body.appendChild(container);
            const element = await createElement(
              `
            ${loremText}
            <span slot="collapsed">See more</span>
          `,
              {
                width: 150,
                height: 26,
                container,
              }
            );
            const expandSpan = element.querySelector('[slot="collapsed"]');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });

          it('should not expand inline when using a tap action', async () => {
            const element = await createElement(
              `
            ${loremText}
            <button slot="collapsed" on="tap:foo.scrollTo">See more</button>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            element.id = 'foo';
            const expandSpan = element.querySelector('[slot="collapsed"]');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });

          it('should not expand inline when a parent has a tap action', async () => {
            const element = await createElement(
              `
            ${loremText}
            <button slot="collapsed" on="tap:foo.scrollTo">See <span>more</span></button>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            element.id = 'foo';
            const expandSpan = element.querySelector('[slot="collapsed"] span');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });

          it('should not expand inline when using a child tap action', async () => {
            const element = await createElement(
              `
            ${loremText}
            <button slot="collapsed">See <span on="tap:foo.scrollTo">more</span></button>
          `,
              {
                width: 150,
                height: 26,
              }
            );
            element.id = 'foo';
            const expandSpan = element.querySelector('[slot="collapsed"] span');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });

          it('should not expand when a component ancestor has a tap action', async () => {
            const container = win.document.createElement('div');
            container.setAttribute('on', 'tap:foo.scrollTo');
            container.id = 'foo';
            doc.body.appendChild(container);
            const element = await createElement(
              `
            ${loremText}
            <span slot="collapsed">See more</span>
          `,
              {
                width: 150,
                height: 26,
                container,
              }
            );
            const expandSpan = element.querySelector('[slot="collapsed"]');

            expandSpan.click();
            await macroTask();

            expect(element.offsetHeight).to.equal(26);
          });
        });
      });
    }

    createTests({
      useShadow: true,
    });
    createTests({
      useShadow: false,
    });
  }
);

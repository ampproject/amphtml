import {mount} from 'enzyme';

import * as Preact from '#preact';
import * as intersectionObserver from '#preact/component/intersection-observer';
import {xhrUtils} from '#preact/utils/xhr';

import {waitFor} from '#testing/helpers/service';

import {BentoList} from '../component/component';

const CONTENTS = '[test-id="contents"]';

describes.sandboxed('BentoList preact component v1.0', {}, (env) => {
  let dataStub;
  beforeEach(() => {
    dataStub = env.sandbox.stub().resolves({items: ['one', 'two', 'three']});
    env.sandbox.stub(xhrUtils, 'fetchJson').resolves({json: dataStub});
  });

  async function waitForData(component, callCount = 1) {
    await waitFor(
      () => dataStub.callCount === callCount,
      'expected fetchJson to have been called' +
        (callCount > 1 ? ` ${callCount} times` : '')
    );
    // Ensure everything has settled:
    await new Promise((r) => setTimeout(r, 0));
    component.update();
  }

  describe('default behavior', () => {
    it('should render a "loading" state first', async () => {
      const component = mount(<BentoList src="" />);

      expect(component.text()).to.equal('Loading...');
    });

    it('should load data, and display in a list', async () => {
      const component = mount(<BentoList src="TEST.json" />);
      expect(component.text()).to.equal('Loading...');

      expect(component.find('p')).to.have.length(0);

      await waitForData(component);

      expect(xhrUtils.fetchJson).calledWith('TEST.json');

      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p><p>two</p><p>three</p></div>`
      );
    });

    it('the list should have aria-roles defined', async () => {
      const component = mount(<BentoList src="TEST.json" />);

      await waitForData(component);

      expect(component.find(CONTENTS).html()).to.equal(
        `<div role="list"><p role="listitem">one</p><p role="listitem">two</p><p role="listitem">three</p></div>`
      );
    });

    it("changing the 'src' should fetch the data", async () => {
      const component = mount(<BentoList src="TEST.json" />);
      expect(component.text()).to.equal('Loading...');

      await waitForData(component);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p><p>two</p><p>three</p></div>`
      );

      dataStub.resolves({items: ['second', 'request']});

      // Prop doesn't change, no fetch:
      component.setProps({src: 'TEST.json'});
      expect(xhrUtils.fetchJson).callCount(1);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p><p>two</p><p>three</p></div>`
      );

      // Prop changes, new fetch:
      component.setProps({src: 'TEST2.json'});
      expect(xhrUtils.fetchJson).callCount(2).calledWith('TEST2.json');
      await waitForData(component, 2);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>second</p><p>request</p></div>`
      );
    });
  });

  describe('itemsKey', () => {
    describe('with a flat array payload', () => {
      const results = ['flat', 'array'];
      beforeEach(() => {
        dataStub.resolves(results);
      });
      it('by default, it should not render the data', async () => {
        const component = mount(<BentoList src="" />);
        await waitForData(component);

        expect(component.text()).to.equal('');
      });
      it('itemsKey="" should render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="" />);
        await waitForData(component);

        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>flat</p><p>array</p></div>'
        );
      });
      it('itemsKey="." should also render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="." />);
        await waitForData(component);

        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>flat</p><p>array</p></div>'
        );
      });
    });

    describe('when a custom itemsKey is supplied', () => {
      beforeEach(() => {
        dataStub.resolves({
          NUMBERS: [1, 2, 3],
          LETTERS: ['A', 'B', 'C'],
          NESTED: {
            OBJECTS: {
              TOO: ['ONE', 'TWO', 'THREE'],
            },
          },
        });
      });
      it('should extract the correct property', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>1</p><p>2</p><p>3</p></div>'
        );
      });
      it('changing itemsKey should not require refetching the data', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>1</p><p>2</p><p>3</p></div>'
        );

        component.setProps({itemsKey: 'LETTERS'});
        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>A</p><p>B</p><p>C</p></div>'
        );

        component.setProps({itemsKey: 'NUMBERS'});
        expect(snapshot(component.find(CONTENTS))).to.equal(
          '<div><p>1</p><p>2</p><p>3</p></div>'
        );

        // Ensure data was only fetched once!
        expect(dataStub).callCount(1);
      });
      describe('dot-separated lists', () => {
        it('should access dot-separated property lists', async () => {
          const component = mount(
            <BentoList src="" itemsKey="NESTED.OBJECTS.TOO" />
          );
          await waitForData(component);

          expect(snapshot(component.find(CONTENTS))).to.equal(
            '<div><p>ONE</p><p>TWO</p><p>THREE</p></div>'
          );
        });
        it('should fail gracefully when the properties are not defined', async () => {
          const component = mount(<BentoList src="" itemsKey="invalid" />);
          await waitForData(component);

          expect(component.text()).to.equal('');

          component.setProps({itemsKey: 'invalid.invalid'});
          expect(component.text()).to.equal('');

          component.setProps({itemsKey: 'LETTERS.invalid'});
          expect(component.text()).to.equal('');

          component.setProps({itemsKey: 'NESTED.invalid.invalid'});
          expect(component.text()).to.equal('');

          component.setProps({itemsKey: 'NESTED.OBJECTS.invalid'});
          expect(component.text()).to.equal('');

          component.setProps({itemsKey: 'NESTED.OBJECTS.TOO.invalid'});
          expect(component.text()).to.equal('');

          // Just to ensure it DOES indeed work when valid:
          component.setProps({itemsKey: 'NESTED.OBJECTS.TOO'});
          expect(component.text()).to.equal('ONETWOTHREE');
        });
      });
    });
  });

  describe('maxItems', () => {
    it('should limit the max number of items', async () => {
      const component = mount(<BentoList src="TEST.json" maxItems={1} />);
      await waitForData(component);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p></div>`
      );
    });
    it('should do nothing if there are already fewer items', async () => {
      const component = mount(<BentoList src="TEST.json" maxItems={99} />);
      await waitForData(component);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p><p>two</p><p>three</p></div>`
      );
    });
  });

  describe('resetOnRefresh', () => {
    async function testROR({expectedWhileRefreshing, render}) {
      const ref = Preact.createRef();
      const component = mount(render({ref}));
      await waitForData(component);

      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>one</p><p>two</p><p>three</p></div>`
      );

      dataStub.resolves({items: ['a', 'b', 'c']});
      ref.current.refresh();
      component.update();
      expect(snapshot(component.find(CONTENTS))).to.equal(
        expectedWhileRefreshing
      );

      await waitForData(component, 2);
      expect(snapshot(component.find(CONTENTS))).to.equal(
        `<div><p>a</p><p>b</p><p>c</p></div>`
      );
    }

    it('should normally show old results while refreshing', async () => {
      await testROR({
        render: (p) => <BentoList {...p} src="TEST" resetOnRefresh={false} />,
        expectedWhileRefreshing: `<div><p>one</p><p>two</p><p>three</p></div>`,
      });
    });
    it("should show the 'Loading' indicator when resetOnRefresh is enabled", async () => {
      await testROR({
        render: (p) => <BentoList {...p} src="TEST" resetOnRefresh />,
        expectedWhileRefreshing: `Loading...`,
      });
    });
  });

  describe('template', () => {
    it.skip('should allow for custom rendering of the data', async () => {});
  });

  describe('load-more', () => {
    const mockData = [
      {
        items: ['one', 'two', 'three'],
        'load-more-src': 'page-2.json',
      },
      {
        items: ['four', 'five'],
        'load-more-src': 'page-3.json',
      },
      {
        items: ['six', 'seven', 'eight', 'nine'],
        'load-more-src': null,
      },
    ];
    beforeEach(() => {
      mockData.forEach((page, index) => {
        dataStub.onCall(index).resolves(page);
      });
    });
    describe('manual', () => {
      const expectedPage1 = `<div><p>one</p><p>two</p><p>three</p></div><button>Load more</button>`;
      const expectedPage2 = `<div><p>one</p><p>two</p><p>three</p><p>four</p><p>five</p></div><button>Load more</button>`;
      const expectedPage3 = `<div><p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p></div>`;

      let component;
      beforeEach(async () => {
        component = mount(<BentoList src="page-1.json" loadMore="manual" />);
        await waitForData(component);
      });

      it('should render a "Load more" button', async () => {
        expect(component.find('button').html()).to.equal(
          `<button>Load more</button>`
        );
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage1);
      });

      it('clicking the button should keep loading more data', async () => {
        // Check page 1:
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage1);

        // Load page 2:
        component.find('button').simulate('click');
        expect(xhrUtils.fetchJson).callCount(2).calledWith('page-2.json');
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage1);
        await waitForData(component, 2);
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage2);

        // Load page 3:
        component.find('button').simulate('click');
        expect(xhrUtils.fetchJson).callCount(3).calledWith('page-3.json');
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage2);
        await waitForData(component, 3);
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage3);
      });

      describe('loadMoreBookmark', () => {
        it('', async () => {
          //
        });
      });
    });
    describe('auto', () => {
      beforeEach(() => {
        env.sandbox
          .stub(intersectionObserver, 'useIsInViewport')
          .returns(false);
      });
      function simulateViewportVisible(component, isInViewport) {
        intersectionObserver.useIsInViewport.returns(isInViewport);
        component.setProps({}); // trigger a rerender
      }

      const expectedPage1 = `<div><p>one</p><p>two</p><p>three</p></div><span></span>`;
      const expectedPage2 = `<div><p>one</p><p>two</p><p>three</p><p>four</p><p>five</p></div><span></span>`;
      const expectedPage3 = `<div><p>one</p><p>two</p><p>three</p><p>four</p><p>five</p><p>six</p><p>seven</p><p>eight</p><p>nine</p></div><span></span>`;

      let component;
      beforeEach(async () => {
        component = mount(<BentoList src="" loadMore="auto" />);
      });
      it('should automatically load the first page', async () => {
        expect(snapshot(component.find(CONTENTS))).to.equal(
          'Loading...<span></span>'
        );

        await waitForData(component, 1);

        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage1);
      });
      it('should only load the first page when not in viewport', async () => {
        await waitForData(component, 1);
        await expect(waitForData(component, 2)).to.be.rejected;
      });
      it('when the element is scrolled into the viewport, it loads more data', async () => {
        await waitForData(component, 1);

        // Bring it into view, then pretend the rerender caused it to grow:
        simulateViewportVisible(component, true);
        simulateViewportVisible(component, false);

        await waitForData(component, 2);
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage2);

        // Bring it into view for 1 render again:
        simulateViewportVisible(component, true);
        simulateViewportVisible(component, false);

        await waitForData(component, 3);
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage3);
      });
      it('when the element is scrolled into the viewport, it keeps loading more data', async () => {
        simulateViewportVisible(component, true);

        await waitForData(component, 3);
        expect(snapshot(component.find(CONTENTS))).to.equal(expectedPage3);
      });
    });
  });

  describe('API', () => {
    let ref;
    let component;
    beforeEach(async () => {
      ref = Preact.createRef();
      component = mount(<BentoList src="TEST.json" ref={ref} />);
      await waitForData(component);
    });
    describe('refresh', () => {
      it('should be defined', () => {
        expect(ref.current.refresh).to.be.a('function');
      });
      it('should refresh the data', async () => {
        expect(dataStub).to.have.callCount(1);
        expect(snapshot(component.find(CONTENTS))).to.equal(
          `<div><p>one</p><p>two</p><p>three</p></div>`
        );

        dataStub.resolves({items: [1, 2, 3]});
        ref.current.refresh();

        await waitForData(component, 2);
        expect(snapshot(component.find(CONTENTS))).to.equal(
          `<div><p>1</p><p>2</p><p>3</p></div>`
        );
      });
    });
  });
});

function snapshot(component, {keepAttributes = false} = {}) {
  let html = component.html();
  if (!keepAttributes) {
    // Simple logic to clean attributes from HTML:
    html = html.replace(/\s([-\w]+)(="[^"]*")/g, '');
  }
  return html;
}

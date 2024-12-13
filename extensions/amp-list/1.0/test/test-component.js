import {mount} from 'enzyme';

import * as Preact from '#preact';
import * as intersectionObserver from '#preact/component/intersection-observer';
import {xhrUtils} from '#preact/utils/xhr';

import {macroTask} from '#testing/helpers';
import {cleanHtml} from '#testing/helpers/cleanHtml';
import {waitFor} from '#testing/helpers/service';

import {BentoList} from '../component';

const CONTENTS = '[test-id="contents"]';
function snapshot(component) {
  return cleanHtml(component.find(CONTENTS).html(), ['aria-label']);
}

describes.sandboxed('BentoList preact component v1.0', {}, (env) => {
  let fetchJson;
  beforeEach(() => {
    fetchJson = env.sandbox
      .stub(xhrUtils, 'fetchJson')
      .resolves({items: ['one', 'two', 'three']});
  });

  async function waitForData(component, callCount = 1) {
    await waitFor(
      () => fetchJson.callCount === callCount,
      'expected fetchJson to have been called' +
        (callCount > 1 ? ` ${callCount} times` : '')
    );
    // Ensure everything has settled:
    await macroTask();
    component.update();
  }

  describe('default behavior', () => {
    it('should render a "loading" state first', async () => {
      const component = mount(<BentoList src="" />);

      expect(snapshot(component)).to.equal(
        '<div><span aria-label="Loading"></span></div>'
      );
    });

    it('should load data, and display in a list', async () => {
      const component = mount(<BentoList src="TEST.json" />);
      expect(snapshot(component)).to.equal(
        '<div><span aria-label="Loading"></span></div>'
      );

      await waitForData(component);

      expect(fetchJson).calledWith('TEST.json');

      expect(snapshot(component)).to.equal(
        `<div><div>one</div><div>two</div><div>three</div></div>`
      );
    });

    it('the list should have aria-roles defined', async () => {
      const component = mount(<BentoList src="TEST.json" />);

      await waitForData(component);

      expect(component.find(CONTENTS).html()).to.equal(
        `<div role="list"><div role="listitem">one</div><div role="listitem">two</div><div role="listitem">three</div></div>`
      );
    });

    it("changing the 'src' should fetch the data", async () => {
      const component = mount(<BentoList src="TEST.json" />);
      expect(snapshot(component)).to.equal(
        '<div><span aria-label="Loading"></span></div>'
      );

      await waitForData(component);
      expect(snapshot(component)).to.equal(
        `<div><div>one</div><div>two</div><div>three</div></div>`
      );

      fetchJson.resolves({items: ['second', 'request']});

      // Prop doesn't change, no fetch:
      component.setProps({src: 'TEST.json'});
      expect(fetchJson).callCount(1);
      expect(snapshot(component)).to.equal(
        `<div><div>one</div><div>two</div><div>three</div></div>`
      );

      // Prop changes, new fetch:
      component.setProps({src: 'TEST2.json'});
      expect(fetchJson).callCount(2).calledWith('TEST2.json');
      await waitForData(component, 2);
      expect(snapshot(component)).to.equal(
        `<div><div>second</div><div>request</div></div>`
      );
    });
  });

  describe('itemsKey', () => {
    describe('with a flat array payload', () => {
      const results = ['flat', 'array'];
      beforeEach(() => {
        fetchJson.resolves(results);
      });
      it('by default, it should not render the data', async () => {
        const component = mount(<BentoList src="" />);
        await waitForData(component);

        expect(component.text()).to.equal('');
      });
      it('itemsKey="" should render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="" />);
        await waitForData(component);

        expect(snapshot(component)).to.equal(
          '<div><div>flat</div><div>array</div></div>'
        );
      });
      it('itemsKey="." should also render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="." />);
        await waitForData(component);

        expect(snapshot(component)).to.equal(
          '<div><div>flat</div><div>array</div></div>'
        );
      });
    });

    describe('when a custom itemsKey is supplied', () => {
      beforeEach(() => {
        fetchJson.resolves({
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

        expect(snapshot(component)).to.equal(
          '<div><div>1</div><div>2</div><div>3</div></div>'
        );
      });
      it('changing itemsKey should not require refetching the data', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(snapshot(component)).to.equal(
          '<div><div>1</div><div>2</div><div>3</div></div>'
        );

        component.setProps({itemsKey: 'LETTERS'});
        expect(snapshot(component)).to.equal(
          '<div><div>A</div><div>B</div><div>C</div></div>'
        );

        component.setProps({itemsKey: 'NUMBERS'});
        expect(snapshot(component)).to.equal(
          '<div><div>1</div><div>2</div><div>3</div></div>'
        );

        // Ensure data was only fetched once!
        expect(fetchJson).callCount(1);
      });
      describe('dot-separated lists', () => {
        it('should access dot-separated property lists', async () => {
          const component = mount(
            <BentoList src="" itemsKey="NESTED.OBJECTS.TOO" />
          );
          await waitForData(component);

          expect(snapshot(component)).to.equal(
            '<div><div>ONE</div><div>TWO</div><div>THREE</div></div>'
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
      expect(snapshot(component)).to.equal(`<div><div>one</div></div>`);
    });
    it('should do nothing if there are already fewer items', async () => {
      const component = mount(<BentoList src="TEST.json" maxItems={99} />);
      await waitForData(component);
      expect(snapshot(component)).to.equal(
        `<div><div>one</div><div>two</div><div>three</div></div>`
      );
    });
  });

  describe('template', () => {
    it('should allow for custom rendering of the data', async () => {
      const component = mount(
        <BentoList
          src=""
          template={(item) => <li>{item}</li>}
          wrapperTemplate={(list) => <ul>{list}</ul>}
        />
      );
      await waitForData(component);
      expect(component.find(CONTENTS).html()).to.equal(
        `<ul role="list"><li role="listitem">one</li><li role="listitem">two</li><li role="listitem">three</li></ul>`
      );
    });
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
        fetchJson.onCall(index).resolves(page);
      });
    });
    describe('manual', () => {
      const expectedPage1 = `<div><div>one</div><div>two</div><div>three</div></div><div><button><label>See More</label></button></div>`;
      const expectedPage2 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div></div><div><button><label>See More</label></button></div>`;
      const expectedPage3 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div><div>six</div><div>seven</div><div>eight</div><div>nine</div></div>`;

      let component;
      beforeEach(async () => {
        component = mount(<BentoList src="page-1.json" loadMore="manual" />);
        await waitForData(component);
      });

      it('should render a "See More" button', async () => {
        expect(component.find('button').html()).to.equal(
          `<button load-more-button="true"><label>See More</label></button>`
        );
        expect(snapshot(component)).to.equal(expectedPage1);
      });

      it('clicking the button should keep loading more data', async () => {
        // Check page 1:
        expect(snapshot(component)).to.equal(expectedPage1);

        // Load page 2:
        simulateClickWithPropagation(
          component.find('button[load-more-button]')
        );
        expect(fetchJson).callCount(2).calledWith('page-2.json');
        expect(snapshot(component)).to.equal(expectedPage1);
        await waitForData(component, 2);
        expect(snapshot(component)).to.equal(expectedPage2);

        // Load page 3:
        simulateClickWithPropagation(
          component.find('button[load-more-button]')
        );
        expect(fetchJson).callCount(3).calledWith('page-3.json');
        expect(snapshot(component)).to.equal(expectedPage2);
        await waitForData(component, 3);
        expect(snapshot(component)).to.equal(expectedPage3);
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

      const expectedLoading =
        '<div><span aria-label="Loading"></span></div><span></span>';
      const expectedPage1 = `<div><div>one</div><div>two</div><div>three</div></div><span></span>`;
      const expectedPage2 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div></div><span></span>`;
      const expectedPage3 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div><div>six</div><div>seven</div><div>eight</div><div>nine</div></div><span></span>`;

      let component;
      beforeEach(async () => {
        component = mount(<BentoList src="" loadMore="auto" />);
      });
      it('should automatically load the first page', async () => {
        expect(snapshot(component)).to.equal(expectedLoading);

        await waitForData(component, 1);

        expect(snapshot(component)).to.equal(expectedPage1);
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
        expect(snapshot(component)).to.equal(expectedPage2);

        // Bring it into view for 1 render again:
        simulateViewportVisible(component, true);
        simulateViewportVisible(component, false);

        await waitForData(component, 3);
        expect(snapshot(component)).to.equal(expectedPage3);
      });
    });
  });

  describe('loadMoreBookmark', () => {
    const mockData = [
      {
        items: ['one', 'two', 'three'],
        METADATA: {'NEXT_PAGE_URL': 'page-2.json'},
      },
      {
        items: ['four', 'five'],
        METADATA: {'NEXT_PAGE_URL': 'page-3.json'},
      },
      {
        items: ['six', 'seven', 'eight', 'nine'],
        METADATA: {'NEXT_PAGE_URL': null},
      },
    ];
    let component;
    beforeEach(async () => {
      mockData.forEach((page, index) => {
        fetchJson.onCall(index).resolves(page);
      });

      component = mount(
        <BentoList
          src="page-1.json"
          loadMore="manual"
          loadMoreBookmark="METADATA.NEXT_PAGE_URL"
        />
      );
      await waitForData(component);
    });

    const expectedPage1 = `<div><div>one</div><div>two</div><div>three</div></div><div><button><label>See More</label></button></div>`;
    const expectedPage2 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div></div><div><button><label>See More</label></button></div>`;
    const expectedPage3 = `<div><div>one</div><div>two</div><div>three</div><div>four</div><div>five</div><div>six</div><div>seven</div><div>eight</div><div>nine</div></div>`;

    it('should render the first page of data, as normal', async () => {
      expect(snapshot(component)).to.equal(expectedPage1);
    });

    it('clicking the button should keep loading more data', async () => {
      // Check page 1:
      expect(snapshot(component)).to.equal(expectedPage1);

      // Load page 2:
      simulateClickWithPropagation(component.find('button[load-more-button]'));
      expect(fetchJson).callCount(2).calledWith('page-2.json');
      expect(snapshot(component)).to.equal(expectedPage1);
      await waitForData(component, 2);
      expect(snapshot(component)).to.equal(expectedPage2);

      // Load page 3:
      simulateClickWithPropagation(component.find('button[load-more-button]'));
      expect(fetchJson).callCount(3).calledWith('page-3.json');
      expect(snapshot(component)).to.equal(expectedPage2);
      await waitForData(component, 3);
      expect(snapshot(component)).to.equal(expectedPage3);
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
        expect(fetchJson).to.have.callCount(1);
        expect(snapshot(component)).to.equal(
          `<div><div>one</div><div>two</div><div>three</div></div>`
        );

        fetchJson.resolves({items: [1, 2, 3]});
        ref.current.refresh();

        await waitForData(component, 2);
        expect(snapshot(component)).to.equal(
          `<div><div>1</div><div>2</div><div>3</div></div>`
        );
      });
    });
  });
});

function simulateClickWithPropagation(wrapper) {
  // Unlike `wrapper.simulate('click')`, this approach will propagate through DOM ancestors:
  wrapper.getDOMNode().click();
}

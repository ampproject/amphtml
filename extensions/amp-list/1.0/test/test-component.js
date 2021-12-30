import {mount} from 'enzyme';

import * as Preact from '#preact';
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
      'expected fetchJson to have been called'
    );
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

      expect(component.find(CONTENTS).html()).to.equal(
        `<p>one</p><p>two</p><p>three</p>`
      );
    });

    it("changing the 'src' should fetch the data", async () => {
      const component = mount(<BentoList src="TEST.json" />);
      expect(component.text()).to.equal('Loading...');

      await waitForData(component);
      expect(component.find(CONTENTS).html()).to.equal(
        `<p>one</p><p>two</p><p>three</p>`
      );

      dataStub.resolves({items: ['second', 'request']});

      // Prop doesn't change, no fetch:
      component.setProps({src: 'TEST.json'});
      expect(xhrUtils.fetchJson).callCount(1);
      expect(component.find(CONTENTS).html()).to.equal(
        `<p>one</p><p>two</p><p>three</p>`
      );

      // Prop changes, new fetch:
      component.setProps({src: 'TEST2.json'});
      expect(xhrUtils.fetchJson).callCount(2).calledWith('TEST2.json');
      await waitForData(component, 2);
      expect(component.find(CONTENTS).html()).to.equal(
        `<p>second</p><p>request</p>`
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

        expect(component.find(CONTENTS).html()).to.equal(
          '<p>flat</p><p>array</p>'
        );
      });
      it('itemsKey="." should also render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="." />);
        await waitForData(component);

        expect(component.find(CONTENTS).html()).to.equal(
          '<p>flat</p><p>array</p>'
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

        expect(component.find(CONTENTS).html()).to.equal(
          '<p>1</p><p>2</p><p>3</p>'
        );
      });
      it('changing itemsKey should not require refetching the data', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(component.find(CONTENTS).html()).to.equal(
          '<p>1</p><p>2</p><p>3</p>'
        );

        component.setProps({itemsKey: 'LETTERS'});
        expect(component.find(CONTENTS).html()).to.equal(
          '<p>A</p><p>B</p><p>C</p>'
        );

        component.setProps({itemsKey: 'NUMBERS'});
        expect(component.find(CONTENTS).html()).to.equal(
          '<p>1</p><p>2</p><p>3</p>'
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

          expect(component.find(CONTENTS).html()).to.equal(
            '<p>ONE</p><p>TWO</p><p>THREE</p>'
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

          component.setProps({itemsKey: 'NESTED.OBJECTS.TOO'});
          expect(component.text()).to.equal('ONETWOTHREE');
        });
      });
    });
  });

  describe('template', () => {
    it('should allow for custom rendering of the data', async () => {});
  });
});

import {mount} from 'enzyme';

import * as Preact from '#preact';
import {xhrUtils} from '#preact/utils/xhr';

import {waitFor} from '#testing/helpers/service';

import {BentoList} from '../component/component';

describes.sandboxed('BentoList preact component v1.0', {}, (env) => {
  let dataStub;
  beforeEach(() => {
    dataStub = env.sandbox.stub().resolves({items: ['one', 'two', 'three']});
    env.sandbox.stub(xhrUtils, 'fetchJson').resolves({json: dataStub});
  });

  async function waitForData(component) {
    await waitFor(
      () => dataStub.callCount >= 1,
      'expected fetchJson to have been called'
    );
    component.update();
  }

  it('should render a "loading" state first', async () => {
    const component = mount(<BentoList src="" />);

    expect(component.text()).to.equal('Loading...');
  });

  it('should load data, and display in a list', async () => {
    const component = mount(<BentoList src="TEST.json" />);
    expect(component.text()).to.equal('Loading...');

    expect(component.find('ul')).to.have.length(0);

    await waitForData(component);

    expect(xhrUtils.fetchJson).calledWith('TEST.json');

    expect(component.find('ul').html()).to.equal(
      `<ul><li>one</li><li>two</li><li>three</li></ul>`
    );
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

        expect(component.find('ul').html()).to.equal(
          '<ul><li>flat</li><li>array</li></ul>'
        );
      });
      it('itemsKey="." should also render the payload', async () => {
        const component = mount(<BentoList src="" itemsKey="." />);
        await waitForData(component);

        expect(component.find('ul').html()).to.equal(
          '<ul><li>flat</li><li>array</li></ul>'
        );
      });
    });

    describe('when a custom itemsKey is supplied', () => {
      beforeEach(() => {
        dataStub.resolves({
          NUMBERS: [1, 2, 3],
          LETTERS: ['A', 'B', 'C'],
          // NESTED: {
          //   OBJECTS: {
          //     TOO: ['ONE', 'TWO', 'THREE'],
          //   },
          // },
        });
      });
      it('should extract the correct property', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(component.find('ul').html()).to.equal(
          '<ul><li>1</li><li>2</li><li>3</li></ul>'
        );
      });
      it('changing itemsKey should not require refetching the data', async () => {
        const component = mount(<BentoList src="" itemsKey="NUMBERS" />);
        await waitForData(component);

        expect(component.find('ul').html()).to.equal(
          '<ul><li>1</li><li>2</li><li>3</li></ul>'
        );

        component.setProps({itemsKey: 'LETTERS'});
        expect(component.find('ul').html()).to.equal(
          '<ul><li>A</li><li>B</li><li>C</li></ul>'
        );
        expect(dataStub).callCount(1);
      });
    });
  });
});

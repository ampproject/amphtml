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
      () => xhrUtils.fetchJson.callCount >= 1,
      'expected fetchJson to have been called'
    );
    component.update();
  }

  it('should render a "loading" state first', async () => {
    const component = mount(<BentoList src="TEST.json" />);

    expect(component.text()).to.equal('Loading...');
  });

  it('should should load data and display in a list', async () => {
    const component = mount(<BentoList src="TEST.json" />);
    expect(component.text()).to.equal('Loading...');

    expect(component.find('ul')).to.have.length(0);

    await waitForData(component);

    expect(component.find('ul')).to.have.lengthOf(1);
    expect(component.find('li')).to.have.lengthOf(3);
  });
});

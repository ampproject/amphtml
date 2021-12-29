import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoAdblockDetector} from '../component';

describes.realWin('BentoAdblockDetector preact component v1.0', {}, (env) => {
  it('should show fallback', () => {
    const wrapper = mount(
      <BentoAdblockDetector
        style={{width: 120, height: 600}}
        ampAd={(props) => (
          <amp-ad
            width="120"
            height="600"
            type="doubleclick"
            data-slot="/21730346048/test-skyscraper"
            {...props}
          >
            <div fallback>This is AMP-Ad fallback.</div>
          </amp-ad>
        )}
        fallbackDiv={(props) => (
          <div
            style={{
              border: '2px solid red',
              borderRadius: 10,
              margin: 5,
              padding: 5,
            }}
            {...props}
          >
            <h2>Ad Blocker Detected</h2>
            <p>Please allow ads to run on this page.</p>
          </div>
        )}
      ></BentoAdblockDetector>
    );

    const component = wrapper.find(BentoAdblockDetector.name);
    // console.log(component);
    expect(component).to.equal(env);
    // expect(component.prop('testProp')).to.be.true;
  });
});

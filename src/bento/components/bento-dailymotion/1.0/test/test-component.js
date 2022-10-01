import {expect} from 'chai';
import {mount} from 'enzyme';

import {BentoDailymotion} from '#bento/components/bento-dailymotion/1.0/component';

import * as Preact from '#preact';

describes.sandboxed('Dailymotion preact component v1.0', {}, () => {
  it('Renders', () => {
    const wrapper = mount(
      <BentoDailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
      ></BentoDailymotion>
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.dailymotion.com/embed/video/x3rdtfy?api=1&html=1&app=amp'
    );

    // Style propagated to container, but not iframe.
    expect(wrapper.prop('style').width).to.equal(300);
    expect(wrapper.prop('style').height).to.equal(200);
  });

  it('Pass correct param attributes to the iframe src', () => {
    const wrapper = mount(
      <BentoDailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        endscreenEnable={false}
        sharingEnable={false}
        uiHighlight="444444"
        info={false}
      ></BentoDailymotion>
    );

    const iframe = wrapper.find('iframe');
    const src = iframe.prop('src');
    expect(src).to.contain('endscreen-enable=false');
    expect(src).to.contain('sharing-enable=false');
    expect(src).to.contain('ui-highlight=444444');
    expect(src).to.contain('info=false');
  });

  it('Pass mute param to iframe src', () => {
    const wrapper = mount(
      <BentoDailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        mute={true}
      ></BentoDailymotion>
    );

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.contain('mute=1');
  });

  it('Renders with iframe already muted when autoplay is passed', () => {
    const wrapper = mount(
      <BentoDailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        autoplay
      ></BentoDailymotion>
    );

    const iframe = wrapper.find('iframe');
    expect(iframe.prop('src')).to.contain('mute=1');
  });
});

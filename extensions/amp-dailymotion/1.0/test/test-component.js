import * as Preact from '#preact';
import {Dailymotion} from '../component';
import {mount} from 'enzyme';
import {expect} from 'chai';

describes.sandboxed('Dailymotion preact component v1.0', {}, () => {
  it('Renders', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    expect(iframe.prop('src')).to.equal(
      'https://www.dailymotion.com/embed/video/x3rdtfy?api=1&html=1&app=amp&mute=0'
    );

    // Style propagated to container, but not iframe.
    expect(wrapper.prop('style').width).to.equal(300);
    expect(wrapper.prop('style').height).to.equal(200);
  });

  it('Pass correct param attributes to the iframe src', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        mute={false}
        endscreenEnable={false}
        sharingEnable={false}
        uiHighlight="444444"
        info={false}
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    // Mute Attr
    expect(iframe.prop('src')).to.contain('mute=0');
    // Enscreen Enable attr
    expect(iframe.prop('src')).to.contain('endscreen-enable=false');
    // Sharing Enable attr
    expect(iframe.prop('src')).to.contain('sharing-enable=false');
    // UI Highlight attr
    expect(iframe.prop('src')).to.contain('ui-highlight=444444');
    // info attr
    expect(iframe.prop('src')).to.contain('info=false');
  });

  it('Pass mute param to iframe src', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        mute={false}
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    // Mute Attr
    expect(iframe.prop('src')).to.contain('mute=0');
  });

  it('Renders with iframe already muted when autoplay is passed', () => {
    const wrapper = mount(
      <Dailymotion
        style={{width: 300, height: 200}}
        videoId="x3rdtfy"
        autoplay
      ></Dailymotion>
    );

    const iframe = wrapper.find('iframe');

    // Mute Attr
    expect(iframe.prop('src')).to.contain('mute=1');
  });
});

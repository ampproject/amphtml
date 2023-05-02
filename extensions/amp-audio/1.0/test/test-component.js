import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoAudio} from '../component';

describes.realWin('Audio preact component v1.0', {}, (env) => {
  it('should load audio through attribute', () => {
    const wrapper = mount(
      <BentoAudio src="audio.mp3" style={{height: '30px', width: '300px'}} />
    );

    const component = wrapper.find('audio');

    expect(component).to.have.lengthOf(1);
    expect(component.name()).to.equal('audio');
    expect(component.prop('src')).to.equal('audio.mp3');
    expect(component.prop('controls')).to.be.true;

    expect(wrapper.prop('style')).to.deep.equal({
      width: '300px',
      height: '30px',
    });
  });
  it('should not preload audio', () => {
    const wrapper = mount(<BentoAudio src="audio.mp3" preload="none" />);

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('preload')).to.equal('none');
  });
  it('should only preload audio metadata', () => {
    const wrapper = mount(<BentoAudio src="audio.mp3" preload="metadata" />);

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('preload')).to.equal('metadata');
  });
  it('should load audio through sources', () => {
    const wrapper = mount(
      <BentoAudio
        autoplay=""
        preload=""
        muted=""
        loop=""
        width="503px"
        height="53px"
        sources={
          <>
            <source src="audio.mp3" type="audio/mpeg" />
            <source src="audio.ogg" type="audio/ogg" />
          </>
        }
      ></BentoAudio>,
      {attachTo: env.win.document.body}
    );

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);

    expect(component.name()).to.equal('audio');
    expect(wrapper.prop('width')).to.equal('503px');
    expect(wrapper.prop('height')).to.equal('53px');
    expect(component.getDOMNode().offsetWidth).to.be.greaterThan(1);
    expect(component.getDOMNode().offsetHeight).to.be.greaterThan(1);
    expect(component.prop('controls')).to.be.true;

    const audio = component.find('audio');
    // TODO(dmanek): Use InOb hook for autoplay.
    // expect(audio.prop('autoplay')).not.to.be.undefined;
    expect(audio.prop('muted')).not.to.be.undefined;
    expect(audio.getDOMNode().muted).not.to.be.undefined;
    expect(audio.prop('preload')).not.to.be.undefined;
    expect(audio.prop('loop')).not.to.be.undefined;
    expect(audio.prop('src')).to.be.undefined;

    /**
     * Here, first  childAt(0) = <> ... </>
     *       second childAt(N) = <source> ... </source>
     */
    expect(component.childAt(0).childAt(0).name()).to.equal('source');
    expect(component.childAt(0).childAt(0).prop('src')).to.equal('audio.mp3');
    expect(component.childAt(0).childAt(1).name()).to.equal('source');
    expect(component.childAt(0).childAt(1).prop('src')).to.equal('audio.ogg');
  });
  it('should propagate ARIA attributes', () => {
    const wrapper = mount(
      <BentoAudio
        src="audio.mp3"
        aria-label="Hello"
        aria-labelledby="id2"
        aria-describedby="id3"
      />
    );

    const component = wrapper.find('audio');
    expect(component).to.have.lengthOf(1);
    expect(component.prop('aria-label')).to.equal('Hello');
    expect(component.prop('aria-labelledby')).to.equal('id2');
    expect(component.prop('aria-describedby')).to.equal('id3');
  });
});

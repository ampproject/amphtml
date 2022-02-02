import {mount} from 'enzyme';

import {BentoJwplayer} from '#bento/components/bento-jwplayer/1.0/component';

import * as Preact from '#preact';

function mountComp(props) {
  return mount(<BentoJwplayer {...props}></BentoJwplayer>);
}

describes.sandboxed('BentoJwplayer preact component v1.0', {}, () => {
  it('should render', () => {
    const mediaId = 'BZ6tc0gy';
    const playerId = 'uoIbMPm3';
    const wrapper = mountComp({mediaId, playerId});
    const iframeEl = wrapper.find('iframe');
    expect(iframeEl).to.not.be.null;
    expect(iframeEl.prop('src')).to.equal(
      `https://content.jwplatform.com/players/${mediaId}-${playerId}.html?backfill=true&isAMP=true`
    );
  });

  it("should not render if props aren't valid", () => {
    const wrapper = mountComp({});
    expect(wrapper.getDOMNode()).to.be.null;
    const wrapper2 = mountComp({player: 'playerId'});
    expect(wrapper2.getDOMNode()).to.be.null;
  });

  it('should pass the loading attribute to the underlying iframe', () => {
    const mediaId = 'BZ6tc0gy';
    const playerId = 'uoIbMPm3';
    const loading = 'lazy';
    const wrapper = mountComp({mediaId, playerId, loading});
    const iframeEl = wrapper.find('iframe');
    expect(iframeEl).to.not.be.null;
    expect(iframeEl.getDOMNode().getAttribute('loading')).to.equal('lazy');
  });

  it('should set data-loading="auto" if no value is specified', () => {
    const mediaId = 'BZ6tc0gy';
    const playerId = 'uoIbMPm3';
    const wrapper = mountComp({mediaId, playerId});
    const iframeEl = wrapper.find('iframe');
    expect(iframeEl).to.not.be.null;
    expect(iframeEl.getDOMNode().getAttribute('loading')).to.equal('auto');
  });

  describe('makeJwplayerIframeSrc', () => {
    it('should prefer playlistId to mediaId', () => {
      const mediaId = 'BZ6tc0gy';
      const playerId = 'uoIbMPm3';
      const playlistId = '482jsTAr';
      const wrapper = mountComp({mediaId, playlistId, playerId});
      const iframeEl = wrapper.find('iframe');
      expect(iframeEl).to.not.be.null;
      expect(iframeEl.prop('src')).to.equal(
        `https://content.jwplatform.com/players/${playlistId}-${playerId}.html?backfill=true&isAMP=true`
      );
    });

    it('should handle "outstream" cid', () => {
      const mediaId = 'outstream';
      const cid = 'oi7pAMI1';
      const playerId = 'uoIbMPm3';
      const wrapper = mountComp({mediaId, playerId});
      const iframeEl = wrapper.find('iframe');
      expect(iframeEl).to.not.be.null;
      expect(iframeEl.prop('src')).to.equal(
        `https://content.jwplatform.com/players/${cid}-${playerId}.html?backfill=true&isAMP=true`
      );
    });

    it('shoud append all query params', () => {
      const props = {
        mediaId: 'BZ6tc0gy',
        playerId: 'uoIbMPm3',
        playlistId: '482jsTAr',
        contentSearch: 'search val',
        contentRecency: 'search rec',
        contentBackfill: false,
        consentParams: {
          policyState: 'state',
          policyInfo: 'info',
          policyMetadata: {gdprApplies: true},
        },
        queryParams: {
          language: 'de',
          customAdData: 'key:value;key2:value2',
          name1: 'abc',
          name2: 'xyz',
          name3: '123',
        },
      };
      const wrapper = mountComp(props);
      const iframeEl = wrapper.find('iframe');
      expect(iframeEl).to.not.be.null;
      expect(iframeEl.prop('src')).to.equal(
        `https://content.jwplatform.com/players/${props.playlistId}-${props.playerId}.html?language=de&customAdData=key%3Avalue%3Bkey2%3Avalue2&name1=abc&name2=xyz&name3=123&search=search%20val&recency=search%20rec&isAMP=true&consentState=state&consentValue=info&consentGdpr=true`
      );
    });
  });
  // describe('onMessage', () => {
  //   it('should handle setup', async () => {
  //     const props = {
  //       mediaId: 'BZ6tc0gy',
  //       playerId: 'uoIbMPm3',
  //       config: {
  //         json: JSON.stringify({
  //           playbackRateControls: true,
  //           displaytitle: false,
  //           horizontalVolumeSlider: true,
  //         }),
  //         skinUrl: 'https://playertest.longtailvideo.com/skins/ethan.css',
  //         pluginUrl:
  //           'https://playertest.longtailvideo.com/plugins/newsticker.js',
  //       },
  //       adMacros: {
  //         itemTest: 'val',
  //         itemParamList: 'one,two,three',
  //       },
  //       adCustParams: JSON.stringify({key1: 'value1', keyTest: 'value2'}),
  //     };
  //     const wrapper = mountComp(props);

  //     const prom = new Promise((res) => {
  //       wrapper
  //         .find('iframe')
  //         .getDOMNode()
  //         .addEventListener('message', (e) => {
  //           res(JSON.parse(e.data));
  //         });
  //     });
  //     triggerEvent(wrapper, 'setup');
  //     const {method, optParams} = await prom;
  //     expect(method).to.equal('setupConfig');
  //     expect(optParams).to.deep.equal({
  //       playbackRateControls: true,
  //       displaytitle: false,
  //       horizontalVolumeSlider: true,
  //       skinUrl: 'https://playertest.longtailvideo.com/skins/ethan.css',
  //       pluginUrl: 'https://playertest.longtailvideo.com/plugins/newsticker.js',
  //       adMacros: {
  //         itemTest: 'val',
  //         itemParamList: 'one,two,three',
  //       },
  //       adCustParams: {key1: 'value1', keyTest: 'value2'},
  //     });
  //   });
  //   it('should handle ready', () => {});
  //   it('should handle play', () => {});
  //   it('should handle adPlay', () => {});
  //   it('should handle pause', () => {});
  //   it('should handle complete', () => {});
  //   it('should synchronize playerState handle');
  //   it('should redispatch jwplayer events');
  // });
});

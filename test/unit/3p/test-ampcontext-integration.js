import {primaryFrameSelection} from '#3p/ampcontext-integration';

describes.fakeWin('#primaryFrameSelect', {}, (env) => {
  it('should allow sharing between configured networks', () =>
    expect(primaryFrameSelection(env.win, 'fake_network').name).to.equal(
      'frame_fake_network_primary'
    ));
});

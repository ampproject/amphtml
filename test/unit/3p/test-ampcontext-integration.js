import {masterSelection} from '#3p/ampcontext-integration';

describes.fakeWin('#masterSelect', {}, (env) => {
  it('should allow sharing between configured networks', () =>
    expect(masterSelection(env.win, 'fake_network').name).to.equal(
      'frame_fake_network_master'
    ));
});

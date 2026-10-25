describes.realWin('amp-blurhash', {
  amp: true,
  extensions: ['amp-blurhash'],
}, env => {
  it('renders a canvas with decoded pixels', async () => {
    const el = env.win.document.createElement('amp-blurhash');
    el.setAttribute('hash', 'LEHV6nWB2yk8pyo0adR*.7kCMdnj');
    el.setAttribute('width', '16');
    el.setAttribute('height', '16');
    el.setAttribute('layout', 'fixed');
    env.win.document.body.appendChild(el);
    await el.whenBuilt();
    const canvas = el.querySelector('canvas');
    expect(canvas).to.exist;
    expect(canvas.width).to.equal(16);
  });
});

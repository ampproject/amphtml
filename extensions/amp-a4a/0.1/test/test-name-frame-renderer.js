import {parseJson} from '#core/types/object/json';
import {utf8Encode} from '#core/types/string/bytes';

import {NameFrameRenderer} from '../name-frame-renderer';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('NameFrameRenderer', realWinConfig, (env) => {
  const minifiedCreative = '<p>Hello, World!</p>';

  let containerElement;
  let context;
  let creativeData;

  beforeEach(async () => {
    context = {
      size: {width: '320', height: '50'},
      requestUrl: 'http://www.google.com',
      win: env.win,
      sentinel: 's-1234',
    };

    creativeData = {
      rawCreativeBytes: utf8Encode(minifiedCreative),
      additionalContextMetadata: {},
    };

    containerElement = env.win.document.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.getIntersectionChangeEntry = () => ({
      time: null,
      boundingClientRect: {},
      rootBounds: {},
      intersectionRect: {},
    });
    env.win.document.body.appendChild(containerElement);

    await new NameFrameRenderer().render(
      context,
      containerElement,
      creativeData
    );
  });

  it('should append iframe child', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    const parsedName = parseJson(iframe.getAttribute('name'));
    expect(parsedName).to.be.ok;
    expect(parsedName.width).to.equal(320);
    expect(parsedName.height).to.equal(50);
    expect(parsedName._context).to.be.ok;
    expect(parsedName._context.sentinel).to.equal('s-1234');
    expect(parsedName.creative).to.equal(minifiedCreative);
  });

  it('should have src pointing to nameframe', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    expect(iframe.getAttribute('src')).to.match(/nameframe\.max\.html$/);
  });

  it('should set correct attributes on the iframe', () => {
    const iframe = containerElement.querySelector('iframe');
    expect(iframe).to.be.ok;
    expect(iframe.getAttribute('width')).to.equal('320');
    expect(iframe.getAttribute('height')).to.equal('50');
    expect(iframe.getAttribute('frameborder')).to.equal('0');
    expect(iframe.getAttribute('allowfullscreen')).to.equal('');
    expect(iframe.getAttribute('allowtransparency')).to.equal('');
    expect(iframe.getAttribute('scrolling')).to.equal('no');
  });
});

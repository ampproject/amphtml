import '../../../amp-mustache/0.2/amp-mustache';
import {Xhr} from '#service/xhr-impl';

import {AmpAdTemplateHelper} from '../amp-ad-template-helper';

describes.fakeWin('AmpAdTemplateHelper', {amp: true}, (env) => {
  const cdnUrl =
    'https://adserver-com.cdn.ampproject.org/ad/s/' +
    'adserver.com/amp_template_1';
  const canonicalUrl = 'https://adserver.com/amp_template_1';

  let win, doc, ampdoc;
  let fetchTextMock;
  let ampAdTemplateHelper;

  beforeEach(() => {
    win = env.win;
    win.__AMP_MODE = {localDev: false};
    doc = win.document;
    ampdoc = env.ampdoc;
    fetchTextMock = env.sandbox.stub(Xhr.prototype, 'fetchText');
    ampAdTemplateHelper = new AmpAdTemplateHelper(ampdoc);

    env.installExtension(
      'amp-mustache',
      '0.2',
      /* latest */ true,
      /* auto */ false
    );
  });

  it('should return a promise resolving to a string template', () => {
    const template = 'content not important here';
    fetchTextMock
      .withArgs(cdnUrl, {
        mode: 'cors',
        method: 'GET',
        ampCors: false,
        credentials: 'omit',
      })
      .returns(
        Promise.resolve({
          headers: {},
          text: () => template,
        })
      );
    return ampAdTemplateHelper
      .fetch(canonicalUrl)
      .then((fetchedTemplate) => expect(fetchedTemplate).to.equal(template));
  });

  it('should use CDN url if one is supplied', () => {
    expect(ampAdTemplateHelper.getTemplateProxyUrl_(cdnUrl)).to.equal(cdnUrl);
  });

  it('should convert canonical to CDN', () => {
    expect(ampAdTemplateHelper.getTemplateProxyUrl_(canonicalUrl)).to.equal(
      cdnUrl
    );
  });

  it('should render a template with correct values', () => {
    const parentDiv = doc.createElement('div');
    parentDiv./*OK*/ innerHTML =
      '<template type="amp-mustache"><p>{{foo}}</p></template>';
    doc.body.appendChild(parentDiv);
    return ampAdTemplateHelper
      .render({foo: 'bar'}, parentDiv)
      .then((result) => {
        expect(result).to.not.be.null;
        expect(result./*OK*/ innerHTML).to.equal('bar');
      });
  });

  it('should insert analytics component', () => {
    const parentDiv = doc.createElement('div');
    parentDiv./*OK*/ innerHTML = '<p>123</p>';
    doc.body.appendChild(parentDiv);
    const analytics = [
      {
        'remote': 'remoteUrl',
        'inline': {
          'requests': 'r',
        },
      },
      {
        'type': 'googleanalytics',
      },
    ];
    ampAdTemplateHelper.insertAnalytics(parentDiv, analytics);
    expect(parentDiv.childNodes.length).to.equal(3);
    expect(parentDiv.innerHTML).to.equal(
      '<p>123</p>' +
        '<amp-analytics config="remoteUrl">' +
        '<script type="application/json">{"requests":"r"}</script>' +
        '</amp-analytics>' +
        '<amp-analytics type="googleanalytics"></amp-analytics>'
    );
  });
});

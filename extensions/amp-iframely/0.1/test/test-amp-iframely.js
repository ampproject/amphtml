import '../amp-iframely';

describes.realWin(
  'amp-iframely',
  {
    amp: {
      extensions: ['amp-iframely'],
    },
  },
  (env) => {
    let win, doc;
    const TestID = 'pHBVuFj';
    const paramsID = {
      'data-id': TestID,
      'width': '10',
      'height': '10',
      'layout': 'responsive',
    };
    const url = 'https//some.url/';
    const key = 'some-StRiNg-of-more-then-16';
    const paramsKU = {
      'data-key': key,
      'data-url': url,
      'layout': 'responsive',
      'width': '100',
      'height': '100',
    };

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function renderIframely(params) {
      const iframely = doc.createElement('amp-iframely');
      for (const param in params) {
        iframely.setAttribute(param, params[param]);
      }
      doc.body.appendChild(iframely);
      return iframely.buildInternal().then(() => {
        iframely.layoutCallback();
        return iframely;
      });
    }

    function testIframe(iframe, id) {
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal('https://cdn.iframe.ly/' + id + '?amp=1');
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    }

    it('renders', () => {
      return renderIframely(paramsID).then((iframely) => {
        testIframe(iframely.querySelector('iframe'), TestID);
      });
    });

    it('does not render without required attributes', () => {
      return allowConsoleError(() => {
        return renderIframely({
          'layout': 'fill',
        }).should.eventually.be.rejectedWith(/<amp-iframely> requires either/);
      });
    });

    it('not renders with only URL parameter', () => {
      return allowConsoleError(() => {
        return renderIframely({
          'data-url': 'https//some.url/',
          'layout': 'fixed',
        }).should.eventually.be.rejectedWith(
          /Iframely data-key must also be set/
        );
      });
    });

    it('not renders with only KEY parameter', () => {
      return allowConsoleError(() => {
        return renderIframely({
          'data-key': 'some-StRiNg/',
          'layout': 'fixed',
        }).should.eventually.be.rejectedWith(
          /<amp-iframely> requires either "data-id" /
        );
      });
    });

    it('rejects with both data-url AND data-id parameters specified', () => {
      const params = {
        'data-id': TestID,
        'data-key': 'some-StRiNg/',
        'data-url': 'https//some.url/',
        'layout': 'fill',
      };
      return allowConsoleError(() => {
        return renderIframely(params).should.eventually.be.rejectedWith(
          /Only one way of setting either data-id or/
        );
      });
    });

    it('builds url for key-url pair properly', () => {
      return renderIframely(paramsKU).then((iframely) => {
        const iframe = iframely.querySelector('iframe');
        expect(iframe).to.not.be.null;
        expect(iframe.src).to.equal(
          `https://cdn.iframe.ly/api/iframe?url=${encodeURIComponent(
            url
          )}&key=${key}&amp=1`
        );
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
      });
    });

    it('renders iframe properly', () => {
      return renderIframely(paramsID).then((iframely) => {
        const iframe = iframely.querySelector('iframe');
        testIframe(iframe, TestID);
        expect(iframe.tagName).to.equal('IFRAME');
        expect(iframe.className).to.match(/i-amphtml-fill-content/);
        // Border render cleared
        expect(iframe.getAttribute('style')).to.equal('border: 0px;');
      });
    });

    it('renders image placeholder', () => {
      return renderIframely(paramsID).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(image).to.have.class('i-amphtml-fill-content');
        expect(image.getAttribute('loading')).to.equal('lazy');
      });
    });

    it('renders image placeholder with proper URL for ID version', () => {
      return renderIframely(paramsID).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(image.getAttribute('src')).to.equal(
          `https://cdn.iframe.ly/${TestID}/thumbnail?amp=1`
        );
      });
    });

    it('renders image placeholder with proper URL for Key-URL version', () => {
      return renderIframely(paramsKU).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(image.getAttribute('src')).to.equal(
          `https://cdn.iframe.ly/api/thumbnail?url=${encodeURIComponent(
            url
          )}&key=${key}&amp=1`
        );
      });
    });

    it('does not render iframe and image placeholder with wrong domain', () => {
      const domain = 'mydomain.com';
      const properDomain = 'cdn.iframe.ly';
      const data = {
        'data-id': TestID,
        'data-domain': domain,
        'width': '100',
        'height': '100',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(image.getAttribute('src')).to.equal(
          `https://${properDomain}/${TestID}/thumbnail?amp=1`
        );
        const iframe = iframely.querySelector('iframe');
        expect(iframe.src).to.equal(`https://${properDomain}/${TestID}?amp=1`);
      });
    });

    it('renders iframe and image placeholder with proper domain', () => {
      const domain = 'iframe.ly';
      const data = {
        'data-id': TestID,
        'data-domain': domain,
        'width': '100',
        'height': '100',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(image.getAttribute('src')).to.equal(
          `https://${domain}/${TestID}/thumbnail?amp=1`
        );
        const iframe = iframely.querySelector('iframe');
        expect(iframe.src).to.equal(`https://${domain}/${TestID}?amp=1`);
      });
    });

    it('renders placeholder with data-img key set', () => {
      const data = {
        'data-id': TestID,
        'data-img': '',
        'layout': 'fill',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render placeholder with resizable key set and responsive layout', () => {
      const data = {
        'data-id': TestID,
        'resizable': '',
        'height': '100',
        'width': '100',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('render placeholder with data-img and resizeable', () => {
      const data = {
        'data-id': TestID,
        'resizable': '',
        'data-img': '',
        'height': '100',
        'width': '100',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render placeholder with fixed layout', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'layout': 'fixed',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render placeholder with fixed layout and resizable', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'resizable': '',
        'layout': 'fixed',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('render placeholder with data-img responsive layout and resizable params', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'data-img': '',
        'resizable': '',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('render placeholder with data-img fixed layout and resizable params', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'data-img': '',
        'layout': 'fixed',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.not.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render placeholder with fixed-height layout and resizable params', () => {
      const data = {
        'data-id': TestID,
        'height': '166',
        'layout': 'fixed-height',
        'resizable': '',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render placeholder with resizable param set and layout===responsive', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'resizable': '',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        expect(image).to.be.null;
        expect(iframely.querySelector('iframe')).to.not.be.null;
      });
    });

    it('does not render with invalid key length', () => {
      const data = {
        'data-url': 'https://some-url.com',
        'height': '100',
        'width': '100',
        'data-key': '',
        'layout': 'fixed',
      };
      return allowConsoleError(() => {
        return renderIframely(data).should.eventually.be.rejectedWith(
          /Iframely data-key must also be set when you specify data-url parameter/
        );
      });
    });

    it('render iframe options properly', () => {
      const data = {
        'data-id': TestID,
        'height': '100',
        'width': '100',
        'data-optionOne': 'value',
        'data-option-two': 'value',
        'data-img': 'something',
        'layout': 'responsive',
      };
      return renderIframely(data).then((iframely) => {
        const image = iframely.querySelector('img');
        const iframe = iframely.querySelector('iframe');
        expect(image).to.not.be.null;
        expect(iframe).to.not.be.null;
        expect(iframe.src.includes('&optionone=value&optionTwo=value')).to.be
          .true;
      });
    });
  }
);

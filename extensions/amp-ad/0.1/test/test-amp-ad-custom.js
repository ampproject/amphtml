import {createElementWithAttributes, removeChildren} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';

import {Services} from '#service';

import {AmpAdCustom} from '../amp-ad-custom';

describes.realWin('Amp custom ad', {amp: true}, (env) => {
  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  it('should get the correct full URLs', () => {
    // Create all the ads *before* calling getFullUrl_() - otherwise, the
    // ads after the first getFullUrl_() call will not be in the cache.

    // Single ad with no slot
    const urlBase1 = '/examples/custom.ad.example.single.json';
    const elem1 = getCustomAd(doc, urlBase1);
    const ad1 = new AmpAdCustom(elem1);
    env.sandbox.stub(ad1, 'getFallback').callsFake(() => {
      return null;
    });
    ad1.buildCallback();

    // Single ad with a slot
    const urlBase2 = '/examples/custom.ad.example.single.json?x=y';
    const slot = 'myslot2';
    const elem2 = getCustomAd(doc, urlBase2, slot);
    const ad2 = new AmpAdCustom(elem2);
    env.sandbox.stub(ad2, 'getFallback').callsFake(() => {
      return null;
    });
    ad2.buildCallback();
    const expected2 = urlBase2 + '&ampslots=' + slot;

    // Pair of ads with the same url but different slots
    const urlBase34 = '/examples/custom.ad.example.json';
    const slot3 = 'myslot3';
    const elem3 = getCustomAd(doc, urlBase34, slot3);
    const ad3 = new AmpAdCustom(elem3);
    env.sandbox.stub(ad3, 'getFallback').callsFake(() => {
      return null;
    });
    ad3.buildCallback();

    const slot4 = 'myslot4';
    const elem4 = getCustomAd(doc, urlBase34, slot4);
    const ad4 = new AmpAdCustom(elem4);
    env.sandbox.stub(ad4, 'getFallback').callsFake(() => {
      return null;
    });
    ad4.buildCallback();

    const expected34 = urlBase34 + '?ampslots=' + slot3 + '%2C' + slot4;

    // Now we can get the URLs
    expect(ad1.getFullUrl_()).to.equal(urlBase1);
    expect(ad2.getFullUrl_()).to.equal(expected2);
    expect(ad3.getFullUrl_()).to.equal(expected34);
    expect(ad4.getFullUrl_()).to.equal(expected34);
  });

  it('should perform multiple requests if no `data-slot`', () => {
    const stub = env.sandbox.stub(Services, 'xhrFor').callsFake(() => ({
      fetchJson: () => Promise.resolve({'foo': 1}),
    }));

    // Single ad with no slot
    const url1 = 'example.test/ad';
    const element1 = getCustomAd(doc, url1);
    const ad1 = new AmpAdCustom(element1);
    ad1.buildCallback();
    ad1.layoutCallback();

    // Single ad with no slot
    const url2 = 'example.test/ad';
    const element2 = getCustomAd(doc, url2);
    const ad2 = new AmpAdCustom(element2);
    ad2.buildCallback();
    ad1.layoutCallback();

    assert(stub.calledTwice);
  });

  describe('TemplateData', () => {
    it('templateData with child template', () => {
      const elem = getCustomAd(doc, 'fake.json');
      const ad = new AmpAdCustom(elem);
      ad.buildCallback();
      expect(
        ad.handleTemplateData_({
          'a': '1',
          'b': '2',
          'data': {
            'c': '3',
          },
          'templateId': '4',
          'vars': {
            'd': '5',
          },
        })
      ).to.deep.equal({
        'a': '1',
        'b': '2',
        'data': {
          'c': '3',
        },
        'templateId': '4',
        'vars': {
          'd': '5',
        },
      });
      expect(elem.getAttribute('template')).to.be.null;
      expect(elem.getAttribute('data-vars-d')).to.be.null;
    });

    it('templateData w/o child template', () => {
      const elem = getCustomAd(doc, 'fake.json');
      removeChildren(elem);
      const ad = new AmpAdCustom(elem);
      ad.buildCallback();
      expect(
        ad.handleTemplateData_({
          'a': '1',
          'b': '2',
          'data': {
            'c': '3',
          },
          'templateId': '4',
          'vars': {
            'd': '5',
          },
        })
      ).to.deep.equal({
        'c': '3',
      });
      expect(elem.getAttribute('template')).to.equal('4');
      expect(elem.getAttribute('data-vars-d')).to.equal('5');
    });

    it('templateData w/o child template or templateId', () => {
      const elem = getCustomAd(doc, 'fake.json');
      removeChildren(elem);
      const ad = new AmpAdCustom(elem);
      ad.buildCallback();
      allowConsoleError(() => {
        expect(() => {
          ad.handleTemplateData_({
            'data': {
              'a': '1',
              'b': '2',
            },
            'vars': {
              'abc': '456',
            },
          });
        }).to.throw('TemplateId not specified');

        expect(() => {
          ad.handleTemplateData_({
            'templateId': '1',
            'vars': {
              'abc': '456',
            },
          });
        }).to.throw('Template data not specified');
      });
    });
  });
});

// TODO(wg-monetization, #25726): This test fails when run by itself.
describes.sandboxed.skip('#getLayoutPriority', {}, () => {
  const url = '/examples/custom.ad.example.json';
  const slot = 'myslot';

  describes.realWin(
    'with shadow AmpDoc',
    {
      amp: {
        ampdoc: 'shadow',
      },
    },
    (env) => {
      it('should return priority of 0', () => {
        const adElement = getCustomAd(
          env.win.document,
          url,
          slot,
          /*body*/ env.ampdoc.getBody()
        );
        const customAd = new AmpAdCustom(adElement);
        expect(customAd.getLayoutPriority()).to.equal(
          LayoutPriority_Enum.CONTENT
        );
      });
    }
  );

  describes.realWin(
    'with single AmpDoc',
    {
      amp: {
        ampdoc: 'single',
      },
    },
    (env) => {
      it('should return priority of 0', () => {
        const adElement = getCustomAd(
          env.win.document,
          url,
          slot,
          /*body*/ env.ampdoc.getBody()
        );
        const customAd = new AmpAdCustom(adElement);
        expect(customAd.getLayoutPriority()).to.equal(
          LayoutPriority_Enum.CONTENT
        );
      });
    }
  );
});

function getCustomAd(doc, url, slot) {
  const ampAdElement = createElementWithAttributes(doc, 'amp-ad', {
    type: 'custom',
    width: '500',
    height: '60',
    'data-url': url,
  });
  if (slot) {
    ampAdElement.setAttribute('data-slot', slot);
  }
  const template = doc.createElement('template');
  ampAdElement.appendChild(template);
  doc.body.appendChild(ampAdElement);
  return ampAdElement;
}

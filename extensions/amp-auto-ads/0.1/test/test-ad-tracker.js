import {layoutRectLtwh} from '#core/dom/layout/rect';

import {Services} from '#service';

import {
  AdTracker,
  getAdConstraintsFromConfigObj,
  getExistingAds,
} from '../ad-tracker';
import * as MeasurePageLayoutBox from '../measure-page-layout-box';

describes.realWin('ad-tracker', {amp: true}, (env) => {
  let win, doc;
  let container;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    env.sandbox
      .stub(MeasurePageLayoutBox, 'measurePageLayoutBox')
      .callsFake((element) => {
        return Promise.resolve(element.layoutBox);
      });

    container = doc.createElement('div');
    doc.body.appendChild(container);
  });

  function addAd(layoutBox) {
    const ad = doc.createElement('amp-ad');
    ad.setAttribute('type', 'adsense');
    ad.setAttribute('layout', 'responsive');
    ad.setAttribute('width', '300');
    ad.setAttribute('height', '100');
    ad.layoutBox = layoutBox;
    container.appendChild(ad);
    return ad;
  }

  function checkMinSpacing(adTracker, tooNearPos, okPos) {
    return adTracker.isTooNearAnAd(tooNearPos).then((tooNear) => {
      expect(tooNear).to.equal(true);
      return adTracker.isTooNearAnAd(okPos).then((tooNear) => {
        expect(tooNear).to.equal(false);
      });
    });
  }

  it('should return the correct ad count', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    expect(adTracker.getAdCount()).to.equal(1);

    adTracker.addAd(addAd(layoutRectLtwh(0, 100, 300, 50)));
    expect(adTracker.getAdCount()).to.equal(2);
  });

  it('should find position is too near when close to ad above', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    return adTracker.isTooNearAnAd(149).then((tooNear) => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when close to ad below', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 100, 300, 50))],
      adConstraints
    );
    return adTracker.isTooNearAnAd(1).then((tooNear) => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is too near when inside ad', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    return adTracker.isTooNearAnAd(25).then((tooNear) => {
      expect(tooNear).to.equal(true);
    });
  });

  it('should find position is not too near an ad', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [
        addAd(layoutRectLtwh(0, 0, 300, 50)),
        addAd(layoutRectLtwh(0, 250, 300, 50)),
      ],
      adConstraints
    );
    return adTracker.isTooNearAnAd(150).then((tooNear) => {
      expect(tooNear).to.equal(false);
    });
  });

  it('should use the initial min ad spacing', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    return checkMinSpacing(adTracker, 549, 550);
  });

  it('should use a subsequent ad spacing when an existing ad present', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [{adCount: 1, spacing: 600}],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    return checkMinSpacing(adTracker, 649, 650);
  });

  it('should use a subsequent ad spacing when two existing ads present', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [
        {adCount: 1, spacing: 600},
        {adCount: 2, spacing: 700},
      ],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [
        addAd(layoutRectLtwh(0, 0, 300, 50)),
        addAd(layoutRectLtwh(0, 0, 300, 50)),
      ],
      adConstraints
    );
    return checkMinSpacing(adTracker, 749, 750);
  });

  it('should change min spacing as ads added', () => {
    const adConstraints = {
      initialMinSpacing: 500,
      subsequentMinSpacing: [
        {adCount: 1, spacing: 600},
        {adCount: 3, spacing: 700},
        {adCount: 4, spacing: 800},
      ],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    return checkMinSpacing(adTracker, 649, 650).then(() => {
      adTracker.addAd(addAd(layoutRectLtwh(0, 0, 300, 50)));
      return checkMinSpacing(adTracker, 649, 650).then(() => {
        adTracker.addAd(addAd(layoutRectLtwh(0, 0, 300, 50)));
        return checkMinSpacing(adTracker, 749, 750).then(() => {
          adTracker.addAd(addAd(layoutRectLtwh(0, 0, 300, 50)));
          return checkMinSpacing(adTracker, 849, 850);
        });
      });
    });
  });

  it('should add an ad to the tracker', () => {
    const adConstraints = {
      initialMinSpacing: 100,
      subsequentMinSpacing: [],
      maxAdCount: 10,
    };

    const adTracker = new AdTracker(
      [addAd(layoutRectLtwh(0, 0, 300, 50))],
      adConstraints
    );
    adTracker.addAd(addAd(layoutRectLtwh(0, 100, 300, 50)));
    return adTracker.isTooNearAnAd(150).then((tooNear) => {
      expect(tooNear).to.equal(true);
    });
  });
});

describes.realWin('getExistingAds', {amp: true}, (env) => {
  let win;
  let doc;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
  });

  it('should find all the amp-ads in the DOM', () => {
    const ad1 = doc.createElement('amp-ad');
    doc.body.appendChild(ad1);
    const ad2 = doc.createElement('amp-ad');
    doc.body.appendChild(ad2);
    const ad3 = doc.createElement('amp-ad');
    doc.body.appendChild(ad3);
    const ad4 = doc.createElement('amp-sticky-ad');
    doc.body.appendChild(ad4);
    ad4.appendChild(doc.createElement('amp-ad'));

    const ads = getExistingAds(ampdoc);
    expect(ads).to.have.lengthOf(3);
    expect(ads[0]).to.equal(ad1);
    expect(ads[1]).to.equal(ad2);
    expect(ads[2]).to.equal(ad3);
  });
});

describes.realWin('getAdConstraintsFromConfigObj', {amp: true}, (env) => {
  let ampdoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
  });

  it('should get from pixel values', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            adCount: 4,
            spacing: '170px',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.deep.equal({
      initialMinSpacing: 150,
      subsequentMinSpacing: [
        {
          adCount: 2,
          spacing: 160,
        },
        {
          adCount: 4,
          spacing: 170,
        },
      ],
      maxAdCount: 8,
    });
  });

  it('should get from viewport values', () => {
    const viewportMock = env.sandbox.mock(Services.viewportForDoc(ampdoc));
    viewportMock.expects('getHeight').returns(500).atLeast(1);

    const configObj = {
      adConstraints: {
        initialMinSpacing: '0.4vp',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '0.5vp',
          },
          {
            adCount: 4,
            spacing: '1.5vp',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.deep.equal({
      initialMinSpacing: 200,
      subsequentMinSpacing: [
        {
          adCount: 2,
          spacing: 250,
        },
        {
          adCount: 4,
          spacing: 750,
        },
      ],
      maxAdCount: 8,
    });
  });

  it('should handle no subsequentMinSpacing', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.deep.equal({
      initialMinSpacing: 150,
      subsequentMinSpacing: [],
      maxAdCount: 8,
    });
  });

  it('should return null when initialMinSpacing unparsable', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150em',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            adCount: 4,
            spacing: '170px',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });

  it('should return null when initialMinSpacing negative', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '-1px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            adCount: 4,
            spacing: '170px',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });

  it('should return null when subsequentMinSpacing unparsable', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            adCount: 4,
            spacing: '170em',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });

  it('should return null when subsequentMinSpacing negative', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            adCount: 4,
            spacing: '-1px',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });

  it('should return null when no adCount', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
          {
            spacing: '170px',
          },
        ],
        maxAdCount: 8,
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });

  it('should return null when no maxAdCount', () => {
    const configObj = {
      adConstraints: {
        initialMinSpacing: '150px',
        subsequentMinSpacing: [
          {
            adCount: 2,
            spacing: '160px',
          },
        ],
      },
    };

    expect(getAdConstraintsFromConfigObj(ampdoc, configObj)).to.be.null;
  });
});

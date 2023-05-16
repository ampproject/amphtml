import '../../../amp-ad/0.1/amp-ad';
import {waitForChild} from '#core/dom';

import {Services} from '#service';

import {sleep} from '#testing/helpers';

import {AnchorAdStrategy} from '../anchor-ad-strategy';

describes.realWin(
  'anchor-ad-strategy',
  {
    amp: {
      runtimeOn: true,
      ampdoc: 'single',
      extensions: ['amp-ad'],
    },
  },
  (env) => {
    let configObj;
    let attributes;

    beforeEach(() => {
      const viewportMock = env.sandbox.mock(
        Services.viewportForDoc(env.win.document)
      );
      viewportMock.expects('getWidth').returns(360).atLeast(1);

      configObj = {
        optInStatus: [1],
      };

      attributes = {
        'data-ad-client': 'ca-pub-test',
        'type': 'adsense',
        'data-no-fill': 'true',
      };
    });

    describe('run', () => {
      it('should insert sticky ad if opted in', () => {
        configObj['optInStatus'].push(2);

        const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc,
          attributes,
          configObj
        );

        const strategyPromise = anchorAdStrategy.run().then((placed) => {
          expect(placed).to.equal(true);
        });

        const expectPromise = new Promise((resolve) => {
          waitForChild(
            env.win.document.body,
            (parent) => {
              return parent.firstChild.tagName == 'AMP-STICKY-AD';
            },
            () => {
              const stickyAd = env.win.document.body.firstChild;
              expect(stickyAd.getAttribute('layout')).to.equal('nodisplay');
              const ampAd = stickyAd.firstChild;
              expect(ampAd.getAttribute('type')).to.equal('adsense');
              expect(ampAd.getAttribute('width')).to.equal('360');
              expect(ampAd.getAttribute('height')).to.equal('100');
              expect(ampAd.getAttribute('data-ad-client')).to.equal(
                'ca-pub-test'
              );
              expect(ampAd.getAttribute('data-no-fill')).to.equal('true');
              resolve();
            }
          );
        });

        return Promise.all([strategyPromise, expectPromise]);
      });

      it('should insert amp-ad sticky ad for top sticky ads', () => {
        configObj['optInStatus'].push(2);
        attributes['sticky'] = 'top';

        const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc,
          attributes,
          configObj
        );

        const strategyPromise = anchorAdStrategy.run().then((placed) => {
          expect(placed).to.equal(true);
        });

        const expectPromise = new Promise((resolve) => {
          waitForChild(
            env.win.document.body,
            (parent) => {
              return parent.firstChild.tagName == 'AMP-AD';
            },
            () => {
              const ampAd = env.win.document.body.firstChild;
              expect(ampAd.getAttribute('sticky')).to.equal('top');
              expect(ampAd.getAttribute('type')).to.equal('adsense');
              expect(ampAd.getAttribute('width')).to.equal('360');
              expect(ampAd.getAttribute('height')).to.equal('100');
              expect(ampAd.getAttribute('data-ad-client')).to.equal(
                'ca-pub-test'
              );
              expect(ampAd.getAttribute('data-no-fill')).to.equal('true');
              resolve();
            }
          );
        });

        return Promise.all([strategyPromise, expectPromise]);
      });

      it('should not insert sticky ad if not opted in anchor ad', async () => {
        const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc,
          attributes,
          configObj
        );

        const placed = await anchorAdStrategy.run();
        await expect(placed).to.equal(false);

        await sleep(500);
        expect(
          env.win.document.getElementsByTagName('AMP-STICKY-AD')
        ).to.have.lengthOf(0);
      });

      it('should not insert sticky ad if exists one', async () => {
        configObj['optInStatus'].push(2);

        const existingStickyAd =
          env.win.document.createElement('amp-sticky-ad');
        env.win.document.body.appendChild(existingStickyAd);

        const anchorAdStrategy = new AnchorAdStrategy(
          env.ampdoc,
          attributes,
          configObj
        );

        const placed = await anchorAdStrategy.run();
        await expect(placed).to.equal(false);

        await sleep(500);
        expect(
          env.win.document.getElementsByTagName('AMP-STICKY-AD')
        ).to.have.lengthOf(1);
      });
    });
  }
);

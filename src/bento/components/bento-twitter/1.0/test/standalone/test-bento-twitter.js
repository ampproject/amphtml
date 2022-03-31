import {CSS} from '#build/bento-twitter-1.0.css';

import {BaseElement as BentoTwitter} from '#bento/components/bento-twitter/1.0/base-element';
import {adoptStyles} from '#bento/util/unit-helpers';

import {createElementWithAttributes} from '#core/dom';

import {defineBentoElement} from '#preact/bento-ce';

import {waitFor} from '#testing/helpers/service';
import {doNotLoadExternalResourcesInTest} from '#testing/iframe';

describes.realWin(
  'bento-twitter-v1.0',
  {
    amp: false,
  },
  (env) => {
    let win, doc, element;

    const waitForRender = async () => {
      await element.getApi();
      const shadow = element.shadowRoot;
      await waitFor(() => shadow.querySelector('iframe'), 'iframe mounted');
    };

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
      defineBentoElement('bento-twitter', BentoTwitter, win);
      adoptStyles(win, CSS);
      // Override global window here because Preact uses global `createElement`.
      doNotLoadExternalResourcesInTest(window, env.sandbox);
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'bento-twitter', {
        'data-tweetid': '585110598171631616',
        style: `height: 500px; width: 500px; display: block; position: relative;`,
      });
      doc.body.appendChild(element);
      await waitForRender();

      expect(element.shadowRoot.querySelector('iframe').src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('should replace iframe after tweetid mutation', async () => {
      const originalTweetId = '585110598171631616';
      const newTweetId = '638793490521001985';
      element = createElementWithAttributes(win.document, 'bento-twitter', {
        'data-tweetid': originalTweetId,
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      const originalName = iframe.getAttribute('name');
      expect(originalName).to.contain(originalTweetId);
      expect(originalName).not.to.contain(newTweetId);

      element.setAttribute('data-tweetid', newTweetId);
      await waitFor(
        () =>
          element.shadowRoot.querySelector('iframe').getAttribute('name') !=
          originalName,
        'iframe changed'
      );

      const newName = element.shadowRoot
        .querySelector('iframe')
        .getAttribute('name');
      expect(newName).not.to.contain(originalTweetId);
      expect(newName).to.contain(newTweetId);
    });

    it('should pass the data-loading attribute to the underlying iframe', async () => {
      element = createElementWithAttributes(doc, 'bento-twitter', {
        'data-tweetid': '585110598171631616',
        'data-loading': 'eager',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('eager');
    });

    it('should set data-loading="auto" if no value is specified', async () => {
      element = createElementWithAttributes(doc, 'bento-twitter', {
        'data-tweetid': '585110598171631616',
      });
      doc.body.appendChild(element);
      await waitForRender();

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe.getAttribute('loading')).to.equal('auto');
    });
  }
);

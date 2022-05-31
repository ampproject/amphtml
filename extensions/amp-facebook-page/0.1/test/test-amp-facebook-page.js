import '../amp-facebook-page';
import {facebook} from '#3p/facebook';

import {serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service-helpers';

describes.realWin(
  'amp-facebook-page',
  {
    amp: {
      extensions: ['amp-facebook-page:0.1'],
    },
  },
  (env) => {
    let win, doc, element;
    const href = 'https://www.facebook.com/nasa/';

    beforeEach(async function () {
      win = env.win;
      doc = win.document;
    });

    it('renders', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.src).to.equal(
        'http://ads.localhost:9876/dist.3p/current/frame.max.html'
      );
    });

    it('ensures iframe is not sandboxed in amp-facebook-page', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.hasAttribute('sandbox')).to.be.false;
    });

    it('propagates title to iframe', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
        'title': 'my custom facebook page',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.title).to.equal('my custom facebook page');
    });

    it('renders amp-facebook-page with specified locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'data-locale': 'fr_FR',
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.getAttribute('name')).to.contain('"locale":"fr_FR"');
    });

    it('renders with correct embed type', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('page');
    });

    it("container's height is changed", async () => {
      const iframeSrc =
        'http://ads.localhost:' +
        location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);

      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-facebook-page', {
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox
        .stub(impl, 'attemptChangeHeight')
        .resolves();

      const mockEvent = new CustomEvent('message');
      const sentinel = JSON.parse(
        element.querySelector('iframe').getAttribute('name')
      )['attributes']['_context']['sentinel'];
      mockEvent.data = serializeMessage('embed-size', sentinel, {
        'height': 1000,
      });
      mockEvent.source = element.querySelector('iframe').contentWindow;
      win.dispatchEvent(mockEvent);
      expect(attemptChangeHeightStub).to.be.calledOnce.calledWith(1000);
    });

    it('adds fb-page element correctly', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
    });

    it('adds fb-page element with data-locale', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        locale: 'fr_FR',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);

      const script = doc.body.querySelector('script');
      expect(script.src).to.contain('fr_FR');
    });

    it('adds fb-page element with data-tabs', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        tabs: 'messages',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-tabs')).to.equal('messages');
    });

    it('adds fb-page element with data-hide-cover', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        hideCover: true,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-hide-cover')).to.equal('true');
    });

    it('adds fb-page element with data-hide-cta', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        hideCta: true,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-hide-cta')).to.equal('true');
    });

    it(
      'check that fb-page element correctly sets `data-adapt-container-width` ' +
        "attribute to 'true'",
      () => {
        const div = doc.createElement('div');
        div.setAttribute('id', 'c');
        doc.body.appendChild(div);

        facebook(win, {
          embedAs: 'page',
          href,
          width: 200,
          height: 200,
        });
        const container = doc.body.getElementsByClassName('fb-page')[0];
        expect(container).not.to.be.undefined;
        expect(container.getAttribute('data-adapt-container-width')).to.equal(
          'true'
        );
      }
    );

    it('adds fb-page element with default attrs', () => {
      const div = doc.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'page',
        href,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-page')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-tabs')).to.equal('undefined');
      expect(container.getAttribute('data-hide-cover')).to.equal('undefined');
      expect(container.getAttribute('data-show-facepile')).to.equal(
        'undefined'
      );
      expect(container.getAttribute('data-hide-cta')).to.equal('undefined');
      expect(container.getAttribute('data-small-header')).to.equal('undefined');
      expect(container.getAttribute('data-adapt-container-width')).to.equal(
        'true'
      );

      const script = doc.body.querySelector('script');
      expect(script.src).to.contain('en_US');
    });
  }
);

import '../amp-facebook-like';
import {facebook} from '#3p/facebook';

import {serializeMessage} from '#core/3p-frame-messaging';
import {createElementWithAttributes} from '#core/dom';

import {setDefaultBootstrapBaseUrlForTesting} from '../../../../src/3p-frame';
import {resetServiceForTesting} from '../../../../src/service-helpers';

describes.realWin(
  'amp-facebook-like',
  {
    amp: {
      extensions: ['amp-facebook-like:0.1'],
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
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
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

    it('propagates title to iframe', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
        'title': 'my custom facebook like element',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      expect(iframe.title).to.equal('my custom facebook like element');
    });

    it('ensures iframe is not sandboxed in amp-facebook-like', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
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

    it('renders amp-facebook-like with specified locale', async () => {
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
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
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
        'height': 500,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const iframe = element.querySelector('iframe');
      const context = JSON.parse(iframe.getAttribute('name'));
      expect(context.attributes.embedAs).to.equal('like');
    });

    it("container's height is changed", async () => {
      const iframeSrc =
        'http://ads.localhost:' +
        location.port +
        '/test/fixtures/served/iframe.html';
      resetServiceForTesting(win, 'bootstrapBaseUrl');
      setDefaultBootstrapBaseUrlForTesting(iframeSrc);

      const initialHeight = 300;
      element = createElementWithAttributes(doc, 'amp-facebook-like', {
        'height': initialHeight,
        'width': 500,
        'layout': 'responsive',
      });
      doc.body.appendChild(element);
      await element.buildInternal();
      await element.layoutCallback();

      const impl = await element.getImpl(false);
      const attemptChangeHeightStub = env.sandbox.stub(
        impl,
        'attemptChangeHeight'
      );
      attemptChangeHeightStub.returns(Promise.resolve());

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

    it('adds fb-like element correctly', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
    });

    it('adds fb-like element with data-locale', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        locale: 'fr_FR',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);

      const script = doc.body.querySelector('script');
      expect(script.src).to.contain('fr_FR');
    });

    it('adds fb-like element with data-action', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        action: 'recommend',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-action')).to.equal('recommend');
    });

    it('adds fb-like element with data-colorscheme', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        colorscheme: 'dark',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-colorscheme')).to.equal('dark');
    });

    it('adds fb-like element with data-kd_site', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        'kd_site': true,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-kd_site')).to.equal('true');
    });

    it('adds fb-like element with data-layout', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        layout: 'button',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-layout')).to.equal('button');
    });

    it('adds fb-like element with data-ref', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        ref: 'asd',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-ref')).to.equal('asd');
    });

    it('adds fb-like element with data-share', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        share: true,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-share')).to.equal('true');
    });

    it('adds fb-like element with data-show_faces', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        'show_faces': true,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-show_faces')).to.equal('true');
    });

    it('adds fb-like element with data-size', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        size: 'large',
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-size')).to.equal('large');
    });

    it('adds fb-like element with default attrs', () => {
      const div = document.createElement('div');
      div.setAttribute('id', 'c');
      doc.body.appendChild(div);

      facebook(win, {
        embedAs: 'like',
        href,
        width: 100,
        height: 100,
      });
      const container = doc.body.getElementsByClassName('fb-like')[0];
      expect(container).not.to.be.undefined;
      expect(container.getAttribute('data-href')).to.equal(href);
      expect(container.getAttribute('data-action')).to.equal('like');
      expect(container.getAttribute('data-colorscheme')).to.equal('light');
      expect(container.getAttribute('data-kd_site')).to.equal('false');
      expect(container.getAttribute('data-layout')).to.equal('standard');
      expect(container.getAttribute('data-ref')).to.equal('');
      expect(container.getAttribute('data-share')).to.equal('false');
      expect(container.getAttribute('data-show_faces')).to.equal('false');
      expect(container.getAttribute('data-size')).to.equal('small');

      const script = doc.body.querySelector('script');
      expect(script.src).to.contain('en_US');
    });
  }
);

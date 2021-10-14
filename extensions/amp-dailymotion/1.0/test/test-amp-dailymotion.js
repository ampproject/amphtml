import '../amp-dailymotion';
import {htmlFor} from '#core/dom/static-template';
import {toggleExperiment} from '#experiments';
import {waitFor} from '#testing/test-helper';

describes.realWin(
  'amp-dailymotion-v1.0',
  {
    amp: {
      extensions: ['amp-dailymotion:1.0'],
    },
  },
  (env) => {
    let win;
    let doc;
    let html;

    beforeEach(async () => {
      win = env.win;
      doc = win.document;
      html = htmlFor(doc);
      toggleExperiment(win, 'bento-dailymotion', true, true);
    });

    it('renders', async () => {
      const element = html`
        <amp-dailymotion
          data-videoid="x3rdtfy"
          width="500"
          height="281"
        ></amp-dailymotion>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x3rdtfy?api=1&html=1&app=amp'
      );
    });

    it('renders with optional attrs correctly', async () => {
      const element = html`
        <amp-dailymotion
          data-videoid="x3rdtfy"
          width="500"
          height="281"
          data-mute="true"
          data-endscreen-enable="true"
          data-sharing-enable="true"
          data-ui-highlight="444444"
          data-info="true"
        ></amp-dailymotion>
      `;
      env.win.document.body.appendChild(element);

      await waitForRender(element);

      const iframe = element.shadowRoot.querySelector('iframe');
      expect(iframe).to.not.be.null;
      // Mute Attr
      expect(iframe.src).to.contain('mute=true');
      // Enscreen Enable attr
      expect(iframe.src).to.contain('endscreen-enable=true');
      // Sharing Enable attr
      expect(iframe.src).to.contain('sharing-enable=true');
      // UI Highlight attr
      expect(iframe.src).to.contain('ui-highlight=444444');
      // info attr
      expect(iframe.src).to.contain('info=true');
    });
  }
);

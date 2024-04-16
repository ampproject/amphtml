import {AmpAd} from '../../../amp-ad/0.1/amp-ad'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {AmpAdNetworkFakeImpl} from '../amp-ad-network-fake-impl';

describes.realWin(
  'amp-ad-network-fake-impl',
  {
    amp: {
      extensions: ['amp-ad', 'amp-ad-network-fake-impl'],
    },
  },
  (env) => {
    const title = `<title>Hello, world.</title>`;
    const styleBoilerplate = `<style amp4ads-boilerplate>body{visibility:hidden}</style>`;
    const ampExperiment = `<script async custom-element=amp-experiment src=https://cdn.ampproject.org/v0/amp-experiment-0.1.js></script>`;
    const ampAudio = `<script async custom-element=amp-audio src=https://cdn.ampproject.org/v0/amp-audio-0.1.js></script>`;
    const noscript = `<noscript><style amp-boilerplate> body{-webkit-animation:none;-moz-animation:none;-ms-animation:none; animation:none}</style></noscript>`;
    const ampRuntimeStyle = `<style amp-runtime i-amphtml-version=42></style>`;
    const ampRuntimeScript = `<script async src=https://cdn.ampproject.org/amp4ads-v0.js></script>`;
    const fontLink = `<link href=https://fonts.googleapis.com/css?foobar rel=stylesheet type=text/css>`;
    const crossorigin = `<link crossorigin href=https://fonts.gstatic.com/ rel="dns-prefetch preconnect">`;
    const metaCharset = `<meta charset=utf-8></meta>`;
    const metaViewport = `<meta name=viewport content="width=device-width,minimum-scale=1,initial-scale=1"></meta>`;
    const ampCustomStyle = `<style amp-custom></style>`;
    const linkIcon = `<link href=https://example.test/favicon.ico rel=icon>`;
    let doc;
    let win;
    let fakeImplElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      fakeImplElem = doc.createElement('amp-ad');
      fakeImplElem.setAttribute('type', 'fake');
      fakeImplElem.setAttribute('src', 'https://fake.com');
      fakeImplElem.setAttribute('layout', 'fixed');
      fakeImplElem.setAttribute('width', '300');
      fakeImplElem.setAttribute('height', '250');
    });

    it('should not send ad request with valid id', () => {
      const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
      // no id
      expect(fakeImpl.isValidElement()).to.be.false;
      // valid id
      fakeImplElem.setAttribute('id', 'valid');
      const fakeImpl2 = new AmpAdNetworkFakeImpl(fakeImplElem);
      expect(fakeImpl2.isValidElement()).to.be.false;
    });

    it('send ad request with invalid id', () => {
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
      expect(fakeImpl.isValidElement()).to.be.true;
    });

    it('reorders head and inserts metadata into creative', () => {
      const input =
        `<html><head>` +
        title +
        styleBoilerplate +
        ampExperiment +
        ampAudio +
        noscript +
        ampRuntimeStyle +
        ampRuntimeScript +
        fontLink +
        crossorigin +
        metaCharset +
        metaViewport +
        ampCustomStyle +
        linkIcon +
        `</head><body><amp-analytics><script type=application/json>Iñtërnâtiônàlizætiøn☃💩</script></amp-analytics></body></html>`;
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      const transformed = new AmpAdNetworkFakeImpl(
        fakeImplElem
      ).transformCreative_(input);
      expect(transformed).to.include(
        '<script type="application/json" amp-ad-metadata>'
      );
      const root = new DOMParser().parseFromString(transformed, 'text/html');
      const parsed = JSON.parse(
        root.querySelector('script[amp-ad-metadata]').textContent
      );
      const runtimeOffsetStart = parsed.ampRuntimeUtf16CharOffsets[0];
      const runtimeOffsetEnd = parsed.ampRuntimeUtf16CharOffsets[1];
      expect(
        transformed.substr(
          runtimeOffsetStart,
          runtimeOffsetEnd - runtimeOffsetStart
        )
      ).to.equal(
        '<script async="" src="https://cdn.ampproject.org/amp4ads-v0.js"></script><script async="" custom-element="amp-experiment" src="https://cdn.ampproject.org/v0/amp-experiment-0.1.js"></script><script async="" custom-element="amp-audio" src="https://cdn.ampproject.org/v0/amp-audio-0.1.js"></script>'
      );
      const jsonOffsetStart = parsed.jsonUtf16CharOffsets['amp-analytics'][0];
      const jsonOffsetEnd = parsed.jsonUtf16CharOffsets['amp-analytics'][1];
      expect(
        transformed.substr(jsonOffsetStart, jsonOffsetEnd - jsonOffsetStart)
      ).to.equal(
        '<script type="application/json">Iñtërnâtiônàlizætiøn☃💩</script>'
      );
      expect(transformed).to.include(
        '"customElementExtensions":["amp-experiment","amp-audio"]'
      );
      expect(transformed).to.include(
        '"customStyleSheets":[{"href":"https://fonts.googleapis.com/css?foobar"}]'
      );
    });

    it('handles html file with preexisting metadata', () => {
      const input = `<!doctype html>
      <html amp4ads>
      <head>
        <meta charset=utf-8>
        <meta content="width=device-width,minimum-scale=1,initial-scale=1" name=viewport>
        <meta content="vendor=doubleclick,type=impression-id,value=CLfNmv7dzuMCFUI6TwodNk4Krg" name=amp4ads-id>
        <script async src=https://cdn.ampproject.org/amp4ads-v0.js></script>
        <script async custom-element=amp-analytics src=https://cdn.ampproject.org/v0/amp-analytics-0.1.js></script>
        <style amp-custom>a { color: #000000 }body { margin: 0; background: transparent; }#google_image_div {height: 250px;width: 300px;overflow:hidden;position:relative}html, body {width:100%;height:100%;}body {display:table;text-align:center;}#google_center_div {display:table-cell;}#google_image_div {display:inline-block;}.abgc {position:absolute;z-index:2147483646;right:0;top:0;}.abgc amp-img, .abgc img {display:block;}.abgs {position:absolute;-webkit-transform:translateX(76px);transform:translateX(76px);right:16px;top:0;}.abgcp {position:absolute;right:0;top:0;width:31px;height:15px;padding-left:10px;padding-bottom:10px;}.abgb {position:relative;margin-right:16px;top:0;}.abgc:hover .abgs {-webkit-transform:none;transform:none;}.cbb {display: block;position: absolute;right:0;top:0;cursor: pointer;height: 15px;width: 15px;z-index: 9020;padding-left:16px;}.btn {display: inline-block;border-radius: 2px;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;box-shadow: 0px 0px 2px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.26);cursor: pointer;font-size: 0.7em;margin: 0 1px 0.4em 1px;}@media (max-width: 375px) and (min-height: 100px) {.btn {display: block;width: 90%;max-width: 240px;margin-left: auto;margin-right: auto;}}#spv1 amp-fit-text>div {-webkit-justify-content: flex-start;justify-content: flex-start;}.jm.sh #spv1 amp-fit-text>div {-webkit-justify-content: center;justify-content: center;}.jt .pn amp-fit-text>div {-webkit-justify-content: flex-start;justify-content: flex-start;}.btn > span {display: inline-block;padding: 0.5em 0.6em;line-height: 1em;}#sbtn {background-color: #FFFFFF;color: #9E9EA6;text-decoration: none;}#sbtn:hover,#sbtn:active {background-color: #F5F5F5;}#rbtn {background-color: rgb(66,133,245);color: white;}#rbtn:hover,#rbtn:active {background-color: #3275E5;}#mta {position:absolute;top: 0;left: 0;font-family: Arial, sans-serif;font-size: 12px;font-weight: 400;line-height: 1em;}#mta input[type="radio"] {display: none;}#mta .pn {left: -320px;top: -250px;width:320px;height:250px;position: absolute;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;background-color: #FAFAFA;text-align: center;}#spv2 {display: -webkit-flex;display: flex;-webkit-justify-content: flex-start;justify-content: flex-start;-webkit-flex-wrap: nowrap;flex-wrap: nowrap;overflow: hidden;background-color: #FAFAFA;font-size: 0;}.sv #spv2 {-webkit-flex-direction: column;flex-direction: column;}.sh #spv2 {-webkit-flex-direction: row;flex-direction: row;-webkit-justify-content: center;justify-content: center;}.sh.sr #spv2 {-webkit-justify-content: flex-start;justify-content: flex-start;}.jt.sv #spv2 {-webkit-justify-content: flex-start;justify-content: flex-start;-webkit-align-items: center;align-items: center;}.jm.sh #spv2 {-webkit-align-items: center;align-items: center;}.jm.sv #spv2 {-webkit-justify-content: center;justify-content: center;-webkit-align-items: center;align-items: center;}#spv2 * {-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box;}#mta input[name="a"]:checked ~ #cbb {display: none;}#spv3 {opacity:1;}.amp-animate #spv4 {opacity:0;transition: opacity 0.5s linear 2.5s;}.amp-animate  #spv3 amp-fit-text {opacity:1;transition: opacity 0.5s linear 2s;}#spr3:checked ~ #spv3 amp-fit-text {opacity:0}#spr3:checked ~ #spv4 {opacity:1;}#spr1:checked ~ #spv1,#spr2:checked ~ #spv2,#spr3:checked ~ #spv3,#spr3:checked ~ #spv4{right: 0px;top: 0px;}.ct svg {border: 0;margin: 0 0 -0.45em 0;display: inline-block;height: 1.38em;opacity: 0.4;}.ct {display: inline-block;line-height: 1.28em;color: rgba(0,0,0,0.4);text-align:center;padding: 0.3em;}.fct {padding: 1em;}#pct {display: block;font-weight: bold;padding: 1em 0.3em;}#ti {width: 320px;}#btns {width: 320px;}.fl {width: 320px;height:250px;}#si {position: relative;display: inline-block;margin-bottom: -0.15em;height: 1em;width: 1em;opacity: 0.4;}.sb {flex-shrink: 0;height: 50px;}.so {position: relative;z-index: 9110;overflow: hidden;display: inline-block;padding: 1px 5px;width: 96px;height: 50px;border: 1px solid #E0E0E0;background-color: #FFFFFF;cursor: pointer;}.so:hover,.so:active {background-color: #F5F5F5;}.so div {display: -webkit-flex;display: flex;-webkit-align-items: center;align-items: center;-webkit-justify-content: center;justify-content: center;width: 100%;height: 100%;}.so span {color: #4285F4;font-family: Arial, sans-serif;text-align: center;font-size: 12px;line-height: 14px;white-space: normal;}@media (min-height: 54px) {.sh.ss .so,.sv .so {box-shadow: 0px 0px 2px rgba(0,0,0,0.12), 0px 1px 3px rgba(0,0,0,0.26);border: none;}}.sh .so {margin-left: -1px;box-shadow: none;}.sh .so:first-child {margin-left: 0;}.sh.ss .so {margin-left: 8px;}.sh.ss .so:first-child {margin-left: 0;}.sh.jt .sb {margin-top: 8px;}.sv .so,.sh.ss .so {border-radius: 2px;}.sv .so {margin: 4px;}.sv.jt .so:first-child {margin-top: 8px;}</style>
        <style amp4ads-boilerplate>body{visibility:hidden}</style>
      </head>
      <body class=amp-animate>
      <div id=google_center_div>
        <div id=google_image_div>
          <a href="https://amp.dev" id=aw0 on="tap:exit-api.exit(target=&#39;landingPage&#39;,_nb=&#39;2&#39;)" target=_blank>
            <amp-img alt class=img_ad height=250 width=300 src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAD6BAMAAADpQ2fAAAAAG1BMVEUiIiKqqqqIiIhVVVVmZmYzMzN3d3dERESZmZlLV2+BAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEWklEQVR4nO2azVPaQBiHUyHGY0OtchS0jEeVOvYIlmqPItPao0ypcixTrT2KtZY/u7sJyW7ebBJ2wiZO5/dcDNlk87gfb/ZdsCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwX9FwU9h7nlodaEFrzqDdPtO85ZPM0HVv5c/LsbL2Xfd7nvu7Oe9PAFo6QEsHaOkALR2gpQO0dICWDtDSwbDWxcnudPbwVXmJ/bY5q8+aoyPF8tiolv0xWOJfxwt/igRg57BILUdKRn7TwneRzGSHVGJQy46kSG+ihb9IxlSfn6/2PFjmMuqF6KfqKVpd73Gt0dWu9+BI3VXfpdlqzuZe84I1VZZ3v0Stc/7ca284O2N2vC4XstZwa0feof3juEAte8qswhbiI6kjCnljrYsJ6BwXpvUlImKz5nklCtmIrkXCwqBRjBZvrL/SZ94+QoQVXpLrg79+cs68D0Wqrpv3J2utsC48IxduSY619GpNBQhW7+vIiVWpF1lP/SlFy6YRgXdcEJusfubOjiEt1k0b8SfticOM4WJIq0/70BttW/PDYRgPCtbaj3dTRZg2RH8Wq9VQdNM0DPSNrIloSMuODy3edYFMWa1VicR08ahQsJyxxYLUy9jJfnhp9krbjNaaFNLlk53woZdlaCnj5WooowgfhWhNVGerYROulvRO7KrCeCVcoThuVi+a0VJONUfMgyFdbxWjpQxMthhRfLEXy4WK0FKMHaa1GRyydaD7mNJeZrSmiiAva3n5h1v7ULAWe+RdHDn0e9ma+xRLpw1rqRFaQcad0GJlaVnOcH7uMWFhVI6W2DepKxqsPC2eHM5PfytMSzXk7+5uyXU3Y9+rU5SWIkAo8VusTusoW8uyDuK9ay6cZi3WJT5zL5JUmtHKXqzL8JC/GT31HLR4JeR6M1rZOUSEaqwXzWjp1jqke1hmtCaav5hao4PLjFY/M7WJUiFbq+YSsnudWmyac5jRWs3MuAh06prRcminZDGMa+l/R5CpZcUCUQY0oujOGUqC1lCz2oK0JppjnnZiP+fv5hK0VlQ7SSnQd7tuhKEkaDl0Wz6d2DbdC9WWT34tvkupUW+VNq5u4KMkafV1VoL86ug2nXbgW1CLvU40RkeDXlzVDXwLaqVuypyTW1jbkI0nWzfwLarF5iLZlLGPg6NJPZLk82+P6byd5osQybuzPKXZlj4PGuH/z6Latmgd/l1jrMO7+XoxWYv3jPsUFA7GUrcwLbf2/izQdRV7lt4OmH/FzdMytfjrlov12u3eydTLBoOSvp+0Pox6vSs/s76kNzveDa0ev1VjSi+gZQebHwGhlkNLFDuDXVG6XC3qtSG9fA8iJapRVJma0rJs6em100jRYCyKtpU3V0MvrbfrQjgnu/4oim/7XfhF9VHSv+V4I7LeOk0oz4ed/CN6O+tL+5R7AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC8/APxIjOC0ym0IgAAAABJRU5ErkJggg=="></amp-img>
          </a>
          <div aria-hidden=true class="abgc abgf pen" dir=ltr id=abgc>
            <amp-analytics>
              <script type=application/json>{"requests": {"reportNoLabelInstance": "https://amp.dev","reportLabelInstance": "https://amp.dev","transport": {"beacon": false,"xhrpost": false,"image": true},"triggers": {"trackMute": {"on": "click","selector": "label[for='spr1']","request": "reportNoLabelInstance"},"trackReportAd": {"on": "click","selector": "label[for='spr2']","request": "reportLabelInstance"},"trackSurveyResponse": {"on": "click","selector": "label[for='spr3']","request": "reportLabelInstance"},"trackWhyThisAd": {"on": "click","selector": "#sbtn","request": "reportLabelInstance"}}}</script>
            </amp-analytics>
          </div>
        </div>
      </div>
      <amp-analytics>
        <script type=application/json>{"transport": {"beacon": true, "xhrpost": false},"requests": {"ampeos": "https://pagead2.googlesyndication.com/pcs/activeview"},"triggers": {"endOfSession": {"on": "visible","request": "ampeos","visibilitySpec": {"reportWhen": "documentExit","selector": ":root","visiblePercentageMin": 50}}}}</script>
      </amp-analytics>
      <amp-analytics type=bg>
        <script type=application/json> {"requests": {"pageview": "https://pagead2.googlesyndication.com/bg/"},"triggers": {"defaultPageview": {"on": "visible","request": "pageview"}}}</script>
      </amp-analytics>
      <script amp-ad-metadata type=application/json>
        {
          "ampRuntimeUtf16CharOffsets" : [ 239, 719 ],
          "customElementExtensions" : [ "amp-ad-exit", "amp-analytics", "amp-fit-text", "amp-form" ],
          "extensions" : [
            {
              "custom-element" : "amp-ad-exit",
              "src" : "https://cdn.ampproject.org/v0/amp-ad-exit-0.1.js"
            },
            {
              "custom-element" : "amp-analytics",
              "src" : "https://cdn.ampproject.org/v0/amp-analytics-0.1.js"
            },
            {
              "custom-element" : "amp-fit-text",
              "src" : "https://cdn.ampproject.org/v0/amp-fit-text-0.1.js"
            },
            {
              "custom-element" : "amp-form",
              "src" : "https://cdn.ampproject.org/v0/amp-form-0.1.js"
            }
          ],
          "jsonUtf16CharOffsets" : {
            "amp-analytics" : [ 11196, 13576, 20920, 22116, 23670, 28548 ]
          }
        }
      </script>
      </body>
      </html>`;
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-test');
      const transformed = new AmpAdNetworkFakeImpl(
        fakeImplElem
      ).transformCreative_(input);
      expect(transformed).to.include(
        '<script type="application/json" amp-ad-metadata>'
      );
      const root = new DOMParser().parseFromString(transformed, 'text/html');
      const parsed = JSON.parse(
        root.querySelector('script[amp-ad-metadata]').textContent
      );
      const runtimeOffsetStart = parsed.ampRuntimeUtf16CharOffsets[0];
      const runtimeOffsetEnd = parsed.ampRuntimeUtf16CharOffsets[1];
      expect(
        transformed.substr(
          runtimeOffsetStart,
          runtimeOffsetEnd - runtimeOffsetStart
        )
      ).to.equal(
        '<script async="" src="https://cdn.ampproject.org/amp4ads-v0.js"></script><script async="" custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>'
      );
      const jsonOffsetStart1 = parsed.jsonUtf16CharOffsets['amp-analytics'][0];
      const jsonOffsetEnd1 = parsed.jsonUtf16CharOffsets['amp-analytics'][1];
      const jsonOffsetStart2 = parsed.jsonUtf16CharOffsets['amp-analytics'][2];
      const jsonOffsetEnd2 = parsed.jsonUtf16CharOffsets['amp-analytics'][3];
      const jsonOffsetStart3 = parsed.jsonUtf16CharOffsets['amp-analytics'][4];
      const jsonOffsetEnd3 = parsed.jsonUtf16CharOffsets['amp-analytics'][5];
      expect(transformed.slice(jsonOffsetStart1, jsonOffsetEnd1)).to.include(
        `<script type="application/json">{"requests": {"reportNoLabelInstance": "https://amp.dev","reportLabelInstance": "https://amp.dev","transport": {"beacon": false,"xhrpost": false,"image": true},"triggers": {"trackMute": {"on": "click","selector": "label[for=\'spr1\']","request": "reportNoLabelInstance"},"trackReportAd": {"on": "click","selector": "label[for=\'spr2\']","request": "reportLabelInstance"},"trackSurveyResponse": {"on": "click","selector": "label[for=\'spr3\']","request": "reportLabelInstance"},"trackWhyThisAd": {"on": "click","selector": "#sbtn","request": "reportLabelInstance"}}}</script>`
      );
      expect(transformed.slice(jsonOffsetStart2, jsonOffsetEnd2)).to.include(
        `<script type="application/json">{"transport": {"beacon": true, "xhrpost": false},"requests": {"ampeos": "https://pagead2.googlesyndication.com/pcs/activeview"},"triggers": {"endOfSession": {"on": "visible","request": "ampeos","visibilitySpec": {"reportWhen": "documentExit","selector": ":root","visiblePercentageMin": 50}}}}</script>`
      );
      expect(transformed.slice(jsonOffsetStart3, jsonOffsetEnd3)).to.include(
        '<script type="application/json"> {"requests": {"pageview": "https://pagead2.googlesyndication.com/bg/"},"triggers": {"defaultPageview": {"on": "visible","request": "pageview"}}}</script>'
      );
      expect(transformed).to.include(
        '"customElementExtensions":["amp-analytics"]'
      );
      expect(transformed).to.include(
        `"images":["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAD6BAMAAADpQ2fAAAAAG1BMVEUiIiKqqqqIiIhVVVVmZmYzMzN3d3dERESZmZlLV2+BAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEWklEQVR4nO2azVPaQBiHUyHGY0OtchS0jEeVOvYIlmqPItPao0ypcixTrT2KtZY/u7sJyW7ebBJ2wiZO5/dcDNlk87gfb/ZdsCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwX9FwU9h7nlodaEFrzqDdPtO85ZPM0HVv5c/LsbL2Xfd7nvu7Oe9PAFo6QEsHaOkALR2gpQO0dICWDtDSwbDWxcnudPbwVXmJ/bY5q8+aoyPF8tiolv0xWOJfxwt/igRg57BILUdKRn7TwneRzGSHVGJQy46kSG+ihb9IxlSfn6/2PFjmMuqF6KfqKVpd73Gt0dWu9+BI3VXfpdlqzuZe84I1VZZ3v0Stc/7ca284O2N2vC4XstZwa0feof3juEAte8qswhbiI6kjCnljrYsJ6BwXpvUlImKz5nklCtmIrkXCwqBRjBZvrL/SZ94+QoQVXpLrg79+cs68D0Wqrpv3J2utsC48IxduSY619GpNBQhW7+vIiVWpF1lP/SlFy6YRgXdcEJusfubOjiEt1k0b8SfticOM4WJIq0/70BttW/PDYRgPCtbaj3dTRZg2RH8Wq9VQdNM0DPSNrIloSMuODy3edYFMWa1VicR08ahQsJyxxYLUy9jJfnhp9krbjNaaFNLlk53woZdlaCnj5WooowgfhWhNVGerYROulvRO7KrCeCVcoThuVi+a0VJONUfMgyFdbxWjpQxMthhRfLEXy4WK0FKMHaa1GRyydaD7mNJeZrSmiiAva3n5h1v7ULAWe+RdHDn0e9ma+xRLpw1rqRFaQcad0GJlaVnOcH7uMWFhVI6W2DepKxqsPC2eHM5PfytMSzXk7+5uyXU3Y9+rU5SWIkAo8VusTusoW8uyDuK9ay6cZi3WJT5zL5JUmtHKXqzL8JC/GT31HLR4JeR6M1rZOUSEaqwXzWjp1jqke1hmtCaav5hao4PLjFY/M7WJUiFbq+YSsnudWmyac5jRWs3MuAh06prRcminZDGMa+l/R5CpZcUCUQY0oujOGUqC1lCz2oK0JppjnnZiP+fv5hK0VlQ7SSnQd7tuhKEkaDl0Wz6d2DbdC9WWT34tvkupUW+VNq5u4KMkafV1VoL86ug2nXbgW1CLvU40RkeDXlzVDXwLaqVuypyTW1jbkI0nWzfwLarF5iLZlLGPg6NJPZLk82+P6byd5osQybuzPKXZlj4PGuH/z6Latmgd/l1jrMO7+XoxWYv3jPsUFA7GUrcwLbf2/izQdRV7lt4OmH/FzdMytfjrlov12u3eydTLBoOSvp+0Pox6vSs/s76kNzveDa0ev1VjSi+gZQebHwGhlkNLFDuDXVG6XC3qtSG9fA8iJapRVJma0rJs6em100jRYCyKtpU3V0MvrbfrQjgnu/4oim/7XfhF9VHSv+V4I7LeOk0oz4ed/CN6O+tL+5R7AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIC8/APxIjOC0ym0IgAAAABJRU5ErkJggg=="]`
      );
    });

    it('renders using srcdoc', async () => {
      // Allow real fetching of data url, fetch-mock is unable to handle it.
      env.win.fetch = env.fetchMock.realFetch;
      const creative = `
      <!doctype html>
      <html ⚡4ads>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,minimum-scale=1">
        <style amp4ads-boilerplate>body{visibility:hidden}</style>
        <style amp-custom>
          #foo { background-color: red; }
        </style>
        <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
      </head>
      <body>
        <p id="foo">Hello, AMP4ADS world.</p>
      </body>
      </html>
      `;
      fakeImplElem.removeAttribute('src');
      fakeImplElem.setAttribute('srcdoc', creative);
      fakeImplElem.setAttribute('id', 'i-amphtml-demo-fake');
      fakeImplElem.setAttribute('a4a-conversion', true);
      doc.body.appendChild(fakeImplElem);

      const fakeImpl = new AmpAdNetworkFakeImpl(fakeImplElem);
      fakeImpl.buildCallback();

      expect(fakeImpl.isValidElement()).to.be.true;
      expect(fakeImpl.getAdUrl()).to.equal(
        'data:text/html,' + encodeURIComponent(creative)
      );
      const response = await fakeImpl.sendXhrRequest(fakeImpl.getAdUrl());
      const responseText = await response.text();
      expect(responseText).to.contain('#foo { background-color: red; }');
      expect(responseText).to.contain('<p id="foo">Hello, AMP4ADS world.</p>');
      expect(responseText).to.contain(
        '<script type="application/json" amp-ad-metadata>{"ampRuntimeUtf16CharOffsets":[110,183]}</script></body></html>'
      );
    });
  }
);

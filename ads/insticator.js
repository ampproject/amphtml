// !!!!!!!!!! ---------- AMP EMBED - INSTICATOR ---------- !!!!!!!!!! //
import { validateData, loadScript } from '../3p/3p';


/*
 * @param {!Window} global
 * @param {!Object} data
*/
// ------- AMP EMBED - INSTICATOR EXPORT ------- //
export function insticator(global, data) {
  // validate passed data attributes
  validateData(data, ['siteId', 'embedId']);

  // create insticator markup
  global.document.getElementById('c').appendChild(createTemplate(data.embedId));

  // create ads and embed
  createAdsAndEmbed(data.siteId, data.embedId);

  // envoke AMP library
  loadScript(global);
};



// ------- HELPER VARIABLES ------- //
// reusable URL references to ads, embed and the library
// Don't forget to preconnect and prefetch as it's described in the docs
// https://github.com/ampproject/amphtml/blob/master/ads/README.md
const url = { content: '//d3lcz8vpax4lo2.cloudfront.net' };


// ------- HELPER FUNCTIONS ------- //
function createTemplate(embedId) {
  const template = document.createElement('template');
  template.innerHTML = `
    <div id="insticator-container">
      <div id="div-insticator-ad-1"></div>
      <div id="insticator-embed" embed-id="${embedId}"></div>
      <div id="div-insticator-ad-2"></div>
    </div>
  `;
  return template.content;
}

function createAdsAndEmbed(siteId, embedId) {
  // helper vars
  const a = window;
  const c = document;
  const s = 'script';
  const u = `${url.content}/ads-code/${siteId}.js`; // vars from preconnect urls and data attributes on amp-embed tag

  // create insticator object on the window
  'Insticator' in a || (a.Insticator = {
      ad: {
          loadAd: function(b) {
              Insticator.ad.q.push(b)
          },
          q: []
      },
      helper: {},
      embed: {},
      version: "4.0",
      q: [],
      amp: null, // this will get set to window.context which is the AMP API so we can access from our ads code
      load: function(t, o) {
          Insticator.amp = window.context; // set the Insticator object property amp to window.context which is the AMP API so we can access from our ads code
          Insticator.q.push({
              t: t,
              o: o
          })
      }
  });

  // load ads code
  const b = c.createElement(s);
  b.src = u;
  b.async = !0;
  const d = c.getElementsByTagName(s)[0];
  d.parentNode.insertBefore(b, d);

  // execute functions of insticator object on the window (load ads and embed)
  Insticator.ad.loadAd("div-insticator-ad-1");
  Insticator.ad.loadAd("div-insticator-ad-2");
  Insticator.load("em", {id : embedId});
}
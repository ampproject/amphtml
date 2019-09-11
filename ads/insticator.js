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

  // load insticator scripts that create an embed and ads
  createComponent(global.document.getElementById('c'), data.siteId, data.embedId);

  // envoke AMP library (with new insticator embed)
  loadScript(global, url.lib);
};



// ------- HELPER VARIABLES ------- //
// reusable URL references to ads, embed and the library
// Don't forget to preconnect and prefetch as it's described in the docs
// https://github.com/ampproject/amphtml/blob/master/ads/README.md
const url = {
  content: '//d3lcz8vpax4lo2.cloudfront.net',
  lib: 'https://testthisshit.online/amp-embed-lib/insticator.js'
};


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

function createElement(location, el, attrs) {
  const newEl = location.createElement(el);
  Object.entries(attrs).forEach(attr => newEl.setAttribute(attr[0], attr[1]));
  return newEl;
}


/*
 * @param {!Object} componentContainer
*/
// ------- COMPONENT CREATOR ------- //
function createComponent(componentContainer, siteId, embedId) {
  // API available to embed
  // https://github.com/ampproject/amphtml/blob/master/ads/README.md#available-information-to-the-ad
  // console.log(window.context)

  // create virtual script tag elements
  const headerCode = createElement(componentContainer.ownerDocument, 'script', { type: 'text/javascript' });
  const bodyCode = createElement(componentContainer.ownerDocument, 'script', { type: 'text/javascript' });

  // populate script tag elements with standard insticator embed code (slightly modified header code to account for AMP specific constraints)
  headerCode.appendChild(document.createTextNode(`
    (function(a, c, s, u) {
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
      var b = c.createElement(s);
      b.src = u;
      b.async = !0;
      var d = c.getElementsByTagName(s)[0];
      d.parentNode.insertBefore(b, d)
    })(
        window,
        document,
        'script',
        '${url.content}/ads-code/AMP_EMBED_TEST_${siteId}.js' // vars from preconnect urls and data attributes on amp-embed tag
    );
  `));
  bodyCode.appendChild(document.createTextNode(`Insticator.ad.loadAd("div-insticator-ad-1");Insticator.ad.loadAd("div-insticator-ad-2");Insticator.load("em",{id : "${embedId}"});`));
  
  // append component and script markup to the DOM
  componentContainer.appendChild(createTemplate(embedId));
  componentContainer.appendChild(headerCode);
  componentContainer.appendChild(bodyCode);
}

// !!!!!!!!!! ---------- AMP EMBED - INSTICATOR ---------- !!!!!!!!!! //
import { validateData, loadScript } from '../3p/3p';


// ------- HELPER VARIABLES ------- //
//reusable URL references to ads, embed and the library
//Don't forget to preconnect and prefetch as it's described in the docs
//https://github.com/ampproject/amphtml/blob/master/ads/README.md
const url = {
  content: '//d3lcz8vpax4lo2.cloudfront.net',
  lib: 'https://testthisshit.online/amp-embed-lib/insticator.js'
};


// ------- HELPER FUNCTIONS ------- //
function createInitialMarkup(embedId) {
  return `
    <div id="insticator-container" >
      <div id="div-insticator-ad-1"></div>
      <div id="insticator-embed" embed-id="${embedId}"></div>
      <div id="div-insticator-ad-2"></div>
    </div>
  `;
}
function createTemplate(domString) {
  const template = document.createElement('template');
  template.innerHTML = domString;
  return template.content;
}
function appendElement(location, el) {
  location.appendChild(el);
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
  // create virtual script tag elements
  const headerCode = createElement(componentContainer.ownerDocument, 'script', { type: 'text/javascript' });
  const bodyCode = createElement(componentContainer.ownerDocument, 'script', { type: 'text/javascript' });

  // populate script tag elements with standard insticator embed code
  headerCode.appendChild(document.createTextNode(`(function (a, c, s, u){'Insticator'in a || (a.Insticator={ad:{loadAd: function (b){Insticator.ad.q.push(b)}, q: []}, helper:{}, embed:{}, version: "4.0", q: [], load: function (t, o){Insticator.q.push({t: t, o: o})}}); var b=c.createElement(s); b.src=u; b.async=!0; var d=c.getElementsByTagName(s)[0]; d.parentNode.insertBefore(b, d)})(window, document, 'script', '${url.content}/ads-code/${siteId}.js');`));
  bodyCode.appendChild(document.createTextNode(`Insticator.ad.loadAd("div-insticator-ad-1");Insticator.ad.loadAd("div-insticator-ad-2");Insticator.load("em",{id : "${embedId}"});`));
  
  // append scripts to DOM
  appendElement(componentContainer, headerCode);
  appendElement(componentContainer, bodyCode);
}


/*
 * @param {!Window} global
 * @param {!Object} data
*/
// ------- AMP EMBED - INSTICATOR EXPORT ------- //
export function insticator(global, data) {
  // validate passed data attributes
  validateData(data, ['siteId', 'embedId']);

  // store component container
  const componentContainer = global.document.getElementById('c');

  // append component markup to the DOM
  appendElement(componentContainer, createTemplate(createInitialMarkup(data.embedId)));

  // load insticator scripts that create an embed and ads
  createComponent(componentContainer, data.siteId, data.embedId);

  // envoke AMP library (with new insticator embed)
  loadScript(global, url.lib);
};

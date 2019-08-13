// !!!!!!!!!! ---------- AMP EMBED - INSTICATOR ---------- !!!!!!!!!! //

import { validateData, loadScript } from '../3p/3p';

// ------- HELPER VARIABLES ------- //
//reusable URL references to ads, embed and the library
//Don't forget to preconnect and prefetch as it's described in the docs
//https://github.com/ampproject/amphtml/blob/master/ads/README.md
const url = {
  ads: 'https://drhn9v8cwg89y.cloudfront.net',
  embed: 'https://d3lcz8vpax4lo2.cloudfront.net',
  lib: 'https://testthisshit.online/amp-embed-lib/insticator.js'
};

// ------- HELPER FUNCTIONS ------- //
function createInitialMarkup() {
  return `
    <div id="insticator-container">
      <div id="div-insticator-ad-1"></div>
      <div id="insticator-embed">
        <iframe id="insticator-iframe" scrolling="no" frameborder="0" allowtransparency="true"></iframe>
      </div>
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

function getRequest(file, callback, componentContainer) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => xhr.readyState == 4 && xhr.status == 200 ? callback(JSON.parse(xhr.responseText), componentContainer) : null;
  xhr.open('GET', file, true);
  xhr.send();
}

function appendAds(ads, componentContainer) {
  Object.entries(ads).forEach(ad => appendElement(componentContainer.querySelector(`#div-insticator-ad-${ad[0][ad[0].length -1]}`), createElement(componentContainer.ownerDocument, 'amp-ad', ad[1])));
}

/*
 * @param {!Object} componentContainer
*/
function createComponent(componentContainer) {
  // get data attribute from the amp-insticator tag
  const embedId = componentContainer.getAttribute('data-embed-id');

  // store DOM elements
  const insticatorContainer = componentContainer.querySelector('#insticator-container');
  const embedIframe = componentContainer.querySelector('#insticator-iframe');
  const embedApp = createElement(componentContainer.ownerDocument, 'div', {
    id: 'app'
  });
  const embedScript = createElement(componentContainer.ownerDocument, 'script', {
    type: 'text/javascript',
    src: `${url.embed}/embed-code/${embedId}.js`
  });

  // append content to iframe
  appendElement(embedIframe.contentWindow.document.body, embedApp);
  appendElement(embedIframe.contentWindow.document.head, embedScript);
  // append ads
  getRequest(`${url.ads}/test/ad_settings/${embedId}.js`, (ads, componentContainer) => appendAds(ads, componentContainer), componentContainer);
}

/*
 * @param {!Window} global
 * @param {!Object} data
*/
export function insticator(global, data) {
  validateData(data, ['embedId']);
  const componentContainer = global.document.getElementById('c');
  componentContainer.setAttribute('data-embed-id', data.embedId);
  appendElement(componentContainer, createTemplate(createInitialMarkup()));
  createComponent(componentContainer);
  loadScript(global, url.lib);
}

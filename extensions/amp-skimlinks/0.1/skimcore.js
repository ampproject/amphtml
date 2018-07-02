import {parseUrlDeprecated} from '../../../src/url';

const PUB_CODE = '68019X1559797';

let affiliateDomains = [];

// function isPostPageLoad() {
//   const domContentLoadedStatus = [
//     READY_STATE_DOM_LOADED,
//     READY_STATE_LOADED,
//   ];

//   return domContentLoadedStatus.indexOf(document.readyState) !== -1;
// }

function callBeacon(xhr, domains) {
  const data = {
    pubcode: PUB_CODE,
    page: '',
    domains,
  };

  const beaconUrl = `https://r.skimresources.com/api?data=${JSON.stringify(data)}`;
  const postReq = {
    method: 'GET',
    // Disabled AMP CORS for dev
    requireAmpResponseSourceOrigin: false,
    ampCors: false,
  };

  return xhr.fetchJson(beaconUrl, postReq).then(res => {
    return res.json();
  });
}

function getLinkDomain(a) {
  return parseUrlDeprecated(a.href).hostname;
}


function getDomainsOnPage() {
  const linkNodesList = document.querySelectorAll('a');
  return Array.from(linkNodesList).map(el => {
    return getLinkDomain(el);
  });
}

function attachClickHandler() {
  document.addEventListener('click', e => {
    const elt = e.target;
    if (elt.href) {
      if (isAffiliateDomain(elt)) {
        const originalHref = elt.href;
        elt.href = `https://go.redirectingat.com?id=${PUB_CODE}&url=${originalHref}&isjs=0`;
        // Restore link after 300ms
        setTimeout(() => {
          elt.href = originalHref;
        }, 300);
      } else {
        e.preventDefault()
        // Send beacon
        console.log('NA CLICK');
      }

    }
  });
}

function isAffiliateDomain(a) {
  const linkDomain = getLinkDomain(a);

  return affiliateDomains.indexOf(linkDomain) !== -1;
}

/**
 * Skimcore is the main module  mostly responsible for calling beacon
 * after page load.
 * @param {Object} context
 */
export function startSkimcore(context) {

  setTimeout(() => {
    console.log('TRACK ANALYTICS');
    context.analytics.trigger('page_impressions', {test: 'Hello world'});
  }, 3000);


  // attachClickHandler();
  const domainsOnPage = getDomainsOnPage();
  // callBeacon(context.xhr, domainsOnPage).then(data => {
  //   affiliateDomains = data.merchant_domains;
  // });
  // if (isPostPageLoad()) {
  //   // Skim js was loaded late, the page is already loaded
  //   window.setTimeout(onPageLoad, 0);
  // } else {
  //   // Do a first beacon request as soon as we can
  //   console.log('CALL BEACON PRE PAGE LOAD');
  //   callBeacon()
  //   // We will make a second one after the page has fully loaded
  //   document.addEventListener('DOMContentLoaded', onPageLoad);
  //   document.addEventListener('load', onPageLoad);
  // }
}

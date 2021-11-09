/**
 * Constructs a human readable curls encoded proxy domain using the following
 * algorithm:
 *   Convert domain from punycode to utf-8 (if applicable)
 *   Replace every '-' with '--'
 *   Replace every '.' with '-'
 *   Convert back to punycode (if applicable)
 *
 * @param {string} domain The publisher domain
 * @return {string} The curls encoded domain
 * @private
 */
function constructHumanReadableCurlsProxyDomain_(domain) {
  domain = toUnicode(domain.toLowerCase());
  domain = domain.split('-').join('--');
  domain = domain.split('.').join('-');
  return toAscii(domain);
}

function parseUrl(url) {
  var elem = document.createElement('a');
  elem.href = url;
  return {
    protocol: elem.protocol,
    host:     elem.host,
    hostname: elem.hostname,
    port:     elem.port,
    pathname: elem.pathname,
    hash:     elem.hash
  };
}

// Update the relevant fields with the new data.
const setDOMInfo = info => {
    fetch(info.url, {
      method: "GET",
      headers: { "Accept": "application/signed-exchange;v=b3"}
    }).then(result => {
      var correctContentType = result.headers.get('Content-Type') ==
          'application/signed-exchange;v=b3';
      document.getElementById('url').textContent = result.url;
      document.getElementById('contenttype').textContent =
          result.headers.get('Content-Type');
      result.arrayBuffer().then(function(buffer) {
        var enc = new TextDecoder("utf-8");
        var s = enc.decode(buffer);
        var a;
        if (s.startsWith('sxg1-b3\0') && correctContentType) {
          document.getElementById("originimg").innerHTML = "✅";
        } else {
          document.getElementById("originimg").innerHTML = "❌";
        }
      });
    })

    var urlObject = parseUrl(info.url);
    cacheUrl = 'https://' 
      + constructHumanReadableCurlsProxyDomain_(urlObject.host) 
      + '.webpkgcache.com/doc/-/s/'
      + urlObject.host
      + urlObject.pathname;

    fetch(cacheUrl, {
      method: "GET",
      headers: { 
        "Accept": "application/signed-exchange;v=b3",
      }
    }).then(result => {
      var correctContentType = result.headers.get('Content-Type') ==
          'application/signed-exchange;v=b3';
      document.getElementById('cacheurl').textContent = result.url;
      document.getElementById('cachecontenttype').textContent =
        result.headers.get('Content-Type');
      document.getElementById('cachewarning').textContent = 
        result.headers.get('Warning');
      document.getElementById('cachelocation').textContent =
        result.headers.get('Location');
      result.arrayBuffer().then(function(buffer) {
        var enc = new TextDecoder("utf-8");
        var s = enc.decode(buffer);
        if (correctContentType && s.startsWith('sxg1-b3\0')) {
          if (result.headers.get('Warning') == null &&
              result.headers.get('Location') != null) {
            document.getElementById("cacheimg").innerHTML = "⌛";
          } else {
            document.getElementById("cacheimg").innerHTML = "✅";
          }
        } else {
          document.getElementById("cacheimg").innerHTML = "❌";
        }
      });
    })
};

window.addEventListener('DOMContentLoaded', () => {
  // Query for the active tab
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, tabs => {
    // Send a request for the DOM info.
    chrome.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        // Specify a callback to be called 
        // from the receiving end (content script).
        setDOMInfo);
  });
});
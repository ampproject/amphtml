# AMP Cache Debugging

**Why is my doc broken on an AMP cache?**

Valid AMP documents typically appear and behave the same on AMP Caches as they
do on the origin. However, there are some components and server configurations
that can be problematic.

If a particular document appears and behaves as expected on your origin, but not
when viewed via the cache ([how to map origin URLs to Google's AMP
Cache](https://developers.google.com/amp/cache/overview#amp-cache-url-format)),
try the following:

1. Open your browser's developer/error tools console, and resolve
any errors or warnings that appear.
1. Run the document through [AMPBench](https://ampbench.appspot.com/) and
resolve any unexpected errors or warnings.

If you still have a problem after following these steps, check the table below.

|Symptom|Issue|Solution|
|---|---|---|
|Web fonts do not appear (fallback fonts are used)|Cache not whitelisted by font provider|Contact font provider and ask them to whitelist [all caches](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md#cors-security-in-amp)|
|Assets (e.g. fonts and images) do not appear #1 (**HTTP origins only**)|Document uses protocol-relative URLs|Switch to absolute URLs (that is, `http://www.site.com/doc/amp`, not `//www.site.com/doc/amp`)|
|Assets (e.g. fonts and images) do not appear #2|Assets served with incorrect MIME type|Specify an [acceptable MIME type](https://github.com/ampproject/amphtml/blob/master/spec/amp-cache-guidelines.md#guidelines-accepted-mime-types)|
|Assets (e.g. fonts and images) do not appear #3|Cache is unable to access assets|Ensure the cache is able to access your assets and is not blocked by IP address, or user agent, etc. ([List of user agents used by Google's crawler](https://support.google.com/webmasters/answer/1061943?hl=en).)|
|Dynamic elements such as `<amp-form>`, `<amp-list>` do not behave as expected|Broken or non-existent CORS headers|These components cause browsers to make cross-origin requests from the cache to your origin. These requests are blocked by default. To allow these requests, emit [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) that whitelist [all caches](https://github.com/ampproject/amphtml/blob/master/spec/amp-cors-requests.md#cors-security-in-amp).|
|Content is being served that must be removed due to legal takedown notice|Cache has not yet picked up removal|Follow the guidelines for each AMP cache to refresh this content. For Google this is the [update ping](https://developers.google.com/amp/cache/update-ping).|
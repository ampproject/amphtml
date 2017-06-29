# AMP Cache Debugging

## Why is my doc broken on an AMP cache?

Valid AMP documents typically appear and behave the same on AMP Caches as they
do on the origin. However, there are some components and server configurations
that can be problematic.

If a particular document appears and behaves as expected on your origin, but not
when viewed via the cache ([how to map origin URLs to Google's AMP
Cache](https://developers.google.com/amp/cache/overview#amp-cache-url-format)),
try the following:

1. Open your browser's developer/error tools console, and resolve
    any errors or warnings that appear.
2.  Run the document through [AMPBench](https://ampbench.appspot.com/) and
    resolve any unexpected errors or warnings.

If you still have a problem after following these steps, check the table below.

<table>
<table>
  <thead>
    <tr>
      <th width="30%">Symptom</th>
      <th width="30%">Issue</th>
      <th width="40%">Solution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Web fonts do not appear (fallback fonts are used)</td>
      <td>The AMP Cache is not whitelisted by the font provider.</td>
      <td>Contact the font provider and ask them to whitelist <a href="https://www.ampproject.org/docs/guides/amp-cors-requests.html#cors-security-in-amp">all caches</a>.</td>
    </tr>
    <tr>
      <td>Assets (e.g., fonts and images) do not appear (<strong>HTTP origins only</strong>)</td>
      <td>The document uses protocol-relative URLs.</td>
      <td>Switch to absolute URLs (that is, <code>http://www.site.com/doc/amp</code>, not <code>//www.site.com/doc/amp</code>).</td>
    </tr>
    <tr>
      <td rowspan="2">Assets (e.g., fonts and images) do not appear</td>
      <td>The assets are served with the incorrect MIME type.</td>
      <td>Specify an <a href="https://github.com/ampproject/amphtml/blob/master/spec/amp-cache-guidelines.md#guidelines-accepted-mime-types">acceptable MIME type</a>.</td>
    </tr>
    <tr>
      <td>The AMP Cache cannot access the assets.</td>
      <td>Ensure the AMP Cache can access your assets and that it is not blocked by an IP address, or a user agent, etc. (<a href="https://support.google.com/webmasters/answer/1061943?hl=en">List of user agents used by Google's crawler</a>).</td>
    </tr>
    <tr>
      <td>Dynamic elements such as <code>&lt;amp-form&gt;</code>, <code>&lt;amp-listgt;</code>, do not behave as expected.</td>
      <td>Broken or missing CORS headers.</td>
      <td>These components make cross-origin requests from the AMP Cache to your origin. By default, browsers block these requests. To allow these requests, emit <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS">CORS headers</a> that whitelist <a href="https://www.ampproject.org/docs/guides/amp-cors-requests.html">all caches</a>.</td>
    </tr>
    <tr>
      <td>Content is being served that must be removed due to a legal takedown notice.</td>
      <td>The AMP Cache has not yet picked up the removal.</td>
      <td>Follow the guidelines for each AMP Cache to refresh the content. For Google AMP Cache, see <a href="https://developers.google.com/amp/cache/update-ping">update ping</a>.</td>
    </tr>
</tbody>
</table>
# Tracking users across origins

AMP pages can be served from either a publisher's website or the AMP Cache.  Because these two websites have different domains, their access to each other’s cookies can be limited in the context of some browsers.  These additional security restrictions mean that some additional effort will be required to maintain the client identification if and when users browse from both contexts.
 
`amp-analytics` makes this effort simpler by providing a [client identifier as a variable substitution](analytics-vars.md#clientid).  The clientId variable can be called with the cid-scope parameter, which is the name of a cookie to read from if the document is loaded from a first-party context.  Otherwise, the clientId variable will be replaced with a cookie set by AMP itself.  At this moment, AMP doesn't provide for direct access to client-side storage (i.e. cookies).

However, by sending the collection request to your own domain you can read and write cookies on those requests, which enables access to both the AMP clientId and your cookies in the same request.  Once the analytics request reaches your server, it can modify the request as needed and respond with a  [302 response](https://en.wikipedia.org/wiki/HTTP_302) code and [set-cookie headers](https://en.wikipedia.org/wiki/HTTP_cookie#Setting_a_cookie), and specify a redirect to another destination.

For example, given an AMP document that has an amp-analytics config that evaluates to a hit request to this url: https://pub.example.com/collect?ampId=${clientId(example-visitor-id)}

* Pageview on pub.example.com:
 * https://pub.example.com/collect?ampId=f2342fedac
 * AMP clientId is included in request and your cookie is sent as normal (and can be written if not present).  In this example, f2342fedac may be the value of the cookie name "example-visitor-id" or AMP may have created this value and stored it in "example-visitor-id".
* Pageview on AMP Cache for a browser session that has never visited pub.example.com before:
 * https://pub.example.com/collect?ampId=b2c2d4bb2d2 
 * AMP uses the clientId for the cache. If one does not exist, it creates one (b2c2d4bb2d2). During the collection request your server may attempt to set a cookie and return it as part of the response. Be prepared that setting the cookie may fail due to the browser’s cookie settings.
* Pageview on AMP Cache for a browser session that has previously visited pub.example.com:
 * https://pub.example.com/collect?ampId=b2c2d4bb2d2
 * AMP uses the clientId for the cache. If one does not exist, it creates one (b2c2d4bb2d2). 
 * Your cookie is being sent as part of the request and can be read on the server.

Please be informed that combining cookie IDs from two or more different domains might require updating your privacy policy, or obtaining end user consent in some jurisdictions. 

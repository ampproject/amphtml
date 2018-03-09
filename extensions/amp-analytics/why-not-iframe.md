# Why not just use an iframe?

With AMP, The AMP Project decided to encourage the use of the AMP Analytics system instead of relegating analytics providers to a separate iframe.  This was done for a number of reasons, including:
* **Performance:** Ultimately, the major driver is performance.  By centralizing client-side code, AMP Analytics is able to remove duplication of effort in collecting data points between analytics providers, thus improving runtime performance.
* **Ability to read and set cookies:** Relegating analytics to a cross origin amp-iframe means that this amp-iframe may not be able to set cookies, as it's in a third-party context.
* **Future-proofing Configuration:** Because elements of vendor-specific configuration are able to be abstracted away in a centralized GitHub repo, and not on each AMP document, revisions to configuration do not require revisions to publisher pages.
* **More features:** By centralizing the client-side code, unique mobile-first functionality could be added to `amp-analytics`, such as:
 * Events related to paywall usage
 * Events related to advertising viewability
 * Integrations with other amp-tags for user interactions (social actions, video player interactions etc)
* **Limitations in Sandboxing:** Because an amp-iframe is in a distinct sandbox from the article, it is unaware of click events, scroll events, and data pertaining to the AMP page or the window it's viewed in (browser width/height).
* **Latency/Reliability:** Iframes can have several limitations compared to scripts running in the main document. Iframe may not get rendered in a timely fashion or it may be slower to load. This will result in inaccurate data.

The disadvantages of this approach are:
* **Less data points (initially):** Initially, the `amp-analytics` extension's data collection will not be as complete as existing systems. This is being addressed by multiple partners in the Github repo. The AMP Project is committed to enhancing the capabilities of amp-analytics based on the foundation that’s been built thus far.
* **Adaption to a new technical approach:** For example, you may use a client-side collection technique that needs to be substituted for a server-side solution.

If this is insufficient, MRC-accredited vendors may still use an embedded iframe. This is discussed in the [amp-analytics documentation](amp-analytics.md). Note that the cross-domain frame is loaded after the creative due to AMP’s prioritization constraints for cross-domain iframes, which may lead to ping loss. Should the previously-existing solution (beacon, image, and/or xhrpost) meet your needs, it is recommended that it be used.

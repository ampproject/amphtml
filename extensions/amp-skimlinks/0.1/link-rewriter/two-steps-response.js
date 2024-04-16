/**
 * Create an object containing an synchronous and an asynchronous response.
 * LinkRewriter expect 'resolveUnknownAnchors()' to return an
 * instance of TwoStepsResponse class.
 *
 * Some replacement urls may be determined synchronously but others may need an
 * asynchronous call. Being able to return a sync and async response offers
 * flexibility to handle all these scenarios:
 *
 * - If you don't need any api calls to determine your replacement url.
 *   Use: new TwoStepsResponse(syncResponse)
 *
 * - If you need a an api call to determine your replacement url
 *   Use: new TwoStepsResponse(null, asyncResponse)
 *
 * - If you need an api call to determine your replacement url but
 *   have implemented a synchronous cache system.
 *   Use: new TwoStepsResponse(syncResponse, asyncResponse);
 *
 * - If you want to return a temporary replacement url until you get the
 *   real replacement url from your api call.
 *   Use: new TwoStepsResponse(syncResponse, asyncResponse)
 */

export class TwoStepsResponse {
  /**
   * @param {?./link-rewriter.AnchorReplacementList} syncResponse
   * @param {?Promise<!./link-rewriter.AnchorReplacementList>} asyncResponse
   */
  constructor(syncResponse, asyncResponse) {
    /** @public {?./link-rewriter.AnchorReplacementList} */
    this.syncResponse = syncResponse;
    /** @public {?Promise<!./link-rewriter.AnchorReplacementList>} */
    this.asyncResponse = asyncResponse;
  }
}

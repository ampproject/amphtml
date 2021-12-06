/**
 * TODO: Should this be deprecated for Bento?
 */
class ViewerService {
  isEmbedded() {
    return false;
  }
  hasCapability(feature) {
    return false;
  }
  /**
   * @deprecated
   */
  sendMessage() {
    throw new Error("NOT IMPLEMENTED!")
  }
}

export const viewerService = new ViewerService();

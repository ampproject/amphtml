/**
 * TODO: Should this be deprecated for Bento?
 */
class ViewerService {
  /**
   * @return {boolean}
   */
  isEmbedded() {
    return false;
  }

  /**
   * @param {string} opt_feature
   * @return {boolean}
   */
  hasCapability(opt_feature) {
    return false;
  }

  /**
   * @deprecated
   */
  sendMessage() {
    throw new Error('NOT IMPLEMENTED!');
  }
}

// eslint-disable-next-line local/no-export-side-effect
export const viewerService = new ViewerService();

import {Services} from '#service';

/**
 * Service for handling Insurads mapping requests.
 */
export class MappingService {
  /** @private {string} */
  static MAPPING_URL_ =
    'https://run.mocky.io/v3/508f85e2-4a98-48ee-8cca-ddbf65bcf237';
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;
  }

  /**
   * Do Mapping Request to Insurads services
   * @return {!Promise<Object>} Promise resolving with mapping data
   */
  doMappingRequest() {
    const xhrInit = {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8000', // Required for CORS Anywhere
        'X-Requested-With': 'XMLHttpRequest', // Required for CORS Anywhere
      },
    };

    return new Promise((resolve, reject) => {
      Services.xhrFor(this.win_)
        .fetch(MappingService.MAPPING_URL_, xhrInit)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Mapping request failed with status ${response.status}`
            );
          }
          return response.json();
        })
        .then((data) => {
          this.mappingData_ = data;
          // Resolve the Promise with the mapping data
          resolve(data);
        })
        .catch((error) => {
          console /*OK*/
            .error('Insurads mapping error:', error);
          // Reject the Promise with the error
          reject(error);
        });
    });
  }
}

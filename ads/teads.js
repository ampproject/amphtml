/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript, validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function teads(global, data) {
  /*eslint "google-camelcase/google-camelcase": 0*/
  global._teads_amp = {
    allowed_data: ['pid', 'tag'],
    mandatory_data: ['pid'],
    mandatory_tag_data: ['tta', 'ttp'],
    data,
  };

  validateData(
    data,
    global._teads_amp.mandatory_data,
    global._teads_amp.allowed_data
  );

  const QueryString = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    const query_string = {}
    const a = document.createElement('a')
    a.href = global.context.sourceUrl
    const query = a.search.substring(1)
    const vars = query.split("&")
    for (var i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=")
      // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1])
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        const arr = [query_string[pair[0]], decodeURIComponent(pair[1])]
        query_string[pair[0]] = arr
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]))
      }
    }
    return query_string
  }()

  if (
    QueryString.js ||
    QueryString.second_asset_url ||
    QueryString.pid ||
    QueryString.page ||
    QueryString.content
  ) {

    if (QueryString.tracking) {
      (global.teads || (global.teads = {})).TRACKING_URL = QueryString.tracking
    }

    // FOR-3052: Split teads-format into 2 assets
    if (QueryString.second_asset_url) {
      (global.teads || (global.teads = {})).FORMAT_WITH_PLAYER_URL = QueryString.second_asset_url
    }

    const ttag = () => {
      global.teads
      .ad(QueryString.pid || 47405, {
        type: 'VastUrl',
        content: QueryString.content || 'https://a.teads.tv/vast/preview/50221',
        settings: {
          values: {
            pageId: QueryString.page || 42266,
            placementId: QueryString.pid || 47405,
            adType: QueryString.adtype || 'video'
          },
          components: {
            progressBar: QueryString.pb || false
          }
        },
        headerBiddingProvider: 'debugFormat'
      })
      .page(QueryString.page || 42266)
      .placement(QueryString.pid || 47405, { format: 'inread', slot: { selector: 'body' } })
      .serve()
    }

    loadScript(global, `//${QueryString.js || 's8t.teads.tv/media/format/v3/teads-format.min.js'}`, ttag)
  } else if (data.tag) {
    validateData(data.tag, global._teads_amp.mandatory_tag_data);
    global._tta = data.tag.tta;
    global._ttp = data.tag.ttp;

    loadScript(
      global,
      'https://s8t.teads.tv/media/format/' +
        encodeURI(data.tag.js || 'v3/teads-format.min.js')
    );
  } else {
    loadScript(
      global,
      'https://a.teads.tv/page/' + encodeURIComponent(data.pid) + '/tag'
    );
  }
}

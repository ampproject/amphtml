/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {user} from './log';
import {isExperimentOn} from './experiments';
import {viewerForDoc} from './viewer';
import {xhrFor} from './xhr';
import {getMode} from './mode'


/**
 * Emit a HTTP request to a destination defined on the incoming URL.
 * Protected by experiment.
 * @param {!Window} win
 */
export function maybeTrackImpression(win) {
  if (!isExperimentOn(win, 'alp')) {
    return;
  }
  console.log('aaaaaaa');
  const viewer = viewerForDoc(win.document);
  /** @const {string|undefined} */
  let clickUrl = viewer.getParam('click');

  //clickUrl = 'http://localhost:8000/local-proxy?url=https://googleads.g.doubleclick.net/pcs/click?alp=1&xai=AKAOjstvASJmd6-NeoO3ner8FBNJW2w8n-sXMo0Nj5YC_LIY2NQjbNs0CoXQtM9tPi8by4H4bHRpMdB14qgRLctKkBKkh3vpR3m8fvPCzcFZ6HrxvxXUqzP17YJsihcINtRniOfmGFkzIolJ3ccPSPq6oYdJpg5lPeufOrLhtWsNspOsRgMSBFP7zH0l8tgtAb665jHEFmdAMH1vl69BxpqU2Q0ZoGDO_SVBMArlL--2nLOVgQt8om6IdzkcodppT9c&sig=Cg0ArKJSzEJGKs3-NmXNEAE&urlfix=1&adurl=https://cdn.ampproject.org/c/www.nbcnews.com/news/us-news/amp/milwaukee-cop-cars-smashed-torched-after-police-kill-suspect-n630236';
  clickUrl = 'https://googleads.g.doubleclick.net/pcs/click?alp=1&xai=AKAOjstvASJmd6-NeoO3ner8FBNJW2w8n-sXMo0Nj5YC_LIY2NQjbNs0CoXQtM9tPi8by4H4bHRpMdB14qgRLctKkBKkh3vpR3m8fvPCzcFZ6HrxvxXUqzP17YJsihcINtRniOfmGFkzIolJ3ccPSPq6oYdJpg5lPeufOrLhtWsNspOsRgMSBFP7zH0l8tgtAb665jHEFmdAMH1vl69BxpqU2Q0ZoGDO_SVBMArlL--2nLOVgQt8om6IdzkcodppT9c&sig=Cg0ArKJSzEJGKs3-NmXNEAE&urlfix=1&adurl=https://cdn.ampproject.org/c/www.nbcnews.com/news/us-news/amp/milwaukee-cop-cars-smashed-torched-after-police-kill-suspect-n630236';
  //clickUrl = 'https://0.cat2.eventfe.cafe.content-ads-owners.pc.borg.google.com/pcs/click?alp=1&xai=AKAOjstvASJmd6-NeoO3ner8FBNJW2w8n-sXMo0Nj5YC_LIY2NQjbNs0CoXQtM9tPi8by4H4bHRpMdB14qgRLctKkBKkh3vpR3m8fvPCzcFZ6HrxvxXUqzP17YJsihcINtRniOfmGFkzIolJ3ccPSPq6oYdJpg5lPeufOrLhtWsNspOsRgMSBFP7zH0l8tgtAb665jHEFmdAMH1vl69BxpqU2Q0ZoGDO_SVBMArlL--2nLOVgQt8om6IdzkcodppT9c&sig=Cg0ArKJSzEJGKs3-NmXNEAE&urlfix=1&adurl=https://cdn.ampproject.org/c/www.nbcnews.com/news/us-news/amp/milwaukee-cop-cars-smashed-torched-after-police-kill-suspect-n630236';
  //clickUrl = "https%3A%2F%2Fadclick.g.doubleclick.net%2Fpcs%2Fclick%3Famp%3D1%26xai%3DAKAOjsv-m1m4UWV9Ma-712CSL1GAlk8LqQBnsR7qaiMk9RHySNoeynJlw-hKVfH6tWAQSc4_ksp0eIKEpASP9Hg52B1ZQfwZebVkFSw_leOH5LpYrdI8CcKVzdDDahoDwi9BWpxj1hBELNiD2yuq4yKHGqhwmwYAtPLBQSzRoyPJyP5WYjp4YdKMGjDLT_mUmL7zCwbX9FgKNupSIkGoghqLtTIPEdPPd0y-CBN04s3sH9vuUnBD4OdAQ9i0Ty1Lf94KEYo%26sig%3DCg0ArKJSzG321ESes8LKEAE%26urlfix%3D1%26adurl%3Dhttps%3A%2F%2Fcdn.ampproject.org%2Fc%2Fs%2Fwww.buzzfeed.com%2Famphtml%2Fstephaniemcneal%2Fyou-can-use-this-website-to-make-president-obama-say-whateve";
  //clickUrl = 'https://googleads.g.doubleclick.net/pcs/click?alp=1&xai=abc…&sig=xyz…&adurl=https://cdn.ampproject.org/c/events.latimes.com/festivalofbooks/&nm=3&nx=139&ny=132&mb=33&clkt=2';
  if (!clickUrl) {
    return;
  }
  if (clickUrl.indexOf('https://') != 0) {
    user().warn('Impression',
        'click fragment param should start with https://. Found ',
        clickUrl);
    return;
  }
  if (win.location.hash) {
    // This is typically done using replaceState inside the viewer.
    // If for some reason it failed, get rid of the fragment here to
    // avoid duplicate tracking.
    win.location.hash = '';
  }
  if (getMode().localDev) {
    clickUrl = 'http://localhost:8000/impression-proxy?url=' + clickUrl;
  }
  viewer.whenFirstVisible().then(() => {
    invoke(win, clickUrl);
  });
}

function invoke(win, clickUrl) {
  xhrFor(win).fetchJson(clickUrl, {
    credentials: 'include',
    requireAmpResponseSourceOrigin: true,
  }).then(a => {
    console.log('fetchJson return');
    console.log(a);
  });
  console.log('invoke');
  // TODO(@cramforce): Do something with the result.
}

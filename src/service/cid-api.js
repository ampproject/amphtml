/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {getCookie, setCookie} from '../cookies';
import {Services} from '../services';
import {dev} from '../log';

const GOOGLE_API_URL = 'https://ampcid.google.com/v1/publisher:getClientId?key=';
const API_KEYS = {
  'googleanalytics': 'AIzaSyA65lEHUEizIsNtlbNo-l2K18dT680nsaM',
};

const TAG = 'GoogleCidApi';
const AMP_TOKEN = 'AMP_TOKEN';
const RETRIEVING = '$RETRIEVING';
const TIMEOUT = 30000;
const EXPIRE_IN_A_YEAR = 365 * 24 * 60 * 60 * 1000;

export class GoogleCidApi {

  constructor(win) {
    this.win_ = win;
    this.timer_ = Services.timerFor(this.win_);
    this.cidPromise_ = null;
  }

  getPubCid(vendor) {
    const url = this.getUrl_(vendor);
    if (!url) {
      return Promise.resolve(null);
    }

    if (this.cidPromise_) {
      return this.cidPromise_;
    }
    let token;
    return this.cidPromise_ = this.timer_.poll(100, () => {
      token = getCookie(this.win_, AMP_TOKEN);
      return token !== RETRIEVING;
    }).then(() => {
      if (!token) {
        const expire = this.win_.Date.time() + TIMEOUT;
        setCookie(this.win_, AMP_TOKEN, RETRIEVING, expire);
      }
      return this.fetchCid_(url, token).then(res => {
        if (res.optOut) {
          return null;
        }
        if (res.clientId) {
          const expire = this.win_.Date.time() + EXPIRE_IN_A_YEAR;
          setCookie(this.win_, AMP_TOKEN, res.securityToken, expire);
          return res.clientId;
        }
      }).catch(e => {
        dev().error(TAG, e);
        return null;
      });
    });
  }

  fetchCid_(url, token) {
    const payload = {
      pubOrigin: this.win_.location.origin,
    };
    if (token) {
      payload.securityToken = token;
    }
    return this.timer_.timeoutPromise(
        TIMEOUT,
        Services.xhrFor(this.win_).fetchJson(url, {
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify(payload),
        }).then(res => res.json()));
  }

  getUrl_(vendor) {
    const key = API_KEYS[vendor];
    if (!key) {
      return null;
    }
    return GOOGLE_API_URL + key;
  }
}

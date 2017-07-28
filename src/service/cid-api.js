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

const TokenStatus = {
  RETRIEVING: '$RETRIEVING',
  OPT_OUT: '$OPT_OUT',
  ERROR: '$ERROR',
};

const TIMEOUT = 30000;
const DAY = 24 * 60 * 60 * 1000;
const YEAR = 365 * DAY;

export class GoogleCidApi {

  constructor(win) {
    this.win_ = win;
    this.timer_ = Services.timerFor(this.win_);
    this.cidPromise_ = null;
  }

  getPubCid(scope, apiClient) {
    const url = this.getUrl_(apiClient);
    if (!url) {
      return Promise.resolve(null);
    }

    if (this.cidPromise_) {
      return this.cidPromise_;
    }
    let token;
    return this.cidPromise_ = this.timer_.poll(100, () => {
      token = getCookie(this.win_, AMP_TOKEN);
      return token !== TokenStatus.RETRIEVING;
    }).then(() => {
      if (token === TokenStatus.OPT_OUT || token === TokenStatus.ERROR) {
        return null;
      }

      if (!token) {
        setCookie(this.win_, AMP_TOKEN, TokenStatus.RETRIEVING,
            this.expiresIn_(TIMEOUT));
      }
      return this.fetchCid_(url, scope, token).then(res => {
        if (res.optOut) {
          setCookie(this.win_, AMP_TOKEN, TokenStatus.OPT_OUT,
              this.expiresIn_(YEAR));
          return null;
        }
        if (res.clientId) {
          setCookie(this.win_, AMP_TOKEN, res.securityToken,
              this.expiresIn_(YEAR));
          return res.clientId;
        } else {
          setCookie(this.win_, AMP_TOKEN, TokenStatus.ERROR,
              this.expiresIn_(DAY));
          return null;
        }
      }).catch(e => {
        setCookie(this.win_, AMP_TOKEN, TokenStatus.ERROR,
            this.expiresIn_(TIMEOUT));
        dev().error(TAG, e);
        return null;
      });
    });
  }

  fetchCid_(url, scope, token) {
    const payload = {
      originScope: scope,
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

  getUrl_(apiClient) {
    const key = API_KEYS[apiClient];
    if (!key) {
      return null;
    }
    return GOOGLE_API_URL + key;
  }

  expiresIn_(time) {
    return this.win_.Date.time() + time;
  }
}

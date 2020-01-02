/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {jsonLiteral} from '../../../../src/json';

const SUBSCRIPTIONS_PROPENSITY_CONFIG = jsonLiteral({
  'vars': {
    // Global variables for all requests
    'clientId': 'CLIENT_ID(__gads)',
    'data':
      '{"skus": "${skus}","source": "${source}","active": "${active}","product": "${product}"}',
  },
  'requests': {
    // Variables
    'baseUrl': 'https://pubads.g.doubleclick.net/subopt',
    'baseParams':
      'u_tz=240&v=1&cookie=${clientId}&cdm=${sourceHostName}&' +
      '_amp_source_origin=${sourceHost}',
    'sendBase': '${baseUrl}/data?${baseParams}',
    'stateParams': 'states=${publicationId}%3A${state}%3A${productId}',
    'eventParams': 'events=${publicationId}%3A${event}%3A${data}',
    // Requests
    'sendSubscriptionState': '${sendBase}&${stateParams}',
    'sendEvent': '${sendBase}&${eventParams}',
  },
  'triggers': {
    'onSubscribed': {
      'on': 'subscriptions-access-granted',
      'request': 'sendSubscriptionState',
      'vars': {
        'state': 'subscriber',
      },
    },
    'onNotSubscribed': {
      'on': 'subscriptions-access-denied',
      'request': 'sendSubscriptionState',
      'vars': {
        // NOTE: SwG is not aware of past subscriptions.  The publisher must
        //       inform us when the user subscribed in the past.
        'state': 'non_subscriber',
      },
    },
    'onShowOffers': {
      'on': 'subscriptions-action-showOffers-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offers_shown',
      },
    },
    'onPaywall': {
      'on': 'subscriptions-paywall-activated',
      'request': 'sendEvent',
      'vars': {
        'event': 'paywall',
        'active': 'false',
      },
    },
    'onSelectOffer': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'offer_selected',
        'active': 'true',
      },
    },
    'onStartBuyflow': {
      'on': 'subscriptions-action-subscribe-started',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_flow_start',
        'active': 'true',
      },
    },
    'onPaymentComplete': {
      'on': 'subscriptions-action-subscribe-success',
      'request': 'sendEvent',
      'vars': {
        'event': 'payment_complete',
        'active': 'true',
      },
    },
  },
  'transport': {
    'beacon': true,
    'xhrpost': false,
    'image': false,
  },
});

export {SUBSCRIPTIONS_PROPENSITY_CONFIG};

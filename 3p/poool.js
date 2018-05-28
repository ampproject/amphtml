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

import {loadScript} from './3p';

import {user} from '../src/log';
import {dict} from '../src/utils/object';

const CONFIG = {
    debug: false,
    force_widget: null,
    login_button_enabled: true,
    signature_enabled: true,
    user_is_premium: false,
    video_client: "vast",
    custom_segment: null,
    cookies_enabled: false
};

const EVENTS = [
    "lock",
    "release",
    "hidden",
    "disabled",
    "register",
    "error",
    "adblock",
    "outdatedBrowser",
    "userOutsideCohort",
    "identityAvailable",
    "subscribeClick",
    "loginClick",
    "dataPolicyClick"
];

/**
 * Produces the Poool SDK object for the passed in callback.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getPooolSDK(global, cb) {
    loadScript(global, 'https://assets.poool.fr/poool.min.js', function() {
        cb(global.poool);
    });
}

export function poool(global, data) {

    // Check for required attributes
    const bundleID = user().assert(
        data.appId,
        'The data-app-id attribute is required for <amp-poool> %s',
        data.element
    );

    const pageType = user().assert(
        data.pageType,
        'The data-page-type attribute is required for <amp-poool> %s',
        data.element
    );

    // Create paywall container
    const container = document.createElement("div");
    container.id = "poool-widget";
    global.document.querySelector("#c").appendChild(container);

    getPooolSDK(global, (_poool) => {

        // Init poool
        _poool("init", data.appId);
        _poool("config", "mode", "custom", true);
        _poool("event", "onIdentityAvailable", function(){
            const size = container.getBoundingClientRect();
            global.context.updateDimensions(size.width, size.height);
        });

        // Set config
        for (const [configKey, configDefaultValue] of Object.entries(CONFIG)) {
            const configValue = data[configKey] || configDefaultValue;

            if(configValue){
                _poool("config", configKey, configValue);
            }
        }

        // Set event handlers
        for (const eventName of EVENTS) {
            _poool(
                "event",
                `on${eventName[0].toUpperCase()}${eventName.slice(1)}`,
                function(eventData){
                    const message = JSON.stringify(dict({
                        "action": eventName,
                        "data": eventData
                    }));

                    global.parent.postMessage(message, "*");
                }
            );
        }

        // Send conversion event, if provided
        if(data.conversion){
            _poool("send", "conversion");
        }

        // Create hit
        _poool("send", "page-view", pageType);

    });
}

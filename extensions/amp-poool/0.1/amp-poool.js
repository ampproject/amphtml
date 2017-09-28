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
import {CSS} from '../../../build/amp-poool-0.1.css';
import {Layout} from '../../../src/layout';
import {user} from '../../../src/log';
export class AmpPoool extends AMP.BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        /** @private {!Element} */
        this.container_ = this.win.document.createElement('div');

        /** @private {!Element} */
        this.pooolUrl_ = 'https://assets.poool.fr/poool.min.js';
    }

    /** @override */
    buildCallback() {
        // Alert if some amp-poool main attribute are missing
        const bundle_id = user().assert(this.element.getAttribute('init'),
            'The init attribute is required for <amp-poool> %s',
            this.element);

        const page_type = user().assert(this.element.getAttribute('page-view'),
            'The page_view attribute is required for <amp-poool> %s',
            this.element);

        // Assign poool configs
        const debug = this.element.getAttribute('debug');
        const force_widget = this.element.getAttribute('force-widget');
        const mode = this.element.getAttribute('mode');
        const percent = this.element.getAttribute('percent');
        const post_container = this.element.getAttribute('post-container');
        const widget_container = this.element.getAttribute('widget-container');
        const subscription_url = this.element.getAttribute('subscription-url');
        const newsletter_name = this.element.getAttribute('newsletter-name');
        const newsletter_id = this.element.getAttribute('newsletter-id');
        const login_url = this.element.getAttribute('login-url');
        const user_is_premium = this.element.getAttribute('user-is-premium');
        const video_primary_mode = this.element.getAttribute('video-primary-mode');
        const video_client = this.element.getAttribute('video-client');
        const popover_enabled = this.element.getAttribute('popover-enabled');
        const alternative_enabled = this.element.getAttribute('alternative-enabled');
        const alternative_widget = this.element.getAttribute('alternative-widget');
        const adblock_enabled = this.element.getAttribute('adblock-enabled');
        const vast = this.element.getAttribute('vast');
        const mobile_vast = this.element.getAttribute('mobile-vast');
        const custom_segment = this.element.getAttribute('custom-segment');

        // Assign poool styles
        const main_color = this.element.getAttribute("main-color");
        const background_color = this.element.getAttribute("background-color");
        const brand_logo = this.element.getAttribute("brand-logo");
        const brand_cover = this.element.getAttribute("brand-cover");

        // Assign poool events
        const on_lock = this.element.getAttribute("on-lock");
        const on_release = this.element.getAttribute("on-release");
        const on_hidden = this.element.getAttribute("on-hidden");
        const on_disabled = this.element.getAttribute("on-disabled");
        const on_register = this.element.getAttribute("on-register");
        const on_subscribeclick = this.element.getAttribute("on-subscribeclick");
        const on_error = this.element.getAttribute("on-error");
        const on_adblock = this.element.getAttribute("on-adblock");
        const on_outdatedbrowser = this.element.getAttribute("on-outdatedbrowser");
        const on_useroutsidecohort = this.element.getAttribute("on_useroutsidecohort");
        const on_identityavailable = this.element.getAttribute("on-identityavailable");

        // Assign poool actions
        const email = this.element.getAttribute("email");
        const conversion = this.element.getAttribute("conversion");

        // Create a div with "poool-widget" id to display it
        this.container_.id = "poool-widget";
        this.element.appendChild(this.container_);

        var head = this.win.document.head;
        var script = document.createElement("script");

        var addThingsToTag = function (type, name, value, script, no_string) {
            if(value != null){
                if(no_string){script.innerHTML += "poool('"+type+"', '"+name+"', "+value+");\n";}
                else{script.innerHTML += "poool('"+type+"', '"+name+"', '"+value+"');\n";}
            }
        };

        // Start poool tag with init value
        script.innerHTML = `
        !function(w,d,s,u,p,t,o){
            w[p]=w[p]||function(){(w[p]._q=w[p]._q||[]).push(arguments)},
            t=d.createElement(s),o=d.getElementsByTagName(s)[0],
            t.async=1,t.src=u,o.parentNode.insertBefore(t,o)
        }(window, document, "script", "https://assets.poool.fr/poool.min.js", "poool");

        poool("init", "`+bundle_id+`");
        `;

        // Add config values
        addThingsToTag("config", "debug", debug, script, true);
        addThingsToTag("config", "mode", mode, script);
        addThingsToTag("config", "percent", percent, script, true);
        addThingsToTag("config", "post_container", post_container, script);
        addThingsToTag("config", "widget_container", widget_container, script);
        addThingsToTag("config", "force_widget", force_widget, script);
        addThingsToTag("config", "subscription_url", subscription_url, script);
        addThingsToTag("config", "newsletter_name", newsletter_name, script);
        addThingsToTag("config", "newsletter_id", newsletter_id, script, true);
        addThingsToTag("config", "login_url", login_url, script);
        addThingsToTag("config", "user_is_premium", user_is_premium, script, true);
        addThingsToTag("config", "video_primary_mode", video_primary_mode, script);
        addThingsToTag("config", "video_client", video_client, script);
        addThingsToTag("config", "popover_enabled", popover_enabled, script, true);
        addThingsToTag("config", "alternative_enabled", alternative_enabled, script, true);
        addThingsToTag("config", "alternative_widget", alternative_widget, script);
        addThingsToTag("config", "adblock_enabled", adblock_enabled, script, true);
        addThingsToTag("config", "vast", vast, script);
        addThingsToTag("config", "mobile_vast", mobile_vast, script);
        addThingsToTag("config", "custom_segment", custom_segment, script);

        // Add style values
        addThingsToTag("style", "main_color", main_color, script);
        addThingsToTag("style", "background_color", background_color, script);
        addThingsToTag("style", "brand_logo", brand_logo, script);
        addThingsToTag("style", "brand_cover", brand_cover, script);

        // Add event values
        addThingsToTag("event", "onlock", on_lock, script, true);
        addThingsToTag("event", "onrelease", on_release, script, true);
        addThingsToTag("event", "onHidden", on_hidden, script, true);
        addThingsToTag("event", "onDisabled", on_disabled, script, true);
        addThingsToTag("event", "onregister", on_register, script, true);
        addThingsToTag("event", "onsubscribeclick", on_subscribeclick, script, true);
        addThingsToTag("event", "onerror", on_error, script, true);
        addThingsToTag("event", "onadblock", on_adblock, script, true);
        addThingsToTag("event", "onoutdatedbrowser", on_outdatedbrowser, script, true);
        addThingsToTag("event", "onUserOutsideCohort", on_useroutsidecohort, script, true);
        addThingsToTag("event", "onIdentityAvailable", on_identityavailable, script, true);

        // End poool tag with action values
        addThingsToTag("send", "email", email, script);
        if(conversion){
            script.innerHTML += "poool('send', 'conversion');\n"
        }
        addThingsToTag("send", "page-view", page_type, script);

        // Append script to head tag
        head.appendChild(script);
    }

    /** @override */
    isLayoutSupported(layout) {
        return layout == Layout.RESPONSIVE;
    }
}

AMP.extension('amp-poool', '0.1', AMP => {
    AMP.registerElement('amp-poool', AmpPoool, CSS);
});

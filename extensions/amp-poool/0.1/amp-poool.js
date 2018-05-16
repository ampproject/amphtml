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

class AmpPoool extends AMP.BaseElement {

    /** @param {!AmpElement} element */
    constructor(element) {
        super(element);

        /** @private {!Element} */
        this.container_ = this.win.document.createElement('div');

    }

    /** @override */
    buildCallback() {
        // Check if required parameter init (bundle-id) isn't missing
        const bundle_id = user().assert(this.element.getAttribute('data-init'),
            'The init attribute is required for <amp-poool> %s',
            this.element);

        // Check if required parameter page-view (page-type) isn't missing
        const page_type = user().assert(this.element.getAttribute('data-page-view'),
            'The page_view attribute is required for <amp-poool> %s',
            this.element);

        // Assign poool conversion variable
        const conversion = this.element.getAttribute("data-conversion");

        // Create a div with "poool-widget" id to display it
        this.container_.id = "poool-widget";
        this.element.appendChild(this.container_);

        var head = this.win.document.head;
        var script = document.createElement("script");

        var updatePoool = function (type, name, value, script, no_string) {
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
        updatePoool("config", "debug", this.element.getAttribute('data-debug'), script, true);
        updatePoool("config", "mode", this.element.getAttribute('data-poool-mode'), script);
        updatePoool("config", "percent", this.element.getAttribute('data-poool'), script, true);
        updatePoool("config", "post_container", this.element.getAttribute('data-post-container'), script);
        updatePoool("config", "widget_container", this.element.getAttribute('data-widget-container'), script);
        updatePoool("config", "force_widget", this.element.getAttribute('data-force-widget'), script);
        updatePoool("config", "subscription_url", this.element.getAttribute('data-subscription-url'), script);
        updatePoool("config", "newsletter_name", this.element.getAttribute('data-newsletter-name'), script);
        updatePoool("config", "newsletter_id", this.element.getAttribute('data-newsletter-id'), script, true);
        updatePoool("config", "login_url", this.element.getAttribute('data-login-url'), script);
        updatePoool("config", "login_button_enabled", this.element.getAttribute('data-login-button-enabled'), script, true);
        updatePoool("config", "signature_enabled", this.element.getAttribute('data-signature-enabled'), script, true);
        updatePoool("config", "user_is_premium", this.element.getAttribute('data-user-is-premium'), script, true);
        updatePoool("config", "video_primary_mode", this.element.getAttribute('data-video-primary-mode'), script);
        updatePoool("config", "video_client", this.element.getAttribute('data-video-client'), script);
        updatePoool("config", "popover_enabled", this.element.getAttribute('data-popover-enabled'), script, true);
        updatePoool("config", "alternative_enabled", this.element.getAttribute('data-alternative-enabled'), script, true);
        updatePoool("config", "alternative_widget", this.element.getAttribute('data-alternative-widget'), script);
        updatePoool("config", "adblock_enabled", this.element.getAttribute('data-adblock-enabled'), script, true);
        updatePoool("config", "vast", this.element.getAttribute('data-vast'), script);
        updatePoool("config", "mobile_vast", this.element.getAttribute('data-mobile-vast'), script);
        updatePoool("config", "custom_segment", this.element.getAttribute('data-custom-segment'), script);
        updatePoool("config", "cookies_enabled", this.element.getAttribute('data-cookies-enabled'), script, true);
        updatePoool("config", "data_policy_url", this.element.getAttribute('data-data-policy-url'), script);

        // Add style values
        updatePoool("style", "main_color", this.element.getAttribute("data-main-color"), script);
        updatePoool("style", "background_color", this.element.getAttribute("data-background-color"), script);
        updatePoool("style", "brand_logo", this.element.getAttribute("data-brand-logo"), script);
        updatePoool("style", "brand_cover", this.element.getAttribute("data-brand-cover"), script);


        // Add event values
        var events = this.win.document.getElementById(this.element.getAttribute("data-events"));

        // Only if publisher want to set events
        if(events) {
            updatePoool("event", "onlock", JSON.parse(events.innerHTML).on_lock, script, true);
            updatePoool("event", "onrelease", JSON.parse(events.innerHTML).on_release, script, true);
            updatePoool("event", "onHidden", JSON.parse(events.innerHTML).on_hidden, script, true);
            updatePoool("event", "onDisabled", JSON.parse(events.innerHTML).on_disabled, script, true);
            updatePoool("event", "onregister", JSON.parse(events.innerHTML).on_register, script, true);
            updatePoool("event", "onsubscribeclick", JSON.parse(events.innerHTML).on_subscribeclick, script, true);
            updatePoool("event", "onerror", JSON.parse(events.innerHTML).on_error, script, true);
            updatePoool("event", "onadblock",JSON.parse(events.innerHTML).on_adblock, script, true);
            updatePoool("event", "onoutdatedbrowser", JSON.parse(events.innerHTML).on_outdatedbrowser, script, true);
            updatePoool("event", "onUserOutsideCohort", JSON.parse(events.innerHTML).on_useroutsidecohort, script, true);
            updatePoool("event", "onIdentityAvailable", JSON.parse(events.innerHTML).on_identityavailable, script, true);
            updatePoool("event", "onDataPolicyClick", JSON.parse(events.innerHTML).on_datapolicyclick, script, true);
        }

        // End poool tag with action values
        updatePoool("send", "email", this.element.getAttribute("data-email"), script);
        if(conversion){
            script.innerHTML += "poool('send', 'conversion');\n"
        }
        updatePoool("send", "page-view", page_type, script);

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

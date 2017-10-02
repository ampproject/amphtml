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

    }

    /** @override */
    buildCallback() {
        // Check if required parameter init (bundle-id) isn't missing
        const bundle_id = user().assert(this.element.getAttribute('init'),
            'The init attribute is required for <amp-poool> %s',
            this.element);

        // Check if required parameter page-view (page-type) isn't missing
        const page_type = user().assert(this.element.getAttribute('page-view'),
            'The page_view attribute is required for <amp-poool> %s',
            this.element);

        // Assign poool conversion variable
        const conversion = this.element.getAttribute("conversion");

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
        updatePoool("config", "debug", this.element.getAttribute('debug'), script, true);
        updatePoool("config", "mode", this.element.getAttribute('mode'), script);
        updatePoool("config", "percent", this.element.getAttribute('percent'), script, true);
        updatePoool("config", "post_container", this.element.getAttribute('post-container'), script);
        updatePoool("config", "widget_container", this.element.getAttribute('widget-container'), script);
        updatePoool("config", "force_widget", this.element.getAttribute('force-widget'), script);
        updatePoool("config", "subscription_url", this.element.getAttribute('subscription-url'), script);
        updatePoool("config", "newsletter_name", this.element.getAttribute('newsletter-name'), script);
        updatePoool("config", "newsletter_id", this.element.getAttribute('newsletter-id'), script, true);
        updatePoool("config", "login_url", this.element.getAttribute('login-url'), script);
        updatePoool("config", "user_is_premium", this.element.getAttribute('user-is-premium'), script, true);
        updatePoool("config", "video_primary_mode", this.element.getAttribute('video-primary-mode'), script);
        updatePoool("config", "video_client", this.element.getAttribute('video-client'), script);
        updatePoool("config", "popover_enabled", this.element.getAttribute('popover-enabled'), script, true);
        updatePoool("config", "alternative_enabled", this.element.getAttribute('alternative-enabled'), script, true);
        updatePoool("config", "alternative_widget", this.element.getAttribute('alternative-widget'), script);
        updatePoool("config", "adblock_enabled", this.element.getAttribute('adblock-enabled'), script, true);
        updatePoool("config", "vast", this.element.getAttribute('vast'), script);
        updatePoool("config", "mobile_vast", this.element.getAttribute('mobile-vast'), script);
        updatePoool("config", "custom_segment", this.element.getAttribute('custom-segment'), script);

        // Add style values
        updatePoool("style", "main_color", this.element.getAttribute("main-color"), script);
        updatePoool("style", "background_color", this.element.getAttribute("background-color"), script);
        updatePoool("style", "brand_logo", this.element.getAttribute("brand-logo"), script);
        updatePoool("style", "brand_cover", this.element.getAttribute("brand-cover"), script);

        // Add event values
        updatePoool("event", "onlock", this.element.getAttribute("on-lock"), script, true);
        updatePoool("event", "onrelease", this.element.getAttribute("on-release"), script, true);
        updatePoool("event", "onHidden", this.element.getAttribute("on-hidden"), script, true);
        updatePoool("event", "onDisabled", this.element.getAttribute("on-disabled"), script, true);
        updatePoool("event", "onregister", this.element.getAttribute("on-register"), script, true);
        updatePoool("event", "onsubscribeclick", this.element.getAttribute("on-subscribeclick"), script, true);
        updatePoool("event", "onerror", this.element.getAttribute("on-error"), script, true);
        updatePoool("event", "onadblock", this.element.getAttribute("on-adblock"), script, true);
        updatePoool("event", "onoutdatedbrowser", this.element.getAttribute("on-outdatedbrowser"), script, true);
        updatePoool("event", "onUserOutsideCohort", this.element.getAttribute("on_useroutsidecohort"), script, true);
        updatePoool("event", "onIdentityAvailable", this.element.getAttribute("on-identityavailable"), script, true);

        // End poool tag with action values
        updatePoool("send", "email", this.element.getAttribute("email"), script);
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

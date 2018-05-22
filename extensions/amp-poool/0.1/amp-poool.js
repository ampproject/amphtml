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

const PooolConfig = {
    debug: { default: false, noString: true},
    mode: { default: "", noString: false},
    percent: { default: 80, noString: true},
    post_container: { default: "[data-poool]", noString: false},
    widget_container: { default: "#poool-widget", noString: true},
    force_widget: { default: "", noString: false},
    subscription_url: { default: "", noString: false},
    newsletter_name: { default: "", noString: false},
    newsletter_id: { default: "", noString: true},
    login_url: { default: "", noString: false},
    login_button_enabled: { default: true, noString: true},
    signature_enabled: { default: true, noString: true},
    user_is_premium: { default: true, noString: true},
    video_primary_mode: { default: "html5", noString: false},
    video_client: { default: "vast", noString: false},
    popover_enabled: { default: false, noString: true},
    alternative_enabled: { default: true, noString: true},
    alternative_widget: { default: "video", noString: false},
    adblock_enabled: { default: false, noString: true},
    vast: { default: "", noString: false},
    mobile_vast: { default: "", noString: false},
    custom_segment: { default: null, noString: false},
    cookies_enabled: { default: true, noString: true},
    data_policy_url: { default: "", noString: false}
};

const PooolStyles = [
    "main_color",
    "brand_logo",
    "brand_cover",
    "background_color"
];

const PooolEvents = [
  "on_lock",
  "on_release",
  "on_hidden",
  "on_disabled",
  "on_register",
  "on_subscribeclick",
  "on_error",
  "on_adblock",
  "on_outdatedbrowser",
  "on_useroutsidecohort",
  "on_identityavailable",
  "on_datapolicyclick"
];

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
        const bundle_id = user().assert(
            this.element.getAttribute('data-init'),
            'The init attribute is required for <amp-poool> %s',
            this.element
        );

        // Check if required parameter page-view (page-type) isn't missing
        const page_type = user().assert(
            this.element.getAttribute('data-page-view'),
            'The page_view attribute is required for <amp-poool> %s',
            this.element
        );

        // Assign poool conversion variable
        const conversion = this.element.getAttribute("data-conversion");

        // Create a div with "poool-widget" id to display it
        this.container_.id = "poool-widget";
        this.element.appendChild(this.container_);

        var head = this.win.document.head;
        var script = document.createElement("script");

        // Start Poool tag with init value
        script.innerHTML = `
            !function(w,d,s,u,p,t,o){
                w[p]=w[p]||function(){(w[p]._q=w[p]._q||[]).push(arguments)},
                t=d.createElement(s),o=d.getElementsByTagName(s)[0],
                t.async=1,t.src=u,o.parentNode.insertBefore(t,o)
            }(window, document, "script", "https://assets.poool.fr/poool.min.js"
            , "poool");

            poool("init", "`+bundle_id+`");
        `;

        // Apply publisher custom configs
        for (config in PooolConfig) {
            this.updatePooolConfig_(
                "config",
                config,
                this.element.getAttribute("data-"+config.replace(/_/g, "-")),
                script,
                PooolConfig[config].noString
            );
        }

        // Apply publisher custom styles
        for (style of PooolStyles) {
            this.updatePooolConfig_(
                "style",
                style,
                this.element.getAttribute("data-"+style.replace("_", "-")),
                script
            );
        }

        // Apply publisher custom events
        var events = this.win.document.getElementById(
            this.element.getAttribute("data-events"
        ));

        // Only if publisher want to set custom events
        if(events) {
            custom_events = JSON.parse(events.innerHTML)

            for (event of PooolEvents) {
                // Only if event is specified
                if (custom_events[event]) {
                    this.updatePooolConfig_(
                        "event",
                        event.replace("_", ""),
                        custom_events[event],
                        script,
                        true
                    );
                }
            }
        }

        // Send email when specified
        this.updatePooolConfig_(
            "send",
            "email",
            this.element.getAttribute("data-email"),
            script
        );

        // Send conversion if needed
        if(conversion){ script.innerHTML += "poool('send', 'conversion');\n" }

        // Send page-view to Poool
        this.updatePooolConfig_(
            "send",
            "page-view",
            page_type,
            script
        );

        // Append script to head tag
        head.appendChild(script);
    }

    /** @override */
    isLayoutSupported(layout) {
        return layout == Layout.RESPONSIVE;
    }


    /**
     * Update current Poool config with custom data
     * @param {string} type Type of config (config, style, event)
     * @param {string} name Poool config parameter name
     * @param {string} value Poool config parameter value
     * @param {string} script Poool script to update
     * @param {boolean} no_string True if parameter isn't a string
     * @private
     */
    updatePooolConfig_ (type, name, value, script, no_string) {
        if(value != null){
            if(no_string){
                script.innerHTML +=
                    "poool('"+type+"', '"+name+"', "+value+");\n";
            }
            else{
                script.innerHTML +=
                    "poool('"+type+"', '"+name+"', '"+value+"');\n";
            }
        }
    };
}


AMP.extension('amp-poool', '0.1', AMP => {
    AMP.registerElement('amp-poool', AmpPoool, CSS);
});

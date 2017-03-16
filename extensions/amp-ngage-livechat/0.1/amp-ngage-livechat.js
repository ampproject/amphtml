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
import {CSS} from '../../../build/amp-ngage-livechat-0.1.css';

class AmpNgageLiveChat extends AMP.BaseElement {
  /** @override */
  buildCallback() { 
    var ja = document.createElement("input");
    ja.id = "ngageMobileInvite";
    ja.type = "checkbox";
    this.element.appendChild(ja);
    var x = document.createElement("label");
    x.setAttribute("for","ngageMobileInvite");
    x.className = "ngageMobileFloat"
    this.element.appendChild(x);
    var v = document.createElement("a");
    v.className = "ngageBoxClose";
    v.id = "ngageBoxClose"; 
    x.appendChild(v);
    var B = document.createElement("div");
    B.className = "ngageText";
    x.appendChild(B);
    var A = document.createElement("div");
    A.className = "ngageMobilePicContainer";
    A.style.borderRadius = "0px";
    A.style.border = "0px";
    B.appendChild(A);
    var z = document.createElement("amp-img");
    z.setAttribute("height","60");
    z.setAttribute("width","60");
    z.setAttribute("layout","responsive");
    z.setAttribute("alt","Welcome");
    z.setAttribute("src","https://messenger.ngageics.com/Images/mobile.png");
    z.id = "ngageMobilePic";
    A.appendChild(z);
    var y = document.createElement("div");
    y.className = "ngageHeader";
    var yh = document.createElement("div");
    yh.className = "ngageStrong";
    yh.textContent = "LIVE CHAT";
    y.appendChild(yh);
    B.appendChild(y);
    var w = document.createElement("div");
    w.textContent = "Hi, we are here to help if you have questions.";
    B.appendChild(w);
    var u = document.createElement("div");
    u.className = "ngageMobileBar"; 
    var ua = document.createElement("div");
    ua.className = "ngageStrong";
    ua.textContent = "YES";
    var ub = document.createElement("span");
    ub.textContent = ", start now!";
    u.appendChild(ua);
    u.appendChild(ub);
    var uh = document.createElement("a");
    uh.href = "https://secure.ngagelive.com/chat/index.aspx?websiteid=" + this.element.getAttribute('id');
    uh.target = "_blank";
    uh.appendChild(u);
    x.appendChild(uh);  
    var jc = document.createElement("a");
	  jc.href = "https://secure.ngagelive.com/chat/index.aspx?websiteid=" + this.element.getAttribute('id');
	  var jca = document.createElement("div");
	  jca.className = "liveChatFloatingButtonMobile";
  	jca.textContent = "LIVE CHAT";
  	jc.appendChild(jca);
  	this.element.appendChild(jc); 
  }
}

AMP.registerElement('amp-ngage-livechat', AmpNgageLiveChat, CSS);

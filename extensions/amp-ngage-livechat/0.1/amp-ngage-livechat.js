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
    this.element./*REVIEW*/innerHTML = '<input type="checkbox" id="ngageMobileInvite"><label for="ngageMobileInvite" class="ngageMobileFloat"><a class="ngageBoxClose" id="ngageBoxClose"></a><div class="ngageText"><div class="ngageMobilePicContainer" ><amp-img src="https://messenger.ngageics.com/Images/mobile.png" layout="responsive" alt="Welcome" height="60" width="60" id="ngageMobilePic"></div><div class="ngageHeader"><div class="ngageStrong">LIVE CHAT</div></div><div>Hi, we are here to help if you have questions.</div></div><A href="https://secure.ngagelive.com/chat/index.aspx?websiteid="' + this.element.getAttribute('id') + '" target="_blank"><div class="ngageMobileBar" ><div class="ngageStrong">YES</div><span>, start now!</span></div></A></label></input><a href="https://secure.ngagelive.com/chat/index.aspx?websiteid="' + this.element.getAttribute('id') + '"><div class="liveChatFloatingButtonMobile">LIVE CHAT</div></a>';
  }
}

AMP.registerElement('amp-ngage-livechat', AmpNgageLiveChat, CSS);

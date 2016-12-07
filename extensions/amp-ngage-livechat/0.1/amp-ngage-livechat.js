import {CSS} from '../../../build/amp-ngage-livechat-0.1.css'; 

/** @const */
const EXPERIMENT = 'amp-ngage-livechat';


/** @const */
const TAG = 'amp-ngage-livechat';


class AmpNgageLiveChat extends AMP.BaseElement {
  /** @override */
  buildCallback() {
	this.element.innerHTML = '<input type="checkbox" id="ngageMobileInvite"><label for="ngageMobileInvite" class="ngageMobileFloat"><a class="ngageBoxClose" id="ngageBoxClose"></a><div class="ngageText"><div class="ngageMobilePicContainer" ><amp-img src="https://messenger.ngageics.com/Images/mobile.png" layout="responsive" alt="Welcome" height="60" width="60" id="ngageMobilePic"></div><div class="ngageHeader"><div class="ngageStrong">LIVE CHAT</div></div><div>Hi, we are here to help if you have questions.</div></div><A href="https://secure.ngagelive.com/chat/index.aspx?websiteid="'+this.element.getAttribute('id')+'" target="_blank"><div class="ngageMobileBar" ><div class="ngageStrong">YES</div><span>, start now!</span></div></A></label></input>';
  } 
}
 
AMP.registerElement('amp-ngage-livechat', AmpNgageLiveChat, CSS);

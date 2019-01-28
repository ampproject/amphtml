(self.AMP=self.AMP||[]).push({n:"amp-ad-network-gmossp-impl",i:["_base_i","_base_ad"],v:"1901181729101",f:(function(AMP,_){
var $AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$ = function($var_args$jscomp$65$$) {
  return _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$.apply(this, arguments) || this;
};
_.$$jscomp$inherits$$($AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$, _.$AmpA4A$$module$extensions$amp_a4a$0_1$amp_a4a$$);
$AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$.prototype.isValidElement = function() {
  var $src$jscomp$19$$ = this.element.getAttribute("src") || "";
  return _.$JSCompiler_StaticMethods_isAmpAdElement$$(this) && (_.$startsWith$$module$src$string$$($src$jscomp$19$$, "https://sp.gmossp-sp.jp/") || _.$startsWith$$module$src$string$$($src$jscomp$19$$, "https://amp.sp.gmossp-sp.jp/_a4a/"));
};
$AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$.prototype.$getSigningServiceNames$ = function() {
  return ["cloudflare"];
};
$AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$.prototype.$getAdUrl$ = function() {
  return this.element.getAttribute("src").replace("https://sp.gmossp-sp.jp/", "https://amp.sp.gmossp-sp.jp/_a4a/");
};
window.self.AMP.registerElement("amp-ad-network-gmossp-impl", $AmpAdNetworkGmosspImpl$$module$extensions$amp_ad_network_gmossp_impl$0_1$amp_ad_network_gmossp_impl$$);

})});

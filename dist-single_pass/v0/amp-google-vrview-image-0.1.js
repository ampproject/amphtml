(self.AMP=self.AMP||[]).push({n:"amp-google-vrview-image",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpGoogleVrviewImage$$module$extensions$amp_google_vrview_image$0_1$amp_google_vrview_image$$ = function($$jscomp$super$this$jscomp$55_element$jscomp$429$$) {
  $$jscomp$super$this$jscomp$55_element$jscomp$429$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$55_element$jscomp$429$$) || this;
  $$jscomp$super$this$jscomp$55_element$jscomp$429$$.$imageSrc_$ = "";
  $$jscomp$super$this$jscomp$55_element$jscomp$429$$.$src_$ = "";
  return $$jscomp$super$this$jscomp$55_element$jscomp$429$$;
};
_.$$jscomp$inherits$$($AmpGoogleVrviewImage$$module$extensions$amp_google_vrview_image$0_1$amp_google_vrview_image$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpGoogleVrviewImage$$module$extensions$amp_google_vrview_image$0_1$amp_google_vrview_image$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$64$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$64$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$imageSrc_$ = this.element.getAttribute("src");
  var $src$jscomp$37$$ = _.$addParamToUrl$$module$src$url$$("https://storage.googleapis.com/vrview/2.0/index.html", "image", this.$imageSrc_$);
  this.element.hasAttribute("stereo") && ($src$jscomp$37$$ = _.$addParamToUrl$$module$src$url$$($src$jscomp$37$$, "is_stereo", "true"));
  var $yaw$$ = this.element.getAttribute("yaw");
  $yaw$$ && ($src$jscomp$37$$ = _.$addParamToUrl$$module$src$url$$($src$jscomp$37$$, "start_yaw", $yaw$$));
  this.element.hasAttribute("yaw-only") && ($src$jscomp$37$$ = _.$addParamToUrl$$module$src$url$$($src$jscomp$37$$, "is_yaw_only", "true"));
  this.$src_$ = $src$jscomp$37$$;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$src_$ && (this.$preconnect$.$preload$(this.$src_$), this.$preconnect$.$preload$(this.$imageSrc_$));
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  return null;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$56$$ = this.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$56$$.onload = function() {
    $iframe$jscomp$56$$.readyState = "complete";
  };
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$56$$);
  $iframe$jscomp$56$$.setAttribute("frameborder", "0");
  $iframe$jscomp$56$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$56$$.setAttribute("src", this.$src_$);
  this.element.appendChild($iframe$jscomp$56$$);
  return this.$loadPromise$($iframe$jscomp$56$$);
};
window.self.AMP.registerElement("amp-google-vrview-image", $AmpGoogleVrviewImage$$module$extensions$amp_google_vrview_image$0_1$amp_google_vrview_image$$);

})});

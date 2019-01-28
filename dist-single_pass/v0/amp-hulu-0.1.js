(self.AMP=self.AMP||[]).push({n:"amp-hulu",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpHulu$$module$extensions$amp_hulu$0_1$amp_hulu$$ = function($$jscomp$super$this$jscomp$57_element$jscomp$433$$) {
  $$jscomp$super$this$jscomp$57_element$jscomp$433$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$57_element$jscomp$433$$) || this;
  $$jscomp$super$this$jscomp$57_element$jscomp$433$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$57_element$jscomp$433$$.$eid_$ = null;
  return $$jscomp$super$this$jscomp$57_element$jscomp$433$$;
};
_.$$jscomp$inherits$$($AmpHulu$$module$extensions$amp_hulu$0_1$amp_hulu$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpHulu$$module$extensions$amp_hulu$0_1$amp_hulu$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function() {
  this.$preconnect$.$preload$(this.$getVideoIframeSrc_$());
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$65$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$65$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$57$$ = window.document.createElement("iframe"), $src$jscomp$38$$ = this.$getVideoIframeSrc_$();
  $iframe$jscomp$57$$.setAttribute("frameborder", "0");
  $iframe$jscomp$57$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$57$$.src = $src$jscomp$38$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$57$$);
  this.element.appendChild($iframe$jscomp$57$$);
  this.$iframe_$ = $iframe$jscomp$57$$;
  return this.$loadPromise$($iframe$jscomp$57$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutOnPause$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$eid_$ = this.element.getAttribute("data-eid");
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  return "https://player.hulu.com/site/dash/mobile_embed.html?amp=1&eid=" + (0,window.encodeURIComponent)(this.$eid_$ || "");
};
window.self.AMP.registerElement("amp-hulu", $AmpHulu$$module$extensions$amp_hulu$0_1$amp_hulu$$);

})});

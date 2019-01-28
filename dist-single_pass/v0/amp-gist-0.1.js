(self.AMP=self.AMP||[]).push({n:"amp-gist",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$ = function($$jscomp$super$this$jscomp$53_element$jscomp$427$$) {
  $$jscomp$super$this$jscomp$53_element$jscomp$427$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$53_element$jscomp$427$$) || this;
  $$jscomp$super$this$jscomp$53_element$jscomp$427$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$53_element$jscomp$427$$;
};
_.$$jscomp$inherits$$($AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$, window.AMP.BaseElement);
$AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$.prototype.$preconnectCallback$ = function($opt_onLayout$jscomp$17$$) {
  this.$preconnect$.url("https://gist.github.com/", $opt_onLayout$jscomp$17$$);
};
$AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$.prototype.$isLayoutSupported$ = function($layout$jscomp$62$$) {
  return "fixed-height" == $layout$jscomp$62$$;
};
$AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$.prototype.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$638$$ = this, $iframe$jscomp$53$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "github");
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$53$$);
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$53$$, "embed-size", function($iframe$jscomp$53$$) {
    _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$638$$, $iframe$jscomp$53$$.height);
  }, !0);
  this.element.appendChild($iframe$jscomp$53$$);
  this.$iframe_$ = $iframe$jscomp$53$$;
  return this.$loadPromise$($iframe$jscomp$53$$);
};
$AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$.prototype.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-gist", $AmpGist$$module$extensions$amp_gist$0_1$amp_gist$$);

})});

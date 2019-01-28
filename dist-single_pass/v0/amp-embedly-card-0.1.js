(self.AMP=self.AMP||[]).push({n:"amp-embedly-card",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpEmbedlyKey$$module$extensions$amp_embedly_card$0_1$amp_embedly_key$$ = function($element$jscomp$393$$) {
  return window.AMP.BaseElement.call(this, $element$jscomp$393$$) || this;
}, $AmpEmbedlyCard$$module$extensions$amp_embedly_card$0_1$amp_embedly_card_impl$$ = function($$jscomp$super$this$jscomp$43_element$jscomp$394$$) {
  $$jscomp$super$this$jscomp$43_element$jscomp$394$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$43_element$jscomp$394$$) || this;
  $$jscomp$super$this$jscomp$43_element$jscomp$394$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$43_element$jscomp$394$$.$apiKey_$ = null;
  return $$jscomp$super$this$jscomp$43_element$jscomp$394$$;
};
_.$$jscomp$inherits$$($AmpEmbedlyKey$$module$extensions$amp_embedly_card$0_1$amp_embedly_key$$, window.AMP.BaseElement);
$AmpEmbedlyKey$$module$extensions$amp_embedly_card$0_1$amp_embedly_key$$.prototype.$buildCallback$ = function() {
};
$AmpEmbedlyKey$$module$extensions$amp_embedly_card$0_1$amp_embedly_key$$.prototype.$isLayoutSupported$ = function($layout$jscomp$52$$) {
  return "nodisplay" === $layout$jscomp$52$$;
};
_.$$jscomp$inherits$$($AmpEmbedlyCard$$module$extensions$amp_embedly_card$0_1$amp_embedly_card_impl$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpEmbedlyCard$$module$extensions$amp_embedly_card$0_1$amp_embedly_card_impl$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $ampEmbedlyKeyElement$$ = window.document.querySelector("amp-embedly-key");
  $ampEmbedlyKeyElement$$ && (this.$apiKey_$ = $ampEmbedlyKeyElement$$.getAttribute("value"));
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$590$$ = this;
  this.$apiKey_$ && this.element.setAttribute("data-card-key", this.$apiKey_$);
  var $iframe$jscomp$47$$ = _.$getIframe$$module$src$3p_frame$$(this.$win$, this.element, "embedly");
  _.$listenFor$$module$src$iframe_helper$$($iframe$jscomp$47$$, "embed-size", function($iframe$jscomp$47$$) {
    _.$JSCompiler_StaticMethods_changeHeight$$($$jscomp$this$jscomp$590$$, $iframe$jscomp$47$$.height);
  }, !0);
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$47$$);
  _.$JSCompiler_StaticMethods_getVsync$$(this).$mutate$(function() {
    return $$jscomp$this$jscomp$590$$.element.appendChild($iframe$jscomp$47$$);
  });
  this.$iframe_$ = $iframe$jscomp$47$$;
  return this.$loadPromise$($iframe$jscomp$47$$);
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$53$$) {
  return "responsive" == $layout$jscomp$53$$;
};
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$11$$) {
  this.$preconnect$.url("https://cdn.embedly.com", $opt_onLayout$jscomp$11$$);
};
var $AMP$jscomp$inline_3193$$ = window.self.AMP;
$AMP$jscomp$inline_3193$$.registerElement("amp-embedly-card", $AmpEmbedlyCard$$module$extensions$amp_embedly_card$0_1$amp_embedly_card_impl$$);
$AMP$jscomp$inline_3193$$.registerElement("amp-embedly-key", $AmpEmbedlyKey$$module$extensions$amp_embedly_card$0_1$amp_embedly_key$$);

})});

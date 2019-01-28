(self.AMP=self.AMP||[]).push({n:"amp-vine",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$ = function($$jscomp$super$this$jscomp$115_element$jscomp$698$$) {
  $$jscomp$super$this$jscomp$115_element$jscomp$698$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$115_element$jscomp$698$$) || this;
  $$jscomp$super$this$jscomp$115_element$jscomp$698$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$115_element$jscomp$698$$;
};
_.$$jscomp$inherits$$($AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$, window.AMP.BaseElement);
$AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$.prototype.$preconnectCallback$ = function($onLayout$jscomp$11$$) {
  this.$preconnect$.url("https://vine.co", $onLayout$jscomp$11$$);
  this.$preconnect$.url("https://v.cdn.vine.co", $onLayout$jscomp$11$$);
};
$AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$.prototype.$isLayoutSupported$ = function($layout$jscomp$110$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$110$$);
};
$AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$.prototype.$layoutCallback$ = function() {
  var $vineid$$ = this.element.getAttribute("data-vineid"), $iframe$jscomp$97$$ = this.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$97$$.setAttribute("frameborder", "0");
  $iframe$jscomp$97$$.src = "https://vine.co/v/" + (0,window.encodeURIComponent)($vineid$$) + "/embed/simple";
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$97$$);
  this.element.appendChild($iframe$jscomp$97$$);
  this.$iframe_$ = $iframe$jscomp$97$$;
  return this.$loadPromise$($iframe$jscomp$97$$);
};
$AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$.prototype.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("pause", "*");
};
window.self.AMP.registerElement("amp-vine", $AmpVine$$module$extensions$amp_vine$0_1$amp_vine$$);

})});

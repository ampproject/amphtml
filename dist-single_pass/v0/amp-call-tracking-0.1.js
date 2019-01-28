(self.AMP=self.AMP||[]).push({n:"amp-call-tracking",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $fetch_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$ = function($win$jscomp$337$$, $url$jscomp$181$$) {
  $url$jscomp$181$$ in $cachedResponsePromises_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$ || ($cachedResponsePromises_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$[$url$jscomp$181$$] = _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($win$jscomp$337$$), $url$jscomp$181$$, {credentials:"include"}).then(function($win$jscomp$337$$) {
    return $win$jscomp$337$$.json();
  }));
  return $cachedResponsePromises_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$[$url$jscomp$181$$];
}, $AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$ = function($$jscomp$super$this$jscomp$28_element$jscomp$372$$) {
  $$jscomp$super$this$jscomp$28_element$jscomp$372$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$28_element$jscomp$372$$) || this;
  $$jscomp$super$this$jscomp$28_element$jscomp$372$$.$hyperlink_$ = null;
  $$jscomp$super$this$jscomp$28_element$jscomp$372$$.$configUrl_$ = null;
  return $$jscomp$super$this$jscomp$28_element$jscomp$372$$;
}, $cachedResponsePromises_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$ = {};
_.$$jscomp$inherits$$($AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$, window.AMP.BaseElement);
$AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$.prototype.$isLayoutSupported$ = function($layout$jscomp$43$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$43$$) || "container" == $layout$jscomp$43$$;
};
$AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$.prototype.$buildCallback$ = function() {
  this.$configUrl_$ = this.element.getAttribute("config");
  this.$hyperlink_$ = this.element.firstElementChild;
};
$AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$.prototype.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$500$$ = this;
  return _.$JSCompiler_StaticMethods_expandUrlAsync$$(_.$Services$$module$src$services$urlReplacementsForDoc$$(this.element), _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), this.$configUrl_$)).then(function($url$jscomp$182$$) {
    return $fetch_$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$($$jscomp$this$jscomp$500$$.$win$, $url$jscomp$182$$);
  }).then(function($data$jscomp$117$$) {
    $$jscomp$this$jscomp$500$$.$hyperlink_$.setAttribute("href", "tel:" + $data$jscomp$117$$.phoneNumber);
    $$jscomp$this$jscomp$500$$.$hyperlink_$.textContent = $data$jscomp$117$$.formattedPhoneNumber || $data$jscomp$117$$.phoneNumber;
  });
};
window.self.AMP.registerElement("amp-call-tracking", $AmpCallTracking$$module$extensions$amp_call_tracking$0_1$amp_call_tracking$$);

})});

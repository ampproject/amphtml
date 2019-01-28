(self.AMP=self.AMP||[]).push({n:"amp-reach-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$ = function($$jscomp$super$this$jscomp$85_element$jscomp$523$$) {
  $$jscomp$super$this$jscomp$85_element$jscomp$523$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$85_element$jscomp$523$$) || this;
  $$jscomp$super$this$jscomp$85_element$jscomp$523$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$85_element$jscomp$523$$;
};
_.$$jscomp$inherits$$($AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$, window.AMP.BaseElement);
$AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$.prototype.$preconnectCallback$ = function($opt_onLayout$jscomp$25$$) {
  this.$preconnect$.url("https://player-cdn.beachfrontmedia.com", $opt_onLayout$jscomp$25$$);
};
$AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$.prototype.$isLayoutSupported$ = function($layout$jscomp$87$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$87$$);
};
$AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$.prototype.$layoutCallback$ = function() {
  var $embedId$$ = this.element.getAttribute("data-embed-id") || "default", $iframe$jscomp$76$$ = this.element.ownerDocument.createElement("iframe");
  $iframe$jscomp$76$$.setAttribute("frameborder", "no");
  $iframe$jscomp$76$$.setAttribute("scrolling", "no");
  $iframe$jscomp$76$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$76$$.src = "https://player-cdn.beachfrontmedia.com/playerapi/v1/frame/player/?embed_id=" + (0,window.encodeURIComponent)($embedId$$);
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$76$$);
  this.element.appendChild($iframe$jscomp$76$$);
  this.$iframe_$ = $iframe$jscomp$76$$;
  return this.$loadPromise$($iframe$jscomp$76$$);
};
$AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$.prototype.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("pause", "https://player-cdn.beachfrontmedia.com");
};
window.self.AMP.registerElement("amp-reach-player", $AmpReachPlayer$$module$extensions$amp_reach_player$0_1$amp_reach_player$$);

})});

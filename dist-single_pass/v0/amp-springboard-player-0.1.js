(self.AMP=self.AMP||[]).push({n:"amp-springboard-player",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpSpringboardPlayer$$module$extensions$amp_springboard_player$0_1$amp_springboard_player$$ = function($$jscomp$super$this$jscomp$95_element$jscomp$548$$) {
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$95_element$jscomp$548$$) || this;
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$mode_$ = "";
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$contentId_$ = "";
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$domain_$ = "";
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$siteId_$ = "";
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$playerId_$ = "";
  $$jscomp$super$this$jscomp$95_element$jscomp$548$$.$iframe_$ = null;
  return $$jscomp$super$this$jscomp$95_element$jscomp$548$$;
};
_.$$jscomp$inherits$$($AmpSpringboardPlayer$$module$extensions$amp_springboard_player$0_1$amp_springboard_player$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpSpringboardPlayer$$module$extensions$amp_springboard_player$0_1$amp_springboard_player$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$27$$) {
  this.$preconnect$.url("https://cms.springboardplatform.com", $opt_onLayout$jscomp$27$$);
  this.$preconnect$.url("https://www.springboardplatform.com", $opt_onLayout$jscomp$27$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$94$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$94$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$mode_$ = this.element.getAttribute("data-mode");
  this.$contentId_$ = this.element.getAttribute("data-content-id");
  this.$domain_$ = this.element.getAttribute("data-domain");
  this.$siteId_$ = this.element.getAttribute("data-site-id");
  this.$playerId_$ = this.element.getAttribute("data-player-id");
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $iframe$jscomp$82$$ = this.element.ownerDocument.createElement("iframe"), $items$jscomp$7$$ = this.element.getAttribute("data-items") || "10";
  $iframe$jscomp$82$$.setAttribute("frameborder", "0");
  $iframe$jscomp$82$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$82$$.id = this.$playerId_$ + "_" + this.$contentId_$;
  $iframe$jscomp$82$$.src = "https://cms.springboardplatform.com/embed_iframe/" + (0,window.encodeURIComponent)(this.$siteId_$) + "/" + (0,window.encodeURIComponent)(this.$mode_$) + "/" + (0,window.encodeURIComponent)(this.$contentId_$) + "/" + (0,window.encodeURIComponent)(this.$playerId_$) + "/" + (0,window.encodeURIComponent)(this.$domain_$) + "/" + (0,window.encodeURIComponent)($items$jscomp$7$$);
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$82$$);
  this.$iframe_$ = $iframe$jscomp$82$$;
  this.element.appendChild($iframe$jscomp$82$$);
  return this.$loadPromise$($iframe$jscomp$82$$);
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("ampPause", "*");
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$20$$ = this.$win$.document.createElement("amp-img");
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["aria-label"], $placeholder$jscomp$20$$);
  $placeholder$jscomp$20$$.setAttribute("src", "https://www.springboardplatform.com/storage/" + (0,window.encodeURIComponent)(this.$domain_$) + "/snapshots/" + (0,window.encodeURIComponent)(this.$contentId_$) + ".jpg");
  "playlist" == this.$mode_$ && $placeholder$jscomp$20$$.setAttribute("src", "https://www.springboardplatform.com/storage/default/snapshots/default_snapshot.png");
  $placeholder$jscomp$20$$.setAttribute("placeholder", "");
  $placeholder$jscomp$20$$.setAttribute("referrerpolicy", "origin");
  $placeholder$jscomp$20$$.setAttribute("layout", "fill");
  $placeholder$jscomp$20$$.hasAttribute("aria-label") ? $placeholder$jscomp$20$$.setAttribute("alt", "Loading video - " + $placeholder$jscomp$20$$.getAttribute("aria-label")) : $placeholder$jscomp$20$$.setAttribute("alt", "Loading video");
  return $placeholder$jscomp$20$$;
};
window.self.AMP.registerElement("amp-springboard-player", $AmpSpringboardPlayer$$module$extensions$amp_springboard_player$0_1$amp_springboard_player$$);

})});

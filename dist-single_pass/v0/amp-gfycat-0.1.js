(self.AMP=self.AMP||[]).push({n:"amp-gfycat",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpGfycat$$module$extensions$amp_gfycat$0_1$amp_gfycat$$ = function($$jscomp$super$this$jscomp$52_element$jscomp$426$$) {
  $$jscomp$super$this$jscomp$52_element$jscomp$426$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$52_element$jscomp$426$$) || this;
  $$jscomp$super$this$jscomp$52_element$jscomp$426$$.$videoid_$ = "";
  $$jscomp$super$this$jscomp$52_element$jscomp$426$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$52_element$jscomp$426$$.$videoIframeSrc_$ = null;
  $$jscomp$super$this$jscomp$52_element$jscomp$426$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$52_element$jscomp$426$$;
};
_.$$jscomp$inherits$$($AmpGfycat$$module$extensions$amp_gfycat$0_1$amp_gfycat$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpGfycat$$module$extensions$amp_gfycat$0_1$amp_gfycat$$.prototype;
_.$JSCompiler_prototypeAlias$$.$preconnectCallback$ = function($opt_onLayout$jscomp$16$$) {
  this.$preconnect$.url("https://gfycat.com", $opt_onLayout$jscomp$16$$);
  this.$preconnect$.url("https://giant.gfycat.com", $opt_onLayout$jscomp$16$$);
  this.$preconnect$.url("https://thumbs.gfycat.com", $opt_onLayout$jscomp$16$$);
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$61$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$61$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  this.$videoid_$ = this.element.getAttribute("data-gfyid");
  this.element.hasAttribute("noautoplay") || this.element.setAttribute("autoplay", "");
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$(this.element);
  _.$Services$$module$src$services$videoManagerForDoc$$(this.element).register(this);
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $placeholder$jscomp$12$$ = this.$win$.document.createElement("amp-img"), $videoid$$ = this.$videoid_$;
  _.$JSCompiler_StaticMethods_propagateAttributes$$(this, ["alt", "aria-label"], $placeholder$jscomp$12$$);
  $placeholder$jscomp$12$$.setAttribute("src", "https://thumbs.gfycat.com/" + (0,window.encodeURIComponent)($videoid$$) + "-poster.jpg");
  $placeholder$jscomp$12$$.setAttribute("layout", "fill");
  $placeholder$jscomp$12$$.setAttribute("placeholder", "");
  $placeholder$jscomp$12$$.setAttribute("referrerpolicy", "origin");
  this.element.hasAttribute("aria-label") ? $placeholder$jscomp$12$$.setAttribute("alt", "Loading gif " + this.element.getAttribute("aria-label")) : this.element.hasAttribute("alt") ? $placeholder$jscomp$12$$.setAttribute("alt", "Loading gif " + this.element.getAttribute("alt")) : $placeholder$jscomp$12$$.setAttribute("alt", "Loading gif");
  _.$JSCompiler_StaticMethods_applyFillContent$$($placeholder$jscomp$12$$);
  return $placeholder$jscomp$12$$;
};
_.$JSCompiler_prototypeAlias$$.$getVideoIframeSrc_$ = function() {
  if (this.$videoIframeSrc_$) {
    return this.$videoIframeSrc_$;
  }
  var $src$jscomp$33$$ = "https://gfycat.com/ifr/" + (0,window.encodeURIComponent)(this.$videoid_$), $params$jscomp$32$$ = _.$getDataParamsFromAttributes$$module$src$dom$$(this.element);
  this.element.hasAttribute("noautoplay") && ($params$jscomp$32$$.autoplay = "0");
  return this.$videoIframeSrc_$ = $src$jscomp$33$$ = _.$addParamsToUrl$$module$src$url$$($src$jscomp$33$$, $params$jscomp$32$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$637$$ = this, $iframe$jscomp$52$$ = this.element.ownerDocument.createElement("iframe"), $src$jscomp$34$$ = this.$getVideoIframeSrc_$();
  $iframe$jscomp$52$$.setAttribute("frameborder", "0");
  $iframe$jscomp$52$$.src = $src$jscomp$34$$;
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$52$$);
  this.$iframe_$ = $iframe$jscomp$52$$;
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$handleGfycatMessages_$.bind(this));
  this.element.appendChild($iframe$jscomp$52$$);
  return this.$loadPromise$(this.$iframe_$).then(function() {
    $$jscomp$this$jscomp$637$$.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
  });
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$handleGfycatMessages_$ = function($event$jscomp$128$$) {
  var $eventData$jscomp$10$$ = $event$jscomp$128$$.data;
  "https://gfycat.com" === $event$jscomp$128$$.origin && $event$jscomp$128$$.source == this.$iframe_$.contentWindow && "string" === typeof $eventData$jscomp$10$$ && ("paused" == $eventData$jscomp$10$$ ? this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$PAUSE$) : "playing" == $eventData$jscomp$10$$ && this.element.$D$(_.$VideoEvents$$module$src$video_interface$$.$PLAYING$));
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.pause();
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("play", "*");
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  this.$iframe_$ && this.$iframe_$.contentWindow && this.$iframe_$.contentWindow.postMessage("pause", "*");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return !1;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return 1;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-gfycat", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-gfycat", $AmpGfycat$$module$extensions$amp_gfycat$0_1$amp_gfycat$$);

})});

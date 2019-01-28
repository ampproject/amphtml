(self.AMP=self.AMP||[]).push({n:"amp-video-iframe",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $disableScrollingOnIframe$$module$src$iframe_helper$$ = function($iframe$jscomp$7$$) {
  _.$addAttributesToElement$$module$src$dom$$($iframe$jscomp$7$$, _.$dict$$module$src$utils$object$$({scrolling:"no"}));
  _.$setStyle$$module$src$style$$($iframe$jscomp$7$$, "overflow", "hidden");
  return $iframe$jscomp$7$$;
}, $AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$ = function($element$jscomp$673$$) {
  var $$jscomp$super$this$jscomp$112$$ = window.AMP.BaseElement.call(this, $element$jscomp$673$$) || this;
  $$jscomp$super$this$jscomp$112$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$112$$.$unlistenFrame_$ = null;
  $$jscomp$super$this$jscomp$112$$.$readyDeferred_$ = null;
  $$jscomp$super$this$jscomp$112$$.$canPlay_$ = !1;
  $$jscomp$super$this$jscomp$112$$.$boundOnMessage_$ = function($element$jscomp$673$$) {
    return $$jscomp$super$this$jscomp$112$$.$onMessage_$($element$jscomp$673$$);
  };
  return $$jscomp$super$this$jscomp$112$$;
}, $JSCompiler_StaticMethods_getMetadata_$$ = function($$jscomp$destructuring$var607_JSCompiler_StaticMethods_getMetadata_$self$$) {
  $$jscomp$destructuring$var607_JSCompiler_StaticMethods_getMetadata_$self$$ = _.$Services$$module$src$services$documentInfoForDoc$$($$jscomp$destructuring$var607_JSCompiler_StaticMethods_getMetadata_$self$$.element);
  return _.$dict$$module$src$utils$object$$({sourceUrl:$$jscomp$destructuring$var607_JSCompiler_StaticMethods_getMetadata_$self$$.sourceUrl, canonicalUrl:$$jscomp$destructuring$var607_JSCompiler_StaticMethods_getMetadata_$self$$.canonicalUrl});
}, $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$$ = function($JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$self$$) {
  var $element$jscomp$677$$ = $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$self$$.element, $JSCompiler_inline_result$jscomp$498_urlService$jscomp$12$$ = _.$Services$$module$src$services$urlForDoc$$($element$jscomp$677$$);
  var $JSCompiler_inline_result$jscomp$496$$ = $element$jscomp$677$$.getAttribute("src");
  var $JSCompiler_temp_const$jscomp$497$$ = _.$getSourceOrigin$$module$src$url$$($JSCompiler_inline_result$jscomp$496$$), $win$jscomp$inline_5263$$ = $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$self$$.$win$;
  $JSCompiler_inline_result$jscomp$498_urlService$jscomp$12$$ = $win$jscomp$inline_5263$$.origin || $JSCompiler_inline_result$jscomp$498_urlService$jscomp$12$$.parse($win$jscomp$inline_5263$$.location.href).origin;
  $JSCompiler_temp_const$jscomp$497$$ === $JSCompiler_inline_result$jscomp$498_urlService$jscomp$12$$ && $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$self$$.$user$().$Log$$module$src$log_prototype$warn$("amp-video-iframe", "Origins of document inside amp-video-iframe and the host are the same, which allows for same-origin behavior. However in AMP cache, origins won't match. Please ensure you do not rely on any same-origin privileges.", 
  $element$jscomp$677$$);
  return $JSCompiler_inline_result$jscomp$496$$;
}, $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$ = function($JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$self$$, $method$jscomp$34$$) {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$$($JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$self$$, _.$dict$$module$src$utils$object$$({event:"method", method:$method$jscomp$34$$}));
}, $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$$ = function($JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$self$$, $message$jscomp$81$$) {
  if ($JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$self$$.$iframe_$ && $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$self$$.$iframe_$.contentWindow) {
    var $promise$jscomp$66$$ = $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$self$$.$readyDeferred_$.$promise$;
    $promise$jscomp$66$$ && $promise$jscomp$66$$.then(function() {
      $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$self$$.$iframe_$.contentWindow.postMessage(JSON.stringify($message$jscomp$81$$), "*");
    });
  }
}, $_template$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$ = ["<amp-img layout=fill placeholder></amp-img>"], $SANDBOX$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$ = ["allow-scripts", "allow-same-origin", "allow-popups-to-escape-sandbox", "allow-top-navigation-by-user-activation"], $ALLOWED_EVENTS$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$ = [_.$VideoEvents$$module$src$video_interface$$.$PLAYING$, _.$VideoEvents$$module$src$video_interface$$.$PAUSE$, _.$VideoEvents$$module$src$video_interface$$.$ENDED$, 
_.$VideoEvents$$module$src$video_interface$$.$MUTED$, _.$VideoEvents$$module$src$video_interface$$.$UNMUTED$, _.$VideoEvents$$module$src$video_interface$$.$AD_START$, _.$VideoEvents$$module$src$video_interface$$.$AD_END$];
_.$$jscomp$inherits$$($AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$107$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$107$$);
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $element$jscomp$674$$ = this.element, $isIntegrationTest$$ = $element$jscomp$674$$.hasAttribute("i-amphtml-integration-test");
  this.$user$().$Log$$module$src$log_prototype$assert$($isIntegrationTest$$ || !_.$looksLikeTrackingIframe$$module$src$iframe_helper$$($element$jscomp$674$$), "<amp-video-iframe> does not allow tracking iframes. Please use amp-analytics instead.");
  _.$installVideoManagerForDoc$$module$src$service$video_manager_impl$$($element$jscomp$674$$);
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$1305$$ = this, $name$jscomp$272$$ = JSON.stringify($JSCompiler_StaticMethods_getMetadata_$$(this));
  this.$iframe_$ = $disableScrollingOnIframe$$module$src$iframe_helper$$(_.$createFrameFor$$module$src$iframe_video$$(this, $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$$(this), $name$jscomp$272$$, $SANDBOX$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$));
  this.$unlistenFrame_$ = _.$internalListenImplementation$$module$src$event_helper_listen$$(this.$win$, "message", this.$boundOnMessage_$, void 0);
  this.$readyDeferred_$ = new _.$Deferred$$module$src$utils$promise$$;
  return this.$readyDeferred_$.$promise$.then(function() {
    return $$jscomp$this$jscomp$1305$$.$onReady_$();
  });
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($iframe$jscomp$inline_5253_mutations$jscomp$19$$) {
  $iframe$jscomp$inline_5253_mutations$jscomp$19$$.src && ($iframe$jscomp$inline_5253_mutations$jscomp$19$$ = this.$iframe_$) && $iframe$jscomp$inline_5253_mutations$jscomp$19$$.src != $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$$(this) && ($iframe$jscomp$inline_5253_mutations$jscomp$19$$.src = $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$getSrc_$$(this));
};
_.$JSCompiler_prototypeAlias$$.$onReady_$ = function() {
  var $element$jscomp$675$$ = this.element;
  _.$Services$$module$src$services$videoManagerForDoc$$($element$jscomp$675$$).register(this);
  $element$jscomp$675$$.$D$(_.$VideoEvents$$module$src$video_interface$$.$LOAD$);
};
_.$JSCompiler_prototypeAlias$$.$createPlaceholderCallback$ = function() {
  var $element$jscomp$676$$ = this.element, $poster$jscomp$7$$ = _.$htmlFor$$module$src$static_template$$($element$jscomp$676$$)($_template$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$);
  $poster$jscomp$7$$.setAttribute("src", _.$JSCompiler_StaticMethods_assertString$$(this.$user$(), $element$jscomp$676$$.getAttribute("poster")));
  return $poster$jscomp$7$$;
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$canPlay_$ = this.$canPlay_$ = !1;
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  this.$unlistenFrame_$ && (this.$unlistenFrame_$(), this.$unlistenFrame_$ = null);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$onMessage_$ = function($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$) {
  if (this.$iframe_$ && _.$originMatches$$module$src$iframe_video$$($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$, this.$iframe_$, /.*/) && ($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.data, _.$isJsonOrObj$$module$src$iframe_video$$($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$))) {
    $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$ = _.$objOrParseJson$$module$src$iframe_video$$($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$);
    var $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.id, $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.method;
    if ($intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$) {
      "getIntersection" == $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$ && ($$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$ = this.element.$I$(), $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.intersectionRatio, $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$postMessage_$$(this, 
      _.$dict$$module$src$utils$object$$({id:$eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$, args:{intersectionRatio:0.5 > $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$ ? 0 : $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$, time:$$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.time}})));
    } else {
      $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.event;
      $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$ = "canplay" == $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$;
      this.$canPlay_$ = this.$canPlay_$ || $intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$;
      var $$jscomp$destructuring$var611_resolve$jscomp$104$$ = this.$readyDeferred_$, $reject$jscomp$37$$ = $$jscomp$destructuring$var611_resolve$jscomp$104$$.reject;
      $$jscomp$destructuring$var611_resolve$jscomp$104$$ = $$jscomp$destructuring$var611_resolve$jscomp$104$$.resolve;
      if ($intersectionRatio$jscomp$inline_5268_isCanPlayEvent_methodReceived$$) {
        return $$jscomp$destructuring$var611_resolve$jscomp$104$$();
      }
      if ("error" == $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ && !this.$canPlay_$) {
        return $reject$jscomp$37$$("Received `error` event.");
      }
      "analytics" == $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ ? ($eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ = $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$.analytics, $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$ = $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$.eventType, $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ = 
      $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$.vars, $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ = void 0 === $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$ ? {} : $eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$, _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$, 
      "`eventType` missing in analytics event"), this.element.$D$("video-hosted-custom", {$eventType$:$$jscomp$inline_5267_data$jscomp$214_event$jscomp$249_eventData$jscomp$20_eventType$jscomp$inline_5271$$, $vars$:$eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$})) : -1 < $ALLOWED_EVENTS$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$.indexOf($eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$) && this.element.$D$($eventReceived_messageId$jscomp$3_spec$jscomp$37_vars$jscomp$inline_5272$$);
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.pause();
};
_.$JSCompiler_prototypeAlias$$.pause = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "pause");
};
_.$JSCompiler_prototypeAlias$$.play = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "play");
};
_.$JSCompiler_prototypeAlias$$.$mute$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "mute");
};
_.$JSCompiler_prototypeAlias$$.$unmute$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "unmute");
};
_.$JSCompiler_prototypeAlias$$.$isInteractive$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$supportsPlatform$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$preimplementsMediaSessionAPI$ = function() {
  return this.element.hasAttribute("implements-media-session");
};
_.$JSCompiler_prototypeAlias$$.$preimplementsAutoFullscreen$ = function() {
  return this.element.hasAttribute("implements-rotate-to-fullscreen");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenEnter$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "fullscreenenter");
};
_.$JSCompiler_prototypeAlias$$.$fullscreenExit$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "fullscreenexit");
};
_.$JSCompiler_prototypeAlias$$.$showControls$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "showcontrols");
};
_.$JSCompiler_prototypeAlias$$.$hideControls$ = function() {
  $JSCompiler_StaticMethods_AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe_prototype$method_$$(this, "hidecontrols");
};
_.$JSCompiler_prototypeAlias$$.getMetadata = function() {
};
_.$JSCompiler_prototypeAlias$$.$getDuration$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getCurrentTime$ = function() {
  return 0;
};
_.$JSCompiler_prototypeAlias$$.$getPlayedRanges$ = function() {
  return [];
};
_.$JSCompiler_prototypeAlias$$.$seekTo$ = function() {
  this.$user$().error("amp-video-iframe", "`seekTo` not supported.");
};
window.self.AMP.registerElement("amp-video-iframe", $AmpVideoIframe$$module$extensions$amp_video_iframe$0_1$amp_video_iframe$$);

})});

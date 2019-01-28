(self.AMP=self.AMP||[]).push({n:"amp-audio",i:["_base_i","_base_media"],v:"1901181729101",f:(function(AMP,_){
var $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$ = function($$jscomp$super$this$jscomp$22_element$jscomp$343$$) {
  $$jscomp$super$this$jscomp$22_element$jscomp$343$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$22_element$jscomp$343$$) || this;
  $$jscomp$super$this$jscomp$22_element$jscomp$343$$.$audio_$ = null;
  $$jscomp$super$this$jscomp$22_element$jscomp$343$$.$metadata_$ = _.$EMPTY_METADATA$$module$src$mediasession_helper$$;
  $$jscomp$super$this$jscomp$22_element$jscomp$343$$.$isPlaying$ = !1;
  return $$jscomp$super$this$jscomp$22_element$jscomp$343$$;
}, $JSCompiler_StaticMethods_buildAudioElement$$ = function($JSCompiler_StaticMethods_buildAudioElement$self$$) {
  var $audio$$ = $JSCompiler_StaticMethods_buildAudioElement$self$$.element.ownerDocument.createElement("audio");
  $audio$$.play ? ($audio$$.controls = !0, $JSCompiler_StaticMethods_buildAudioElement$self$$.element.getAttribute("src"), _.$JSCompiler_StaticMethods_propagateAttributes$$($JSCompiler_StaticMethods_buildAudioElement$self$$, "src preload autoplay muted loop aria-label aria-describedby aria-labelledby controlsList".split(" "), $audio$$), _.$JSCompiler_StaticMethods_applyFillContent$$($audio$$), $JSCompiler_StaticMethods_buildAudioElement$self$$.$getRealChildNodes$().forEach(function($JSCompiler_StaticMethods_buildAudioElement$self$$) {
    $JSCompiler_StaticMethods_buildAudioElement$self$$.getAttribute && $JSCompiler_StaticMethods_buildAudioElement$self$$.getAttribute("src") && $JSCompiler_StaticMethods_buildAudioElement$self$$.getAttribute("src");
    $audio$$.appendChild($JSCompiler_StaticMethods_buildAudioElement$self$$);
  }), $JSCompiler_StaticMethods_buildAudioElement$self$$.element.appendChild($audio$$), $JSCompiler_StaticMethods_buildAudioElement$self$$.$audio_$ = $audio$$, _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_buildAudioElement$self$$.$audio_$, "playing", function() {
    return $JSCompiler_StaticMethods_audioPlaying_$$($JSCompiler_StaticMethods_buildAudioElement$self$$);
  })) : ($JSCompiler_StaticMethods_buildAudioElement$self$$.$toggleFallback$(!0), window.Promise.resolve());
}, $JSCompiler_StaticMethods_isInvocationValid_$$ = function($JSCompiler_StaticMethods_isInvocationValid_$self$$) {
  return $JSCompiler_StaticMethods_isInvocationValid_$self$$.$audio_$ ? _.$closestByTag$$module$src$dom$$($JSCompiler_StaticMethods_isInvocationValid_$self$$.element, "AMP-STORY") ? (_.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-audio", "<amp-story> elements do not support actions on <amp-audio> elements"), !1) : !0 : !1;
}, $JSCompiler_StaticMethods_audioPlaying_$$ = function($JSCompiler_StaticMethods_audioPlaying_$self$$) {
  _.$setMediaSession$$module$src$mediasession_helper$$($JSCompiler_StaticMethods_audioPlaying_$self$$.element, $JSCompiler_StaticMethods_audioPlaying_$self$$.$win$, $JSCompiler_StaticMethods_audioPlaying_$self$$.$metadata_$, function() {
    $JSCompiler_StaticMethods_audioPlaying_$self$$.$audio_$.play();
  }, function() {
    $JSCompiler_StaticMethods_audioPlaying_$self$$.$audio_$.pause();
  });
};
_.$$jscomp$inherits$$($AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$35$$) {
  return "fixed" == $layout$jscomp$35$$ || "fixed-height" == $layout$jscomp$35$$;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  "nodisplay" === this.$getLayout$() && (this.element.removeAttribute("autoplay"), $JSCompiler_StaticMethods_buildAudioElement$$(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "play", this.$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio_prototype$play_$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "pause", this.$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio_prototype$pause_$.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  "nodisplay" !== this.$getLayout$() && $JSCompiler_StaticMethods_buildAudioElement$$(this);
  var $artwork$jscomp$1_document$jscomp$8$$ = this.$getAmpDoc$().$win$.document, $artist$$ = this.element.getAttribute("artist") || "", $title$jscomp$21$$ = this.element.getAttribute("title") || this.element.getAttribute("aria-label") || $artwork$jscomp$1_document$jscomp$8$$.title || "", $album$$ = this.element.getAttribute("album") || "";
  $artwork$jscomp$1_document$jscomp$8$$ = this.element.getAttribute("artwork") || _.$parseSchemaImage$$module$src$mediasession_helper$$($artwork$jscomp$1_document$jscomp$8$$) || _.$parseOgImage$$module$src$mediasession_helper$$($artwork$jscomp$1_document$jscomp$8$$) || _.$parseFavicon$$module$src$mediasession_helper$$($artwork$jscomp$1_document$jscomp$8$$) || "";
  this.$metadata_$ = {title:$title$jscomp$21$$, $artist$:$artist$$, $album$:$album$$, $artwork$:[{src:$artwork$jscomp$1_document$jscomp$8$$}]};
  return this.$loadPromise$(this.$audio_$);
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$pauseCallback$ = function() {
  this.$audio_$ && this.$audio_$.pause();
};
_.$JSCompiler_prototypeAlias$$.$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio_prototype$pause_$ = function() {
  $JSCompiler_StaticMethods_isInvocationValid_$$(this) && this.$audio_$.pause();
};
_.$JSCompiler_prototypeAlias$$.$AmpAudio$$module$extensions$amp_audio$0_1$amp_audio_prototype$play_$ = function() {
  $JSCompiler_StaticMethods_isInvocationValid_$$(this) && this.$audio_$.play();
};
window.self.AMP.registerElement("amp-audio", $AmpAudio$$module$extensions$amp_audio$0_1$amp_audio$$);

})});

(self.AMP=self.AMP||[]).push({n:"amp-riddle-quiz",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$ = function($$jscomp$super$this$jscomp$87_element$jscomp$525$$) {
  $$jscomp$super$this$jscomp$87_element$jscomp$525$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$87_element$jscomp$525$$) || this;
  $$jscomp$super$this$jscomp$87_element$jscomp$525$$.$iframe_$ = null;
  $$jscomp$super$this$jscomp$87_element$jscomp$525$$.$itemHeight_$ = 400;
  $$jscomp$super$this$jscomp$87_element$jscomp$525$$.$riddleId_$ = null;
  $$jscomp$super$this$jscomp$87_element$jscomp$525$$.$unlistenMessage_$ = null;
  return $$jscomp$super$this$jscomp$87_element$jscomp$525$$;
}, $JSCompiler_StaticMethods_riddleHeightChanged_$$ = function($JSCompiler_StaticMethods_riddleHeightChanged_$self$$, $height$jscomp$55$$) {
  _.$isFiniteNumber$$module$src$types$$($height$jscomp$55$$) && $height$jscomp$55$$ !== $JSCompiler_StaticMethods_riddleHeightChanged_$self$$.$itemHeight_$ && ($JSCompiler_StaticMethods_riddleHeightChanged_$self$$.$itemHeight_$ = $height$jscomp$55$$, _.$JSCompiler_StaticMethods_attemptChangeHeight$$($JSCompiler_StaticMethods_riddleHeightChanged_$self$$, $JSCompiler_StaticMethods_riddleHeightChanged_$self$$.$itemHeight_$).catch(function() {
  }));
};
_.$$jscomp$inherits$$($AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$, window.AMP.BaseElement);
$AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$.prototype.$D$ = function($data$jscomp$164_event$jscomp$175$$) {
  this.$iframe_$ && "https://www.riddle.com" == $data$jscomp$164_event$jscomp$175$$.origin && $data$jscomp$164_event$jscomp$175$$.source == this.$iframe_$.contentWindow && ($data$jscomp$164_event$jscomp$175$$ = $data$jscomp$164_event$jscomp$175$$.data, _.$isObject$$module$src$types$$($data$jscomp$164_event$jscomp$175$$) && void 0 != $data$jscomp$164_event$jscomp$175$$.riddleId && $data$jscomp$164_event$jscomp$175$$.riddleId == this.$riddleId_$ && $JSCompiler_StaticMethods_riddleHeightChanged_$$(this, 
  $data$jscomp$164_event$jscomp$175$$.riddleHeight));
};
$AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$.prototype.$isLayoutSupported$ = function($layout$jscomp$90$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$90$$);
};
$AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$.prototype.$layoutCallback$ = function() {
  this.$riddleId_$ = this.element.getAttribute("data-riddle-id");
  this.$unlistenMessage_$ = _.$listen$$module$src$event_helper$$(this.$win$, "message", this.$D$.bind(this));
  var $iframe$jscomp$80$$ = this.element.ownerDocument.createElement("iframe");
  this.$iframe_$ = $iframe$jscomp$80$$;
  $iframe$jscomp$80$$.setAttribute("scrolling", "no");
  $iframe$jscomp$80$$.setAttribute("frameborder", "0");
  $iframe$jscomp$80$$.setAttribute("allowtransparency", "true");
  $iframe$jscomp$80$$.setAttribute("allowfullscreen", "true");
  $iframe$jscomp$80$$.src = "https://www.riddle.com/a/iframe/" + (0,window.encodeURIComponent)(this.$riddleId_$);
  _.$JSCompiler_StaticMethods_applyFillContent$$($iframe$jscomp$80$$);
  this.element.appendChild($iframe$jscomp$80$$);
  return this.$loadPromise$($iframe$jscomp$80$$);
};
$AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$.prototype.$unlayoutCallback$ = function() {
  this.$unlistenMessage_$ && this.$unlistenMessage_$();
  this.$iframe_$ && (_.$removeElement$$module$src$dom$$(this.$iframe_$), this.$iframe_$ = null);
  return !0;
};
window.self.AMP.registerElement("amp-riddle-quiz", $AmpRiddleQuiz$$module$extensions$amp_riddle_quiz$0_1$amp_riddle_quiz$$, !1);

})});

(self.AMP=self.AMP||[]).push({n:"amp-date-countdown",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$ = function($$jscomp$super$this$jscomp$36_element$jscomp$383$$) {
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$36_element$jscomp$383$$) || this;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$templates_$ = _.$Services$$module$src$services$templatesFor$$($$jscomp$super$this$jscomp$36_element$jscomp$383$$.$win$);
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$boundRendered_$ = $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$rendered_$.bind($$jscomp$super$this$jscomp$36_element$jscomp$383$$);
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$endDate_$ = "";
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$timeleftMs_$ = 0;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$timestampMs_$ = 0;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$timestampSeconds_$ = 0;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$offsetSeconds_$ = 0;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$locale_$ = "";
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$whenEnded_$ = "";
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$biggestUnit_$ = "";
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$localeWordList_$ = null;
  $$jscomp$super$this$jscomp$36_element$jscomp$383$$.$countDownTimer_$ = null;
  return $$jscomp$super$this$jscomp$36_element$jscomp$383$$;
}, $JSCompiler_StaticMethods_tickCountDown_$$ = function($JSCompiler_StaticMethods_tickCountDown_$self$$, $differentBetween$jscomp$1$$) {
  var $items$jscomp$1$$ = {}, $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$ = {$DAYS$:1, $HOURS$:2, $MINUTES$:3, $SECONDS$:4}, $DIFF_d$jscomp$inline_3107$$ = $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] == $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$DAYS$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ / 864E5)) : 0, $h$jscomp$inline_3108$$ = $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] == 
  $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$HOURS$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ / 36E5)) : $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] < $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$HOURS$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ % 864E5 / 36E5)) : 0, $m$jscomp$inline_3109$$ = $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] == 
  $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$MINUTES$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ / 6E4)) : $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] < $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$MINUTES$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ % 36E5 / 6E4)) : 0;
  $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$ = $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$[$JSCompiler_StaticMethods_tickCountDown_$self$$.$biggestUnit_$] == $TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$.$SECONDS$ ? $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ / 1000)) : $JSCompiler_StaticMethods_supportBackDate_$$(Math.floor($differentBetween$jscomp$1$$ % 6E4 / 1000));
  $DIFF_d$jscomp$inline_3107$$ = {d:$DIFF_d$jscomp$inline_3107$$, dd:$JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$padStart_$$($DIFF_d$jscomp$inline_3107$$), $h$:$h$jscomp$inline_3108$$, $hh$:$JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$padStart_$$($h$jscomp$inline_3108$$), $m$:$m$jscomp$inline_3109$$, $mm$:$JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$padStart_$$($m$jscomp$inline_3109$$), 
  s:$TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$, $ss$:$JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$padStart_$$($TimeUnit$jscomp$inline_3106_s$jscomp$inline_3110$$)};
  "stop" === $JSCompiler_StaticMethods_tickCountDown_$self$$.$whenEnded_$ && 1000 > $differentBetween$jscomp$1$$ && (_.$Services$$module$src$services$actionServiceForDoc$$($JSCompiler_StaticMethods_tickCountDown_$self$$.element).$trigger$($JSCompiler_StaticMethods_tickCountDown_$self$$.element, "timeout", null, 1), $JSCompiler_StaticMethods_tickCountDown_$self$$.$win$.clearInterval($JSCompiler_StaticMethods_tickCountDown_$self$$.$countDownTimer_$));
  $items$jscomp$1$$.data = Object.assign($DIFF_d$jscomp$inline_3107$$, $JSCompiler_StaticMethods_tickCountDown_$self$$.$localeWordList_$);
  _.$JSCompiler_StaticMethods_findAndRenderTemplate$$($JSCompiler_StaticMethods_tickCountDown_$self$$.$templates_$, $JSCompiler_StaticMethods_tickCountDown_$self$$.element, $items$jscomp$1$$.data).then($JSCompiler_StaticMethods_tickCountDown_$self$$.$boundRendered_$);
}, $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$$ = function($JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$) {
  var $epoch$$;
  $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$endDate_$ ? $epoch$$ = Date.parse($JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$endDate_$) : $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timeleftMs_$ ? $epoch$$ = Number(new Date) + $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timeleftMs_$ : 
  $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timestampMs_$ ? $epoch$$ = $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timestampMs_$ : $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timestampSeconds_$ && ($epoch$$ = 1000 * $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$self$$.$timestampSeconds_$);
  return $epoch$$;
}, $JSCompiler_StaticMethods_getLocaleWord_$$ = function($locale$jscomp$3_localeWordList$$) {
  if ($LOCALE_WORD$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$[$locale$jscomp$3_localeWordList$$]) {
    return $locale$jscomp$3_localeWordList$$ = $LOCALE_WORD$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$[$locale$jscomp$3_localeWordList$$], {years:$locale$jscomp$3_localeWordList$$[0], months:$locale$jscomp$3_localeWordList$$[1], days:$locale$jscomp$3_localeWordList$$[2], hours:$locale$jscomp$3_localeWordList$$[3], minutes:$locale$jscomp$3_localeWordList$$[4], seconds:$locale$jscomp$3_localeWordList$$[5]};
  }
  _.$user$$module$src$log$$().error("amp-date-countdown", "Invalid locale %s, return empty locale word", $locale$jscomp$3_localeWordList$$);
  return {};
}, $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$padStart_$$ = function($input$jscomp$48$$) {
  return -9 > $input$jscomp$48$$ || 9 < $input$jscomp$48$$ ? String($input$jscomp$48$$) : -9 <= $input$jscomp$48$$ && 0 > $input$jscomp$48$$ ? "-0" + Math.abs($input$jscomp$48$$) : "0" + $input$jscomp$48$$;
}, $JSCompiler_StaticMethods_supportBackDate_$$ = function($input$jscomp$49$$) {
  return 0 > $input$jscomp$49$$ ? $input$jscomp$49$$ + 1 : $input$jscomp$49$$;
}, $LOCALE_WORD$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$ = {de:"Jahren Monaten Tagen Stunden Minuten Sekunden".split(" "), en:"Years Months Days Hours Minutes Seconds".split(" "), es:"a\u00f1os meses d\u00edas horas minutos segundos".split(" "), fr:"ans mois jours heures minutes secondes".split(" "), id:"tahun bulan hari jam menit detik".split(" "), it:"anni mesi giorni ore minuti secondi".split(" "), ja:"\u5e74 \u30f6\u6708 \u65e5 \u6642\u9593 \u5206 \u79d2".split(" "), ko:"\ub144 \ub2ec \uc77c \uc2dc\uac04 \ubd84 \ucd08".split(" "), 
nl:"jaar maanden dagen uur minuten seconden".split(" "), pt:"anos meses dias horas minutos segundos".split(" "), ru:"\u0433\u043e\u0434 \u043c\u0435\u0441\u044f\u0446 \u0434\u0435\u043d\u044c \u0447\u0430\u0441 \u043c\u0438\u043d\u0443\u0442\u0430 \u0441\u0435\u043a\u0443\u043d\u0434\u0430".split(" "), th:"\u0e1b\u0e35 \u0e40\u0e14\u0e37\u0e2d\u0e19 \u0e27\u0e31\u0e19 \u0e0a\u0e31\u0e48\u0e27\u0e42\u0e21\u0e07 \u0e19\u0e32\u0e17\u0e35 \u0e27\u0e34\u0e19\u0e32\u0e17\u0e35".split(" "), tr:"y\u0131l ay g\u00fcn saat dakika saniye".split(" "), 
vi:"n\u0103m th\u00e1ng ng\u00e0y gi\u1edd ph\u00fat gi\u00e2y".split(" "), "zh-cn":"\u5e74 \u6708 \u5929 \u5c0f\u65f6 \u5206\u949f \u79d2".split(" "), "zh-tw":"\u5e74 \u6708 \u5929 \u5c0f\u6642 \u5206\u9418 \u79d2".split(" ")};
_.$$jscomp$inherits$$($AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$.prototype;
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$563$$ = this;
  this.$endDate_$ = this.element.getAttribute("end-date");
  this.$timeleftMs_$ = Number(this.element.getAttribute("timeleft-ms"));
  this.$timestampMs_$ = Number(this.element.getAttribute("timestamp-ms"));
  this.$timestampSeconds_$ = Number(this.element.getAttribute("timestamp-seconds"));
  this.$offsetSeconds_$ = Number(this.element.getAttribute("offset-seconds")) || 0;
  this.$locale_$ = (this.element.getAttribute("locale") || "en").toLowerCase();
  this.$whenEnded_$ = (this.element.getAttribute("when-ended") || "stop").toLowerCase();
  this.$biggestUnit_$ = (this.element.getAttribute("biggest-unit") || "DAYS").toUpperCase();
  this.$localeWordList_$ = $JSCompiler_StaticMethods_getLocaleWord_$$(this.$locale_$);
  _.$Services$$module$src$services$viewerForDoc$$(this.$getAmpDoc$()).$D$.then(function() {
    var $EPOCH$$ = $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$$($$jscomp$this$jscomp$563$$) + 1000 * $$jscomp$this$jscomp$563$$.$offsetSeconds_$;
    $JSCompiler_StaticMethods_tickCountDown_$$($$jscomp$this$jscomp$563$$, new Date($EPOCH$$) - new Date);
  });
};
_.$JSCompiler_prototypeAlias$$.$renderOutsideViewport$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$layoutCallback$ = function() {
  var $$jscomp$this$jscomp$564$$ = this, $EPOCH$jscomp$1$$ = $JSCompiler_StaticMethods_AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown_prototype$getEpoch_$$(this) + 1000 * this.$offsetSeconds_$, $differentBetween$$ = new Date($EPOCH$jscomp$1$$) - new Date - 1000;
  this.$countDownTimer_$ = this.$win$.setInterval(function() {
    $JSCompiler_StaticMethods_tickCountDown_$$($$jscomp$this$jscomp$564$$, $differentBetween$$);
    $differentBetween$$ -= 1000;
  }, 1000);
  return window.Promise.resolve();
};
_.$JSCompiler_prototypeAlias$$.$unlayoutCallback$ = function() {
  this.$win$.clearInterval(this.$countDownTimer_$);
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function($layout$jscomp$48$$) {
  return _.$isLayoutSizeDefined$$module$src$layout$$($layout$jscomp$48$$);
};
_.$JSCompiler_prototypeAlias$$.$rendered_$ = function($element$jscomp$384$$) {
  var $$jscomp$this$jscomp$565$$ = this;
  return this.$mutateElement$(function() {
    var $template$jscomp$17$$ = _.$JSCompiler_StaticMethods_maybeFindTemplate$$($$jscomp$this$jscomp$565$$.element, void 0), $isChildTemplate$$ = $$jscomp$this$jscomp$565$$.element.contains($template$jscomp$17$$);
    _.$removeChildren$$module$src$dom$$($$jscomp$this$jscomp$565$$.element);
    $isChildTemplate$$ && $$jscomp$this$jscomp$565$$.element.appendChild($template$jscomp$17$$);
    $$jscomp$this$jscomp$565$$.element.appendChild($element$jscomp$384$$);
  });
};
window.self.AMP.registerElement("amp-date-countdown", $AmpDateCountdown$$module$extensions$amp_date_countdown$0_1$amp_date_countdown$$);

})});

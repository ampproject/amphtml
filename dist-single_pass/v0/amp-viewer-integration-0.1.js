(self.AMP=self.AMP||[]).push({n:"amp-viewer-integration",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $parseMessage$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$ = function($message$jscomp$82$$) {
  if ("string" != typeof $message$jscomp$82$$) {
    return $message$jscomp$82$$;
  }
  if ("{" != $message$jscomp$82$$.charAt(0)) {
    return null;
  }
  try {
    return _.$parseJson$$module$src$json$$($message$jscomp$82$$);
  } catch ($e$366$$) {
    return null;
  }
}, $WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$ = function($win$jscomp$482$$, $origin$jscomp$42$$, $target$jscomp$204$$) {
  this.$win$ = $win$jscomp$482$$;
  this.$origin_$ = $origin$jscomp$42$$;
  this.$target_$ = $target$jscomp$204$$;
}, $Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$ = function($win$jscomp$483$$, $port$jscomp$30$$, $opt_isWebview$$) {
  this.$win$ = $win$jscomp$483$$;
  this.$F$ = $port$jscomp$30$$;
  this.$O$ = !!$opt_isWebview$$;
  this.$P$ = 0;
  this.$I$ = {};
  this.$G$ = {};
  this.$J$ = null;
  this.$F$.addEventListener("message", this.$K$.bind(this));
  this.$F$.start();
}, $JSCompiler_StaticMethods_setDefaultHandler$$ = function($JSCompiler_StaticMethods_setDefaultHandler$self$$, $requestHandler$jscomp$1$$) {
  $JSCompiler_StaticMethods_setDefaultHandler$self$$.$J$ = $requestHandler$jscomp$1$$;
}, $JSCompiler_StaticMethods_sendResponseError_$$ = function($JSCompiler_StaticMethods_sendResponseError_$self$$, $requestId$jscomp$8$$, $messageName$jscomp$6$$, $errString_reason$jscomp$65$$) {
  $errString_reason$jscomp$65$$ = $errString_reason$jscomp$65$$ ? $errString_reason$jscomp$65$$.message ? $errString_reason$jscomp$65$$.message : String($errString_reason$jscomp$65$$) : "unknown error";
  $JSCompiler_StaticMethods_logError_$$($JSCompiler_StaticMethods_sendResponseError_$self$$, "amp-viewer-messaging: sendResponseError_, Message name: " + $messageName$jscomp$6$$, $errString_reason$jscomp$65$$);
  $JSCompiler_StaticMethods_sendResponseError_$self$$.$sendMessage_$({app:"__AMPHTML__", requestid:$requestId$jscomp$8$$, type:"s", name:$messageName$jscomp$6$$, data:null, error:$errString_reason$jscomp$65$$});
}, $JSCompiler_StaticMethods_handleRequest_$$ = function($JSCompiler_StaticMethods_handleRequest_$self$$, $message$jscomp$85$$) {
  var $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$ = $JSCompiler_StaticMethods_handleRequest_$self$$.$G$[$message$jscomp$85$$.name];
  $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$ || ($error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$ = $JSCompiler_StaticMethods_handleRequest_$self$$.$J$);
  if (!$error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$) {
    throw $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$ = Error("Cannot handle request because handshake is not yet confirmed!"), $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$.args = $message$jscomp$85$$.name, $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$;
  }
  $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$ = $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$($message$jscomp$85$$.name, $message$jscomp$85$$.data, !!$message$jscomp$85$$.rsvp);
  if ($message$jscomp$85$$.rsvp) {
    var $requestId$jscomp$9$$ = $message$jscomp$85$$.requestid;
    if (!$error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$) {
      throw $JSCompiler_StaticMethods_sendResponseError_$$($JSCompiler_StaticMethods_handleRequest_$self$$, $requestId$jscomp$9$$, $message$jscomp$85$$.name, Error("no response")), Error("expected response but none given: " + $message$jscomp$85$$.name);
    }
    $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$.then(function($error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$) {
      $JSCompiler_StaticMethods_handleRequest_$self$$.$sendMessage_$({app:"__AMPHTML__", requestid:$requestId$jscomp$9$$, type:"s", name:$message$jscomp$85$$.name, data:$error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$});
    }, function($error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$) {
      $JSCompiler_StaticMethods_sendResponseError_$$($JSCompiler_StaticMethods_handleRequest_$self$$, $requestId$jscomp$9$$, $message$jscomp$85$$.name, $error$jscomp$99_handler$jscomp$69_promise$jscomp$68$$);
    });
  }
}, $JSCompiler_StaticMethods_logError_$$ = function($JSCompiler_StaticMethods_logError_$self$$, $state$jscomp$111$$, $opt_data$jscomp$11$$) {
  $JSCompiler_StaticMethods_logError_$self$$.$win$.viewerState = "amp-messaging-error-logger: " + $state$jscomp$111$$ + (" data: " + ($opt_data$jscomp$11$$ ? $opt_data$jscomp$11$$.message ? $opt_data$jscomp$11$$.message : String($opt_data$jscomp$11$$) : "unknown error"));
}, $FocusHandler$$module$extensions$amp_viewer_integration$0_1$focus_handler$$ = function($win$jscomp$484$$, $messaging$$) {
  this.$win$ = $win$jscomp$484$$;
  this.$D$ = $messaging$$;
  _.$listen$$module$src$event_helper$$(this.$win$.document, "focusin", this.$F$.bind(this), {capture:!1});
}, $CircularBuffer$$module$extensions$amp_viewer_integration$0_1$findtext$$ = function($max$jscomp$15$$) {
  this.$G$ = $max$jscomp$15$$;
  this.$F$ = [];
  this.$D$ = 0;
}, $canonicalizeChar$$module$extensions$amp_viewer_integration$0_1$findtext$$ = function($c$jscomp$181$$) {
  return "\u2019" == $c$jscomp$181$$ || "\u2018" == $c$jscomp$181$$ ? "'" : "\u201c" == $c$jscomp$181$$ || "\u201d" == $c$jscomp$181$$ ? '"' : $c$jscomp$181$$.toLowerCase();
}, $markSingleTextNode$$module$extensions$amp_viewer_integration$0_1$findtext$$ = function($doc$jscomp$163_win$jscomp$488$$, $node$jscomp$107$$, $endText_start$jscomp$25$$, $end$jscomp$21$$, $marked$jscomp$2$$) {
  if ($endText_start$jscomp$25$$ >= $end$jscomp$21$$) {
    return null;
  }
  $doc$jscomp$163_win$jscomp$488$$ = $doc$jscomp$163_win$jscomp$488$$.document;
  var $parent$jscomp$60$$ = $node$jscomp$107$$.parentNode, $text$jscomp$23$$ = $node$jscomp$107$$.wholeText;
  0 < $endText_start$jscomp$25$$ && $parent$jscomp$60$$.insertBefore($doc$jscomp$163_win$jscomp$488$$.createTextNode($text$jscomp$23$$.substring(0, $endText_start$jscomp$25$$)), $node$jscomp$107$$);
  var $span$jscomp$2$$ = $doc$jscomp$163_win$jscomp$488$$.createElement("span");
  $span$jscomp$2$$.appendChild($doc$jscomp$163_win$jscomp$488$$.createTextNode($text$jscomp$23$$.substring($endText_start$jscomp$25$$, $end$jscomp$21$$)));
  $parent$jscomp$60$$.insertBefore($span$jscomp$2$$, $node$jscomp$107$$);
  $marked$jscomp$2$$.push($span$jscomp$2$$);
  $endText_start$jscomp$25$$ = null;
  $end$jscomp$21$$ < $text$jscomp$23$$.length && ($endText_start$jscomp$25$$ = $doc$jscomp$163_win$jscomp$488$$.createTextNode($text$jscomp$23$$.substring($end$jscomp$21$$)), $parent$jscomp$60$$.insertBefore($endText_start$jscomp$25$$, $node$jscomp$107$$));
  $parent$jscomp$60$$.removeChild($node$jscomp$107$$);
  return $endText_start$jscomp$25$$;
}, $TextScanner$$module$extensions$amp_viewer_integration$0_1$findtext$$ = function($win$jscomp$490$$, $child$jscomp$40_node$jscomp$109$$) {
  this.$I$ = $win$jscomp$490$$;
  this.$G$ = $child$jscomp$40_node$jscomp$109$$;
  this.$F$ = -1;
  this.$D$ = null;
  $child$jscomp$40_node$jscomp$109$$ instanceof $win$jscomp$490$$.Text ? this.$F$ = 0 : $child$jscomp$40_node$jscomp$109$$ instanceof $win$jscomp$490$$.Element && "none" != _.$computedStyle$$module$src$style$$($win$jscomp$490$$, $child$jscomp$40_node$jscomp$109$$).display && ($child$jscomp$40_node$jscomp$109$$ = $child$jscomp$40_node$jscomp$109$$.firstChild, null != $child$jscomp$40_node$jscomp$109$$ && (this.$D$ = new $TextScanner$$module$extensions$amp_viewer_integration$0_1$findtext$$($win$jscomp$490$$, 
  $child$jscomp$40_node$jscomp$109$$)));
}, $getHighlightParam$$module$extensions$amp_viewer_integration$0_1$highlight_handler$$ = function($ampdoc$jscomp$233_highlight_param$jscomp$27$$) {
  $ampdoc$jscomp$233_highlight_param$jscomp$27$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($ampdoc$jscomp$233_highlight_param$jscomp$27$$.$win$.location.hash).highlight;
  if (!$ampdoc$jscomp$233_highlight_param$jscomp$27$$ || 102400 < $ampdoc$jscomp$233_highlight_param$jscomp$27$$.length) {
    return null;
  }
  $ampdoc$jscomp$233_highlight_param$jscomp$27$$ = _.$parseJson$$module$src$json$$($ampdoc$jscomp$233_highlight_param$jscomp$27$$);
  var $sens$$ = $ampdoc$jscomp$233_highlight_param$jscomp$27$$.s;
  if (!($sens$$ instanceof Array) || 15 < $sens$$.length) {
    return null;
  }
  for (var $skipRendering_sum$$ = 0, $i$373$$ = 0; $i$373$$ < $sens$$.length; $i$373$$++) {
    var $sen$jscomp$1$$ = $sens$$[$i$373$$];
    if ("string" != typeof $sen$jscomp$1$$ || !$sen$jscomp$1$$) {
      return null;
    }
    $skipRendering_sum$$ += $sen$jscomp$1$$.length;
    if (1500 < $skipRendering_sum$$) {
      return null;
    }
  }
  $skipRendering_sum$$ = !1;
  $ampdoc$jscomp$233_highlight_param$jscomp$27$$.n && ($skipRendering_sum$$ = !0);
  return {$sentences$:$sens$$, $skipRendering$:$skipRendering_sum$$};
}, $HighlightHandler$$module$extensions$amp_viewer_integration$0_1$highlight_handler$$ = function($ampdoc$jscomp$234$$, $highlightInfo$$) {
  this.$ampdoc_$ = $ampdoc$jscomp$234$$;
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$234$$);
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$(this.$ampdoc_$);
  this.$D$ = null;
  $JSCompiler_StaticMethods_initHighlight_$$(this, $highlightInfo$$);
}, $JSCompiler_StaticMethods_sendHighlightState_$$ = function($JSCompiler_StaticMethods_sendHighlightState_$self$$, $params$jscomp$44_state$jscomp$112$$, $opt_params$jscomp$4$$) {
  $params$jscomp$44_state$jscomp$112$$ = _.$dict$$module$src$utils$object$$({state:$params$jscomp$44_state$jscomp$112$$});
  for (var $key$jscomp$162$$ in $opt_params$jscomp$4$$) {
    $params$jscomp$44_state$jscomp$112$$[$key$jscomp$162$$] = $opt_params$jscomp$4$$[$key$jscomp$162$$];
  }
  _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$sendMessage$$($JSCompiler_StaticMethods_sendHighlightState_$self$$.$viewer_$, "highlightState", $params$jscomp$44_state$jscomp$112$$);
}, $JSCompiler_StaticMethods_findHighlightedNodes_$$ = function($JSCompiler_StaticMethods_findHighlightedNodes_$self$$, $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$) {
  var $win$jscomp$491$$ = $JSCompiler_StaticMethods_findHighlightedNodes_$self$$.$ampdoc_$.$win$;
  a: {
    var $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$ = $JSCompiler_StaticMethods_findHighlightedNodes_$self$$.$ampdoc_$.$getBody$();
    $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$ = $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$.$sentences$;
    $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$ = new $TextScanner$$module$extensions$amp_viewer_integration$0_1$findtext$$($win$jscomp$491$$, $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$);
    for (var $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ = [], $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ = 0; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ < $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$.length; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$++) {
      for (var $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$ = $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$[$i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$], $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$ = 
      [], $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ = 0; $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ < $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length; $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$++) {
        var $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$[$buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$];
        $skipCharRe$$module$extensions$amp_viewer_integration$0_1$findtext$$.test($JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$) || $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.push($canonicalizeChar$$module$extensions$amp_viewer_integration$0_1$findtext$$($JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$));
      }
      if ($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$ = $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.join("")) {
        $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$ = {};
        for ($buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ = 0; $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ < $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length; $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$++) {
          $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$[$endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$[$buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$]] = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length - 
          1 - $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$;
        }
        $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ = new $CircularBuffer$$module$extensions$amp_viewer_integration$0_1$findtext$$($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length);
        $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = -1;
        for (var $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length - 1;;) {
          var $next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$ = $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$.next();
          if (null == $next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$) {
            $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$ = null;
            break a;
          }
          if (!($skipCharRe$$module$extensions$amp_viewer_integration$0_1$findtext$$.test($next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$.node.wholeText[$next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$.offset]) || ($buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.add($next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$), $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$++, 
          $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ < $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$))) {
            $next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$ = !0;
            for (var $j$jscomp$inline_5357$$ = 0; $j$jscomp$inline_5357$$ < $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length; $j$jscomp$inline_5357$$++) {
              var $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ = $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.get($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length - $j$jscomp$inline_5357$$ - 1);
              $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ = $canonicalizeChar$$module$extensions$amp_viewer_integration$0_1$findtext$$($c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$.node.wholeText[$c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$.offset]);
              if ($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$[$endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length - 1 - $j$jscomp$inline_5357$$] != $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$) {
                $next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$ = !1;
                $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ = $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$[$c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$];
                null == $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ && ($c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length);
                $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ -= $j$jscomp$inline_5357$$;
                1 > $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ && ($c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$ = 1);
                $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ += $c$369$jscomp$inline_5358_pos$jscomp$inline_6586_skip$jscomp$inline_5359$$;
                break;
              }
            }
            if ($next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$) {
              $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$ = $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.get($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length - 1);
              $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$.push({start:$buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.get(0), end:{node:$endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.node, offset:$endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.offset + 
              1}});
              break;
            }
          }
        }
      }
    }
    $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$ = 0 < $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$.length ? $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ : null;
  }
  if ($JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$) {
    $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$ = [];
    $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ = null;
    for ($i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ = 0; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ < $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$.length; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$++) {
      $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$ = $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$[$i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$], $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ && 
      $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$.end.node == $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.start.node && $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$.end.offset == $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.start.offset ? 
      $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$.end = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.end : ($i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$, $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$.push($endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$));
    }
    $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$ = $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$;
    $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$ = [];
    for ($i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ = 0; $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$ < $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$.length; $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$++) {
      for ($i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ = $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$[$i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$], $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$ = $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$.start, 
      $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$ = $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$.end, $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$ = $JSCompiler_inline_result$jscomp$1041_highlightInfo$jscomp$1_ranges$jscomp$inline_5363_ranges$jscomp$inline_6588_sens$jscomp$1_sentences$jscomp$inline_5345$$, 
      $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ = $i$370$jscomp$inline_5365_matches$jscomp$inline_5347_prev$jscomp$inline_6590$$;;) {
        if ($buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.node == $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.node) {
          if ($buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$ = $markSingleTextNode$$module$extensions$amp_viewer_integration$0_1$findtext$$($win$jscomp$491$$, $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.node, $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.offset, $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.offset, 
          $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$)) {
            for ($i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ += 1; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$ < $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$.length; $i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$++) {
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = $endPos$jscomp$inline_5360_r$jscomp$inline_6592_ranges$jscomp$inline_6597_ranges$jscomp$inline_6602_s$jscomp$inline_6581_sen$jscomp$inline_5349$$[$i$371$jscomp$inline_6591_i$372$jscomp$inline_6603_idx$jscomp$inline_6598_r$jscomp$inline_5366_senIdx$jscomp$inline_5348$$];
              if ($buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.node != $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.start.node) {
                break;
              }
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.start.node = $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$;
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.start.offset -= $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.offset;
              if ($buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.node != $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.end.node) {
                break;
              }
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.end.node = $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$;
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$.end.offset -= $buf$jscomp$inline_5352_end$jscomp$inline_6596_i$367$jscomp$inline_6583_i$368$jscomp$inline_5351_pos$jscomp$inline_6601$$.offset;
            }
          }
          break;
        }
        a: {
          for ($JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = !0, $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ = $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.node;;) {
            if (null == $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$) {
              $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = null;
              break a;
            }
            if ($JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$) {
              ($next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$ = $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$.nextSibling) ? ($nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ = $next$jscomp$inline_6608_ok$jscomp$inline_5356_pos$jscomp$inline_5355$$, $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = !1) : $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ = 
              $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$.parentNode;
            } else {
              if ($nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ instanceof $win$jscomp$491$$.Text) {
                $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$;
                break a;
              }
              $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$.firstChild ? $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$ = $nextIndex$jscomp$inline_5354_node$jscomp$inline_6607$$.firstChild : $JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$ = !0;
            }
          }
        }
        $markSingleTextNode$$module$extensions$amp_viewer_integration$0_1$findtext$$($win$jscomp$491$$, $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.node, $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.offset, $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$.node.wholeText.length, $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$);
        if (!$JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$) {
          break;
        }
        $buf$jscomp$inline_6582_newText$jscomp$inline_6600_skipTable$jscomp$inline_5350_start$jscomp$inline_6595$$ = {node:$JSCompiler_inline_result$jscomp$inline_6605_c$jscomp$inline_6584_index$jscomp$inline_5353_leaving$jscomp$inline_6606_next$jscomp$inline_6609_r$jscomp$inline_6604$$, offset:0};
      }
    }
    $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$ && 0 != $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$.length && ($JSCompiler_StaticMethods_findHighlightedNodes_$self$$.$D$ = $marked$jscomp$inline_5364_node$jscomp$inline_5344_ret$jscomp$inline_6589_scanner$jscomp$inline_5346$$);
  }
}, $JSCompiler_StaticMethods_initHighlight_$$ = function($JSCompiler_StaticMethods_initHighlight_$self$$, $highlightInfo$jscomp$2_i$374$$) {
  if ($JSCompiler_StaticMethods_initHighlight_$self$$.$ampdoc_$.$win$.document.querySelector('script[id="amp-access"]')) {
    $JSCompiler_StaticMethods_sendHighlightState_$$($JSCompiler_StaticMethods_initHighlight_$self$$, "has_amp_access");
  } else {
    if ($JSCompiler_StaticMethods_findHighlightedNodes_$$($JSCompiler_StaticMethods_initHighlight_$self$$, $highlightInfo$jscomp$2_i$374$$), $JSCompiler_StaticMethods_initHighlight_$self$$.$D$) {
      var $scrollTop$jscomp$16$$ = $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$$($JSCompiler_StaticMethods_initHighlight_$self$$);
      $JSCompiler_StaticMethods_sendHighlightState_$$($JSCompiler_StaticMethods_initHighlight_$self$$, "found", _.$dict$$module$src$utils$object$$({scroll:$scrollTop$jscomp$16$$}));
      if (!$highlightInfo$jscomp$2_i$374$$.$skipRendering$) {
        for ($highlightInfo$jscomp$2_i$374$$ = 0; $highlightInfo$jscomp$2_i$374$$ < $JSCompiler_StaticMethods_initHighlight_$self$$.$D$.length; $highlightInfo$jscomp$2_i$374$$++) {
          _.$setStyles$$module$src$style$$($JSCompiler_StaticMethods_initHighlight_$self$$.$D$[$highlightInfo$jscomp$2_i$374$$], {backgroundColor:"#ff9632", color:"#000"});
        }
        if ("visible" == $JSCompiler_StaticMethods_initHighlight_$self$$.$viewer_$.$G$) {
          $JSCompiler_StaticMethods_animateScrollToTop_$$($JSCompiler_StaticMethods_initHighlight_$self$$, $scrollTop$jscomp$16$$);
        } else {
          _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$($JSCompiler_StaticMethods_initHighlight_$self$$.$viewport_$, Math.max(0, $scrollTop$jscomp$16$$ - 500));
          var $called$$ = !1;
          _.$JSCompiler_StaticMethods_Viewer$$module$src$service$viewer_impl_prototype$onVisibilityChanged$$($JSCompiler_StaticMethods_initHighlight_$self$$.$viewer_$, function() {
            $called$$ || "visible" != $JSCompiler_StaticMethods_initHighlight_$self$$.$viewer_$.$G$ || ($JSCompiler_StaticMethods_animateScrollToTop_$$($JSCompiler_StaticMethods_initHighlight_$self$$, $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$$($JSCompiler_StaticMethods_initHighlight_$self$$)), $called$$ = !0);
          });
        }
        _.$listenOnce$$module$src$event_helper$$($JSCompiler_StaticMethods_initHighlight_$self$$.$ampdoc_$.$getBody$(), "click", $JSCompiler_StaticMethods_initHighlight_$self$$.$F$.bind($JSCompiler_StaticMethods_initHighlight_$self$$));
      }
    } else {
      $JSCompiler_StaticMethods_sendHighlightState_$$($JSCompiler_StaticMethods_initHighlight_$self$$, "not_found");
    }
  }
}, $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$$ = function($JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$) {
  var $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ = $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$.$D$;
  if (!$height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$) {
    return 0;
  }
  var $viewport$jscomp$19$$ = $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$.$viewport_$;
  $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ = Number.MAX_VALUE;
  for (var $maxBottom$$ = 0, $paddingTop$jscomp$10$$ = $viewport$jscomp$19$$.$F$, $i$375$$ = 0; $i$375$$ < $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$.length; $i$375$$++) {
    var $$jscomp$destructuring$var634$$ = _.$moveLayoutRect$$module$src$layout_rect$$($viewport$jscomp$19$$.$getLayoutRect$($height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$[$i$375$$]), 0, -$paddingTop$jscomp$10$$), $bottom$jscomp$9$$ = $$jscomp$destructuring$var634$$.bottom;
    $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ = Math.min($JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$, $$jscomp$destructuring$var634$$.top);
    $maxBottom$$ = Math.max($maxBottom$$, $bottom$jscomp$9$$);
  }
  if ($JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ >= $maxBottom$$) {
    return 0;
  }
  $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ = _.$JSCompiler_StaticMethods_getHeight$$($viewport$jscomp$19$$) - $paddingTop$jscomp$10$$;
  $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ = ($maxBottom$$ + $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ - $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$) / 2;
  $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ > $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ - 80 && ($height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ = $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$self_minTop$jscomp$4$$ - 80);
  return 0 < $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ ? $height$jscomp$78_nodes$jscomp$9_pos$jscomp$59$$ : 0;
}, $JSCompiler_StaticMethods_animateScrollToTop_$$ = function($JSCompiler_StaticMethods_animateScrollToTop_$self$$, $top$jscomp$27$$) {
  _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$.$viewport_$, Math.max(0, $top$jscomp$27$$ - 500));
  var $sentinel$jscomp$8$$ = $JSCompiler_StaticMethods_animateScrollToTop_$self$$.$ampdoc_$.$win$.document.createElement("div");
  _.$setInitialDisplay$$module$src$style$$($sentinel$jscomp$8$$);
  _.$setStyles$$module$src$style$$($sentinel$jscomp$8$$, {position:"absolute", top:Math.floor($top$jscomp$27$$) + "px", height:"1px", left:"0", width:"1px", "pointer-events":"none"});
  var $body$jscomp$37$$ = $JSCompiler_StaticMethods_animateScrollToTop_$self$$.$ampdoc_$.$getBody$();
  $body$jscomp$37$$.appendChild($sentinel$jscomp$8$$);
  $JSCompiler_StaticMethods_sendHighlightState_$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$, "auto_scroll");
  _.$JSCompiler_StaticMethods_animateScrollIntoView$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$.$viewport_$, $sentinel$jscomp$8$$).then(function() {
    $body$jscomp$37$$.removeChild($sentinel$jscomp$8$$);
    var $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$ = $JSCompiler_StaticMethods_calcTopToCenterHighlightedNodes_$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$);
    var $current$jscomp$inline_5377$$ = _.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$getScrollTop$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$.$viewport_$);
    if ($current$jscomp$inline_5377$$ == $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$ && $current$jscomp$inline_5377$$ == $top$jscomp$27$$) {
      $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$ = null;
    } else {
      var $shownParam$jscomp$inline_5378$$ = {};
      $current$jscomp$inline_5377$$ != $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$ && (_.$JSCompiler_StaticMethods_Viewport$$module$src$service$viewport$viewport_impl_prototype$setScrollTop$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$.$viewport_$, $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$), $shownParam$jscomp$inline_5378$$.nd = $current$jscomp$inline_5377$$ - $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$);
      $current$jscomp$inline_5377$$ != $top$jscomp$27$$ && ($shownParam$jscomp$inline_5378$$.od = $current$jscomp$inline_5377$$ - $top$jscomp$27$$);
      $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$ = $shownParam$jscomp$inline_5378$$;
    }
    $JSCompiler_StaticMethods_sendHighlightState_$$($JSCompiler_StaticMethods_animateScrollToTop_$self$$, "shown", $JSCompiler_inline_result$jscomp$1046_newTop$jscomp$inline_5376$$);
  });
}, $JSCompiler_StaticMethods_setupMessaging$$ = function($JSCompiler_StaticMethods_setupMessaging$self_requestHandler$jscomp$inline_5382$$, $messaging$jscomp$1$$) {
  $JSCompiler_StaticMethods_setupMessaging$self_requestHandler$jscomp$inline_5382$$ = $JSCompiler_StaticMethods_setupMessaging$self_requestHandler$jscomp$inline_5382$$.$F$.bind($JSCompiler_StaticMethods_setupMessaging$self_requestHandler$jscomp$inline_5382$$);
  $messaging$jscomp$1$$.$G$.highlightDismiss = $JSCompiler_StaticMethods_setupMessaging$self_requestHandler$jscomp$inline_5382$$;
}, $KeyboardHandler$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$ = function($handleEvent$jscomp$inline_5385_win$jscomp$492$$, $messaging$jscomp$2$$) {
  this.$win$ = $handleEvent$jscomp$inline_5385_win$jscomp$492$$;
  this.$D$ = $messaging$jscomp$2$$;
  $handleEvent$jscomp$inline_5385_win$jscomp$492$$ = this.$F$.bind(this);
  _.$internalListenImplementation$$module$src$event_helper_listen$$(this.$win$, "keydown", $handleEvent$jscomp$inline_5385_win$jscomp$492$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$(this.$win$, "keypress", $handleEvent$jscomp$inline_5385_win$jscomp$492$$, void 0);
  _.$internalListenImplementation$$module$src$event_helper_listen$$(this.$win$, "keyup", $handleEvent$jscomp$inline_5385_win$jscomp$492$$, void 0);
}, $isHandledByEventTarget$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$ = function($e$jscomp$350$$) {
  if ($e$jscomp$350$$.defaultPrevented) {
    return !0;
  }
  if ("Escape" == $e$jscomp$350$$.key) {
    return !1;
  }
  switch($e$jscomp$350$$.target.nodeName) {
    case "INPUT":
      return "checkbox" != $e$jscomp$350$$.target.type || " " == $e$jscomp$350$$.key;
    case "TEXTAREA":
    case "BUTTON":
    case "SELECT":
    case "OPTION":
      return !0;
  }
  return $e$jscomp$350$$.target.hasAttribute && $e$jscomp$350$$.target.hasAttribute("contenteditable");
}, $getKeyboardEventInit$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$ = function($e$jscomp$351$$) {
  var $copiedEvent$$ = {};
  $eventProperties$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$.forEach(function($eventProperty$$) {
    void 0 !== $e$jscomp$351$$[$eventProperty$$] && ($copiedEvent$$[$eventProperty$$] = $e$jscomp$351$$[$eventProperty$$]);
  });
  return $copiedEvent$$;
}, $TouchHandler$$module$extensions$amp_viewer_integration$0_1$touch_handler$$ = function($requestHandler$jscomp$inline_5392_win$jscomp$493$$, $messaging$jscomp$3$$) {
  this.$win$ = $requestHandler$jscomp$inline_5392_win$jscomp$493$$;
  this.$G$ = $messaging$jscomp$3$$;
  this.$D$ = !1;
  this.$F$ = [];
  $requestHandler$jscomp$inline_5392_win$jscomp$493$$ = this.$J$.bind(this);
  $messaging$jscomp$3$$.$G$.scrollLock = $requestHandler$jscomp$inline_5392_win$jscomp$493$$;
  $JSCompiler_StaticMethods_listenForTouchEvents_$$(this);
}, $JSCompiler_StaticMethods_listenForTouchEvents_$$ = function($JSCompiler_StaticMethods_listenForTouchEvents_$self$$) {
  var $handleEvent$jscomp$1$$ = $JSCompiler_StaticMethods_listenForTouchEvents_$self$$.$I$.bind($JSCompiler_StaticMethods_listenForTouchEvents_$self$$), $doc$jscomp$164$$ = $JSCompiler_StaticMethods_listenForTouchEvents_$self$$.$win$.document, $options$jscomp$74$$ = {capture:!1, passive:!$JSCompiler_StaticMethods_listenForTouchEvents_$self$$.$D$};
  $JSCompiler_StaticMethods_listenForTouchEvents_$self$$.$F$.push(_.$internalListenImplementation$$module$src$event_helper_listen$$($doc$jscomp$164$$, "touchstart", $handleEvent$jscomp$1$$, $options$jscomp$74$$), _.$internalListenImplementation$$module$src$event_helper_listen$$($doc$jscomp$164$$, "touchend", $handleEvent$jscomp$1$$, $options$jscomp$74$$), _.$internalListenImplementation$$module$src$event_helper_listen$$($doc$jscomp$164$$, "touchmove", $handleEvent$jscomp$1$$, $options$jscomp$74$$));
}, $JSCompiler_StaticMethods_copyTouches_$$ = function($touchList$$) {
  for (var $copiedTouches$$ = [], $i$377$$ = 0; $i$377$$ < $touchList$$.length; $i$377$$++) {
    $copiedTouches$$.push($JSCompiler_StaticMethods_copyProperties_$$($touchList$$[$i$377$$], $TOUCH_PROPERTIES$$module$extensions$amp_viewer_integration$0_1$touch_handler$$));
  }
  return $copiedTouches$$;
}, $JSCompiler_StaticMethods_copyProperties_$$ = function($o$jscomp$21$$, $properties$jscomp$3$$) {
  for (var $copy$jscomp$2$$ = {}, $i$378$$ = 0; $i$378$$ < $properties$jscomp$3$$.length; $i$378$$++) {
    var $p$jscomp$42$$ = $properties$jscomp$3$$[$i$378$$];
    void 0 !== $o$jscomp$21$$[$p$jscomp$42$$] && ($copy$jscomp$2$$[$p$jscomp$42$$] = $o$jscomp$21$$[$p$jscomp$42$$]);
  }
  return $copy$jscomp$2$$;
}, $AmpViewerIntegrationVariableService$$module$extensions$amp_viewer_integration$0_1$variable_service$$ = function($ampdoc$jscomp$235$$) {
  var $$jscomp$this$jscomp$1322$$ = this;
  this.$ampdoc_$ = $ampdoc$jscomp$235$$;
  this.$D$ = {$ancestorOrigin$:function() {
    var $ampdoc$jscomp$235$$ = $$jscomp$this$jscomp$1322$$.$ampdoc_$.$win$.location.ancestorOrigins;
    return $ampdoc$jscomp$235$$ ? $ampdoc$jscomp$235$$[0] : "";
  }, $fragmentParam$:function($ampdoc$jscomp$235$$, $defaultValue$jscomp$9$$) {
    var $param$jscomp$28$$ = _.$parseQueryString_$$module$src$url_parse_query_string$$($$jscomp$this$jscomp$1322$$.$ampdoc_$.$win$.location.$D$);
    return void 0 === $param$jscomp$28$$[$ampdoc$jscomp$235$$] ? $defaultValue$jscomp$9$$ : $param$jscomp$28$$[$ampdoc$jscomp$235$$];
  }};
}, $AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration$$ = function() {
  var $$jscomp$this$jscomp$1323$$ = this;
  this.$win$ = window.self.AMP.$win$;
  this.$G$ = this.$D$ = !1;
  this.$F$ = null;
  this.$variableService_$ = new $AmpViewerIntegrationVariableService$$module$extensions$amp_viewer_integration$0_1$variable_service$$(_.$getAmpdoc$$module$src$service$$(this.$win$.document));
  _.$registerServiceBuilder$$module$src$service$$(this.$win$, "viewer-integration-variable", function() {
    return $$jscomp$this$jscomp$1323$$.$variableService_$.get();
  });
}, $JSCompiler_StaticMethods_webviewPreHandshakePromise_$$ = function($JSCompiler_StaticMethods_webviewPreHandshakePromise_$self$$, $source$jscomp$58$$, $origin$jscomp$44$$) {
  return new window.Promise(function($resolve$jscomp$106$$) {
    var $unlisten$jscomp$27$$ = _.$listen$$module$src$event_helper$$($JSCompiler_StaticMethods_webviewPreHandshakePromise_$self$$.$win$, "message", function($e$jscomp$355$$) {
      "amp-viewer-integration";
      var $data$jscomp$217$$ = $parseMessage$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$($e$jscomp$355$$.data);
      if ($data$jscomp$217$$ && $e$jscomp$355$$.origin === $origin$jscomp$44$$ && $e$jscomp$355$$.source === $source$jscomp$58$$ && "__AMPHTML__" == $data$jscomp$217$$.app && "handshake-poll" == $data$jscomp$217$$.name) {
        if ($JSCompiler_StaticMethods_webviewPreHandshakePromise_$self$$.$D$ && (!$e$jscomp$355$$.ports || !$e$jscomp$355$$.ports.length)) {
          throw Error("Did not receive communication port from the Viewer!");
        }
        $resolve$jscomp$106$$($e$jscomp$355$$.ports && 0 < $e$jscomp$355$$.ports.length ? $e$jscomp$355$$.ports[0] : new $WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$($JSCompiler_StaticMethods_webviewPreHandshakePromise_$self$$.$win$, $origin$jscomp$44$$, $JSCompiler_StaticMethods_webviewPreHandshakePromise_$self$$.$win$.parent));
        $unlisten$jscomp$27$$();
      }
    });
  });
}, $JSCompiler_StaticMethods_openChannelAndStart_$$ = function($JSCompiler_StaticMethods_openChannelAndStart_$self$$, $viewer$jscomp$53$$, $ampdoc$jscomp$237_ampdocUrl$$, $origin$jscomp$45$$, $messaging$jscomp$4$$) {
  "amp-viewer-integration";
  $ampdoc$jscomp$237_ampdocUrl$$ = $ampdoc$jscomp$237_ampdocUrl$$.$AmpDoc$$module$src$service$ampdoc_impl_prototype$getUrl$();
  var $srcUrl$$ = _.$getSourceUrl$$module$src$url$$($ampdoc$jscomp$237_ampdocUrl$$);
  return $messaging$jscomp$4$$.$D$("channelOpen", _.$dict$$module$src$utils$object$$({url:$ampdoc$jscomp$237_ampdocUrl$$, sourceUrl:$srcUrl$$}), !0).then(function() {
    "amp-viewer-integration";
    $JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$$($JSCompiler_StaticMethods_openChannelAndStart_$self$$, $messaging$jscomp$4$$, $viewer$jscomp$53$$, $origin$jscomp$45$$);
  });
}, $JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$$ = function($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$, $messaging$jscomp$5$$, $viewer$jscomp$54$$, $origin$jscomp$46$$) {
  $JSCompiler_StaticMethods_setDefaultHandler$$($messaging$jscomp$5$$, function($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$, $messaging$jscomp$5$$, $origin$jscomp$46$$) {
    return $viewer$jscomp$54$$.$ka$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$, $messaging$jscomp$5$$, $origin$jscomp$46$$);
  });
  _.$JSCompiler_StaticMethods_setMessageDeliverer$$($viewer$jscomp$54$$, $messaging$jscomp$5$$.$D$.bind($messaging$jscomp$5$$), $origin$jscomp$46$$);
  _.$listenOnce$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$win$, "unload", $JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$I$.bind($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$, $messaging$jscomp$5$$));
  _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$54$$, "swipe") && new $TouchHandler$$module$extensions$amp_viewer_integration$0_1$touch_handler$$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$win$, $messaging$jscomp$5$$);
  _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$54$$, "keyboard") && new $KeyboardHandler$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$win$, $messaging$jscomp$5$$);
  _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$54$$, "focus-rect") && new $FocusHandler$$module$extensions$amp_viewer_integration$0_1$focus_handler$$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$win$, $messaging$jscomp$5$$);
  null != $JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$F$ && $JSCompiler_StaticMethods_setupMessaging$$($JSCompiler_StaticMethods_AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration_prototype$setup_$self$$.$F$, $messaging$jscomp$5$$);
};
$WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.addEventListener = function($eventType$jscomp$68$$, $handler$jscomp$68$$) {
  var $$jscomp$this$jscomp$1317$$ = this;
  this.$win$.addEventListener("message", function($eventType$jscomp$68$$) {
    $eventType$jscomp$68$$.origin == $$jscomp$this$jscomp$1317$$.$origin_$ && $eventType$jscomp$68$$.source == $$jscomp$this$jscomp$1317$$.$target_$ && "__AMPHTML__" == $eventType$jscomp$68$$.data.app && $handler$jscomp$68$$($eventType$jscomp$68$$);
  });
};
$WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.postMessage = function($data$jscomp$215$$) {
  this.$target_$.postMessage($data$jscomp$215$$, this.$origin_$);
};
$WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.start = function() {
};
$Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.$K$ = function($event$jscomp$251_message$jscomp$83$$) {
  if ($event$jscomp$251_message$jscomp$83$$ = $parseMessage$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$($event$jscomp$251_message$jscomp$83$$.data)) {
    if ("q" == $event$jscomp$251_message$jscomp$83$$.type) {
      $JSCompiler_StaticMethods_handleRequest_$$(this, $event$jscomp$251_message$jscomp$83$$);
    } else {
      if ("s" == $event$jscomp$251_message$jscomp$83$$.type) {
        var $requestId$jscomp$inline_5316$$ = $event$jscomp$251_message$jscomp$83$$.requestid, $pending$jscomp$inline_5317$$ = this.$I$[$requestId$jscomp$inline_5316$$];
        $pending$jscomp$inline_5317$$ && (delete this.$I$[$requestId$jscomp$inline_5316$$], $event$jscomp$251_message$jscomp$83$$.error ? ($JSCompiler_StaticMethods_logError_$$(this, "amp-viewer-messaging: handleResponse_ error: ", $event$jscomp$251_message$jscomp$83$$.error), $pending$jscomp$inline_5317$$.reject(Error("Request " + $event$jscomp$251_message$jscomp$83$$.name + " failed: " + $event$jscomp$251_message$jscomp$83$$.error))) : $pending$jscomp$inline_5317$$.resolve($event$jscomp$251_message$jscomp$83$$.data));
      }
    }
  }
};
$Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.$D$ = function($messageName$jscomp$4$$, $messageData$$, $awaitResponse$jscomp$2$$) {
  var $$jscomp$this$jscomp$1318$$ = this, $requestId$jscomp$6$$ = ++this.$P$, $promise$jscomp$67$$ = void 0;
  $awaitResponse$jscomp$2$$ && ($promise$jscomp$67$$ = new window.Promise(function($messageName$jscomp$4$$, $messageData$$) {
    $$jscomp$this$jscomp$1318$$.$I$[$requestId$jscomp$6$$] = {resolve:$messageName$jscomp$4$$, reject:$messageData$$};
  }));
  this.$sendMessage_$({app:"__AMPHTML__", requestid:$requestId$jscomp$6$$, type:"q", name:$messageName$jscomp$4$$, data:$messageData$$, rsvp:$awaitResponse$jscomp$2$$});
  return $promise$jscomp$67$$;
};
$Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$.prototype.$sendMessage_$ = function($message$jscomp$84$$) {
  this.$F$.postMessage(this.$O$ ? JSON.stringify($message$jscomp$84$$) : $message$jscomp$84$$);
};
$FocusHandler$$module$extensions$amp_viewer_integration$0_1$focus_handler$$.prototype.$F$ = function($e$jscomp$347$$) {
  $e$jscomp$347$$.defaultPrevented || this.$D$.$D$($e$jscomp$347$$.type, _.$dict$$module$src$utils$object$$({focusTargetRect:$e$jscomp$347$$.target.getBoundingClientRect()}), !1);
};
$CircularBuffer$$module$extensions$amp_viewer_integration$0_1$findtext$$.prototype.add = function($item$jscomp$25$$) {
  this.$F$[this.$D$] = $item$jscomp$25$$;
  this.$D$ = (this.$D$ + 1) % this.$G$;
};
$CircularBuffer$$module$extensions$amp_viewer_integration$0_1$findtext$$.prototype.get = function($index$jscomp$192$$) {
  this.$F$.length >= this.$G$ && ($index$jscomp$192$$ = (this.$D$ + $index$jscomp$192$$) % this.$G$);
  return this.$F$[$index$jscomp$192$$];
};
var $skipCharRe$$module$extensions$amp_viewer_integration$0_1$findtext$$ = /[,.\s\u2022()]/;
$TextScanner$$module$extensions$amp_viewer_integration$0_1$findtext$$.prototype.next = function() {
  if (0 <= this.$F$) {
    var $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$;
    a: {
      for ($JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = this.$G$.wholeText; this.$F$ < $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$.length;) {
        $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = this.$F$;
        this.$F$++;
        $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = {node:this.$G$, offset:$JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$};
        break a;
      }
      $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = null;
    }
    return $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$;
  }
  for (; null != this.$D$;) {
    $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = this.$D$.next();
    if (null != $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$) {
      return $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$;
    }
    $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ = this.$D$.$G$.nextSibling;
    this.$D$ = null != $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$ ? new $TextScanner$$module$extensions$amp_viewer_integration$0_1$findtext$$(this.$I$, $JSCompiler_inline_result$jscomp$1045_idx$jscomp$inline_5341_pos$jscomp$58_sibling$jscomp$1_text$jscomp$inline_5340$$) : null;
  }
  return null;
};
$HighlightHandler$$module$extensions$amp_viewer_integration$0_1$highlight_handler$$.prototype.$F$ = function() {
  if (this.$D$) {
    for (var $i$376$$ = 0; $i$376$$ < this.$D$.length; $i$376$$++) {
      _.$resetStyles$$module$src$style$$(this.$D$[$i$376$$], ["backgroundColor", "color"]);
    }
  }
};
var $eventProperties$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$ = "key code location ctrlKey shiftKey altKey metaKey repeat isComposing charCode keyCode which".split(" ");
$KeyboardHandler$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$.prototype.$F$ = function($e$jscomp$348$$) {
  $isHandledByEventTarget$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$($e$jscomp$348$$) || this.$D$.$D$($e$jscomp$348$$.type, $getKeyboardEventInit$$module$extensions$amp_viewer_integration$0_1$keyboard_handler$$($e$jscomp$348$$), !1);
};
var $EVENT_PROPERTIES$$module$extensions$amp_viewer_integration$0_1$touch_handler$$ = "altKey charCode ctrlKey detail eventPhase key layerX layerY metaKey pageX pageY returnValue shiftKey timeStamp type which".split(" "), $TOUCH_PROPERTIES$$module$extensions$amp_viewer_integration$0_1$touch_handler$$ = "clientX clientY force identifier pageX pageY radiusX radiusY screenX screenY".split(" ");
$TouchHandler$$module$extensions$amp_viewer_integration$0_1$touch_handler$$.prototype.$unlisten_$ = function() {
  this.$F$.forEach(function($unlisten$jscomp$26$$) {
    return $unlisten$jscomp$26$$();
  });
  this.$F$.length = 0;
};
$TouchHandler$$module$extensions$amp_viewer_integration$0_1$touch_handler$$.prototype.$I$ = function($e$jscomp$352$$) {
  switch($e$jscomp$352$$.type) {
    case "touchstart":
    case "touchend":
    case "touchmove":
      if ($e$jscomp$352$$ && $e$jscomp$352$$.type) {
        var $copiedEvent$jscomp$inline_6614$$ = $JSCompiler_StaticMethods_copyProperties_$$($e$jscomp$352$$, $EVENT_PROPERTIES$$module$extensions$amp_viewer_integration$0_1$touch_handler$$);
        $e$jscomp$352$$.touches && ($copiedEvent$jscomp$inline_6614$$.touches = $JSCompiler_StaticMethods_copyTouches_$$($e$jscomp$352$$.touches));
        $e$jscomp$352$$.changedTouches && ($copiedEvent$jscomp$inline_6614$$.changedTouches = $JSCompiler_StaticMethods_copyTouches_$$($e$jscomp$352$$.changedTouches));
        this.$G$.$D$($e$jscomp$352$$.type, $copiedEvent$jscomp$inline_6614$$, !1);
      }
      this.$D$ && $e$jscomp$352$$.preventDefault();
  }
};
$TouchHandler$$module$extensions$amp_viewer_integration$0_1$touch_handler$$.prototype.$J$ = function($type$jscomp$207$$, $payload$jscomp$35$$, $awaitResponse$jscomp$3$$) {
  this.$D$ = !!$payload$jscomp$35$$;
  this.$unlisten_$();
  $JSCompiler_StaticMethods_listenForTouchEvents_$$(this);
  return $awaitResponse$jscomp$3$$ ? window.Promise.resolve({}) : void 0;
};
$AmpViewerIntegrationVariableService$$module$extensions$amp_viewer_integration$0_1$variable_service$$.prototype.get = function() {
  return this.$D$;
};
$AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration$$.prototype.init = function() {
  var $$jscomp$this$jscomp$1324$$ = this;
  "amp-viewer-integration";
  var $ampdoc$jscomp$236$$ = _.$getAmpdoc$$module$src$service$$(this.$win$.document), $viewer$jscomp$52$$ = _.$Services$$module$src$services$viewerForDoc$$($ampdoc$jscomp$236$$);
  this.$D$ = "1" == $viewer$jscomp$52$$.$params_$.webview;
  this.$G$ = _.$JSCompiler_StaticMethods_hasCapability$$($viewer$jscomp$52$$, "handshakepoll");
  var $origin$jscomp$43$$ = $viewer$jscomp$52$$.$params_$.origin || "";
  if (!this.$D$ && !$origin$jscomp$43$$) {
    return window.Promise.resolve();
  }
  if (this.$D$ || this.$G$) {
    return $JSCompiler_StaticMethods_webviewPreHandshakePromise_$$(this, _.$isIframed$$module$src$dom$$(this.$win$) ? this.$win$.parent : null, $origin$jscomp$43$$).then(function($highlightInfo$jscomp$3$$) {
      return $JSCompiler_StaticMethods_openChannelAndStart_$$($$jscomp$this$jscomp$1324$$, $viewer$jscomp$52$$, $ampdoc$jscomp$236$$, $origin$jscomp$43$$, new $Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$($$jscomp$this$jscomp$1324$$.$win$, $highlightInfo$jscomp$3$$, $$jscomp$this$jscomp$1324$$.$D$));
    });
  }
  var $highlightInfo$jscomp$3$$ = $getHighlightParam$$module$extensions$amp_viewer_integration$0_1$highlight_handler$$($ampdoc$jscomp$236$$);
  $highlightInfo$jscomp$3$$ && (this.$F$ = new $HighlightHandler$$module$extensions$amp_viewer_integration$0_1$highlight_handler$$($ampdoc$jscomp$236$$, $highlightInfo$jscomp$3$$));
  return $JSCompiler_StaticMethods_openChannelAndStart_$$(this, $viewer$jscomp$52$$, $ampdoc$jscomp$236$$, $origin$jscomp$43$$, new $Messaging$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$(this.$win$, new $WindowPortEmulator$$module$extensions$amp_viewer_integration$0_1$messaging$messaging$$(this.$win$, $origin$jscomp$43$$, this.$win$.parent), this.$D$));
};
$AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration$$.prototype.$I$ = function($messaging$jscomp$6$$) {
  return $messaging$jscomp$6$$.$D$("unloaded", {}, !0);
};
(new $AmpViewerIntegration$$module$extensions$amp_viewer_integration$0_1$amp_viewer_integration$$).init();

})});
